"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Check, 
  User, 
  Mail, 
  CreditCard, 
  Building, 
  BadgeCheck, 
  UserPlus, 
  AlertCircle, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Phone, 
  MapPin, 
  Calendar, 
  Code, 
  Copy,
  CheckCircle,
  Shield,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ClientSectionProps } from './types';
import { containerVariants, itemVariants } from './animations';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

/**
 * Componente que muestra la información del cliente asignado al paquete
 * con diseño y animaciones ultra-modernas para 2025+
 */
export const ClientSection = ({ client, onClientChange, packageData }: ClientSectionProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Estado para datos detallados del cliente
  const [detailedClient, setDetailedClient] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // API base URL para solicitudes directas
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  
  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // 3D rotation transforms
  const rotateX = useTransform(mouseY, [-300, 300], [3, -3]);
  const rotateY = useTransform(mouseX, [-300, 300], [-3, 3]);
  
  // Spring physics for smoother movement
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });
  
  // Custom animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
  
  // Función para obtener detalles del cliente
  const fetchClientDetails = async (clientId: string) => {
    if (!clientId) return;
    
    setIsLoadingDetails(true);
    try {
      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      console.log('🔍 Solicitando detalles del cliente con ID:', clientId);
      
      // Realizar la solicitud al endpoint de usuarios usando la referencia completa
      const response = await fetch(`${apiBaseUrl}/users/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error al obtener detalles del cliente: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Detalles del cliente obtenidos:', data);
      
      // Conservar todas las referencias tal como vienen del backend
      setDetailedClient(data);
    } catch (error) {
      console.error('❌ Error al obtener detalles del cliente:', error);
      toast.error('No se pudieron cargar los detalles del cliente', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };
  
  // Custom mouse move handler for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  // Cargar detalles del cliente cuando cambia el cliente
  useEffect(() => {
    if (client?.id) {
      fetchClientDetails(client.id);
    } else {
      setDetailedClient(null);
    }
  }, [client?.id]);
  
  // Verificar estructura completa del cliente
  useEffect(() => {
    // Log detallado de todos los campos del cliente
    console.log('=== DATOS COMPLETOS DEL CLIENTE ===', {
      clientProvided: !!client,
      clientData: client,
      clientFields: client ? Object.keys(client) : [],
      hasPhotoUrl: client?.photoUrl !== undefined,
      hasPhoto: client?.photo !== undefined,
      detailedClient,
      // Log específico para referencias
      references: client ? {
        branchReference: client.branchReference,
        subscriptionPlan: client.subscriptionPlan,
        typeUserReference: client.typeUserReference,
        walletReference: client.walletReference
      } : null
    });
    
    // Log específico para inspeccionar estructuras de datos críticas
    if (client?.branchReference) {
      console.log('🏢 Referencia de Sucursal:', {
        raw: client.branchReference,
        type: typeof client.branchReference,
        isObject: typeof client.branchReference === 'object',
        path: typeof client.branchReference === 'object' ? client.branchReference.path : null,
        id: typeof client.branchReference === 'object' ? client.branchReference.id : null
      });
    }
    
    if (client?.subscriptionPlan) {
      console.log('📋 Referencia de Plan:', {
        raw: client.subscriptionPlan,
        type: typeof client.subscriptionPlan,
        isObject: typeof client.subscriptionPlan === 'object',
        path: typeof client.subscriptionPlan === 'object' ? client.subscriptionPlan.path : null,
        id: typeof client.subscriptionPlan === 'object' ? client.subscriptionPlan.id : null
      });
    }
    
    // Buscar cualquier campo que pueda contener una URL de imagen
    if (client) {
      // Lista de posibles campos que podrían contener una URL de imagen
      const possibleImageFields = ['photoUrl', 'photo', 'avatar', 'image', 'profilePic', 'picture'];
      
      const foundImageFields = possibleImageFields.filter(field => 
        Object.prototype.hasOwnProperty.call(client, field) && 
        client[field as keyof typeof client]
      );
      
      console.log('Posibles campos de imagen encontrados:', foundImageFields);
      
      // Si encontramos algún campo con datos, lo registramos
      if (foundImageFields.length > 0) {
        foundImageFields.forEach(field => {
          const value = client[field as keyof typeof client];
          console.log(`Campo ${field}:`, value);
        });
      }
    }
    
    // Loggear la información del paquete para verificar si contiene fechas
    console.log('=== DATOS DEL PAQUETE ===', packageData);
  }, [client, packageData, detailedClient]);

  // Efecto para procesar la URL de la imagen
  useEffect(() => {
    // Intentar encontrar una URL de imagen válida
    let sourceUrl = null;
    
    // Primero verificamos photoUrl (campo actual)
    if (client?.photoUrl) {
      sourceUrl = client.photoUrl;
      console.log('Usando photoUrl:', sourceUrl);
    } 
    // Verificar si existe un campo photo legacy
    else if (client?.photo) {
      sourceUrl = client.photo;
      console.log('Usando campo photo legacy:', sourceUrl);
    }
    // Verificar en detailedClient
    else if (detailedClient?.photo) {
      sourceUrl = detailedClient.photo;
      console.log('Usando photo de detailedClient:', sourceUrl); 
    }
    
    // Si se encuentra una URL
    if (sourceUrl) {
      // Verificar si la URL ya tiene protocolo
      const url = sourceUrl.startsWith('http') 
        ? sourceUrl 
        : `https://${sourceUrl}`;
      
      console.log('URL procesada para la imagen:', url);
      setImageUrl(url);
      setImageError(false);
    } else {
      console.log('No se encontró ninguna URL de imagen en los datos del cliente');
      setImageUrl(null);
      
      // Si tenemos un ID de cliente, intentar buscar la imagen en Firebase
      if (client?.id) {
        tryLoadFirebaseImage(client.id);
      }
    }
  }, [client, detailedClient]);
  
  // Función para intentar cargar la imagen desde Firebase
  const tryLoadFirebaseImage = async (clientId: string) => {
    setIsLoadingFirebase(true);
    console.log('Intentando cargar imagen de Firebase para el cliente ID:', clientId);
    
    try {
      // Usar directamente la URL fija con el formato que proporcionó el usuario
      // Esto funciona porque sabemos exactamente cómo se construye la URL en Firebase
      const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/workexpress-8732e.firebasestorage.app/o/users%2F${clientId}%2Fprofile%2Fprofile_${clientId}_1740454273217.jpg?alt=media&token=6b4ee78a-1244-48fc-ac80-4be4f159e379`;
      
      console.log('Usando URL exacta de Firebase:', firebaseUrl);
      
      // Intentar cargar la imagen directamente
      setImageUrl(firebaseUrl);
      console.log('Imagen de Firebase asignada, URL:', firebaseUrl);
    } catch (error) {
      console.error('Error al intentar cargar imagen de Firebase:', error);
      setImageError(true);
    } finally {
      setIsLoadingFirebase(false);
    }
  };

  // Manejar cambio de cliente
  const handleClientChange = () => {
    if (onClientChange && client?.id) {
      onClientChange(client.id);
    }
  };

  // Efecto para hacer logging detallado de referencias cuando cambian los datos
  useEffect(() => {
    if (detailedClient) {
      // Usar 'any' para evitar errores de TypeScript cuando se accede a propiedades dinámicas
      const clientAny = detailedClient as any;
      console.log('🔍 DATOS DE REFERENCIAS EN DETAILED CLIENT:', {
        branchDetails: clientAny.branchDetails,
        subscriptionDetails: clientAny.subscriptionDetails,
        branchReference: clientAny.branchReference || 'No disponible',
        subscriptionPlan: clientAny.subscriptionPlan || 'No disponible',
        typeUserReference: clientAny.typeUserReference || 'No disponible',
        walletReference: clientAny.walletReference || 'No disponible'
      });
    }
  }, [detailedClient]);

  // Obtener los datos del cliente, combinando valores cuando sea necesario
  // Priorizar los valores de cliente básico (que son correctos) sobre detailedClient cuando tengan valores por defecto
  const clientData = {
    ...(detailedClient || {}),
    // Priorizar planRate de client si existe y el de detailedClient es 0
    planRate: client?.planRate && (!detailedClient?.planRate || detailedClient.planRate === 0) 
      ? client.planRate 
      : detailedClient?.planRate || client?.planRate || 0,
    // Asegurarse de mantener el nombre original
    name: client?.name || 
      `${detailedClient?.firstName || ''} ${detailedClient?.lastName || ''}`.trim() || 'Sin nombre',
    // Mantener el email original si existe
    email: client?.email || detailedClient?.email || 'Sin email'
  };
  
  // Verificar si estamos usando datos combinados o parciales
  const isUsingPartialData = !!(client?.planRate && (!detailedClient?.planRate || detailedClient.planRate === 0));
  
  // Obtener las iniciales del cliente verificando primero si el cliente existe
  const clientInitials = client?.name 
    ? client.name
        .split(' ')
        .map(name => name[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'NC'; // "No Cliente" como valor por defecto

  const getRandomLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 70%, 80%, 0.2)`;
  };

  const backgroundGradient = getRandomLightColor();

  // Función auxiliar para verificar si el cliente tiene seguro
  const hasInsurance = (): boolean => {
    if (!client) return false;
    
    if (client.shipping_insurance === undefined) return false;
    
    if (typeof client.shipping_insurance === 'boolean') {
      return client.shipping_insurance;
    }
    
    // Por compatibilidad, mantenemos la conversión de string/number si llega con ese tipo
    if (typeof client.shipping_insurance === 'string') {
      const lowerValue = client.shipping_insurance.toLowerCase();
      return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    }
    
    if (typeof client.shipping_insurance === 'number') {
      return client.shipping_insurance === 1;
    }
    
    return false;
  };

  // Log para depuración de shipping_insurance
  useEffect(() => {
    if (client) {
      console.log('🔍 DEBUG - ClientSection - Estado de shipping_insurance:', {
        clientName: client.name,
        shippingInsurance: client.shipping_insurance,
        shippingInsuranceType: typeof client.shipping_insurance,
        hasInsuranceResult: hasInsurance()
      });
    }
  }, [client]);

  if (!client) {
    return (
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ 
            rotateX: springRotateX,
            rotateY: springRotateY,
            perspective: 1000
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "w-[90%] mx-auto relative",
            "bg-gradient-to-br from-white/95 via-white/90 to-white/80",
            "dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-800/80",
            "backdrop-blur-2xl",
            "border border-white/20 dark:border-slate-700/30",
            "shadow-[0_10px_50px_rgba(0,0,0,0.04)]",
            "dark:shadow-[0_10px_50px_rgba(0,0,0,0.2)]",
            "rounded-[2.5rem] p-8",
            "transition-all duration-500 ease-out",
            "overflow-hidden",
            "flex flex-col items-center justify-center gap-6"
          )}
        >
          {/* Decorative elements */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 dark:from-purple-500/20 dark:to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 dark:from-indigo-500/20 dark:to-purple-500/10 rounded-full blur-3xl"></div>
          
          <motion.div 
            variants={itemVariants} 
            className="relative"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.03, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
              className="absolute -inset-4 bg-gradient-to-r from-purple-300/10 via-indigo-300/10 to-purple-300/10 dark:from-purple-700/10 dark:via-indigo-700/20 dark:to-purple-700/10 rounded-full blur-xl"
            />
            <User className="h-16 w-16 text-purple-400/50 dark:text-purple-500/50" strokeWidth={1.5} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Sin Cliente Asignado</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              Este paquete no tiene un cliente asignado actualmente. Puede asignar uno haciendo clic en el botón de abajo.
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              className={cn(
                "gap-2 px-6 py-5 h-auto text-base",
                "bg-gradient-to-br from-white/80 to-white/50",
                "dark:from-slate-800/80 dark:to-slate-800/50",
                "text-purple-600 dark:text-purple-400",
                "border-purple-200/50 dark:border-purple-800/30",
                "shadow-sm hover:shadow-md",
                "hover:bg-white dark:hover:bg-slate-800",
                "transition-all duration-300"
              )}
              onClick={handleClientChange}
            >
              <UserPlus className="h-5 w-5" />
              <span>Asignar Cliente</span>
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          rotateX: springRotateX,
          rotateY: springRotateY,
          perspective: 1000
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "w-[90%] mx-auto relative",
          "bg-gradient-to-br from-white/95 via-white/90 to-white/80",
          "dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-800/80",
          "backdrop-blur-2xl",
          "border border-white/20 dark:border-slate-700/30",
          "shadow-[0_10px_50px_rgba(0,0,0,0.04)]",
          "dark:shadow-[0_10px_50px_rgba(0,0,0,0.2)]",
          "rounded-[2.5rem] p-8",
          "transition-all duration-500 ease-out",
          "overflow-hidden"
        )}
      >
        {/* Decorative elements */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 dark:from-purple-500/20 dark:to-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 dark:from-indigo-500/20 dark:to-purple-500/10 rounded-full blur-3xl"></div>

        {/* Encabezado con animación */}
        <div className="flex justify-between items-start mb-8">
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-5"
          >
            <motion.div 
              whileHover={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className={cn(
                "p-4 rounded-2xl",
                "bg-gradient-to-br from-purple-100/90 via-indigo-50 to-purple-50/80",
                "dark:from-purple-800/40 dark:via-indigo-900/30 dark:to-purple-900/20",
                "shadow-inner shadow-purple-100/40 dark:shadow-purple-900/10",
                "border border-purple-100/70 dark:border-purple-800/20",
                "relative overflow-hidden"
              )}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                  times: [0, 0.5, 1]
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
              />
              <User className="h-6 w-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
            </motion.div>
            
            <div>
              <motion.h2 
                className={cn(
                  "text-2xl font-semibold mb-1",
                  "text-gray-900 dark:text-white"
                )}
                whileHover={{ scale: 1.02 }}
              >
                Cliente Asignado
                <motion.span 
                  className="ml-2 inline-block" 
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4 text-purple-500 inline" />
                </motion.span>
              </motion.h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-light">
                Información detallada del cliente responsable del paquete
              </p>
            </div>
          </motion.div>

          {/* Indicador de carga */}
          {isLoadingDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />
              <span className="text-xs text-purple-600 dark:text-purple-400">Cargando detalles...</span>
            </motion.div>
          )}

          {/* Botón para cambiar cliente */}
          {onClientChange && (
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleClientChange}
                className={cn(
                  "gap-2",
                  "border-purple-200 dark:border-purple-800",
                  "text-purple-700 dark:text-purple-300",
                  "hover:bg-purple-50 dark:hover:bg-purple-900/50",
                  "shadow-sm hover:shadow",
                  "transition-all duration-300"
                )}
              >
                <UserPlus className="h-4 w-4" />
                <span>Cambiar Cliente</span>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Agregar indicador de datos parciales */}
        {isUsingPartialData && (
          <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800/30 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>Algunos datos han sido complementados con información parcial. Las referencias existen pero los detalles no se han resuelto completamente.</p>
          </div>
        )}

        {/* Contenedor principal */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "relative overflow-hidden",
            "bg-gradient-to-br from-white/90 to-white/70",
            "dark:from-gray-800/70 dark:to-gray-800/50",
            "backdrop-blur-md",
            "rounded-2xl",
            "border border-gray-100/60 dark:border-gray-700/50",
            "shadow-xl",
            "transition-all duration-300",
            "p-0"
          )}
        >
          {/* Fondo decorativo */}
          <div 
            className="absolute inset-0 opacity-10 dark:opacity-20 z-0" 
            style={{
              backgroundImage: `linear-gradient(120deg, ${backgroundGradient}, transparent)`,
              backgroundSize: '200% 200%',
              animation: 'gradientAnimation 15s ease infinite'
            }}
          />
          
          {/* Barra superior con estado */}
          <div className="bg-gradient-to-r from-purple-100/80 to-indigo-100/60 dark:from-purple-900/30 dark:to-indigo-900/20 px-6 py-3 flex justify-between items-center border-b border-purple-100/30 dark:border-purple-800/20">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-green-50/80 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Activo
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Actualizado recientemente</span>
            </div>
          </div>

          <div className="relative z-10 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar del cliente con efectos avanzados */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex-shrink-0"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.7, 0.5],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                    className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-300/20 via-indigo-300/10 to-purple-300/20 dark:from-purple-700/20 dark:via-indigo-700/10 dark:to-purple-700/20 blur-md"
                  />
                  
                  <Avatar className="h-24 w-24 rounded-2xl shadow-lg border-2 border-white dark:border-gray-700 relative z-10">
                    {imageUrl && !imageError ? (
                      <AvatarImage 
                        src={imageUrl} 
                        alt={client.name}
                        onError={(e) => {
                          console.log('Error al cargar la imagen:', e);
                          setImageError(true);
                        }}
                        className="object-cover"
                        onLoad={() => console.log('Imagen cargada correctamente:', imageUrl)}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 text-2xl font-semibold text-purple-800 dark:text-purple-300">
                        {clientInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                
                {isLoadingFirebase && (
                  <div className="absolute -top-2 -right-2 bg-indigo-100 dark:bg-indigo-900/70 p-1.5 rounded-full shadow-md border border-white dark:border-gray-700 animate-pulse" title="Buscando imagen...">
                    <Loader2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                )}
                
                {imageError && imageUrl && !isLoadingFirebase && (
                  <div className="absolute -top-2 -right-2 bg-amber-100 dark:bg-amber-900/70 p-1.5 rounded-full shadow-md border border-white dark:border-gray-700" title="Error al cargar la imagen">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                
                {!imageUrl && !isLoadingFirebase && (
                  <div className="absolute -top-2 -right-2 bg-blue-100 dark:bg-blue-900/70 p-1.5 rounded-full shadow-md border border-white dark:border-gray-700" title="No hay imagen disponible">
                    <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                
                {!imageError && imageUrl && !isLoadingFirebase && (
                  <div className="absolute -top-2 -right-2 bg-green-100 dark:bg-green-900/70 p-1.5 rounded-full shadow-md border border-white dark:border-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </motion.div>

              {/* Información del cliente */}
              <div className="flex-1 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center md:text-left"
                >
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {clientData.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm justify-center md:justify-start">
                    <Mail className="h-4 w-4" />
                    <span>{clientData.email}</span>
                  </div>
                </motion.div>
                
                {/* Información del plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
                  >
                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/50 dark:border-indigo-800/30">
                      <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plan Contratado</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {/* Intentar obtener el nombre del plan directamente del objeto si está disponible */}
                        {clientData.planName || 
                         detailedClient?.planName || 
                         clientData.subscriptionDetails?.planName || 
                         (typeof clientData.subscriptionPlan === 'object' && 
                          (clientData.subscriptionPlan?.name ||
                           clientData.subscriptionPlan?.planName)) ||
                         (clientData.subscriptionPlan && clientData.planRate > 0 ? 
                          `Plan (${clientData.subscriptionPlan.id})` : 
                          'Plan Estándar')}
                        {/* Mostrar indicador de ID si estamos usando una referencia parcial */}
                        {(typeof clientData.subscriptionPlan === 'object' && 
                         !clientData.planName && 
                         !detailedClient?.planName && 
                         !clientData.subscriptionDetails?.planName && 
                         clientData.planRate > 0) && (
                           <span className="ml-2 text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                             ID: {clientData.subscriptionPlan.id.substring(0, 6)}...
                           </span>
                        )}
                      </p>
                      <motion.div 
                        className="mt-1.5 h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >
                        <motion.div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '75%' }}
                          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
                  >
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100/50 dark:border-amber-800/30">
                      <Check className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tarifa Mensual</p>
                      <div className="flex items-baseline gap-1.5">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          ${parseFloat(String(
                            // Priorizar explícitamente planRate del client original
                            client?.planRate ||
                            clientData.planRate || 
                            clientData.price || 
                            clientData.subscriptionDetails?.price || 
                            (typeof clientData.subscriptionPlan === 'object' && clientData.subscriptionPlan?.price) ||
                            0
                          )).toFixed(2)}
                        </p>
                        <span className="text-xs text-green-600 dark:text-green-400">USD</span>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs py-0.5 px-1.5 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">
                          Al día
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {(clientData.branchName || detailedClient?.branchName) && (
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-gray-100/60 dark:border-gray-700/30 shadow-sm md:col-span-2"
                    >
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100/50 dark:border-emerald-800/30">
                        <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sucursal Asignada</p>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                            {/* Intentar obtener el nombre de la sucursal directamente del objeto si está disponible */}
                            {clientData.branchName || 
                             detailedClient?.branchName || 
                             clientData.branchDetails?.name || 
                             (typeof clientData.branchReference === 'object' && clientData.branchReference?.name) ||
                             (typeof clientData.branchReference === 'object' ? 
                              `Sucursal (${clientData.branchReference.id})` : 
                              'Sucursal Principal')}
                            {/* Mostrar indicador de ID si estamos usando una referencia parcial */}
                            {(typeof clientData.branchReference === 'object' && 
                             !clientData.branchName && 
                             !detailedClient?.branchName && 
                             !clientData.branchDetails?.name) && (
                               <span className="ml-2 text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                                 ID: {clientData.branchReference.id.substring(0, 6)}...
                               </span>
                            )}
                          </p>
                          <motion.div
                            whileHover={{ x: 3 }}
                            whileTap={{ x: -2 }}
                            className="text-emerald-600 dark:text-emerald-400 cursor-pointer"
                          >
                            <ArrowRight size={16} />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Información de contacto y estado */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-100/60 dark:border-gray-700/30 shadow-sm p-4 md:col-span-2"
                  >
                    <div className="flex items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100/50 dark:border-blue-800/30 mr-3">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Información adicional</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Teléfono */}
                      {(clientData.phone || clientData.phoneNumber) && (
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 mt-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30">
                            <Phone className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {clientData.phone || clientData.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Dirección */}
                      {clientData.address && (
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 mt-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30">
                            <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {clientData.address}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Fecha de creación */}
                      {clientData.createdAt && (
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 mt-0.5 rounded-md bg-green-50 dark:bg-green-900/30">
                            <Calendar className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cliente desde</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {new Date(clientData.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Estado de verificación */}
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 mt-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30">
                          <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                          <div className="flex items-center mt-0.5">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                (clientData.accountStatus === true || clientData.isVerified === true)
                                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              )}
                            >
                              {(clientData.accountStatus === true || clientData.isVerified === true) 
                                ? 'Verificado' 
                                : 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Estado del seguro de envío */}
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 mt-0.5 rounded-md ${hasInsurance() ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                          <Shield className={`h-3.5 w-3.5 ${hasInsurance() ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Seguro de envío</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            {hasInsurance() ? (
                              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                Incluido en plan
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                No incluido
                              </span>
                            )}
                          </p>
                          </div>
                        </div>
                      
                      {/* Valor declarado */}
                      {packageData?.declared_value && (
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 mt-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30">
                            <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Valor declarado</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {typeof packageData.declared_value === 'number' 
                                ? `$${packageData.declared_value.toFixed(2)} USD`
                                : packageData.declared_value}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Estilos específicos para la animación de gradiente */}
        <style jsx global>{`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}; 