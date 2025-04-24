import { API_ROUTES } from '../config/api';
import { ExtendedFirebaseUser } from '../dashboard/billing/types';
import { PendingInvoiceWithClient } from '../dashboard/billing/hooks/useInvoices';
import { UsersService, FirebaseUser } from './users.service';

// Función para generar un avatar por defecto a partir del nombre e ID
const generateDefaultAvatar = (name: string, userId: string): string => {
  // Opciones para generar avatares:
  // 1. UI Avatars - genera avatares basados en iniciales
  // 2. Dicebear - genera avatares únicos basados en el ID
  // 3. Gravatar - basado en email 
  
  // Usamos DiceBear Avatars - un generador gratuito de avatares
  const firstName = name.split(' ')[0] || 'User';
  const lastName = name.split(' ')[1] || '';
  const initials = encodeURIComponent(`${firstName[0] || ''}${lastName[0] || ''}`);
  
  const colorHash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const hue = colorHash; // Usar el hash para determinar el color
  
  // Diferentes opciones de avatares:
  
  // 1. UI Avatars (simples, basados en iniciales)
  // return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
  
  // 2. DiceBear con estilo de píxeles
  // return `https://api.dicebear.com/6.x/pixel-art/svg?seed=${encodeURIComponent(userId)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  
  // 3. DiceBear con rostros de personas
  return `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(userId)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  
  // 4. Opción con Gravatar
  // return `https://www.gravatar.com/avatar/${userId.slice(0, 10)}?d=identicon&s=128`;
};

// Interfaces para tipado
export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhoto?: string;
  amount: number;
  description: string;
  status: 'paid' | 'due' | 'overdue';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  paid: boolean;
  planName?: string;
  [key: string]: any; // Para propiedades adicionales
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface InvoiceFilterOptions {
  userId?: string;
  status?: 'paid' | 'due' | 'overdue';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  amountMin?: number;
  amountMax?: number;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: any; // Para cualquier otro filtro
}

interface ApiError {
  message: string;
  details?: string;
  statusCode?: number;
}

export class PaymentsService {
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

  static async getInvoices(
    page = 1,
    limit = 10,
    filters: InvoiceFilterOptions = {}
  ): Promise<{ invoices: Invoice[], pagination: PaginationData }> {
    try {
      console.log('🔄 Obteniendo facturas con filtros:', filters);
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de paginación
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      // Agregar filtros si existen
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      // Verificar si tenemos un userId en los filtros para usar en la ruta
      const userId = filters.userId || 'all';
      
      // Usar la función API_ROUTES.payments.invoices con el userId
      const invoicesEndpoint = `${API_ROUTES.payments.invoices(userId)}?${queryParams.toString()}`;
      console.log(`📡 Consultando endpoint: ${invoicesEndpoint}`);
      
      const response = await fetch(invoicesEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error al obtener facturas:', errorData);
        throw new Error(errorData.message || 'Error al obtener facturas');
      }
      
      const data = await response.json();
      console.log('📊 Datos de facturas recibidos:', data);
      
      // Procesar las facturas para agregar los datos del usuario si no están
      const processedInvoices = await Promise.all(data.invoices.map(async (invoice: any) => {
        // Si el invoice ya tiene la información completa del usuario, la utilizamos
        if (invoice.user && typeof invoice.user === 'object') {
          console.log(`✅ La factura ${invoice.invoiceNumber} ya incluye datos de usuario completos`);
          
          // Generar nombre completo si no existe
          const fullName = invoice.user.name || 
            `${invoice.user.firstName || ''} ${invoice.user.lastName || ''}`.trim() || 
            'Usuario Desconocido';
          
          // Generar avatar predeterminado
          const defaultAvatar = `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(invoice.userId)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
          
          // Determinar la foto del usuario
          const userPhoto = invoice.user.photo || 
                           invoice.user.photoURL || 
                           invoice.user.avatarUrl || 
                           invoice.user.photoUrl || 
                           defaultAvatar;
          
          // Determinar el nombre del plan
          let planName = 'Plan Estándar';
          if (invoice.user.subscriptionPlan && typeof invoice.user.subscriptionPlan === 'object') {
            planName = invoice.user.subscriptionPlan.name || invoice.user.planName || 'Plan Estándar';
          } else {
            planName = invoice.user.planName || 'Plan Estándar';
          }
          
          return {
            ...invoice,
            userId: invoice.user.id || invoice.userId,
            userName: fullName,
            userEmail: invoice.user.email || invoice.userEmail || 'sin-email@example.com',
            userPhoto: userPhoto,
            planName: planName,
            status: this.determineInvoiceStatus(invoice),
          };
        } 
        // Si solo tenemos el ID del usuario, buscamos sus datos
        else if (invoice.userId) {
          console.log(`🔍 Buscando datos para usuario con ID: ${invoice.userId}`);
          try {
            const userInfo = await UsersService.searchUser(invoice.userId);
            if (userInfo) {
              console.log(`✅ Usuario encontrado para factura ${invoice.invoiceNumber}:`, userInfo.email);
              
              // Generar nombre completo
              const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userInfo.name || 'Usuario';
              
              // Determinar la foto del usuario
              const userPhoto = userInfo.photo || 
                               `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(invoice.userId)}`;
              
              // Determinar el nombre del plan
              let planName = 'Plan Estándar';
              if (userInfo.subscriptionPlan && typeof userInfo.subscriptionPlan === 'object') {
                planName = userInfo.planName || 'Plan Estándar';
              } else {
                planName = userInfo.planName || 'Plan Estándar';
              }
              
              return {
                ...invoice,
                userName: fullName,
                userEmail: userInfo.email,
                userPhoto: userPhoto,
                planName: planName,
                status: this.determineInvoiceStatus(invoice),
              };
            }
          } catch (error) {
            console.warn(`⚠️ No se pudo obtener información del usuario ${invoice.userId}:`, error);
          }
        }
        
        // Si no se pudo obtener la información del usuario o hubo un error
        return {
          ...invoice,
          userName: invoice.userName || 'Usuario Desconocido',
          userEmail: invoice.userEmail || 'sin-email@example.com',
          userPhoto: `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(invoice.userId || 'unknown')}`,
          status: this.determineInvoiceStatus(invoice),
        };
      }));
      
      return {
        invoices: processedInvoices,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('❌ Error en getInvoices:', error);
      throw error;
    }
  }

  static async getPendingInvoices(): Promise<{ pendingInvoices: PendingInvoiceWithClient[] }> {
    try {
      console.log('🔍 Obteniendo todas las facturas pendientes');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.payments.pending(), {
        credentials: 'include',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error en solicitud GET /payments/pending: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Facturas pendientes obtenidas:', data);
      
      // Procesar y transformar los datos para que coincidan con la estructura esperada
      const pendingInvoices: PendingInvoiceWithClient[] = [];
      
      if (data && data.invoices && Array.isArray(data.invoices)) {
        // Utilizamos Promise.all para procesar todas las facturas en paralelo
        await Promise.all(data.invoices.map(async (invoice: any) => {
          try {
            // Calcular días de vencimiento
            const invoiceDate = new Date(invoice.date);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - invoiceDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isOverdue = diffDays > 30;
            
            // Obtener información detallada del usuario
            let userDetails: ExtendedFirebaseUser;
            
            try {
              // Intentar obtener los detalles completos del usuario
              let userInfo: FirebaseUser | null = null;
              
              // Verificar si es un ID con formato UUID
              const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoice.userId);
              
              if (isUUID) {
                console.log(`📍 Detectado UUID para usuario, obteniendo directamente:`, invoice.userId);
                try {
                  // Primero intentar obtener directamente por ID
                  userInfo = await UsersService.getUserDetails(invoice.userId);
                } catch (error) {
                  console.error(`❌ Error al obtener usuario por ID directo, intentando búsqueda:`, error);
                  userInfo = await UsersService.searchUser(invoice.userId);
                }
              } else {
                // Fallback al método normal de búsqueda
                userInfo = await UsersService.searchUser(invoice.userId);
              }
              
              if (userInfo) {
                // Diagnóstico detallado sobre la foto
                console.log(`======= DIAGNÓSTICO DE FOTO DE USUARIO ${invoice.userId} =======`);
                console.log(`Datos completos del usuario:`, userInfo);
                console.log(`=============================================================`);
                
                // Generar un nombre completo para el usuario
                const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
                
                // Crear un avatar predeterminado usando el ID del usuario
                const defaultAvatarURL = `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(invoice.userId)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                
                // Lista de posibles propiedades de fotos para verificar
                const possiblePhotoProps = ['photo', 'photoURL', 'avatarUrl', 'photoUrl', 'avatar', 'profileImage', 'picture'];
                
                // Función para determinar la foto final
                const determineFinalPhoto = (user: any): string => {
                  // Log inicial
                  console.log(`🔍 Determinando foto final para usuario ${user.id || user.userId || 'desconocido'}`);
                  
                  // Revisar todas las posibles propiedades
                  for (const prop of possiblePhotoProps) {
                    if (user[prop] && typeof user[prop] === 'string' && user[prop].trim() !== '') {
                      console.log(`✅ Usando ${prop} para foto:`, user[prop]);
                      return user[prop];
                    }
                  }
                  
                  // Si no se encontró ninguna foto, usar avatar predeterminado
                  console.log('⚠️ No se encontraron fotos, usando avatar predeterminado:', defaultAvatarURL);
                  return defaultAvatarURL;
                };
                
                // Determinar la foto final garantizando que siempre haya un valor
                const finalPhoto = determineFinalPhoto(userInfo);
                console.log(`📸 FOTO FINAL SELECCIONADA: ${finalPhoto}`);
                
                // Determinar el nombre del plan
                let planName = 'Plan Estándar';
                if (userInfo.subscriptionPlan && typeof userInfo.subscriptionPlan === 'object') {
                  // Si tenemos el objeto subscriptionPlan completo, usamos directamente su nombre
                  planName = userInfo.planName || 'Plan Estándar';
                  console.log(`✅ Usando nombre de plan desde planName:`, planName);
                } else {
                  // Fallback al planName que ya puede estar en el objeto
                  planName = userInfo.planName || 'Plan Estándar';
                  console.log(`✅ Usando nombre de plan desde planName:`, planName);
                }
                
                userDetails = {
                  id: userInfo.id,
                  email: userInfo.email,
                  firstName: userInfo.firstName || (userInfo.name ? userInfo.name.split(' ')[0] : 'Usuario'),
                  lastName: userInfo.lastName || (userInfo.name ? userInfo.name.split(' ').slice(1).join(' ') : 'Desconocido'),
                  // Asignar foto garantizada
                  photo: finalPhoto,
                  isVerified: userInfo.isVerified,
                  accountStatus: typeof userInfo.accountStatus === 'boolean' 
                    ? (userInfo.accountStatus ? 'active' : 'inactive')
                    : userInfo.accountStatus,
                  // Usar directamente el nombre del plan que ya hemos determinado
                  planName: planName,
                  walletName: userInfo.walletName,
                  assignedLocker: userInfo.assignedLocker
                };
              } else {
                // Si no se encuentra el usuario, generamos un avatar predeterminado
                const defaultName = invoice.userName || 'Usuario Desconocido';
                const defaultAvatar = `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(invoice.userId)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                console.log('⚠️ Usuario no encontrado, usando avatar predeterminado:', defaultAvatar);
                
                userDetails = {
                  id: invoice.userId,
                  email: invoice.userEmail || 'sin-email@example.com',
                  firstName: invoice.userName ? invoice.userName.split(' ')[0] : 'Usuario',
                  lastName: invoice.userName ? invoice.userName.split(' ').slice(1).join(' ') : 'Desconocido',
                  photo: defaultAvatar, // Usar avatar generado
                  isVerified: true,
                  accountStatus: 'active'
                };
              }
            } catch (error) {
              console.error(`Error al obtener detalles del usuario ${invoice.userId}:`, error);
              
              // Fallback en caso de error - generar avatar predeterminado
              const defaultAvatar = `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(invoice.userId)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              console.log('⚠️ Error al obtener usuario, usando avatar predeterminado:', defaultAvatar);
              
              // Fallback en caso de error
              userDetails = {
                id: invoice.userId,
                email: invoice.userEmail || 'sin-email@example.com',
                firstName: invoice.userName ? invoice.userName.split(' ')[0] : 'Usuario',
                lastName: invoice.userName ? invoice.userName.split(' ').slice(1).join(' ') : 'Desconocido',
                photo: defaultAvatar, // Usar avatar predeterminado
                isVerified: true,
                accountStatus: 'active'
              };
            }
            
            // Determinar el estado correcto para la interfaz Invoice
            let invoiceStatusForInterface: 'paid' | 'due' | 'overdue';
            if (invoice.status === 'PAGADO' || invoice.paid === true) {
              invoiceStatusForInterface = 'paid';
            } else if (invoice.status === 'PARCIAL' || invoice.status === 'PENDIENTE' || isOverdue) {
              invoiceStatusForInterface = isOverdue ? 'overdue' : 'due';
            } else {
              invoiceStatusForInterface = 'due'; // Default a 'due' si no está pagada o vencida
            }

            // Procesar la factura
            const processedInvoice: Invoice = {
              id: invoice.id,
              userId: invoice.userId,
              amount: typeof invoice.amount === 'number' ? invoice.amount : parseFloat(String(invoice.amount)) || 0,
              status: invoiceStatusForInterface, // Usar el estado determinado
              dueDate: invoice.dueDate || new Date().toISOString(), // Map or default
              createdAt: invoice.createdAt || new Date().toISOString(), // Map or default
              updatedAt: invoice.updatedAt || new Date().toISOString(), // Map or default
              paid: invoice.paid === true, // Ensure boolean
              description: invoice.description || '',
              invoiceNumber: invoice.invoiceNumber,
              // Explicitly add fields potentially required by PendingInvoiceWithClient's invoice type
              date: invoice.date || invoice.createdAt || new Date().toISOString(), // Add date field
              packages: Array.isArray(invoice.packages) ? invoice.packages.map((pkg: any) => ({ // Map packages or default
                packageId: pkg.id,
                trackingNumber: pkg.trackingNumber || '',
                status: pkg.status || 'PROCESANDO',
                weight: pkg.weight || 0,
                volumetricWeight: pkg.volumetricWeight || 0,
                position: pkg.position || null
              })) : [],
              totalPackages: Array.isArray(invoice.packages) ? invoice.packages.length : 0, // Add totalPackages
              // Agregar campos para pagos parciales si existen (ya presentes)
              paid_amount: invoice.paid_amount,
              remaining_amount: invoice.remaining_amount,
              payment_history: invoice.payment_history
            };
            
            // Primero revisar si la factura tiene pagos parciales
            const hasPartialPayment = 
              invoice.status === 'PARCIAL' || 
              (invoice.paid_amount !== undefined && invoice.paid_amount > 0 && 
               invoice.remaining_amount !== undefined && invoice.remaining_amount > 0);
            
            // Determinar el estado de la factura correctamente
            let invoiceStatus: 'overdue' | 'paid' | 'PARCIAL' | 'pending';
            if (hasPartialPayment) {
              invoiceStatus = 'PARCIAL';
            } else if (processedInvoice.paid) {
              invoiceStatus = 'paid';
            } else {
              invoiceStatus = isOverdue ? 'overdue' : 'pending';
            }
            
            pendingInvoices.push({
              invoice: processedInvoice as any,
              client: userDetails,
              status: invoiceStatus,
              daysOverdue: diffDays
            });
          } catch (error) {
            console.error(`Error al procesar factura ${invoice.id}:`, error);
          }
        }));
      }
      
      console.log('📊 Total facturas pendientes procesadas:', pendingInvoices.length);
      
      return {
        pendingInvoices
      };
    } catch (error) {
      console.error('Error al obtener facturas pendientes:', error);
      throw error;
    }
  }

  static async processPayment(
    invoiceId: string, 
    amount: number,
    paymentDetails?: {
      method: string;
      amountReceived: number;
      paymentMethodId?: string;
      isPartialPayment?: boolean;
      requestId?: string;
    }
  ): Promise<any> {
    // Declare requestId outside the try block
    let requestId = paymentDetails?.requestId || `auto-${Date.now()}`;
    try {
      // ID fijo para el método de pago, usar el proporcionado o el predeterminado
      const FIXED_PAYMENT_METHOD_ID = '3e7a40e3-307d-4846-8f65-f4f1668bbfb3';
      const paymentMethodId = paymentDetails?.paymentMethodId || FIXED_PAYMENT_METHOD_ID;
      // requestId is now declared above

      const url = API_ROUTES.payments.process(invoiceId);
      console.log(`💰 [${requestId}] Procesando pago:`, {
        url,
        invoiceId,
        amount,
        paymentDetails,
        paymentMethodId,
        isPartialPayment: paymentDetails?.isPartialPayment
      });

      const headers = await this.getAuthHeaders();

      // Asegurarse de que el monto enviado sea siempre un número
      const paymentAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
      const paymentAmountReceived = typeof paymentDetails?.amountReceived === 'number' 
        ? paymentDetails.amountReceived 
        : (paymentDetails?.amountReceived ? parseFloat(String(paymentDetails.amountReceived)) : paymentAmount);
        
      const isPartial = paymentDetails?.isPartialPayment === true;
      
      const paymentData = {
        amount: paymentAmount,
        method: paymentDetails?.method || 'cash',
        amountReceived: paymentAmountReceived,
        paymentMethodId,
        isPartialPayment: isPartial,
        requestId: requestId
      };
      
      console.log(`📤 [${requestId}] Datos de pago a enviar:`, paymentData);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ [${requestId}] Error del servidor:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Personalizar mensajes de error para casos específicos
        if (errorData && errorData.response && errorData.response.message) {
          if (errorData.response.message.includes('Monto excede lo pendiente')) {
            throw new Error(
              `[${requestId}] ${errorData.response.details || 
              'El monto del pago excede lo pendiente por pagar. Por favor, confirma el monto correcto.'}`
            );
          }
        }
        
        throw new Error(
          `[${requestId}] ${errorData.response?.message || 
          errorData.message || 
          errorData.error || 
          'Error al procesar el pago'}`
        );
      }

      const result = await response.json();
      console.log(`✅ [${requestId}] Pago procesado:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [${requestId}] Error en PaymentsService.processPayment:`, error);
      throw error;
    }
  }

  static async processPendingInvoice(invoiceId: string, userId: string): Promise<any> {
    try {
      // Implementar lógica...
    } catch (error) {
      console.error('Error processing invoice:', error);
      throw error;
    }
  }

  /**
   * Determina el estado de una factura basado en su fecha de vencimiento
   * @param invoice Factura a evaluar
   * @returns Estado de la factura: 'overdue', 'due', 'paid' o 'partial'
   */
  static determineInvoiceStatus(invoice: any): 'overdue' | 'due' | 'paid' | 'partial' {
    // Si la factura ya tiene un status definido, lo usamos
    if (invoice.status) {
      if (['overdue', 'due', 'paid', 'partial', 'PAGADO', 'PENDIENTE', 'PARCIAL'].includes(invoice.status)) {
        // Normalizar estados
        if (invoice.status === 'PAGADO') return 'paid';
        if (invoice.status === 'PENDIENTE') return 'due';
        if (invoice.status === 'PARCIAL') return 'partial';
        return invoice.status as 'overdue' | 'due' | 'paid' | 'partial';
      }
    }
    
    // Si la factura está pagada, retornamos 'paid'
    if (invoice.paid) {
      return 'paid';
    }
    
    // Si tiene pago parcial
    if (invoice.paid_amount > 0 && invoice.remaining_amount > 0) {
      return 'partial';
    }
    
    // Verificar si la factura está vencida
    if (invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      
      // Resetear las horas para comparar solo las fechas
      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        return 'overdue';
      }
    }
    
    // Por defecto, la factura está pendiente de pago pero no vencida
    return 'due';
  }
} 