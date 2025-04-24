"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import {
  AlertCircle, Check, DollarSign, CreditCard, Wallet, Package, User,
  ArrowRight, RefreshCcw, X, ChevronUp, ChevronDown, Scale, Box, Clock,
  FileText, CalendarDays, Mail, Phone, MapPin, Layers, Zap
} from "lucide-react";
import { PaymentDialogState, PaymentMethod } from "../types";
import { PaymentType, paymentTypesService } from "@/app/services/payment-types.service";
import { cn } from "@/lib/utils";

interface PaymentDialogProps {
  paymentDialog: PaymentDialogState;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAmountReceivedChange: (amount: number) => void;
  isProcessing: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onPartialPaymentChange?: (isPartial: boolean, amount: number) => void;
}

export default function PaymentDialog({
  paymentDialog,
  onClose,
  onSubmit,
  onPaymentMethodChange,
  onAmountReceivedChange,
  isProcessing,
  formatCurrency,
  formatDate,
  onPartialPaymentChange
}: PaymentDialogProps) {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'payment'>('details');
  const [showPackages, setShowPackages] = useState(true);
  const amountReceivedInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estado local para el input de monto recibido para evitar re-renderizados
  const [localAmountReceived, setLocalAmountReceived] = useState<string>('');
  
  // Estado para controlar si es un pago parcial
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  
  // Estado para almacenar el monto del pago parcial
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<string>('');
  
  // Inicializar el estado local cuando cambia el valor global
  useEffect(() => {
    if (paymentDialog.amountReceived) {
      setLocalAmountReceived(paymentDialog.amountReceived.toString());
    } else {
      setLocalAmountReceived('');
    }
  }, [paymentDialog.open, paymentDialog.paymentMethod]);

  // Detectar tamaño de pantalla móvil
  const checkIfMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  // Inicializar y actualizar el estado de isMobile cuando cambia el tamaño de la ventana
  useEffect(() => {
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [checkIfMobile]);

  // Función auxiliar para verificar si es método efectivo
  const isCashMethod = (method: string): boolean => {
    if (!method) return false;
    
    const cashMethods = ['cash', 'efectivo', 'efectivo-cash', 'payment-cash'];
    const result = cashMethods.some(cashMethod => method.toLowerCase().includes(cashMethod));
    
    // Debug para ver si se está detectando correctamente
    console.log(`Verificando si '${method}' es efectivo:`, result);
    
    return result;
  };

  // Obtener los tipos de pago al abrir el diálogo
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const types = await paymentTypesService.getAllPaymentTypes();
        console.log("Tipos de pago obtenidos:", types);
        
        // Verificar si realmente obtenemos métodos de pago
        if (types && Array.isArray(types) && types.length > 0) {
          const activeTypes = types.filter(type => type.is_active);
          setPaymentTypes(activeTypes);
          
          // Seleccionar un método predeterminado si no hay uno seleccionado
          if (!paymentDialog.paymentMethod && activeTypes.length > 0) {
            // Intentar encontrar efectivo
            const cashMethod = activeTypes.find(type => 
              type.code === 'efectivo' || 
              type.code === 'cash' || 
              (type.name && type.name.toLowerCase().includes('efectivo'))
            );
            
            if (cashMethod && cashMethod.code) {
              console.log("Seleccionando método predeterminado (efectivo):", cashMethod.code);
              onPaymentMethodChange(cashMethod.code);
            } else {
              // Si no hay efectivo, seleccionar el primero
              const firstMethod = activeTypes[0];
              if (firstMethod && firstMethod.code) {
                console.log("Seleccionando primer método disponible:", firstMethod.code);
                onPaymentMethodChange(firstMethod.code);
              }
            }
          }
        } else {
          // Si no hay resultados o hay un problema, usar métodos predeterminados
          console.warn("No se recibieron métodos de pago válidos, usando predeterminados");
          const defaultTypes = getDefaultPaymentTypes();
          setPaymentTypes(defaultTypes);
          
          // Seleccionar efectivo como predeterminado si no hay método seleccionado
          if (!paymentDialog.paymentMethod) {
            console.log("Seleccionando efectivo como método predeterminado");
            onPaymentMethodChange('efectivo');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar tipos de pago:", error);
        setError("No se pudieron cargar los métodos de pago");
        // En caso de error, establecer métodos de pago predeterminados
        const defaultTypes = getDefaultPaymentTypes();
        setPaymentTypes(defaultTypes);
        
        // Seleccionar efectivo como predeterminado si no hay método seleccionado
        if (!paymentDialog.paymentMethod) {
          console.log("Seleccionando efectivo como método predeterminado (tras error)");
          onPaymentMethodChange('efectivo');
        }
        
        setLoading(false);
      }
    };

    // Métodos de pago predeterminados para usar como respaldo
    const getDefaultPaymentTypes = (): PaymentType[] => {
      return [
        {
          id: '1',
          name: 'Efectivo',
          code: 'efectivo',
          icon: 'dollar-sign',
          description: 'Pago en efectivo',
          is_active: true
        },
        {
          id: '2',
          name: 'Tarjeta',
          code: 'tarjeta',
          icon: 'credit-card',
          description: 'Pago con tarjeta de crédito/débito',
          is_active: true
        },
        {
          id: '3',
          name: 'Transferencia',
          code: 'transferencia',
          icon: 'wallet',
          description: 'Pago por transferencia bancaria',
          is_active: true
        }
      ];
    };

    if (paymentDialog.open) {
      fetchPaymentTypes();
      console.log("Método de pago al abrir:", paymentDialog.paymentMethod);
    }
  }, [paymentDialog.open, paymentDialog.paymentMethod, onPaymentMethodChange]);

  // Inicializar el valor del monto recibido cuando se abre el diálogo
  useEffect(() => {
    if (paymentDialog.open) {
      // Si no hay método de pago seleccionado, establecer uno predeterminado
      if (!paymentDialog.paymentMethod) {
        console.log("Estableciendo método de pago predeterminado: efectivo");
        onPaymentMethodChange("efectivo");
      }
      
      // Reiniciar el estado de pago parcial SÓLO cuando se abre el diálogo por primera vez
      if (isPartialPayment) {
        // Mantenemos el estado actual si ya está en pago parcial
        console.log("Manteniendo modo de pago parcial activo");
      } else {
        console.log("Inicializando modo de pago parcial a false");
        setIsPartialPayment(false);
        setPartialPaymentAmount(paymentDialog.paymentAmount.toString());
      }
      
      // Para métodos en efectivo, inicializar el monto recibido SOLO SI no hay un valor ya ingresado
      if (isCashMethod(paymentDialog.paymentMethod) && !paymentDialog.amountReceived) {
        console.log("Inicializando campo de monto recibido con:", isPartialPayment 
          ? partialPaymentAmount 
          : paymentDialog.paymentAmount);
          
        // Inicializar con el monto apropiado según el tipo de pago
        const amount = isPartialPayment 
          ? (partialPaymentAmount === '' ? 0 : parseFloat(partialPaymentAmount))
          : paymentDialog.paymentAmount;
        
        onAmountReceivedChange(amount);
        setLocalAmountReceived(amount.toString());
        
        // Dar foco al campo cuando aparezca
        setTimeout(() => {
          if (amountReceivedInputRef.current) {
            amountReceivedInputRef.current.focus();
            amountReceivedInputRef.current.select();
          }
        }, 300);
      }
    }
  }, [
    paymentDialog.open, 
    paymentDialog.paymentMethod, 
    paymentDialog.paymentAmount, 
    paymentDialog.amountReceived, 
    onAmountReceivedChange, 
    onPaymentMethodChange, 
    isPartialPayment,
    partialPaymentAmount,
    isCashMethod
  ]);

  // Manejar el cambio del valor en el input con useCallback para prevenir recreaciones
  const handleAmountReceivedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Actualizar solo el estado local mientras el usuario escribe
    setLocalAmountReceived(value);
  }, []);

  // Actualizar el estado global solo cuando el input pierde el foco
  const handleAmountReceivedBlur = useCallback(() => {
    // Convertir el valor local a número y actualizar el estado global
    const numValue = localAmountReceived === '' ? 0 : parseFloat(localAmountReceived);
    onAmountReceivedChange(numValue);
  }, [localAmountReceived, onAmountReceivedChange]);

  // Manejar el cambio de método de pago
  const handlePaymentMethodChange = useCallback((method: string) => {
    console.log("Cambiando método de pago a:", method);
    
    // Asegurarnos de que el método seleccionado existe en los métodos disponibles
    const methodExists = paymentTypes.some(type => 
      (type.code === method) || 
      (type.name?.toLowerCase().replace(/\s+/g, '-') === method)
    );
    
    if (!methodExists && method) {
      console.warn(`El método ${method} no existe en los métodos disponibles.`);
    }
    
    // Aplicar el cambio
    onPaymentMethodChange(method);
    
    // Si el método es efectivo, inicializar el monto recibido SOLO SI no tiene valor o cambiamos DE otro método A efectivo
    const changingToEffectivo = isCashMethod(method) && !isCashMethod(paymentDialog.paymentMethod);
    if (changingToEffectivo && (!paymentDialog.amountReceived || paymentDialog.amountReceived < paymentDialog.paymentAmount)) {
      console.log("Cambiando a método efectivo, inicializando monto recibido");
      const newAmount = paymentDialog.paymentAmount;
      onAmountReceivedChange(newAmount);
      setLocalAmountReceived(newAmount.toString());
      
      // Dar foco al input del monto recibido
      setTimeout(() => {
        if (amountReceivedInputRef.current) {
          amountReceivedInputRef.current.focus();
          amountReceivedInputRef.current.select();
        }
      }, 100);
    }
  }, [paymentTypes, paymentDialog.paymentMethod, paymentDialog.paymentAmount, paymentDialog.amountReceived, onPaymentMethodChange, isCashMethod]);

  // Renderizar icono según el tipo de pago
  const renderPaymentIcon = (code: string) => {
    console.log("Renderizando icono para código:", code);
    
    switch (code?.toLowerCase()) {
      case 'cash':
      case 'efectivo':
        return <DollarSign className="h-5 w-5" />;
      case 'card':
      case 'tarjeta':
      case 'tarjeta-de-credito':
      case 'tarjeta-de-debito':
        return <CreditCard className="h-5 w-5" />;
      case 'transfer':
      case 'transferencia':
      case 'transferencia-bancaria':
        return <Wallet className="h-5 w-5" />;
      case 'billetera-digital':
      case 'wallet-interno':
      case 'yappy':
        return <Wallet className="h-5 w-5" />;
      default:
        console.log("Usando icono predeterminado para código desconocido:", code);
        return <Wallet className="h-5 w-5" />;
    }
  };

  // Manejar reintentar carga
  const handleRetry = () => {
    const fetchPaymentTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const types = await paymentTypesService.getAllPaymentTypes();
        setPaymentTypes(types.filter(type => type.is_active));
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar tipos de pago:", error);
        setError("No se pudieron cargar los métodos de pago");
        setLoading(false);
      }
    };

    fetchPaymentTypes();
  };

  // Calcular si hay cambio - memoizado para evitar recálculos innecesarios
  const hasChange = useMemo(() => {
    const numAmount = localAmountReceived === '' ? 0 : parseFloat(localAmountReceived);
    const targetAmount = isPartialPayment ? 
      (partialPaymentAmount === '' ? 0 : parseFloat(partialPaymentAmount)) : 
      paymentDialog.paymentAmount;
    
    return isCashMethod(paymentDialog.paymentMethod) && numAmount > targetAmount;
  }, [
    isCashMethod, 
    paymentDialog.paymentMethod, 
    paymentDialog.paymentAmount, 
    localAmountReceived,
    isPartialPayment,
    partialPaymentAmount
  ]);
  
  // Calcular el monto del cambio - memoizado
  const changeAmount = useMemo(() => {
    if (!hasChange) return 0;
    
    const numAmount = localAmountReceived === '' ? 0 : parseFloat(localAmountReceived);
    const targetAmount = isPartialPayment ? 
      (partialPaymentAmount === '' ? 0 : parseFloat(partialPaymentAmount)) : 
      paymentDialog.paymentAmount;
    
    return numAmount - targetAmount;
  }, [
    hasChange, 
    localAmountReceived, 
    paymentDialog.paymentAmount,
    isPartialPayment,
    partialPaymentAmount
  ]);

  // Comprobar si el monto recibido es suficiente - memoizado
  const isAmountValid = useMemo(() => {
    if (!isCashMethod(paymentDialog.paymentMethod)) return true;
    
    const numAmount = localAmountReceived === '' ? 0 : parseFloat(localAmountReceived);
    const targetAmount = isPartialPayment ? 
      (partialPaymentAmount === '' ? 0 : parseFloat(partialPaymentAmount)) : 
      paymentDialog.paymentAmount;
    
    // Si es pago parcial, el monto debe ser mayor que 0 y menor o igual que el monto total
    if (isPartialPayment) {
      return numAmount >= targetAmount && targetAmount > 0 && targetAmount <= paymentDialog.paymentAmount;
    }
    
    // Para pagos normales, el monto debe ser al menos igual al total
    return numAmount >= paymentDialog.paymentAmount;
  }, [
    isCashMethod, 
    paymentDialog.paymentMethod, 
    paymentDialog.paymentAmount, 
    localAmountReceived, 
    isPartialPayment, 
    partialPaymentAmount
  ]);

  // Calcular cuánto falta para completar el pago - memoizado
  const amountShortage = useMemo(() => {
    if (!isCashMethod(paymentDialog.paymentMethod)) return 0;
    
    const numAmount = localAmountReceived === '' ? 0 : parseFloat(localAmountReceived);
    const targetAmount = isPartialPayment ? 
      (partialPaymentAmount === '' ? 0 : parseFloat(partialPaymentAmount)) : 
      paymentDialog.paymentAmount;
    
    return numAmount < targetAmount ? targetAmount - numAmount : 0;
  }, [
    isCashMethod, 
    paymentDialog.paymentMethod, 
    paymentDialog.paymentAmount, 
    localAmountReceived,
    isPartialPayment,
    partialPaymentAmount
  ]);

  // Calcular el monto restante después del pago parcial
  const remainingAmount = useMemo(() => {
    if (!isPartialPayment) return 0;
    
    const partialAmount = partialPaymentAmount === '' ? 0 : parseFloat(partialPaymentAmount);
    return Math.max(0, paymentDialog.paymentAmount - partialAmount);
  }, [isPartialPayment, partialPaymentAmount, paymentDialog.paymentAmount]);

  // Manejar cambio en el monto del pago parcial
  const handlePartialPaymentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // No permitir montos mayores al total de la factura
    if (value !== '' && parseFloat(value) > paymentDialog.paymentAmount) {
      setPartialPaymentAmount(paymentDialog.paymentAmount.toString());
      // Si el pago es por el monto total, no es parcial
      setIsPartialPayment(false);
      
      // Notificar al componente padre
      if (onPartialPaymentChange) {
        onPartialPaymentChange(false, paymentDialog.paymentAmount);
      }
    } else {
      setPartialPaymentAmount(value);
      
      // Notificar al componente padre si el valor es válido
      if (value !== '' && onPartialPaymentChange) {
        const numValue = parseFloat(value);
        onPartialPaymentChange(true, numValue);
      }
      
      // Para pagos en efectivo, el monto recibido debe ser al menos igual al monto parcial
      if (isCashMethod(paymentDialog.paymentMethod)) {
        const numValue = value === '' ? 0 : parseFloat(value);
        const currentReceived = localAmountReceived === '' ? 0 : parseFloat(localAmountReceived);
        
        // Solo actualizar el monto recibido si es menor que el nuevo monto parcial
        if (currentReceived < numValue || value === '') {
          setLocalAmountReceived(value);
          onAmountReceivedChange(numValue);
        }
      }
    }
  }, [paymentDialog.paymentAmount, paymentDialog.paymentMethod, isCashMethod, onAmountReceivedChange, localAmountReceived, onPartialPaymentChange]);

  // Manejar la activación/desactivación del pago parcial
  const togglePartialPayment = useCallback(() => {
    const newIsPartialPayment = !isPartialPayment;
    console.log('Toggling partial payment:', newIsPartialPayment);
    
    // Evitar ciclos de re-renderizado innecesarios
    setIsPartialPayment(prev => {
      const newValue = !prev;
      console.log('Setting isPartialPayment from', prev, 'to', newValue);
      return newValue;
    });
    
    if (!isPartialPayment) { // Cambiando a TRUE (activando pago parcial)
      // Al activar el pago parcial, inicializar con un valor por defecto (50% del total)
      const halfAmount = (paymentDialog.paymentAmount / 2).toFixed(2);
      setPartialPaymentAmount(halfAmount);
      
      // Si es pago en efectivo, actualizar también el monto recibido
      if (isCashMethod(paymentDialog.paymentMethod)) {
        setLocalAmountReceived(halfAmount);
        onAmountReceivedChange(parseFloat(halfAmount));
      }
      
      // Notificar al componente padre sobre el cambio
      if (onPartialPaymentChange) {
        onPartialPaymentChange(true, parseFloat(halfAmount));
      }
      
      // Dar foco al input del monto parcial después del cambio
      setTimeout(() => {
        if (amountReceivedInputRef.current) {
          amountReceivedInputRef.current.focus();
          amountReceivedInputRef.current.select();
        }
      }, 100);
    } else { // Cambiando a FALSE (desactivando pago parcial)
      // Al desactivar el pago parcial, restablecer al monto total
      setPartialPaymentAmount(paymentDialog.paymentAmount.toString());
      
      // Si es pago en efectivo, actualizar también el monto recibido
      if (isCashMethod(paymentDialog.paymentMethod)) {
        setLocalAmountReceived(paymentDialog.paymentAmount.toString());
        onAmountReceivedChange(paymentDialog.paymentAmount);
      }
      
      // Notificar al componente padre sobre el cambio
      if (onPartialPaymentChange) {
        onPartialPaymentChange(false, paymentDialog.paymentAmount);
      }
    }
  }, [
    isPartialPayment, 
    paymentDialog.paymentAmount, 
    paymentDialog.paymentMethod, 
    isCashMethod, 
    onAmountReceivedChange,
    onPartialPaymentChange
  ]);

  // Formatear el peso
  const formatWeight = (weight: number | string | undefined | null) => {
    // Si el peso es inválido, nulo o indefinido
    if (weight === undefined || weight === null) {
      return "0.00 lb";
    }
    
    // Convertir a número para asegurar que sea un valor válido
    const weightNum = Number(weight);
    
    // Si no es un número válido o es negativo
    if (isNaN(weightNum) || weightNum < 0) {
      return "0.00 lb";
    }
    
    // Si el peso es 0 o muy cercano a 0, mostramos 0.00
    if (weightNum < 0.01) {
      return "0.00 lb";
    }
    
    return `${weightNum.toFixed(2)} lb`;
  };

  // Función auxiliar para obtener el peso del paquete
  const getPackageWeight = (pkg: any): number => {
    // Si el paquete no existe, devuelve 0
    if (!pkg) return 0;
    
    // Accede directamente a la propiedad weight definida en el tipo Package
    if (typeof pkg.weight !== 'undefined') {
      return Number(pkg.weight) || 0;
    }
    
    // Intenta obtener el peso desde otras posibles estructuras
    const weight = 
      (pkg.package && pkg.package.weight) || 
      (pkg.details && pkg.details.weight) ||
      (typeof pkg.data === 'object' && pkg.data && pkg.data.weight) ||
      0;
    
    return Number(weight) || 0;
  };
  
  // Función auxiliar para obtener el peso volumétrico del paquete
  const getVolumetricWeight = (pkg: any): number => {
    // Si el paquete no existe, devuelve 0
    if (!pkg) return 0;
    
    // Accede directamente a la propiedad volumetricWeight definida en el tipo Package
    if (typeof pkg.volumetricWeight !== 'undefined') {
      return Number(pkg.volumetricWeight) || 0;
    }
    
    // Intenta obtener el peso volumétrico desde otras posibles estructuras
    const volumetricWeight = 
      (pkg.package && pkg.package.volumetricWeight) || 
      (pkg.details && pkg.details.volumetricWeight) ||
      (typeof pkg.data === 'object' && pkg.data && pkg.data.volumetricWeight) ||
      0;
    
    return Number(volumetricWeight) || 0;
  };

  // Verificar si tenemos información del cliente
  const hasClientInfo = paymentDialog.invoice?.client;

  // Agregamos un efecto para manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('payment-method-dropdown');
      const button = document.getElementById('payment-method-button');
      
      if (dropdown && !dropdown.contains(event.target as Node) && 
          button && !button.contains(event.target as Node)) {
        dropdown.classList.add('hidden');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Dialog 
      open={paymentDialog.open} 
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent className="w-[95vw] md:w-[90vw] max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-auto p-0 bg-background"
                    style={{ zIndex: 100 }}>
        {/* Overlay de carga cuando isProcessing es true */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card shadow-lg rounded-xl p-6 max-w-md w-full mx-auto flex flex-col items-center"
            >
              <div className="relative mb-4">
                <motion.div 
                  className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <DollarSign className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary/70" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Procesando pago</h3>
              <p className="text-center text-muted-foreground mb-3">
                {isPartialPayment 
                  ? `Estamos procesando tu pago parcial de ${formatCurrency(parseFloat(partialPaymentAmount) || 0)}`
                  : 'Estamos procesando tu pago'}
              </p>
              <div className="flex justify-center space-x-1 mt-1">
                <motion.div
                  className="h-2 w-2 bg-primary rounded-full"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="h-2 w-2 bg-primary rounded-full"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="h-2 w-2 bg-primary rounded-full"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Por favor, no cierres esta ventana
              </p>
            </motion.div>
          </div>
        )}

        {/* Cabecera fija */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">Procesar Pago</h2>
              {paymentDialog.invoice?.invoiceNumber && (
                <Badge variant="outline" className="ml-2 font-mono text-xs">
                  {paymentDialog.invoice.invoiceNumber || `INV-${paymentDialog.invoice.id.substring(0, 8)}`}
                </Badge>
              )}
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Pestañas */}
          <div className="flex">
            <button
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'details' 
                  ? 'border-primary text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
              onClick={() => setActiveTab('details')}
            >
              <span className="flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" />
                {isMobile ? 'Detalles' : 'Detalles de Factura'}
              </span>
            </button>
            <button
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'payment' 
                  ? 'border-primary text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
              onClick={() => setActiveTab('payment')}
            >
              <span className="flex items-center justify-center gap-2">
                <DollarSign className="h-4 w-4" />
                {isMobile ? 'Pago' : 'Método de Pago'}
              </span>
            </button>
          </div>
        </div>

        {/* Contenido principal con padding adaptativo */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Contenido de la pestaña Detalles */}
          {activeTab === 'details' && paymentDialog.invoice && (
            <div className="space-y-8">
              {/* Bloque superior con resumen de factura y cliente */}
              <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/20">
                {/* Cliente - Información condensada */}
                {hasClientInfo && (
                  <div className="px-4 pt-4 pb-3 border-b bg-muted/20">
                    <div className="flex items-center space-x-3">
                      {(paymentDialog.invoice.client?.photo || paymentDialog.invoice.client?.photoURL) ? (
                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                          <img 
                            src={paymentDialog.invoice.client?.photo || paymentDialog.invoice.client?.photoURL} 
                            alt={`${paymentDialog.invoice.client?.firstName} ${paymentDialog.invoice.client?.lastName}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=User';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-primary/70" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-base truncate">
                          {paymentDialog.invoice.client?.firstName} {paymentDialog.invoice.client?.lastName}
                        </h3>
                        {paymentDialog.invoice.client?.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {paymentDialog.invoice.client.email}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={paymentDialog.invoice.status === 'PAGADO' ? "success" : "warning"}
                        className="ml-2 px-2"
                      >
                        {paymentDialog.invoice.status}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Información de factura y monto - Grid responsivo */}
                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Fecha */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Fecha Emisión
                      </p>
                      <p className="text-sm font-medium">{formatDate(paymentDialog.invoice.date)}</p>
                    </div>
                    
                    {/* Plan */}
                    {(paymentDialog.invoice.client?.planName || 
                      paymentDialog.invoice.client?.subscriptionPlan?.name) && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5" />
                          Plan Suscripción
                        </p>
                        <p className="text-sm font-medium truncate">
                          {paymentDialog.invoice.client?.planName || 
                          paymentDialog.invoice.client?.subscriptionPlan?.name}
                        </p>
                      </div>
                    )}
                    
                    {/* Paquetes */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        Paquetes
                      </p>
                      <p className="text-sm font-medium">{paymentDialog.invoice.totalPackages}</p>
                    </div>
                    
                    {/* Monto a pagar - Destacado */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        Total a Pagar
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(paymentDialog.invoice.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles adicionales del cliente */}
              {hasClientInfo && (
                <div className="rounded-xl border border-border/40 overflow-hidden">
                  <div className="px-4 py-3 bg-muted/20 border-b flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Información del Cliente
                    </h3>
                    
                    {/* Precio del plan si existe */}
                    {(paymentDialog.invoice.client?.planRate || 
                      paymentDialog.invoice.client?.price ||
                      paymentDialog.invoice.client?.subscriptionPlan?.price) && (
                      <div className="text-xs flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-muted-foreground">Precio Plan:</span>
                        <span className="font-semibold">
                          {formatCurrency(Number(
                            paymentDialog.invoice.client?.planRate || 
                            paymentDialog.invoice.client?.price ||
                            paymentDialog.invoice.client?.subscriptionPlan?.price || 0
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {/* Teléfono */}
                    {paymentDialog.invoice.client?.phone && (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-4 w-4 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Teléfono</p>
                          <p>{paymentDialog.invoice.client.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Dirección */}
                    {paymentDialog.invoice.client?.address && (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dirección</p>
                          <p className="truncate max-w-[250px]">{paymentDialog.invoice.client.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paquetes - Card Colapsable */}
              <div className="rounded-xl border border-border/40 overflow-hidden">
                <div className="px-4 py-3 bg-muted/20 border-b flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Paquetes ({paymentDialog.invoice.packages?.length || 0})
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPackages(!showPackages)}
                    className="h-7 text-xs gap-1 rounded-full hover:bg-muted"
                  >
                    {showPackages ? 'Ocultar' : 'Mostrar'}
                    {showPackages ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                {showPackages && (
                  <div className="p-4">
                    {paymentDialog.invoice.packages?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {paymentDialog.invoice.packages.map((pkg, index) => (
                          <Card key={pkg.packageId || index} className="overflow-hidden shadow-sm border-border/40">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between pb-1 border-b border-border/20">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <Box className="h-3 w-3 text-primary/70" />
                                    </div>
                                    <span className="font-medium text-sm">
                                      Paquete {index + 1}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {pkg.trackingNumber}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {/* Peso real */}
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Scale className="h-3.5 w-3.5" />
                                      <span>Peso:</span>
                                    </div>
                                    <span className="ml-auto font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800/30">
                                      {formatWeight(getPackageWeight(pkg))}
                                    </span>
                                  </div>
                                  
                                  {/* Peso volumétrico */}
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Scale className="h-3.5 w-3.5" />
                                      <span>Peso Vol.:</span>
                                    </div>
                                    <span className="ml-auto font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-100 dark:border-amber-800/30">
                                      {formatWeight(getVolumetricWeight(pkg))}
                                    </span>
                                  </div>
                                  
                                  {/* Posición del paquete */}
                                  {pkg.position && (
                                    <div className="flex items-center gap-1.5 col-span-2 mt-1 mb-1">
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>Posición:</span>
                                      </div>
                                      <span className="ml-auto font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30">
                                        {pkg.position}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Dimensiones - Mejorado */}
                                  <div className="flex items-center gap-1.5 col-span-2 mt-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Box className="h-3.5 w-3.5" />
                                      <span>Dimensiones:</span>
                                    </div>
                                    <span className="ml-auto font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200 border border-purple-100 dark:border-purple-800/30">
                                      {pkg.dimensions ? 
                                        `${pkg.dimensions.length}×${pkg.dimensions.width}×${pkg.dimensions.height} cm` : 
                                        "0×0×0 cm"}
                                    </span>
                                  </div>
                                  
                                  {/* Estado del paquete */}
                                  <div className="flex items-center gap-1.5 col-span-2 mt-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>Estado:</span>
                                    </div>
                                    <span className="ml-auto font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200 border border-slate-100 dark:border-slate-800/30">
                                      {pkg.status || "Entregado"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                        <Package className="h-5 w-5 mr-2 opacity-40" />
                        No hay paquetes asociados a esta factura
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contenido de la pestaña Pago */}
          {activeTab === 'payment' && (
            <div className="p-4 sm:p-6">
              {/* Sección de Pago Parcial */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="partial-payment"
                      checked={isPartialPayment}
                      onCheckedChange={togglePartialPayment}
                    />
                    <Label htmlFor="partial-payment" className="font-medium cursor-pointer">
                      Pago parcial
                    </Label>
                  </div>
                  {isPartialPayment && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-muted-foreground"
                    >
                      Restante: {formatCurrency(remainingAmount)}
                    </motion.div>
                  )}
                </div>
              
                {/* Detalles del Pago */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total a pagar:</span>
                    <span className="font-semibold">{formatCurrency(paymentDialog.paymentAmount)}</span>
                  </div>
                
                  {paymentDialog.invoice?.paid_amount && paymentDialog.invoice.paid_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ya pagado:</span>
                      <span className="text-green-600 font-semibold">{formatCurrency(paymentDialog.invoice.paid_amount)}</span>
                    </div>
                  )}
                
                  {/* Campo para ingresar monto parcial */}
                  {isPartialPayment && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2"
                    >
                      <Label htmlFor="partial-amount" className="mb-2 block text-sm font-medium">
                        ¿Cuánto desea pagar ahora?
                      </Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="partial-amount"
                          type="number"
                          placeholder="Monto a pagar ahora"
                          className="pl-9 pr-12"
                          value={partialPaymentAmount}
                          onChange={handlePartialPaymentChange}
                          min={0.01}
                          max={paymentDialog.paymentAmount}
                          step={0.01}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                          MXN
                        </span>
                      </div>
                      
                      {/* Barra de progreso del pago */}
                      {partialPaymentAmount && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progreso del pago</span>
                            <span>
                              {parseFloat(partialPaymentAmount) > 0 
                                ? Math.min(100, Math.round((parseFloat(partialPaymentAmount) / paymentDialog.paymentAmount) * 100))
                                : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-2 transition-all duration-300 ease-out"
                              style={{ 
                                width: `${Math.min(100, (parseFloat(partialPaymentAmount) / paymentDialog.paymentAmount) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Selección de método de pago */}
              <div className="mb-6">
                <Label htmlFor="payment-method" className="mb-2 block font-medium">
                  Método de pago
                </Label>
                
                {loading ? (
                  <div className="flex justify-center items-center p-6">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : error ? (
                  <div className="text-center p-4 rounded-lg border border-red-200 bg-red-50">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 mb-3">{error}</p>
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Reintentar
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {paymentTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => type.code && handlePaymentMethodChange(type.code)}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-lg border text-center transition-all",
                          paymentDialog.paymentMethod === type.code
                            ? "bg-primary/10 border-primary text-primary ring-1 ring-primary"
                            : "bg-card hover:bg-muted/50 border-border"
                        )}
                      >
                        {renderPaymentIcon(type.code || '')}
                        <span className="text-sm font-medium">{type.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input para monto recibido (solo para efectivo) */}
              {isCashMethod(paymentDialog.paymentMethod) && (
                <div className="mb-6">
                  <Label htmlFor="amount-received" className="mb-2 block font-medium">
                    Monto recibido
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount-received"
                      ref={amountReceivedInputRef}
                      type="number"
                      placeholder="0.00"
                      className={cn(
                        "pl-9 pr-12",
                        !isAmountValid && "border-red-500 focus-visible:ring-red-500"
                      )}
                      value={localAmountReceived}
                      onChange={handleAmountReceivedChange}
                      onBlur={handleAmountReceivedBlur}
                      min={isPartialPayment ? parseFloat(partialPaymentAmount) || 0 : paymentDialog.paymentAmount}
                      step="0.01"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      MXN
                    </span>
                  </div>
                  
                  {/* Mostrar advertencia si el monto recibido es menor que el requerido */}
                  {amountShortage > 0 && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Faltan {formatCurrency(amountShortage)}
                    </p>
                  )}
                  
                  {/* Mostrar monto de cambio si aplica */}
                  {hasChange && (
                    <p className="mt-1 text-sm text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Cambio: {formatCurrency(changeAmount)}
                    </p>
                  )}
                </div>
              )}

              {/* Botón procesando */}
              {isProcessing ? (
                <Button disabled className="w-full" size="lg">
                  <Spinner className="mr-2 h-4 w-4" />
                  Procesando...
                </Button>
              ) : (
                <Button 
                  onClick={onSubmit}
                  disabled={
                    // Deshabilitar si:
                    !paymentDialog.paymentMethod || // No hay método de pago seleccionado
                    (!isAmountValid) || // El monto recibido no es válido (para efectivo)
                    (isPartialPayment && (!partialPaymentAmount || parseFloat(partialPaymentAmount) <= 0 || parseFloat(partialPaymentAmount) > paymentDialog.paymentAmount)) // Es parcial pero el monto es inválido
                  }
                  className="w-full"
                  size="lg"
                >
                  {isPartialPayment 
                    ? `Procesar pago de ${formatCurrency(parseFloat(partialPaymentAmount || '0'))}`
                    : `Procesar pago de ${formatCurrency(paymentDialog.paymentAmount)}`}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Barra de acción fija */}
        <div className="sticky bottom-0 left-0 right-0 p-3 sm:p-4 border-t bg-background/95 backdrop-blur-sm flex justify-between items-center gap-3 z-10">
          {!isMobile && (
            <div className="text-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="gap-1"
              >
                Cancelar
              </Button>
            </div>
          )}
          
          <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab(activeTab === 'details' ? 'payment' : 'details')}
                className="flex-1"
                disabled={isProcessing}
              >
                {activeTab === 'details' ? 'Siguiente' : 'Anterior'}
              </Button>
            )}
            
            {/* En la pestaña details mostramos el botón Siguiente, en payment solo mostramos Procesar Pago */}
            {activeTab === 'details' ? (
              <Button
                variant="default"
                size={isMobile ? "sm" : "default"}
                onClick={() => setActiveTab('payment')}
                disabled={isProcessing}
                className={`gap-1 ${isMobile ? 'flex-1' : ''}`}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                size={isMobile ? "sm" : "default"}
                onClick={(e) => {
                  e.preventDefault();
                  // Evitar que el evento se propague para prevenir re-renders innecesarios
                  e.stopPropagation();
                  onSubmit();
                }}
                disabled={
                  isProcessing || 
                  !paymentDialog.paymentMethod || 
                  (isPartialPayment 
                    ? partialPaymentAmount === '' || parseFloat(partialPaymentAmount || '0') <= 0
                    : !isCashMethod(paymentDialog.paymentMethod) 
                      ? false 
                      : !isAmountValid
                  )
                }
                className={`gap-1 ${isMobile ? 'flex-1' : ''}`}
              >
                {isProcessing ? (
                  <Spinner className="h-4 w-4 mr-1.5" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-1.5" />
                )}
                <span>
                  {isPartialPayment 
                   ? `Procesar pago de ${formatCurrency(parseFloat(partialPaymentAmount || '0'))}` 
                   : 'Procesar pago'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 