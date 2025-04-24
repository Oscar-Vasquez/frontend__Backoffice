import { EmailCampaign, EmailCampaignMetrics } from '@/types/email-template';

export class CampaignService {
  private static BASE_URL = 'http://localhost:3001/api/v1/email/campaigns';

  static async getCampaigns(): Promise<EmailCampaign[]> {
    try {
      console.log('🔍 Obteniendo listado de campañas...');
      const response = await fetch(`${this.BASE_URL}`);
      if (!response.ok) {
        throw new Error('Error al obtener las campañas');
      }
      const data = await response.json();
      console.log('✅ Campañas obtenidas:', {
        total: data.length,
        campañas: data.map((c: EmailCampaign) => ({
          id: c.id,
          nombre: c.name,
          estado: c.status,
          destinatarios: c.recipients?.length,
          métricas: c.metrics ? {
            aperturas: c.metrics.openRate,
            clics: c.metrics.totalClicks,
            rebotes: c.metrics.bounceRate,
            respuestas: c.metrics.responseRate
          } : 'Sin métricas'
        }))
      });
      return data;
    } catch (error) {
      console.error('❌ Error en getCampaigns:', error);
      throw error;
    }
  }

  static async getCampaignById(id: string): Promise<EmailCampaign> {
    try {
      console.log('🔍 Obteniendo detalles de campaña:', id);
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener la campaña');
      }
      const data = await response.json();
      console.log('✅ Detalles de campaña obtenidos:', {
        id: data.id,
        nombre: data.name,
        estado: data.status,
        destinatarios: data.recipients?.length,
        métricas: data.metrics ? {
          aperturas: data.metrics.openRate,
          clics: data.metrics.totalClicks,
          rebotes: data.metrics.bounceRate,
          respuestas: data.metrics.responseRate,
          dispositivos: data.metrics.deviceMetrics
        } : 'Sin métricas'
      });
      return data;
    } catch (error) {
      console.error('❌ Error en getCampaignById:', error);
      throw error;
    }
  }

  static async getCampaignMetrics(id: string): Promise<EmailCampaignMetrics> {
    try {
      console.log('📊 Solicitando métricas de campaña:', id);
      const response = await fetch(`${this.BASE_URL}/${id}/metrics`);
      if (!response.ok) {
        throw new Error('Error al obtener las métricas de la campaña');
      }
      const data = await response.json();
      console.log('✅ Métricas recibidas:', {
        totalDestinatarios: data.totalRecipients,
        aperturasÚnicas: data.uniqueOpens,
        aperturasTotal: data.totalOpens,
        tasaApertura: `${data.openRate.toFixed(1)}%`,
        clicsTotal: data.totalClicks,
        tasaClics: `${data.clickThroughRate.toFixed(1)}%`,
        tasaRebote: `${data.bounceRate.toFixed(1)}%`,
        rebotesTotal: data.bouncedCount,
        tasaRespuesta: `${data.responseRate.toFixed(1)}%`,
        respuestasTotal: data.responseCount,
        entregadosTotal: data.deliveredCount,
        dispositivos: data.deviceMetrics,
        últimaActualización: new Date(data.lastUpdated).toLocaleString()
      });
      return data;
    } catch (error) {
      console.error('❌ Error en getCampaignMetrics:', error);
      throw error;
    }
  }

  static async updateCampaignStatus(id: string, status: EmailCampaign['status']): Promise<void> {
    try {
      console.log('🔄 Actualizando estado de campaña:', { id, nuevoEstado: status });
      const response = await fetch(`${this.BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la campaña');
      }
      console.log('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ Error en updateCampaignStatus:', error);
      throw error;
    }
  }
} 