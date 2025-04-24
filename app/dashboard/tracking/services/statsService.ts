'use client';

/**
 * Servicio para obtener estadísticas de paquetes
 */
export interface PackageStats {
  percentage: number;
  assignedNotInvoiced: number;
  totalPackages: number;
  trend: number;
  lastMonthPercentage: number;
  message?: string;
}

interface StatsResponse {
  success: boolean;
  data?: PackageStats;
  message?: string;
}

export class StatsService {
  // Cache para evitar bucles y llamadas repetidas
  private static requestCache: Map<string, {
    data: StatsResponse,
    timestamp: number
  }> = new Map();
  private static requestsInProgress: Set<string> = new Set();
  
  /**
   * Obtiene el token de autenticación de las cookies
   */
  private static getAuthToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('workexpress_token='))
      ?.split('=')[1];
    
    return token || null;
  }

  /**
   * Obtiene el porcentaje de paquetes con clientes asignados pero no facturados por sucursal
   * @param branchId ID de la sucursal
   * @returns Estadísticas de paquetes
   */
  static async getAssignedNotInvoicedPercentage(branchId: string): Promise<StatsResponse> {
    console.log('🔄 StatsService: Iniciando obtención de estadísticas para sucursal:', branchId);
    
    // Evitar llamadas duplicadas en progreso
    if (this.requestsInProgress.has(branchId)) {
      console.log('⚠️ StatsService: Ya hay una solicitud en progreso para esta sucursal, evitando duplicación');
      return {
        success: false,
        message: 'Ya hay una solicitud en progreso para esta sucursal',
      };
    }
    
    // Comprobar caché y devolver si no ha expirado (5 minutos)
    const cacheEntry = this.requestCache.get(branchId);
    const now = Date.now();
    if (cacheEntry && (now - cacheEntry.timestamp < 5 * 60 * 1000)) {
      console.log('📋 StatsService: Devolviendo datos desde caché');
      return cacheEntry.data;
    }
    
    try {
      // Marcar como en progreso
      this.requestsInProgress.add(branchId);
      
      const token = this.getAuthToken();
      
      if (!token) {
        console.error('❌ StatsService: No se encontró token de autenticación');
        throw new Error('No se encontró token de autenticación');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const endpoint = `${apiUrl}/packages/stats/unassigned-percentage/${branchId}`;
      
      console.log('🔍 StatsService: Llamando al endpoint:', endpoint);
      
      // Agregar timeout para evitar solicitudes colgadas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📋 StatsService: Respuesta recibida, status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ StatsService: Error en la respuesta:', errorData);
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }
      
      const data = await response.json();
      console.log('✅ StatsService: Datos recibidos:', data);
      
      // Guardar en caché
      this.requestCache.set(branchId, {
        data,
        timestamp: now
      });
      
      return data;
    } catch (error) {
      console.error('❌ StatsService: Error al obtener estadísticas:', error);
      
      // Comprobar el tipo de error para manejo específico de AbortError
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: 'La solicitud de estadísticas tomó demasiado tiempo y fue cancelada',
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    } finally {
      // Siempre quitar de la lista de "en progreso"
      this.requestsInProgress.delete(branchId);
    }
  }
} 