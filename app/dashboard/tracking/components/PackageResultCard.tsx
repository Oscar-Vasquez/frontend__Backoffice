import React, { useState } from 'react';
import { 
  PackageIcon, 
  Scale, 
  User, 
  Tag, 
  ArrowRight,
  UserCog,
  FileText,
  Eye,
  MapPin,
  Clock,
  Shield,
  Box,
  ChevronRight,
  Calendar,
  Building,
  Package2,
  AlertCircle,
  RefreshCcw,
  ServerOff
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrackingInfo } from '../services/directTrackingService';
import { formatPrice } from '../utils/helpers';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Define the Client interface first
interface Client {
  id: string;
  name: string;
  email: string;
  planRate: number;
  photo?: string;
  planName?: string;
  branchName?: string;
  shipping_insurance?: boolean;
  subscriptionDetails?: {
    planName: string;
    price?: string;
  };
}

// Extended TrackingInfo interface
interface ExtendedTrackingInfo extends Omit<TrackingInfo, 'client'> {
  isInvoiced?: boolean;
  invoiceDetails?: {
    invoice_number: string;
    [key: string]: any;
  };
  status?: string;
  status_name?: string;
  client?: Client;
  estimatedDeliveryDate?: string;
  lastUpdated?: string;
  notes?: string;
  origin?: string;
  destination?: string;
  declared_value?: string | number;
  shipping_insurance?: boolean;
  position?: string;
}

/**
 * Define the props for the PackageResultCard component
 */
interface PackageResultCardProps {
  result: ExtendedTrackingInfo;
  themeColor: string;
  onViewDetails: () => void;
  onChangeClient: (packageId: string) => void;
  addToInvoice: (packageId: string) => void;
  isInInvoice: boolean;
}

export const PackageResultCard: React.FC<PackageResultCardProps> = ({
  result,
  themeColor,
  onViewDetails,
  onChangeClient,
  addToInvoice,
  isInInvoice
}) => {
  // Estados para manejar operaciones asíncronas y errores
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAssigningClient, setIsAssigningClient] = useState(false);
  const [isApiError, setIsApiError] = useState(false);
  const [isAddingToInvoice, setIsAddingToInvoice] = useState(false);
  
  // Función que maneja la asignación de cliente, verificando primero si el ID tiene
  // el formato CNUSUP, en cuyo caso no muestra la alerta de error
  const handleClientAssignment = () => {
    // Si hay error de API, mostrar toast de reconexión
    if (isApiError) {
      toast.info("Intentando reconectar con el servidor...");
      setIsApiError(false);
      return;
    }

    // Solo mostrar alerta de error si no estamos en el proceso de asignación de cliente
    // Esto evita que aparezca la alerta cuando se está intentando asignar un cliente
    // a un paquete con formato de ID no UUID (como CNUSUP)
    const isTrackingFormat = result.id?.toString().startsWith('CNUSUP');
    
    // Si es un formato de tracking CNUSUP, no mostraremos alertas de error innecesarias
    // ya que en realidad la asignación funcionará correctamente después de seleccionar el cliente
    if (isTrackingFormat) {
      // Para IDs de formato CNUSUP, procedemos directamente sin alertas
      onChangeClient(result.id || result.trackingNumber);
    } else {
      // Para IDs que no son de tracking, mantenemos el comportamiento original
      try {
        onChangeClient(result.id || result.trackingNumber);
      } catch (error) {
        console.error('Error al iniciar asignación de cliente:', error);
        setIsApiError(true);
        toast.error('Error al asignar cliente', {
          description: 'No se pudo iniciar el proceso de asignación de cliente.'
        });
      }
    }
  };

  // Computed values
  const hasClient = !!result.client;
  const hasWeight = result.weight && result.weight > 0;
  const hasDimensions = result.length && result.width && result.height;

  // Convertir el código de tracking a mayúsculas para mejor visualización
  const formattedTrackingNumber = result.trackingNumber?.toUpperCase() || '';
  
  // Handle invoice button click
  const handleInvoiceClick = () => {
    // Check if the package has a client assigned
    if (!result.client) {
      toast.error("Este paquete no tiene un cliente asignado. Por favor, asigne un cliente primero.");
      return;
    }
    
    // Set loading state
    setIsAddingToInvoice(true);
    
    try {
      // Obtener el valor del seguro del cliente de forma explícita
      const clientHasInsurance = hasInsurance();
      
      console.log('⚡ Añadiendo paquete a factura con datos:', {
        id: result.id,
        trackingNumber: result.trackingNumber,
        weight: result.weight,
        clientId: result.client.id,
        clientName: result.client.name,
        planRate: result.client.planRate,
        shipping_insurance: clientHasInsurance
      });
      
      // Asegúrese de que todos los detalles del cliente se pasen
      const clientDetails = {
        photo: result.client.photo,
        email: result.client.email,
        planName: result.client.planName || 'Plan Estándar',
        branchName: result.client.branchName || 'Sucursal Principal',
        shipping_insurance: clientHasInsurance // Asegurarse de que este valor sea un booleano
      };
      
      console.log('📊 Detalles del cliente para facturación:', clientDetails);
      
      // If everything is OK, add to invoice
      addToInvoice(result.id || result.trackingNumber);
      
      // After the action completes - we'll remove the loading state after a small delay
      // to ensure the animation is visible
      setTimeout(() => {
        setIsAddingToInvoice(false);
      }, 800);
    } catch (error) {
      toast.error("Error al añadir a factura", {
        description: "Ocurrió un problema al procesar su solicitud."
      });
      setIsAddingToInvoice(false);
    }
  };

  // Determinar si hay problemas con el identificador
  const hasIdIssue = formattedTrackingNumber?.startsWith('CNUSUP');

  // Log para depuración de shipping_insurance
  React.useEffect(() => {
    if (result.client) {
      console.log('🔍 DEBUG - Estado de shipping_insurance:', {
        packageId: result.id,
        tracking: result.trackingNumber,
        clientExists: !!result.client,
        clientName: result.client?.name,
        shippingInsurance: result.client?.shipping_insurance,
        shippingInsuranceType: typeof result.client?.shipping_insurance
      });
    }
  }, [result.client, result.id, result.trackingNumber]);

  // Función auxiliar para verificar si el cliente tiene seguro
  const hasInsurance = (): boolean => {
    if (!result.client) return false;
    
    const insurance = result.client.shipping_insurance as boolean | string | number | undefined;
    if (typeof insurance === 'boolean') return insurance;
    if (typeof insurance === 'string') {
      const lowerValue = insurance.toLowerCase();
      return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    }
    if (typeof insurance === 'number') return insurance === 1;
    return false;
  };
  
  // Genera un código de casillero basado en el tracking number (replica la lógica del backend)
  const generarCodigoCasillero = (tracking: string): string => {
    // Extraer solo los números del tracking
    const numeros = tracking.replace(/\D/g, "");
    
    if (numeros.length < 2) {
      return "0A"; // Valor por defecto si no hay suficientes números
    }
    
    // Tomar el penúltimo dígito
    const penultimoDigito = numeros[numeros.length - 2];
    
    // Tomar el último dígito y convertirlo en una letra
    const ultimoDigito = parseInt(numeros[numeros.length - 1], 10);
    
    let letra = "C"; // Por defecto, 6-7-8-9 → C
    if (ultimoDigito <= 2) letra = "A"; // 0-1-2 → A
    else if (ultimoDigito <= 5) letra = "B"; // 3-4-5 → B
    
    // Retornar el código de casillero
    return `${penultimoDigito}${letra}`;
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border border-border/20 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-background to-muted/10">
        <CardHeader className="p-0 relative overflow-hidden">
          <div className={cn(
            "bg-gradient-to-r p-5 pb-4",
            isApiError 
              ? "from-red-50/30 to-red-50/10 dark:from-red-950/30 dark:to-red-900/10" 
              : hasIdIssue
                ? "from-amber-50/30 to-amber-50/10 dark:from-amber-950/30 dark:to-amber-900/10"
                : "from-primary/8 to-primary/3"
          )}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                  isApiError 
                    ? "bg-red-100 ring-2 ring-red-200/30 dark:bg-red-900/40 dark:ring-red-800/30" 
                    : hasIdIssue
                      ? "bg-amber-100 ring-2 ring-amber-200/30 dark:bg-amber-900/40 dark:ring-amber-800/30"
                      : "bg-primary/10 ring-2 ring-primary/5"
                )}>
                  {isApiError ? (
                    <ServerOff className="h-5 w-5 text-red-500/80 dark:text-red-400/80" />
                  ) : (
                    <Package2 className={cn(
                      "h-5 w-5",
                      hasIdIssue ? "text-amber-500/80 dark:text-amber-400/80" : "text-primary/80"
                    )} />
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tracking ID</span>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{formattedTrackingNumber}</h3>
                    
                    {hasIdIssue && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] p-3">
                            <p className="text-sm">
                              Este formato de ID puede causar problemas con algunas funciones.
                              El sistema está esperando un UUID en lugar de un código alfanumérico.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {isApiError && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] p-3">
                            <p className="text-sm font-medium text-red-500 mb-1">Error de conexión con el servidor</p>
                            <p className="text-xs">
                              No se pudo establecer conexión con el servidor o este devolvió un error.
                              Algunas funciones pueden no estar disponibles.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
          </div>
          </div>
        </div>

              <StatusBadge 
                status={result.packageStatus} 
                pulse={
                  (result.packageStatus || '')?.toLowerCase().includes('transit') || 
                  (result.packageStatus || '')?.toLowerCase().includes('tránsito')
                }
                solid={(result.packageStatus || '')?.toLowerCase().includes('entreg')}
                gradient={(result.packageStatus || '')?.toLowerCase().includes('entreg')}
                tooltip={`Estado: ${result.packageStatus || 'En proceso'}`}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-3">
          {/* Origen y destino con línea de progreso */}
          {result.origin && result.destination && (
            <div className="mb-4 mt-1">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-muted-foreground">{result.origin}</span>
                </div>
                
                <div className="flex-1 mx-2 px-2">
                  <div className="h-[3px] bg-muted/50 relative rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary/60 rounded-full" 
                      style={{ 
                        width: result.packageStatus?.toLowerCase().includes('entreg') ? '100%' : 
                              result.packageStatus?.toLowerCase().includes('transit') ? '60%' : '30%' 
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-muted-foreground">{result.destination}</span>
                  </div>
                </div>
              </div>
            )}
          
          {/* Información principal */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-xs text-muted-foreground">Peso</span>
              </div>
              <span className="font-medium text-foreground block">{result.weight} Lb</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-xs text-muted-foreground">Dimensiones</span>
              </div>
              <span className="font-medium text-foreground block">{result.length}×{result.width}×{result.height} cm</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-xs text-muted-foreground">Posición</span>
              </div>
              <span className="font-medium text-foreground block">
                {result.position || generarCodigoCasillero(result.trackingNumber)}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-xs text-muted-foreground">Actualizado</span>
              </div>
              <span className="font-medium text-foreground block">
                {result.lastUpdated ? new Date(result.lastUpdated).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <Separator className="my-3 opacity-50" />
          
          {/* Sección de cliente */}
          <div className="flex justify-between items-center mt-3 mb-1">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full overflow-hidden flex items-center justify-center",
                result.client?.photo 
                  ? "" 
                  : "bg-muted/60"
              )}>
                {result.client?.photo ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={result.client.photo} 
                      alt={result.client.name}
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        const clientName = result.client ? encodeURIComponent(result.client.name) : "user";
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=" + clientName + "&background=random";
                      }}
                    />
                    <AvatarFallback>
                      {result.client.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-4 w-4 text-muted-foreground/80" />
                )}
              </div>
              
              <div className="overflow-hidden">
                <span className="text-xs text-muted-foreground block">Cliente</span>
                {result.client ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate max-w-[150px]">{result.client.name}</span>
                      {result.client.planRate && (
                        <Badge className="bg-primary/10 hover:bg-primary/15 text-primary text-xs px-1.5">
                          ${result.client.planRate}/Lb
                  </Badge>
                      )}
                    </div>
                    {result.client.branchName && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        <Building className="h-3 w-3 inline-block mr-1 text-muted-foreground/70" />
                        {result.client.branchName}
                      </span>
                    )}
            </div>
                ) : (
                  <span className="text-muted-foreground font-medium italic">Sin asignar</span>
                )}
          </div>
        </div>

            <Button
              variant={isApiError ? "destructive" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-2.5 rounded-lg",
                isApiError 
                  ? "bg-red-100/80 hover:bg-red-200/80 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400" 
                  : "hover:bg-primary/5 text-primary/90"
              )}
              onClick={handleClientAssignment}
              disabled={isAssigningClient}
            >
              {isAssigningClient ? (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span className="text-xs">Procesando...</span>
                </>
              ) : isApiError ? (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Reconectar</span>
                </>
              ) : result.client ? (
              <>
                  <UserCog className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Cambiar</span>
              </>
            ) : (
              <>
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Asignar</span>
              </>
            )}
            </Button>
          </div>
          
          {/* Características extra */}
          <div className="flex flex-wrap gap-3 mt-4 mb-1">
            {result.estimatedDeliveryDate && (
              <Badge variant="outline" className="bg-background/80 border-border/30 font-normal text-xs px-2 py-1 rounded-md gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>Est: {new Date(result.estimatedDeliveryDate).toLocaleDateString()}</span>
              </Badge>
            )}
            
            <Badge 
              variant="outline" 
              className={cn(
                "font-normal text-xs px-2 py-1 rounded-md gap-1.5",
                // Verificación mejorada de shipping_insurance
                (result.client && hasInsurance())
                  ? "bg-green-50/80 border-green-200/30 text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30" 
                  : "bg-background/80 border-border/30"
              )}
            >
              <Shield className={cn(
                "h-3 w-3",
                (result.client && hasInsurance())
                  ? "text-green-600 dark:text-green-400" 
                  : "text-muted-foreground"
              )} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      {(result.client && hasInsurance())
                        ? 'Plan con seguro' 
                        : 'Sin seguro de envío'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px] p-3">
                    <p className="text-xs mb-1 font-medium">
                      {(result.client && hasInsurance())
                        ? "✅ Seguro de envío incluido" 
                        : "❌ Sin seguro de envío"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.client 
                        ? (hasInsurance())
                          ? `El cliente "${result.client.name}" tiene protección de envío incluida en su plan ${result.client.planName || 'actual'}.`
                          : `El cliente "${result.client.name}" no tiene seguro incluido en su plan ${result.client.planName || 'actual'}. Puede ser adquirido como complemento.`
                        : "No hay cliente asignado. Asigne un cliente para verificar su cobertura de seguro."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Badge>
          
            {/* Badge para mostrar el valor declarado del paquete */}
            {result.declared_value && (
              <Badge 
                variant="outline" 
                className="bg-blue-50/80 border-blue-200/30 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30 font-normal text-xs px-2 py-1 rounded-md gap-1.5"
              >
                <Tag className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        Valor: {typeof result.declared_value === 'number' 
                          ? formatPrice(result.declared_value) 
                          : result.declared_value}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] p-3">
                      <p className="text-xs mb-1 font-medium">
                        Valor declarado del envío
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Este valor representa el monto declarado para fines de seguro y aduanas.
                        {result.client?.shipping_insurance 
                          ? ' Este envío está protegido por seguro.' 
                          : ' Este envío no cuenta con seguro adicional.'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 px-5 pb-4 pt-1">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              size="sm"
            onClick={onViewDetails}
              className="h-9 bg-background/80 hover:bg-background border-border/40 shadow-sm"
          >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Ver detalles</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1 opacity-70" />
            </Button>
          </motion.div>
            
          {!isInInvoice && result.client && (
            <motion.div
              whileHover={{ scale: isAddingToInvoice ? 1 : 1.03 }}
              whileTap={{ scale: isAddingToInvoice ? 1 : 0.97 }}
            >
              <Button
                variant="default"
                size="sm"
                onClick={handleInvoiceClick}
                className="h-9 bg-primary/90 hover:bg-primary"
                disabled={isApiError || isAddingToInvoice}
              >
                {isAddingToInvoice ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs">Procesando...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-xs">Añadir a factura</span>
                  </>
                )}
              </Button>
            </motion.div>
          )}
            
          {isInInvoice && (
            <Badge variant="outline" className="h-9 bg-primary/5 text-primary border-primary/20 px-3 py-1.5 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              En lista de facturación
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}; 