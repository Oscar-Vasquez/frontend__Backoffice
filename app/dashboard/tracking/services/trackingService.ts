import { CombinedTrackingInfo, TrackingAPIResponse } from '../types';

/**
 * Servicios para manejar la búsqueda y gestión de envíos
 * Contiene todas las funciones relacionadas con las operaciones de tracking
 */

/**
 * Busca envíos por término de búsqueda
 * @param query - Término de búsqueda para encontrar envíos
 * @returns Promise con la respuesta de la API con información de tracking
 */
export const searchTracking = async (query: string): Promise<TrackingAPIResponse> => {
  const apiUrl = `/api/tracking/search?query=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error en la búsqueda: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al buscar envíos:', error);
    throw error;
  }
};

/**
 * Obtiene información detallada de un envío específico
 * @param id - ID del envío a consultar
 * @returns Promise con la información combinada del tracking
 */
export const getTrackingDetails = async (id: string): Promise<CombinedTrackingInfo> => {
  const apiUrl = `/api/tracking/${id}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener detalles: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tracking;
  } catch (error) {
    console.error('Error al obtener detalles del envío:', error);
    throw error;
  }
};

/**
 * Guarda un nuevo tracking 
 * @param trackingNumber - Número de tracking a guardar
 * @param carrier - Código del carrier (opcional)
 * @returns Promise con la respuesta de la API
 */
export const saveTracking = async (trackingNumber: string, carrier?: string): Promise<any> => {
  const apiUrl = '/api/tracking/save';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        carrier_code: carrier,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error al guardar tracking: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al guardar tracking:', error);
    throw error;
  }
};

/**
 * Elimina un tracking
 * @param id - ID del tracking a eliminar
 * @returns Promise con la respuesta de la API
 */
export const deleteTracking = async (id: string): Promise<any> => {
  const apiUrl = `/api/tracking/delete/${id}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar tracking: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar tracking:', error);
    throw error;
  }
}; 