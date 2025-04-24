import { API_ROUTES } from '@/app/config/api';
import { ApiService } from './api.service';

/**
 * Interface para los tipos de pago
 */
export interface PaymentType {
  id: string | number;
  name: string;
  code?: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  processing_fee_percentage?: string | number;
  processing_fee_fixed?: string | number;
  requires_approval?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/**
 * Servicio para gestionar los tipos de pago
 */
export class PaymentTypesService {
  private static instance: PaymentTypesService;

  /**
   * Constructor del servicio
   */
  private constructor() {
    console.log('PaymentTypesService initializing...');
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): PaymentTypesService {
    if (!PaymentTypesService.instance) {
      PaymentTypesService.instance = new PaymentTypesService();
    }
    return PaymentTypesService.instance;
  }

  /**
   * Datos estáticos de tipos de pago para usar en caso de fallo
   * @private
   */
  private getStaticPaymentTypes(): PaymentType[] {
    console.log('[PaymentTypesService] Using static payment types data');
    return [
      {
        id: '1',
        name: 'Efectivo',
        code: 'cash',
        icon: 'dollar-sign',
        description: 'Pago en efectivo',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Tarjeta',
        code: 'card',
        icon: 'credit-card',
        description: 'Pago con tarjeta de crédito/débito',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Transferencia',
        code: 'transfer',
        icon: 'wallet',
        description: 'Pago por transferencia bancaria',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Yappy',
        code: 'yappy',
        icon: 'y',
        description: 'Pago mediante Yappy',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Obtiene todos los tipos de pago activos desde la base de datos
   */
  async getAllPaymentTypes(includeInactive = false): Promise<PaymentType[]> {
    try {
      const url = API_ROUTES.paymentTypes.all(includeInactive);
      console.log(`[PaymentTypesService] Fetching payment types from API: ${url}`);
      
      const response = await ApiService.get(url);
      
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`[PaymentTypesService] Successfully retrieved ${response.data.length} payment types`);
        
        return response.data.map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          name: item.name || 'Método de Pago',
          code: item.code || item.name?.toLowerCase().replace(/\s+/g, '-') || `payment-method-${Math.random().toString(36).substr(2, 5)}`,
          icon: item.icon || null,
          description: item.description || null,
          is_active: item.is_active ?? true,
          processing_fee_percentage: item.processing_fee_percentage,
          processing_fee_fixed: item.processing_fee_fixed,
          requires_approval: item.requires_approval,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
      }
      
      // Si la respuesta no es un array válido, usar datos estáticos
      console.warn('[PaymentTypesService] API response is not a valid array or is empty, using static data');
      return this.getStaticPaymentTypes();
    } catch (error) {
      console.error('[PaymentTypesService] API error:', error);
      // En caso de error, devolver datos estáticos
      return this.getStaticPaymentTypes();
    }
  }

  /**
   * Obtiene un tipo de pago por su ID
   */
  async getPaymentTypeById(id: string): Promise<PaymentType | null> {
    try {
      console.log(`[PaymentTypesService] Getting payment type with ID: ${id}`);
      const response = await ApiService.get(API_ROUTES.paymentTypes.byId(id));
      
      if (response.data) {
        return {
          id: response.data.id.toString(),
          name: response.data.name,
          code: response.data.code || response.data.name.toLowerCase().replace(/\s+/g, '-'),
          icon: response.data.icon || null,
          description: response.data.description || null,
          is_active: response.data.is_active ?? true,
          processing_fee_percentage: response.data.processing_fee_percentage,
          processing_fee_fixed: response.data.processing_fee_fixed,
          requires_approval: response.data.requires_approval,
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`[PaymentTypesService] Error getting payment type with ID ${id}:`, error);
      // Intentar encontrar el tipo de pago en los datos estáticos
      const staticTypes = this.getStaticPaymentTypes();
      return staticTypes.find(type => type.id === id) || null;
    }
  }

  /**
   * Obtiene un tipo de pago por su código
   */
  async getPaymentTypeByCode(code: string): Promise<PaymentType | null> {
    try {
      console.log(`[PaymentTypesService] Getting payment type with code: ${code}`);
      const response = await ApiService.get(API_ROUTES.paymentTypes.byCode(code));
      
      if (response.data) {
        return {
          id: response.data.id.toString(),
          name: response.data.name,
          code: response.data.code || response.data.name.toLowerCase().replace(/\s+/g, '-'),
          icon: response.data.icon || null,
          description: response.data.description || null,
          is_active: response.data.is_active ?? true,
          processing_fee_percentage: response.data.processing_fee_percentage,
          processing_fee_fixed: response.data.processing_fee_fixed,
          requires_approval: response.data.requires_approval,
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`[PaymentTypesService] Error getting payment type with code ${code}:`, error);
      // Intentar encontrar el tipo de pago en los datos estáticos
      const staticTypes = this.getStaticPaymentTypes();
      return staticTypes.find(type => type.code === code) || null;
    }
  }
}

// Exportamos una instancia del servicio
export const paymentTypesService = PaymentTypesService.getInstance(); 