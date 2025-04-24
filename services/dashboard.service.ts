import { api } from '@/lib/api';

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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  } catch (error) {
    console.error('Error al obtener métricas del dashboard:', error);
    throw error;
  }
}

function formatIncremento(valor: number): string {
  return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
} 