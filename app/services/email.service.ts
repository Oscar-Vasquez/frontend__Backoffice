import { EmailCampaign, EmailSendResult, EmailTemplate } from '@/types/email-template';
import { v4 as uuidv4 } from 'uuid';

export class EmailService {
  private static BASE_URL = 'http://localhost:3001/api/v1';

  static async sendCampaign(campaign: EmailCampaign): Promise<EmailSendResult[]> {
    try {
      // Generar ID de tracking para la campaña
      const trackingId = uuidv4();
      
      const response = await fetch(`${this.BASE_URL}/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaign,
          trackingId,
          tracking: true
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar la campaña');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en sendCampaign:', error);
      throw error;
    }
  }

  static async trackEmailOpen(trackingId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/email/track/open/${trackingId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Error al registrar apertura de email');
      }
    } catch (error) {
      console.error('Error en trackEmailOpen:', error);
    }
  }

  static async trackEmailClick(trackingId: string, linkId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/email/track/click/${trackingId}/${linkId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Error al registrar clic en email');
      }
    } catch (error) {
      console.error('Error en trackEmailClick:', error);
    }
  }

  static async getEmailMetrics(campaignId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/email/metrics/${campaignId}`);
      if (!response.ok) {
        throw new Error('Error al obtener métricas del email');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getEmailMetrics:', error);
      throw error;
    }
  }

  static async getCampaigns(): Promise<EmailCampaign[]> {
    try {
      console.log('🔍 Obteniendo campañas de correo');
      
      const response = await fetch(`${this.BASE_URL}/email/campaigns`);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Error del servidor:', data);
        throw new Error(data.message || 'Error al obtener las campañas');
      }

      console.log('✅ Campañas obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en getCampaigns:', error);
      throw error;
    }
  }

  static async getCampaignById(campaignId: string): Promise<EmailCampaign> {
    try {
      const response = await fetch(`${this.BASE_URL}/email/campaigns/${campaignId}`);

      if (!response.ok) {
        throw new Error('Error al obtener la campaña');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getCampaignById:', error);
      throw error;
    }
  }

  static async deleteCampaign(campaignId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/email/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la campaña');
      }
    } catch (error) {
      console.error('Error en deleteCampaign:', error);
      throw error;
    }
  }
} 