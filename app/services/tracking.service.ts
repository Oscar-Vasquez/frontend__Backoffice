import { API_URL } from '@/config/constants';

// Importante: El backend agrega automáticamente el prefijo /api/v1 a todas las rutas
// Por lo tanto, no debemos incluirlo en las llamadas desde el frontend

/**
 * Obtiene una cookie por su nombre
 * @param name Nombre de la cookie
 * @returns Valor de la cookie o null si no existe
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Estamos en el servidor
  }
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

interface TrackingResponse {
  tracking: string;
  status: string;
  statusName: string;
  totalWeight: string;
  volWeight: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  mode: string;
  carrier: string;
  shipper?: string;
  insurance?: boolean;
  dateCreated?: string;
  dateUpdated?: string;
  estimated_delivery?: string;
  created_at?: string;
  userReference?: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
}

const getAuthHeaders = () => {
  const token = getCookie('workexpress_token');

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const TrackingService = {
  async getTrackingInfo(trackingNumber: string): Promise<TrackingResponse> {
    console.log('TrackingService.getTrackingInfo - Iniciando búsqueda para', trackingNumber);
    
    try {
      // Obtener el token de autenticación
      const token = getCookie('workexpress_token');
      
      if (!token) {
        console.error('TrackingService.getTrackingInfo - No hay token de autenticación');
        throw new Error('No hay token de autenticación');
      }
      
      // Búsqueda local
      try {
        console.log('TrackingService.getTrackingInfo - Intentando búsqueda local');
        console.log('TrackingService.getTrackingInfo - URL:', `${API_URL}/packages/tracking/${trackingNumber}`);
        
        const response = await fetch(`${API_URL}/packages/tracking/${trackingNumber}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('TrackingService.getTrackingInfo - Paquete encontrado localmente:', data);
          return {
            tracking: data.tracking || trackingNumber,
            status: data.status || 'unknown',
            statusName: data.status_name || 'DESCONOCIDO',
            totalWeight: data.total_weight?.toString() || '0',
            volWeight: data.vol_weight?.toString() || '0',
            dimensions: {
              length: parseFloat(data.cargo_length) || 0,
              width: parseFloat(data.cargo_width) || 0,
              height: parseFloat(data.cargo_height) || 0,
              unit: data.unit || 'in'
            },
            mode: data.mode || undefined,
            carrier: data.shipper || undefined,
            shipper: data.shipper,
            insurance: false,
            dateCreated: data.datecreated,
            dateUpdated: data.dateupdated,
            estimated_delivery: data.dateupdated || data.datecreated || new Date().toISOString(),
            created_at: data.datecreated || new Date().toISOString(),
            userReference: data.userReference,
            client: {
              id: data.client_id?.toString() || '',
              name: data.client_name || '',
              email: data.client_email || ''
            }
          };
        }
        
        console.log('TrackingService.getTrackingInfo - Paquete no encontrado localmente, status:', response.status);
      } catch (localError) {
        console.error('TrackingService.getTrackingInfo - Error en búsqueda local:', localError);
      }
      
      // Si no encontramos el paquete localmente, buscamos en el servicio externo
      console.log('TrackingService.getTrackingInfo - Intentando búsqueda externa');
      console.log('TrackingService.getTrackingInfo - URL:', `${API_URL}/cargo/external-tracking/${trackingNumber}`);
      
      const externalResponse = await fetch(`${API_URL}/cargo/external-tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!externalResponse.ok) {
        console.error('TrackingService.getTrackingInfo - Error en búsqueda externa, status:', externalResponse.status);
        throw new Error(`Error al obtener información de tracking: ${externalResponse.statusText}`);
      }
      
      const externalData = await externalResponse.json();
      console.log('TrackingService.getTrackingInfo - Paquete encontrado externamente:', externalData);
      return {
        tracking: externalData.tracking || trackingNumber,
        status: externalData.status || 'unknown',
        statusName: externalData.status_name || 'DESCONOCIDO',
        totalWeight: externalData.total_weight?.toString() || '0',
        volWeight: externalData.vol_weight?.toString() || '0',
        dimensions: {
          length: parseFloat(externalData.cargo_length) || 0,
          width: parseFloat(externalData.cargo_width) || 0,
          height: parseFloat(externalData.cargo_height) || 0,
          unit: externalData.unit || 'in'
        },
        mode: externalData.mode || undefined,
        carrier: externalData.shipper || undefined,
        shipper: externalData.shipper,
        insurance: false,
        dateCreated: externalData.datecreated,
        dateUpdated: externalData.dateupdated,
        estimated_delivery: externalData.dateupdated || externalData.datecreated || new Date().toISOString(),
        created_at: externalData.datecreated || new Date().toISOString(),
        userReference: externalData.userReference,
        client: {
          id: externalData.client_id?.toString() || '',
          name: externalData.client_name || '',
          email: externalData.client_email || ''
        }
      };
    } catch (error) {
      console.error('TrackingService.getTrackingInfo - Error general:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de eventos de un paquete
   * @param trackingNumber Número de tracking
   * @returns Historial de eventos del paquete
   */
  async getTrackingLogs(trackingNumber: string): Promise<any[]> {
    console.log('TrackingService.getTrackingLogs - Obteniendo historial para', trackingNumber);
    
    try {
      // Obtener el token de autenticación
      const token = getCookie('workexpress_token');
      
      if (!token) {
        console.error('TrackingService.getTrackingLogs - No hay token de autenticación');
        throw new Error('No hay token de autenticación');
      }
      
      // Primero intentamos obtener historial local
      try {
        console.log('TrackingService.getTrackingLogs - Intentando obtener historial local');
        console.log('TrackingService.getTrackingLogs - URL:', `${API_URL}/packages/tracking-logs/${trackingNumber}`);
        
        const response = await fetch(`${API_URL}/packages/tracking-logs/${trackingNumber}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('TrackingService.getTrackingLogs - Historial local encontrado:', data);
          return data;
        }
        
        console.log('TrackingService.getTrackingLogs - Historial local no encontrado, status:', response.status);
      } catch (localError) {
        console.error('TrackingService.getTrackingLogs - Error al obtener historial local:', localError);
      }
      
      // Si no encontramos historial local, buscamos en el servicio externo
      console.log('TrackingService.getTrackingLogs - Intentando obtener historial externo');
      console.log('TrackingService.getTrackingLogs - URL:', `${API_URL}/cargo/tracking-logs/${trackingNumber}`);
      
      const externalResponse = await fetch(`${API_URL}/cargo/tracking-logs/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!externalResponse.ok) {
        console.error('TrackingService.getTrackingLogs - Error al obtener historial externo, status:', externalResponse.status);
        return []; // Retornamos array vacío en caso de error
      }
      
      const externalData = await externalResponse.json();
      console.log('TrackingService.getTrackingLogs - Historial externo encontrado:', externalData);
      return externalData;
    } catch (error) {
      console.error('TrackingService.getTrackingLogs - Error general:', error);
      return []; // Retornamos array vacío en caso de error general
    }
  }
}; 
