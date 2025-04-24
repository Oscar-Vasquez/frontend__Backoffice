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

export interface Invoice {
  id: string;
  invoice_number: string;
  userReference?: string;
  issue_date: string;
  due_date: string;
  status: string;
  totalAmount?: number;
  total_amount?: string;
  price_plan?: number;
  shipping_insurance?: boolean;
  packageReferences?: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
    weight?: number | string;
  }>;
  isPaid?: boolean;
  is_paid?: boolean;
  paymentMethod?: string;
  createdTimestamp?: Date;
  updatedTimestamp?: Date;
  customer?: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
  packages?: Array<{
    id: string;
    tracking_number: string;
    status: string;
    weight: string | number;
  }>;
}

export class InvoicesService {
  // Utilizamos directamente la constante API_URL importada
  // private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  static async getAllInvoices(): Promise<Invoice[]> {
    try {
      // Obtener el token de autenticación
      const token = getCookie('workexpress_token');

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/invoices`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al obtener las facturas');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getAllInvoices:', error);
      throw error;
    }
  }

  static async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      // Obtener el token de autenticación
      const token = getCookie('workexpress_token');

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la factura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createInvoice:', error);
      throw error;
    }
  }

  static async updateInvoiceStatus(id: string, status: string): Promise<Invoice> {
    try {
      // Obtener el token de autenticación
      const token = getCookie('workexpress_token');

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/invoices/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado de la factura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateInvoiceStatus:', error);
      throw error;
    }
  }

  /**
   * Verifica si un paquete ya ha sido facturado
   * @param trackingNumber Número de tracking del paquete
   * @returns Objeto indicando si el paquete está facturado y opcionalmente detalles de la factura
   */
  static async verifyPackage(trackingNumber: string): Promise<{ isInvoiced: boolean; invoiceDetails?: any }> {
    console.log('InvoicesService.verifyPackage - Verificando si el paquete está facturado:', trackingNumber);
    
    try {
      // Obtener el token de autenticación
      const token = getCookie('workexpress_token');
      
      if (!token) {
        console.error('InvoicesService.verifyPackage - No hay token de autenticación');
        throw new Error('No hay token de autenticación');
      }
      
      console.log('InvoicesService.verifyPackage - URL de API:', API_URL);
      const url = `${API_URL}/invoices/verify-package/${trackingNumber}`;
      console.log('InvoicesService.verifyPackage - URL completa:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`InvoicesService.verifyPackage - Error HTTP ${response.status}:`, errorText);
        
        if (response.status === 404) {
          console.log('InvoicesService.verifyPackage - Paquete no encontrado');
          return { isInvoiced: false };
        }
        
        if (response.status === 401) {
          console.error('InvoicesService.verifyPackage - No autorizado');
          throw new Error('Sesión expirada o no válida');
        }
        
        if (response.status === 400) {
          // Si es un error 400, probablemente significa que el paquete está facturado
          try {
            const errorData = JSON.parse(errorText);
            console.log('InvoicesService.verifyPackage - Datos de error:', errorData);
            
            // Si el error indica que el paquete ya está facturado
            if (errorData.details && errorData.details.includes('facturado')) {
              return { 
                isInvoiced: true,
                invoiceDetails: errorData.invoiceDetails || {}
              };
            }
          } catch (parseError) {
            console.error('Error al parsear la respuesta de error:', parseError);
          }
        }
        
        console.error('InvoicesService.verifyPackage - Error en la verificación:', response.statusText);
        return { isInvoiced: false };
      }
      
      const data = await response.json();
      console.log('InvoicesService.verifyPackage - Resultado de la verificación:', data);
      
      return {
        isInvoiced: data.isInvoiced || false,
        invoiceDetails: data.invoiceDetails || null
      };
    } catch (error) {
      console.error('InvoicesService.verifyPackage - Error general:', error);
      throw error; // Propagamos el error para que lo maneje quien llame a esta función
    }
  }

  /**
   * Envía un recordatorio por correo electrónico para una factura pendiente
   * @param invoiceId ID de la factura
   * @returns Resultado de la operación
   */
  static async sendInvoiceReminder(invoiceId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('InvoicesService.sendInvoiceReminder - Enviando recordatorio para factura:', invoiceId);
      
      // Obtener el token de autenticación
      const token = getCookie('workexpress_token');
      
      if (!token) {
        console.error('InvoicesService.sendInvoiceReminder - No hay token de autenticación');
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('InvoicesService.sendInvoiceReminder - Error al enviar recordatorio:', errorData);
        throw new Error(errorData.message || 'Error al enviar recordatorio');
      }
      
      const result = await response.json();
      console.log('InvoicesService.sendInvoiceReminder - Resultado del envío:', result);
      
      return {
        success: true,
        message: result.message || 'Recordatorio enviado exitosamente'
      };
    } catch (error) {
      console.error('Error en sendInvoiceReminder:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al enviar recordatorio'
      };
    }
  }
} 