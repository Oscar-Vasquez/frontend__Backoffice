import { API_ROUTES } from '../config/api';

/**
 * Interface para los datos de una transacción
 */
export interface Transaction {
  id: string;
  description: string;
  status: string;
  transactionDate: string;
  transactionDateLocal?: string; // Fecha en zona horaria local (América/Panama)
  transactionType: string;
  entityType: string;
  entityId: string;
  amount?: number;
  metadata?: any;
  paymentMethod?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  transactionTypeDetails?: {
    id: string;
    name: string;
    affectsBalance: string; // 'credit' | 'debit'
  };
}

/**
 * Interface para la respuesta paginada de transacciones
 */
export interface TransactionsResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    date?: string;
    period?: string;
    cutoffTime?: string;
    timezone?: string; // Zona horaria utilizada para los cálculos (e.g., 'America/Panama')
    summary?: {
      totalCredit: number;
      totalDebit: number;
    };
  };
}

/**
 * Servicio para gestionar transacciones
 */
export class TransactionsService {
  /**
   * Obtener headers de autenticación
   */
  private static async getAuthHeaders() {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('workexpress_token='))
      ?.split('=')[1];

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Crear una nueva transacción
   */
  static async createTransaction(data: {
    description: string;
    status: string;
    transactionType: string;
    entityType: string;
    entityId: string;
    referenceId?: string | null;
    paymentMethodId?: string;
    metadata?: Record<string, any>;
    amount?: number;
    categoryId?: string;
    transactionTypeId?: string;
  }): Promise<any> {
    try {
      console.log('🔄 Creando transacción:', data);
      
      // Función auxiliar para validar y formatear UUIDs
      const formatUUID = (uuid: string | null | undefined): string | null => {
        if (!uuid) return null;
        
        // Limpiar guiones
        const cleanUuid = uuid.replace(/-/g, '');
        
        // Validar formato (32 caracteres hexadecimales)
        if (cleanUuid.length === 32 && /^[0-9a-f]{32}$/i.test(cleanUuid)) {
          return cleanUuid;
        }
        
        console.warn(`⚠️ UUID inválido detectado: "${uuid}"`);
        return null;
      };
      
      // Aplicar validación a todos los campos UUID
      const cleanData = {
        ...data,
        entityId: formatUUID(data.entityId) || data.entityId,
        referenceId: formatUUID(data.referenceId),
        paymentMethodId: formatUUID(data.paymentMethodId) || data.paymentMethodId,
        categoryId: formatUUID(data.categoryId) || data.categoryId,
        transactionTypeId: formatUUID(data.transactionTypeId)
      };
      
      console.log('🧹 Datos validados y formateados:', cleanData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.transactions.create(), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la transacción');
      }

      const result = await response.json();
      console.log('✅ Transacción creada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en TransactionsService.createTransaction:', error);
      throw error;
    }
  }

  /**
   * Obtener tipos de transacción
   */
  static async getTransactionTypes(): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.transactions.types(), {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener tipos de transacción');
      }

      const result = await response.json();
      return result.types;
    } catch (error) {
      console.error('❌ Error en TransactionsService.getTransactionTypes:', error);
      throw error;
    }
  }

  /**
   * Obtener transacciones de una entidad
   */
  static async getTransactionsByEntity(entityType: string, entityId: string): Promise<Transaction[]> {
    try {
      console.log(`🔍 Obteniendo transacciones para ${entityType}: ${entityId}`);

      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.transactions.entity(entityType, entityId), {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener transacciones');
      }

      const result = await response.json();
      console.log('✅ Transacciones obtenidas:', result);

      // Transformar a formato frontend
      const transactions: Transaction[] = result.transactions.map((tx: any) => ({
        id: tx.id,
        description: tx.description,
        status: tx.status,
        transactionDate: tx.transaction_date,
        transactionType: tx.transaction_type,
        entityType: tx.entity_type,
        entityId: tx.entity_id,
        amount: tx.amount,
        metadata: tx.metadata,
        paymentMethod: tx.payment_method_id,
        category: tx.category_id
      }));

      return transactions;
    } catch (error) {
      console.error('❌ Error en TransactionsService.getTransactionsByEntity:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las transacciones del período actual de cierre de caja
   */
  static async getTodayTransactions(page: number = 1, limit: number = 50): Promise<TransactionsResponse> {
    try {
      console.log(`🔍 Obteniendo transacciones del período actual - Página ${page}, Límite ${limit}`);

      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.transactions.today(page, limit), {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las transacciones del período');
      }

      const result = await response.json();
      console.log('✅ Transacciones del período obtenidas:', result);

      return {
        data: result.data,
        meta: {
          total: result.meta.total,
          page: result.meta.page,
          limit: result.meta.limit,
          date: result.meta.date,
          period: result.meta.period,
          cutoffTime: result.meta.cutoffTime,
          timezone: result.meta.timezone,
          summary: result.meta.summary
        }
      };
    } catch (error) {
      console.error('❌ Error en TransactionsService.getTodayTransactions:', error);
      // Devolver una estructura vacía como fallback
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          date: new Date().toISOString().split('T')[0],
          period: 'No disponible',
          cutoffTime: '18:00',
          timezone: 'America/Panama',
          summary: {
            totalCredit: 0,
            totalDebit: 0
          }
        }
      };
    }
  }

  /**
   * Obtener transacciones filtradas por categoría
   */
  static async getTransactionsByCategory(
    categoryId: string, 
    page: number = 1, 
    limit: number = 50,
    transactionType?: string
  ): Promise<TransactionsResponse> {
    try {
      console.log(`🔍 Obteniendo transacciones por categoría ${categoryId} - Página ${page}, Límite ${limit}`);
      if (transactionType) {
        console.log(`🔍 Filtrando por tipo: ${transactionType}`);
      }

      // Construir la URL con los parámetros
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (transactionType) {
        params.append('type', transactionType);
      }
      
      const url = `${API_ROUTES.transactions.byCategory(categoryId)}?${params.toString()}`;

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las transacciones por categoría');
      }

      const result = await response.json();
      console.log('✅ Transacciones por categoría obtenidas:', result);

      return {
        data: result.data,
        meta: {
          total: result.meta.total,
          page: result.meta.page,
          limit: result.meta.limit,
          ...result.meta
        }
      };
    } catch (error) {
      console.error('❌ Error en TransactionsService.getTransactionsByCategory:', error);
      // Devolver una estructura vacía como fallback
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
        }
      };
    }
  }

  /**
   * Genera un resumen por método de pago a partir de las transacciones
   * para su uso en componentes como PaymentMethodSummary
   */
  static getPaymentMethodSummary(transactions: Transaction[]): { 
    paymentMethods: { id: string; name: string; credit: number; debit: number; total: number }[],
    totalAmount: number;
    totalCredit: number;
    totalDebit: number;
  } {
    // Agrupar transacciones por método de pago
    const paymentMethodsMap = new Map<string, { 
      id: string; 
      name: string; 
      credit: number; 
      debit: number;
      total: number;
    }>();
    
    // Totales generales
    let totalCredit = 0;
    let totalDebit = 0;
    
    // Procesar cada transacción
    transactions.forEach(tx => {
      // Determinar si es ingreso o egreso con lógica mejorada
      let isCredit = false;
      
      // 1. Primero verificar por el campo affectsBalance (criterio prioritario)
      if (tx.transactionTypeDetails?.affectsBalance) {
        isCredit = tx.transactionTypeDetails.affectsBalance === 'credit';
      } 
      // 2. Si no está disponible, intentar inferir por la categoría
      else if (tx.category?.name) {
        const categoryName = tx.category.name.toLowerCase();
        if (categoryName.includes('gasto') || categoryName.includes('egreso')) {
          isCredit = false;
        } else if (categoryName.includes('ingreso')) {
          isCredit = true;
        } else {
          // 3. Si no podemos inferir por categoría, usar el monto
          isCredit = (tx.amount !== undefined && tx.amount > 0);
        }
      } 
      // 4. Como último recurso, usar el monto
      else {
        isCredit = (tx.amount !== undefined && tx.amount > 0);
      }
      
      // Obtener el método de pago (usar 'Otros' si no está definido)
      let methodName = 'Efectivo'; // Valor por defecto
      let methodId = 'efectivo'; // ID por defecto
      
      // 1. Primera prioridad: metadatos.paymentMethod
      if (tx.metadata && typeof tx.metadata === 'object') {
        // Si hay un paymentMethodId en los metadatos, usarlo
        if ('paymentMethodId' in tx.metadata && tx.metadata.paymentMethodId) {
          methodId = tx.metadata.paymentMethodId.toString();
        }
        
        // Si hay un paymentMethod en los metadatos, usarlo para el nombre
        if ('paymentMethod' in tx.metadata && typeof tx.metadata.paymentMethod === 'string') {
          // Formatear para que sea presentable
          const metaMethodName = tx.metadata.paymentMethod.toString().toLowerCase();
          if (metaMethodName === 'efectivo') {
            methodName = 'Efectivo';
          } else if (metaMethodName === 'tarjeta' || metaMethodName === 'tarjeta-credito' || metaMethodName === 'tarjeta-de-credito') {
            methodName = 'Tarjeta de Crédito';
          } else if (metaMethodName === 'tarjeta-debito' || metaMethodName === 'tarjeta-de-debito') {
            methodName = 'Tarjeta de Débito';
          } else if (metaMethodName === 'transferencia' || metaMethodName === 'transferencia-bancaria') {
            methodName = 'Transferencia Bancaria';
          } else {
            // Capitalizar primera letra de cada palabra
            methodName = metaMethodName.split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        }
      }
      
      // 2. Segunda prioridad: objeto paymentMethod
      // Solo usamos esto si no encontramos información en los metadatos o para complementar
      if (tx.paymentMethod && tx.paymentMethod.name) {
        // Si no teníamos un ID desde los metadatos, usar el del objeto
        if (methodId === 'efectivo' && tx.paymentMethod.id) {
          methodId = tx.paymentMethod.id;
        }
        
        // Solo sobreescribir el nombre si no lo habíamos obtenido de los metadatos
        // o si el nombre de metadatos es genérico (efectivo)
        if (methodName === 'Efectivo') {
          methodName = tx.paymentMethod.name;
        }
      }
      
      // Crear un ID único si no tenemos uno
      if (methodId === 'efectivo' && methodName !== 'Efectivo') {
        methodId = `other-${methodName.toLowerCase().replace(/\s+/g, '-')}`;
      }
      
      // Obtener el monto (asegurar que sea un número positivo para los cálculos)
      const amount = (tx.amount !== undefined && tx.amount !== null) 
        ? Math.abs(tx.amount) 
        : (tx.metadata?.amount || tx.metadata?.amountReceived || 0);
      
      // Actualizar los totales generales
      if (isCredit) {
        totalCredit += amount;
      } else {
        totalDebit += amount;
      }
      
      // Buscar o crear el entry para este método de pago
      if (!paymentMethodsMap.has(methodId)) {
        paymentMethodsMap.set(methodId, {
          id: methodId,
          name: methodName,
          credit: 0,
          debit: 0,
          total: 0
        });
      }
      
      // Actualizar los montos para este método de pago
      const methodData = paymentMethodsMap.get(methodId);
      if (methodData) {
        if (isCredit) {
          methodData.credit += amount;
        } else {
          methodData.debit += amount;
        }
        methodData.total = methodData.credit - methodData.debit;
      }
    });
    
    // Convertir el mapa en un array para el resultado final
    const paymentMethods = Array.from(paymentMethodsMap.values());
    
    // Calcular el total general
    const totalAmount = totalCredit - totalDebit;
    
    return {
      paymentMethods,
      totalAmount,
      totalCredit,
      totalDebit
    };
  }
} 