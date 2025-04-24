import { OperatorActivity } from '@/app/types/activities';
//import { CreateActivityDto } from '@/app/types/activities';
import axios from 'axios';

export class ActivitiesService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  static async createActivity(activity: any): Promise<OperatorActivity> {
    try {
      console.log('📝 Creando actividad:', activity);
      
      const token = localStorage.getItem('workexpress_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.post<OperatorActivity>(`${this.API_URL}/activities`, activity, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Actividad creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear actividad:', error);
      throw error;
    }
  }

  static async getOperatorActivities(operatorId: string): Promise<OperatorActivity[]> {
    try {
      console.log(`🔍 Obteniendo actividades del operador: ${operatorId}`);
      
      // Asegurarnos de que tenemos un token válido
      const token = localStorage.getItem('workexpress_token');
      if (!token) {
        console.error('❌ No hay token de autenticación');
        throw new Error('No hay token de autenticación');
      }

      const url = `${this.API_URL}/activities/operator/${operatorId}`;
      console.log('🔗 URL de la petición:', url);

      const response = await axios.get<OperatorActivity[]>(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.data) {
        console.error('❌ No se recibieron datos del servidor');
        return [];
      }

      console.log(`📊 Actividades obtenidas: ${response.data.length}`);
      console.log('📝 Datos recibidos:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener actividades del operador:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  static async getRecentActivities(limit?: number, days?: number): Promise<OperatorActivity[]> {
    try {
      console.log(`🔍 Obteniendo actividades recientes (límite: ${limit}, días: ${days})`);
      
      const token = localStorage.getItem('workexpress_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (days) params.append('days', days.toString());
      
      const url = `${this.API_URL}/activities/recent${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🔗 URL de la petición:', url);

      const response = await axios.get<OperatorActivity[]>(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log(`📊 Actividades recientes obtenidas: ${response.data.length}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener actividades recientes:', error);
      throw error;
    }
  }
} 