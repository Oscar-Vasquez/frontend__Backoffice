"use client";

import { useState, useMemo } from "react";
import { PaymentsService } from "@/app/services/payments.service";
import { TransactionsService } from "@/app/services/transactions.service";
import { Invoice, BillingStats, PaymentDialogState, PaymentMethod, InvoiceStatus, ExtendedFirebaseUser, Package } from "../types";
import { customToast } from "@/app/lib/toast";
import { UsersService } from "@/app/services/users.service";

// Nuevo tipo para facturas con información del cliente
export interface PendingInvoiceWithClient {
  invoice: Invoice;
  client: ExtendedFirebaseUser;
  status: 'pending' | 'overdue' | 'paid' | 'PARCIAL';
  daysOverdue: number;
}

interface UseInvoicesProps {
  onUpdateUser?: (userId: string) => Promise<void>;
}

interface UseInvoicesResult {
  invoices: Invoice[];
  stats: BillingStats;
  paymentDialog: PaymentDialogState;
  processingPayment: string | null;
  pendingInvoices: PendingInvoiceWithClient[];
  isPartialPayment: boolean;
  partialPaymentAmount: string;
  localAmountReceived: string;
  isInvoicePaid: (invoice: Invoice) => boolean;
  getInvoicesForUser: (userId: string) => Promise<Invoice[]>;
  getPendingInvoices: () => Promise<PendingInvoiceWithClient[]>;
  handleOpenPaymentDialog: (invoice: Invoice) => void;
  handleClosePaymentDialog: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountReceived: (amount: number) => void;
  setIsPartialPayment: (isPartial: boolean) => void;
  setPartialPaymentAmount: (amount: string) => void;
  setLocalAmountReceived: (amount: string) => void;
  handlePaymentSubmit: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getCachedUser: (userId: string) => ExtendedFirebaseUser | null;
  cacheUser: (user: ExtendedFirebaseUser) => void;
  handlePartialPaymentChange: (isPartial: boolean, amount: number) => void;
}

const DEFAULT_STATS: BillingStats = {
  totalPayments: 0,
  activePackages: 0,
  pendingPayments: 0,
  lastActivity: 'Sin actividad'
};

export function useInvoices({ onUpdateUser }: UseInvoicesProps = {}): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoiceWithClient[]>([]);
  const [stats, setStats] = useState<BillingStats>(DEFAULT_STATS);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState>({
    open: false,
    invoice: null,
    paymentAmount: 0,
    paymentMethod: '',
    amountReceived: 0
  });
  
  // Estados para pago parcial
  const [isPartialPayment, setIsPartialPayment] = useState<boolean>(false);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<string>('');
  const [localAmountReceived, setLocalAmountReceived] = useState<string>('');
  
  // Sistema de caché de usuarios para evitar consultas repetidas
  const [userCache, setUserCache] = useState<Record<string, ExtendedFirebaseUser>>({});

  // Función para verificar si un método es efectivo
  const isCashMethod = useMemo(() => (method: string): boolean => {
    return method === 'cash' || method === 'efectivo';
  }, []);

  // Función para obtener un usuario de la caché o null si no existe
  const getCachedUser = (userId: string): ExtendedFirebaseUser | null => {
    return userCache[userId] || null;
  };

  // Función para guardar un usuario en la caché
  const cacheUser = (user: ExtendedFirebaseUser) => {
    if (user && user.id) {
      console.log('🗃️ Guardando usuario en caché:', user.id);
      setUserCache(prev => ({
        ...prev,
        [user.id]: user
      }));
    }
  };

  const updateStats = (currentInvoices: Invoice[]) => {
    try {
      // Log para depuración
      console.log('🔢 Calculando estadísticas para', currentInvoices.length, 'facturas');
      
      // Función para determinar si una factura está pagada con verificaciones completas
      const isPaid = (invoice: Invoice): boolean => {
        return (
          invoice.status === 'PAGADO' || 
          invoice.invoiceStatus === 'PAGADO' ||
          invoice.isPaid === true ||
          (invoice.paymentDate !== undefined && invoice.paymentDate !== null)
        );
      };
      
      // Separar facturas pagadas y pendientes usando el método de verificación más confiable
      const paidInvoices = currentInvoices.filter(inv => isPaid(inv));
      const pendingInvoices = currentInvoices.filter(inv => !isPaid(inv));
      
      // Logging de depuración
      console.log('📊 Facturas pagadas:', paidInvoices.length);
      console.log('📊 Facturas pendientes:', pendingInvoices.length);
      
      // Calcular los totales de montos
      const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const pendingPayments = pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      
      // Log de montos
      console.log('💰 Total pagado:', totalPaid);
      console.log('💰 Total pendiente:', pendingPayments);
      
      // Contar paquetes activos (solo en facturas pendientes)
      const activePackages = pendingInvoices.reduce((sum, inv) => {
        // Asegurarnos que packages siempre sea un array
        const packages = Array.isArray(inv.packages) ? inv.packages : [];
        return sum + packages.length;
      }, 0);
      
      console.log('📦 Paquetes activos:', activePackages);
      
      // Obtener la fecha de actividad más reciente de cualquier factura
      let lastActivityDate = new Date(0); // Fecha inicial muy antigua
      
      currentInvoices.forEach(inv => {
        // Verificar todas las posibles propiedades de fecha
        const dateFields = ['createdAt', 'date', 'paymentDate', 'updatedAt'];
        
        dateFields.forEach(field => {
          if (inv[field as keyof Invoice]) {
            const currentDate = new Date(inv[field as keyof Invoice] as string);
            if (currentDate > lastActivityDate) {
              lastActivityDate = currentDate;
            }
          }
        });
      });
      
      const lastActivity = lastActivityDate.getTime() > 0 
        ? formatDate(lastActivityDate.toISOString()) 
        : 'Sin actividad';
      
      console.log('🕒 Última actividad:', lastActivity);
      
      // Actualizar el estado con las estadísticas calculadas
      setStats({
        totalPayments: totalPaid,
        activePackages: activePackages,
        pendingPayments: pendingPayments,
        lastActivity: lastActivity
      });
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      // En caso de error, mantener las estadísticas anteriores
    }
  };

  const getInvoicesForUser = async (userId: string) => {
    try {
      console.log('📄 Obteniendo facturas para usuario:', userId);
      
      // Primero, obtener la información del usuario y guardarla en caché
      const userInfo = getCachedUser(userId) || await UsersService.searchUser(userId);
      if (userInfo) {
        // Asegurarse de que solo cacheamos ExtendedFirebaseUser
        // Asumiendo que ExtendedFirebaseUser tiene 'uid' y 'userId' que SupabaseUser no tiene juntos
        if ('uid' in userInfo && 'userId' in userInfo && typeof userInfo.accountStatus === 'string') {
           cacheUser(userInfo as ExtendedFirebaseUser);
        } else {
           console.warn('⚠️ Usuario obtenido no es de tipo ExtendedFirebaseUser, no se guardará en caché:', userInfo);
        }
      }
      
      // Usar la nueva API con filtros
      const { invoices: userInvoices, pagination } = await PaymentsService.getInvoices(1, 50, {
        userId: userId,
        sort: 'createdAt',
        sortDirection: 'desc'
      });
      
      console.log('📄 Facturas obtenidas:', userInvoices, 'Paginación:', pagination);

      // Adaptar las facturas al formato esperado por el componente InvoiceList
      const adaptedInvoices = userInvoices.map(invoice => {
        // Verificar que factura tenga los campos necesarios
        console.log('🔄 Adaptando factura:', invoice);
        
        // Asegurar que la factura tenga el campo 'packages' esperado por InvoiceList
        // Forzar tipo a Package[] si es necesario.
        let currentPackages: Package[] = [];
        if (Array.isArray(invoice.packages)) {
          currentPackages = invoice.packages as Package[];
        } else if (Array.isArray(invoice.items)) {
          // Si viene como 'items', intentar adaptarlo
          // Asumiendo que 'items' tiene una estructura similar a Package
          currentPackages = (invoice.items as any[]).map((item: any, index: number): Package => ({
            packageId: item.packageId || item.id || `pkg-${index}`,
            trackingNumber: item.trackingNumber || item.tracking || `TN-${index}`,
            status: item.status || 'pending',
            weight: item.weight || 0,
            volumetricWeight: item.volumetricWeight || 0,
            dimensions: item.dimensions || { length: 0, width: 0, height: 0 },
            insurance: item.insurance || false,
            shippingStages: item.shippingStages || [],
            position: item.position || 'N/A'
          }));
        } else {
          console.warn('⚠️ La factura no tiene packages/items o no es un array:', invoice.id);
          currentPackages = [];
        }

        // Determinar el status correcto según InvoiceStatus
        let finalStatus: InvoiceStatus;
        const rawStatus = invoice.status?.toUpperCase(); // Normalizar a mayúsculas para comparar
        if (rawStatus === 'PAID' || rawStatus === 'PAGADO') {
          finalStatus = 'PAGADO';
        } else if (rawStatus === 'PARTIAL' || rawStatus === 'PARCIAL') {
          finalStatus = 'PARCIAL';
        } else {
          finalStatus = 'PENDIENTE'; // Por defecto o si es 'due', 'pending', etc.
        }

        // Asegurar campos obligatorios y añadir información del cliente
        const adaptedInvoice: Invoice = {
          id: invoice.id,
          userId: invoice.userId,
          amount: invoice.amount || 0,
          status: finalStatus, // Usar el status validado
          date: invoice.createdAt || invoice.date || new Date().toISOString(),
          description: invoice.description || 'Factura de servicio',
          packages: currentPackages, // Usar los paquetes adaptados
          totalPackages: currentPackages.length,
          isPaid: finalStatus === 'PAGADO',
          paymentDate: invoice.paymentDate,
          transactionId: invoice.transactionId,
          invoiceStatus: finalStatus, // Asegurar coherencia
          invoiceNumber: invoice.invoiceNumber,
          client: (userInfo && 'uid' in userInfo && 'userId' in userInfo) ? (userInfo as ExtendedFirebaseUser) : undefined,
          paid_amount: invoice.paid_amount,
          remaining_amount: invoice.remaining_amount,
          payment_status: invoice.payment_status as Invoice['payment_status'], // Cast a tipo correcto
          last_payment_date: invoice.last_payment_date,
          next_payment_due_date: invoice.next_payment_due_date,
          payment_history: invoice.payment_history as Invoice['payment_history'] // Cast a tipo correcto
        };
        return adaptedInvoice;
      }); // No necesita cast al final si el mapeo es correcto
      
      setInvoices(adaptedInvoices);
      updateStats(adaptedInvoices);
      
      if (adaptedInvoices.length === 0) {
        customToast.info({
          title: "Sin Facturas",
          description: "No hay facturas para este usuario"
        });
      }
      
      return adaptedInvoices;
    } catch (error) {
      console.error('❌ Error al obtener facturas:', error);
      customToast.warning({
        title: "Facturas No Disponibles",
        description: "No se pudieron cargar las facturas del usuario"
      });
      setInvoices([]);
      throw error;
    }
  };

  // Nueva función para obtener facturas pendientes que utiliza la caché
  const getPendingInvoices = async () => {
    try {
      console.log('📄 Obteniendo facturas pendientes de todos los clientes');
      const { pendingInvoices: invoicesWithClients } = await PaymentsService.getPendingInvoices();
      console.log('📄 Facturas pendientes obtenidas:', invoicesWithClients);
      
      // Guardar usuarios en caché mientras procesamos
      invoicesWithClients.forEach(item => {
        if (item.client && item.client.id) {
          cacheUser(item.client);
        }
      });
      
      // Procesar cada factura para determinar si está atrasada y calcular días de vencimiento
      const processedInvoices: PendingInvoiceWithClient[] = invoicesWithClients.map(item => {
        // Usar 'date' en lugar de dueDate/createdAt
        const dueDate = new Date(item.invoice.date); 
        const today = new Date();
        
        // Resetear las horas para comparar solo fechas
        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Verificar si la factura está vencida
        const isOverdue = dueDate < today && item.invoice.status !== 'PAGADO' && !item.invoice.isPaid; 
        
        // Verificar si tiene pagos parciales - prioridad máxima
        const hasPartialPayment = 
          item.invoice.status === 'PARCIAL' || 
          (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0) ||
          (item.invoice.payment_status === 'partial') ||
          (item.invoice.payment_history && item.invoice.payment_history.length > 0 && 
           (item.invoice.amount > (item.invoice.paid_amount || 0)));
        
        // Log detallado para depuración de pagos parciales
        if (item.invoice.id === '717626ec-f43e-4424-b9bd-924bb02647de' || 
            item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0) {
          console.log('🔍 Analizando factura con posible pago parcial:', item.invoice.id);
          console.log('- Status original:', item.invoice.status);
          console.log('- Monto total:', item.invoice.amount);
          console.log('- Monto pagado:', item.invoice.paid_amount);
          console.log('- Monto restante:', item.invoice.remaining_amount);
          console.log('- Tiene historial de pagos:', !!item.invoice.payment_history?.length);
          console.log('- payment_status:', item.invoice.payment_status);
          console.log('- ¿Detectado como parcial?:', hasPartialPayment);
        }
        
        return {
          ...item,
          status: hasPartialPayment ? 'PARCIAL' : 
                  (item.invoice.status === 'PAGADO' || item.invoice.isPaid) ? 'paid' : // Usar status o isPaid en lugar de 'paid'
                  (isOverdue ? 'overdue' : 'pending'),
          daysOverdue: isOverdue ? diffDays : 0,
          invoice: hasPartialPayment ? {
            ...item.invoice,
            // Si es pago parcial, asegurar que el estado sea PARCIAL
            status: 'PARCIAL' as InvoiceStatus,
            // Si no tiene monto restante calculado, calcularlo
            remaining_amount: item.invoice.remaining_amount !== undefined ? 
                              item.invoice.remaining_amount : 
                              (item.invoice.amount - (item.invoice.paid_amount || 0))
          } : item.invoice
        };
      });
      
      setPendingInvoices(processedInvoices);
      
      if (processedInvoices.length === 0) {
        customToast.info({
          title: "Sin Facturas Pendientes",
          description: "No hay facturas pendientes o atrasadas en el sistema"
        });
      } else {
        customToast.success({
          title: "Facturas Pendientes",
          description: `Se encontraron ${processedInvoices.length} facturas pendientes`
        });
      }
      
      return processedInvoices;
    } catch (error) {
      console.error('❌ Error al obtener facturas pendientes:', error);
      customToast.warning({
        title: "Facturas No Disponibles",
        description: "No se pudieron cargar las facturas pendientes del sistema"
      });
      setPendingInvoices([]);
      throw error;
    }
  };

  // Función unificada para determinar si una factura está pagada completamente
  const isInvoicePaidInternal = (invoice: Invoice): boolean => {
    return (
      invoice.status === 'PAGADO' || 
      invoice.invoiceStatus === 'PAGADO' ||
      invoice.isPaid === true ||
      (invoice.paymentDate !== undefined && invoice.paymentDate !== null &&
           invoice.status !== 'PARCIAL') // Si tiene fecha de pago pero es PARCIAL, no está totalmente pagada
    );
  };

  // Función para verificar si una factura tiene pagos parciales
  const hasPartialPayment = (invoice: Invoice): boolean => {
    return (
      invoice.status === 'PARCIAL' ||
      (invoice.paid_amount !== undefined && invoice.paid_amount > 0 && 
       invoice.remaining_amount !== undefined && invoice.remaining_amount > 0)
    );
  };

  const getInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
    return isInvoicePaidInternal(invoice) ? 'PAGADO' : 'PENDIENTE';
  };

  const isInvoicePaid = (invoice: Invoice): boolean => {
    return isInvoicePaidInternal(invoice);
  };

  const handleOpenPaymentDialog = (invoice: Invoice) => {
    console.log('[useInvoices] Abriendo diálogo de pago para factura:', invoice.id);
    
    // Obtener información del cliente si no está presente
    let invoiceWithClient = { ...invoice };
    
    if (invoice.userId && !invoice.client) {
      const cachedClient = getCachedUser(invoice.userId);
      if (cachedClient) {
        console.log('[useInvoices] Utilizando cliente de caché:', cachedClient.id);
        invoiceWithClient.client = cachedClient;
      }
    }
    
    // Calcular el monto pendiente para facturas con pagos parciales
    const hasPreviousPayment = invoice.paid_amount !== undefined && invoice.paid_amount > 0;
    const pendingAmount = hasPreviousPayment
      // Usar nullish coalescing para evitar error con undefined
      ? invoice.remaining_amount ?? (invoice.amount - (invoice.paid_amount ?? 0)) 
      : invoice.amount;
    
    console.log('[useInvoices] Información de pago:', {
      total: invoice.amount,
      pagado: invoice.paid_amount || 0,
      pendiente: pendingAmount,
      tienePartial: hasPreviousPayment
    });
    
    // Restablecer valores de pago parcial
    const newIsPartialPayment = false;
    const newPartialAmount = pendingAmount.toString();
    
    // Restablecer todos los valores del diálogo al abrir
    setPaymentDialog({
      open: true,
      invoice: invoiceWithClient,
      paymentAmount: pendingAmount, // Usar el monto pendiente en lugar del total
      paymentMethod: 'cash', // Predeterminado a efectivo
      amountReceived: pendingAmount, // Inicializamos con el monto pendiente a pagar
      isPartialPayment: newIsPartialPayment,
      partialPaymentAmount: parseFloat(newPartialAmount)
    });
    
    // Restablecer estados locales de pago parcial
    setIsPartialPayment(newIsPartialPayment);
    setPartialPaymentAmount(newPartialAmount);
    setLocalAmountReceived(pendingAmount.toString());
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialog(prev => ({ ...prev, open: false }));
    // Restablecer estados de pago parcial
    setIsPartialPayment(false);
    setPartialPaymentAmount('');
    setLocalAmountReceived('');
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    console.log(`[useInvoices] Cambiando método de pago a: ${method}`);
    
    setPaymentDialog(prev => {
      // Crear el nuevo estado
      const newState = { 
        ...prev, 
        paymentMethod: method,
      };
      
      // Verificar si es método efectivo
      if (isCashMethod(method)) {
        console.log(`[useInvoices] Método efectivo seleccionado, inicializando monto recibido a: ${prev.paymentAmount}`);
        newState.amountReceived = prev.paymentAmount;
        
        // Actualizar también el estado local
        const targetAmount = isPartialPayment && partialPaymentAmount 
          ? parseFloat(partialPaymentAmount) 
          : prev.paymentAmount;
          
        setLocalAmountReceived(targetAmount.toString());
      } else {
        // Para otros métodos, no necesitamos el amountReceived pero mantenemos el valor
        newState.amountReceived = prev.paymentAmount;
      }
      
      return newState;
    });
  };

  const setAmountReceived = (amount: number) => {
    setPaymentDialog(prev => ({ 
      ...prev, 
      amountReceived: amount
    }));
  };

  const handlePaymentSubmit = async () => {
    console.log('🔄 Iniciando envío de pago...');
    if (!paymentDialog.invoice) return;

    setProcessingPayment(paymentDialog.invoice.id);
    
    try {
      // ID único para el seguimiento de este pago específico
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Verificar si la factura ya está pagada completamente
      if (isInvoicePaid(paymentDialog.invoice)) {
        throw new Error('Esta factura ya ha sido pagada completamente');
      }

      // ID fijo para el método de pago
      const FIXED_PAYMENT_METHOD_ID = '3e7a40e3-307d-4846-8f65-f4f1668bbfb3';

      // Calcular montos previamente pagados
      const previouslyPaid = paymentDialog.invoice.paid_amount || 0;
      const totalInvoiceAmount = paymentDialog.invoice.amount;
      const remainingAmount = totalInvoiceAmount - previouslyPaid;
      
      // Determinar el monto a pagar (total o parcial)
      const paymentAmount = isPartialPayment 
        ? parseFloat(partialPaymentAmount) 
        : paymentDialog.paymentAmount;
        
      // Verificar que el monto a pagar no exceda lo pendiente
      // Usar una pequeña tolerancia para evitar problemas con números flotantes
      if (paymentAmount > remainingAmount + 0.001) { // Añadimos una pequeña tolerancia para evitar errores con montos idénticos
        console.warn(`⚠️ [${requestId}] Intento de pagar más del monto pendiente: $${paymentAmount} > $${remainingAmount}`);
        console.warn('Ajustando el monto a pagar al monto pendiente...');
        throw new Error(`El monto a pagar (${formatCurrency(paymentAmount)}) excede el monto pendiente (${formatCurrency(remainingAmount)})`);
      }
      
      // Si los montos son prácticamente iguales (dentro de la tolerancia), usar exactamente el monto restante
      const finalPaymentAmount = Math.abs(paymentAmount - remainingAmount) < 0.001 ? remainingAmount : paymentAmount;

      console.log(`💰 [${requestId}] Procesando pago:`, {
        invoiceId: paymentDialog.invoice.id,
        amount: finalPaymentAmount, // Usar el monto ajustado
        method: paymentDialog.paymentMethod,
        amountReceived: paymentDialog.amountReceived,
        paymentMethodId: FIXED_PAYMENT_METHOD_ID,
        isPartialPayment: isPartialPayment && finalPaymentAmount < remainingAmount, // Actualizar el flag si el monto final es el total
        montoTotal: totalInvoiceAmount,
        montoPagadoPrevio: previouslyPaid,
        montoPendiente: remainingAmount
      });

      // Procesar el pago a través del servicio
      const result = await PaymentsService.processPayment(
        paymentDialog.invoice.id, 
        finalPaymentAmount, // Usar el monto ajustado
        {
          method: paymentDialog.paymentMethod,
          amountReceived: paymentDialog.amountReceived,
          paymentMethodId: FIXED_PAYMENT_METHOD_ID,
          isPartialPayment: isPartialPayment && finalPaymentAmount < remainingAmount, // Actualizar el flag
          requestId: requestId // Enviar el ID único para seguimiento
        }
      );
      
      if (result) {
        console.log('✅ Pago procesado con éxito:', result);
        
        // Actualizar la factura en el estado local inmediatamente
        const updatedInvoice: Invoice = {
          ...paymentDialog.invoice,
          status: isPartialPayment ? 'PARCIAL' : 'PAGADO',
          isPaid: !isPartialPayment, // Solo se marca como pagada si no es parcial
          paymentDate: new Date().toISOString(),
          transactionId: result.transactionId || 'tx-' + Date.now(),
          // Guardar información de pago parcial si aplica
          paid_amount: (paymentDialog.invoice.paid_amount || 0) + finalPaymentAmount,
          remaining_amount: isPartialPayment ? 
            totalInvoiceAmount - ((paymentDialog.invoice.paid_amount || 0) + finalPaymentAmount) : 
            0,
          payment_status: isPartialPayment ? 'partial' : 'paid'
        };

        // Guardar los detalles del pago parcial para mostrarlos
        if (isPartialPayment && !updatedInvoice.payment_history) {
          updatedInvoice.payment_history = [];
        }
        
        // Agregar este pago al historial
        if (updatedInvoice.payment_history) {
          updatedInvoice.payment_history.push({
            amount: finalPaymentAmount,
            date: new Date().toISOString(),
            method: paymentDialog.paymentMethod,
            reference: result.transactionId || 'tx-' + Date.now()
          });
        }

        console.log('📝 Actualizando factura en estado local:', updatedInvoice);

        setInvoices(prevInvoices => 
          prevInvoices.map(invoice => 
            invoice.id === updatedInvoice.id ? updatedInvoice : invoice
          )
        );
        
        // Actualizar facturas pendientes si es pago parcial o total
        if (!isPartialPayment) {
          // Si es pago completo, quitar de la lista de pendientes
          setPendingInvoices(prev => 
            prev.filter(item => item.invoice.id !== updatedInvoice.id)
          );
        } else {
          // Si es parcial, actualizar la factura en la lista de pendientes
          console.log('📝 Actualizando factura como pago parcial');
          setPendingInvoices(prev => {
            const updated = prev.map(item => {
              if (item.invoice.id === updatedInvoice.id) {
                // Asegurar que los montos de pago parcial están definidos
                const paid_amount = updatedInvoice.paid_amount || finalPaymentAmount;
                const remaining_amount = updatedInvoice.remaining_amount !== undefined ? 
                                        updatedInvoice.remaining_amount : 
                                        (item.invoice.amount - paid_amount);
                                        
                console.log('📊 Detalles del pago parcial para factura', updatedInvoice.id, {
                  montoOriginal: item.invoice.amount,
                  montoPagado: paid_amount,
                  montoRestante: remaining_amount,
                  estadoAnterior: item.invoice.status,
                  nuevoEstado: 'PARCIAL'
                });
                
                const updatedItem = {
                  ...item,
                  // Hacer cast al tipo específico del status de PendingInvoiceWithClient
                  status: 'PARCIAL' as PendingInvoiceWithClient['status'], 
                  invoice: {
                    ...item.invoice,
                    status: 'PARCIAL' as InvoiceStatus, // Asegurar que status es del tipo correcto
                    paid_amount: paid_amount,
                    remaining_amount: remaining_amount,
                    payment_history: updatedInvoice.payment_history,
                    payment_status: 'partial' as Invoice['payment_status'] // Asegurar tipo correcto
                  }
                };
                console.log('📊 Factura actualizada con pago parcial:', updatedItem);
                return updatedItem;
              }
              return item;
            });
            return updated;
          });
        }
        
        // Intentar obtener las transacciones asociadas para mostrar información adicional
        try {
          const transactions = await TransactionsService.getTransactionsByEntity(
            'invoice', 
            paymentDialog.invoice.id
          );
          
          if (transactions && transactions.length > 0) {
            console.log('🔍 Transacciones asociadas:', transactions);
            
            // Aquí podrías mostrar información adicional sobre la transacción
            // o almacenarla en el estado para su uso posterior
          }
        } catch (txError) {
          console.warn('⚠️ No se pudieron obtener las transacciones:', txError);
          // No interrumpir el flujo principal si hay un error aquí
        }
        
        // Calcular cambio (solo relevante si es efectivo)
        const isCash = paymentDialog.paymentMethod === 'cash' || 
                      paymentDialog.paymentMethod === 'efectivo';
                      
        const change = isCash ? paymentDialog.amountReceived - finalPaymentAmount : 0;
        
        // Mostrar mensaje de éxito
        customToast.success({
          title: isPartialPayment ? '¡Pago Parcial Procesado!' : '¡Pago Procesado!',
          description: `Pago de ${formatCurrency(finalPaymentAmount)} procesado correctamente.${
            change > 0 ? ` Cambio: ${formatCurrency(change)}` : ''
          }${
            isPartialPayment ? ` Pendiente: ${formatCurrency(paymentDialog.paymentAmount - finalPaymentAmount)}` : ''
          }`
        });

        // Refrescar lista de facturas si es necesario
        if (paymentDialog.invoice.userId && onUpdateUser) {
          await onUpdateUser(paymentDialog.invoice.userId);
        }

        // Actualizar lista de facturas pendientes
        await getPendingInvoices();

        handleClosePaymentDialog();
      }
    } catch (error) {
      console.error('❌ Error al procesar pago:', error);
      
      // Mostrar mensaje de error más amigable según el tipo de error
      let errorMessage = 'No se pudo procesar el pago';
      
      if (error instanceof Error) {
        // Manejar casos específicos de error
        if (error.message.includes('Monto excede lo pendiente') || error.message.includes('excede el monto pendiente')) {
          errorMessage = 'El monto del pago excede lo pendiente por pagar. La factura posiblemente ya tiene pagos parciales registrados.';
        } else if (error.message.includes('ya ha sido pagada')) {
          errorMessage = 'Esta factura ya ha sido pagada completamente.';
        } else {
          // Usar el mensaje original
          errorMessage = error.message;
        }
      }
      
      customToast.error({
        title: 'Error al Procesar Pago',
        description: errorMessage
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Manejador para cambios en el estado de pago parcial desde el diálogo
  const handlePartialPaymentChange = (isPartial: boolean, amount: number) => {
    console.log('🔄 [useInvoices] Actualizando estado de pago parcial:', { isPartial, amount });
    
    // Actualizar el estado local
    setIsPartialPayment(isPartial);
    setPartialPaymentAmount(amount.toString());
    
    // Actualizar también el estado del diálogo para mantener todo sincronizado
    setPaymentDialog(prev => ({
      ...prev,
      isPartialPayment: isPartial, // Asegurar que este campo exista en PaymentDialogState
      partialPaymentAmount: amount
    }));
  };

  return {
    invoices,
    stats,
    paymentDialog,
    processingPayment,
    pendingInvoices,
    isPartialPayment,
    partialPaymentAmount,
    localAmountReceived,
    isInvoicePaid,
    getInvoicesForUser,
    getPendingInvoices,
    handleOpenPaymentDialog,
    handleClosePaymentDialog,
    setPaymentMethod,
    setAmountReceived,
    setIsPartialPayment,
    setPartialPaymentAmount,
    setLocalAmountReceived,
    handlePaymentSubmit,
    formatCurrency,
    formatDate,
    getCachedUser,
    cacheUser,
    handlePartialPaymentChange
  };
} 