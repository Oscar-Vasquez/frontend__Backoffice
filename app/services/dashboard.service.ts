export interface DashboardMetrics {
  paquetes: {
    total: number;
    incremento: number;
    desglose: {
      entregados: number;
      enProceso: number;
    }
  };
  facturas: {
    total: number;
    incremento: number;
    montoTotal: number;
    pendientes: number;
  };
  usuarios: {
    total: number;
    incremento: number;
    nuevos: number;
    activos: number;
  };
}

export class DashboardService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static async getMetrics(): Promise<DashboardMetrics> {
    try {
      console.log('📊 Solicitando métricas del dashboard');
      
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('❌ No se encontró el token de autenticación');
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${this.API_URL}/dashboard/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error en la respuesta:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // Evitar redirecciones automáticas, solo lanzar el error
        if (response.status === 401) {
          console.error('❌ Error de autenticación al obtener métricas');
          throw new Error('Sesión expirada o inválida');
        }
        
        throw new Error(errorData.message || 'Error al obtener las métricas del dashboard');
      }

      const data = await response.json();
      console.log('✅ Métricas recibidas:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en getMetrics:', error);
      throw error;
    }
  }
} 