import { API_URL } from '@/config/constants';

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

export interface ShippingStage {
  location: string;
  photo: string;
  stage: string;
  status: string;
  updatedTimestamp: string;
}

export interface Package {
  id?: string;
  packageId?: string;
  trackingNumber: string;
  packageStatus: string;
  weight: number;
  volumetricWeight: number;
  length: number;
  width: number;
  height: number;
  insurance: boolean;
  shippingStages: ShippingStage[];
  userReference?: string;
  createdAt?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    planRate: number;
  };
}

export class PackagesService {
  private async getAuthHeaders() {
    const token = getCookie('workexpress_token');

    if (!token) {
      throw new Error('No hay sesión activa');
    }

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Busca un paquete por su número de tracking
   * @param trackingNumber Número de tracking
   * @returns Paquete encontrado o null
   */
  async findByTracking(trackingNumber: string) {
    console.log('🔍 PackagesService.findByTracking - Buscando paquete con tracking:', trackingNumber);
    
    try {
      // Intentar obtener el token de workexpress_token
      const token = getCookie('workexpress_token');
      
      if (!token) {
        console.error('❌ PackagesService.findByTracking - No hay token de autenticación');
        throw new Error('No hay token de autenticación');
      }
      
      console.log('📊 PackagesService.findByTracking - URL de API:', API_URL);
      const url = `${API_URL}/packages/tracking/${trackingNumber}`;
      console.log('🔎 PackagesService.findByTracking - URL completa:', url);
      console.log('🔑 PackagesService.findByTracking - Token encontrado:', token.substring(0, 10) + '...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      console.log('📡 PackagesService.findByTracking - Estado respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ PackagesService.findByTracking - Paquete no encontrado en Firebase');
        } else {
          console.error('❌ PackagesService.findByTracking - Error en la respuesta:', response.status);
          console.log('📝 PackagesService.findByTracking - Texto de error:', await response.text());
        }
        return null;
      }
      
      const data = await response.json();
      console.log('✅ PackagesService.findByTracking - Paquete encontrado en Firebase:', data);
      return data;
    } catch (error) {
      console.error('❌ PackagesService.findByTracking - Error:', error);
      return null;
    }
  }

  async createPackage(packageData: Omit<Package, 'id' | 'packageId'>): Promise<Package> {
    try {
      console.log('📦 PackagesService.createPackage - Creando nuevo paquete:', packageData);
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/packages`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        console.error('❌ PackagesService.createPackage - Error al crear paquete:', response.status);
        throw new Error('Error al crear el paquete');
      }

      const result = await response.json();
      console.log('✅ PackagesService.createPackage - Paquete creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ PackagesService.createPackage - Error:', error);
      throw error;
    }
  }

  async assignUserToPackage(packageId: string, userId: string): Promise<void> {
    try {
      console.log('👤 PackagesService.assignUserToPackage - Asignando usuario a paquete:', {packageId, userId});
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/packages/${packageId}/assign-user`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PackagesService.assignUserToPackage - Error al asignar usuario:', errorText);
        throw new Error(`Error al asignar usuario al paquete: ${response.status} ${errorText}`);
      }
      
      console.log('✅ PackagesService.assignUserToPackage - Usuario asignado exitosamente');
    } catch (error) {
      console.error('❌ PackagesService.assignUserToPackage - Error:', error);
      throw error;
    }
  }
}

export const packagesService = new PackagesService(); 