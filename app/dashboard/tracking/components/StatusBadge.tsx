import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Truck, 
  Package, 
  AlertCircle,
  Clock,
  XCircle,
  CircleDashed,
  ShieldCheck,
  Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status?: string | null;
  /** Size variant of the badge: 'xs' | 'sm' | 'md' | 'lg' */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Whether to show the full text label or just the icon */
  iconOnly?: boolean;
  /** Optional className to extend styling */
  className?: string;
  /** Optional pulse animation effect */
  pulse?: boolean;
  /** Whether to use solid background fill (high contrast) */
  solid?: boolean;
  /** Whether to use gradient background (only works with solid=true) */
  gradient?: boolean;
  /** Optional tooltip text */
  tooltip?: string;
}

type StatusConfig = {
  color: string;
  solidColor: string;
  gradient: string;
  icon: React.ElementType;
  text: string;
  description?: string;
  pulseColor?: string;
};

/**
 * StatusBadge - A professional status indicator component that displays package
 * status with appropriate icon, color and optional animations
 * 
 * @example
 * <StatusBadge status="delivered" />
 * <StatusBadge status="in_transit" size="lg" />
 * <StatusBadge status="pending" iconOnly solid />
 * <StatusBadge status="processing" pulse />
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  iconOnly = false,
  className,
  pulse = false,
  solid = false,
  gradient = false,
  tooltip
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Hide tooltip after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showTooltip) {
      timer = setTimeout(() => setShowTooltip(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [showTooltip]);

  const getStatusConfig = (inputStatus?: string | null): StatusConfig => {
    // Default to 'pending' if status is undefined or null
    const safeStatus = inputStatus || 'pending';
    const statusLower = safeStatus.toLowerCase();
    
    const statusMap: Record<string, StatusConfig> = {
      // Delivered status with enhanced aesthetics
      delivered: {
        color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900/60 dark:hover:bg-green-900/70',
        solidColor: 'bg-green-600 text-white border-green-700 hover:bg-green-700 dark:bg-green-600 dark:border-green-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-800/20 hover:from-green-600 hover:to-emerald-700',
        icon: CheckCircle2,
        text: 'Entregado',
        description: 'El paquete ha sido entregado correctamente',
        pulseColor: 'rgba(34, 197, 94, 0.4)' // green-500 with alpha
      },
      entregado: {
        color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900/60 dark:hover:bg-green-900/70',
        solidColor: 'bg-green-600 text-white border-green-700 hover:bg-green-700 dark:bg-green-600 dark:border-green-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-800/20 hover:from-green-600 hover:to-emerald-700',
          icon: CheckCircle2,
        text: 'Entregado',
        description: 'El paquete ha sido entregado correctamente',
        pulseColor: 'rgba(34, 197, 94, 0.4)'
      },
      
      // In transit status
      in_transit: {
        color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60 dark:hover:bg-blue-900/70',
        solidColor: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-800/20 hover:from-blue-600 hover:to-indigo-700',
        icon: Truck,
        text: 'En Tránsito',
        description: 'El paquete está en camino hacia su destino',
        pulseColor: 'rgba(59, 130, 246, 0.4)' // blue-500 with alpha
      },
      'in transit': {
        color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60 dark:hover:bg-blue-900/70',
        solidColor: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-800/20 hover:from-blue-600 hover:to-indigo-700',
        icon: Truck,
        text: 'En Tránsito',
        description: 'El paquete está en camino hacia su destino',
        pulseColor: 'rgba(59, 130, 246, 0.4)'
      },
      en_transito: {
        color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60 dark:hover:bg-blue-900/70',
        solidColor: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-800/20 hover:from-blue-600 hover:to-indigo-700',
        icon: Truck,
        text: 'En Tránsito',
        description: 'El paquete está en camino hacia su destino',
        pulseColor: 'rgba(59, 130, 246, 0.4)'
      },
      'en transito': {
        color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60 dark:hover:bg-blue-900/70',
        solidColor: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-800/20 hover:from-blue-600 hover:to-indigo-700',
          icon: Truck,
        text: 'En Tránsito',
        description: 'El paquete está en camino hacia su destino',
        pulseColor: 'rgba(59, 130, 246, 0.4)'
      },
      
      // Pending status
      pending: {
        color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60 dark:hover:bg-amber-900/70',
        solidColor: 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700 dark:bg-amber-600 dark:border-amber-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-800/20 hover:from-amber-600 hover:to-amber-700',
        icon: Clock,
        text: 'Pendiente',
        description: 'El paquete está pendiente de procesamiento',
        pulseColor: 'rgba(245, 158, 11, 0.4)' // amber-500 with alpha
      },
      pendiente: {
        color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60 dark:hover:bg-amber-900/70',
        solidColor: 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700 dark:bg-amber-600 dark:border-amber-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-800/20 hover:from-amber-600 hover:to-amber-700',
          icon: Clock,
        text: 'Pendiente',
        description: 'El paquete está pendiente de procesamiento',
        pulseColor: 'rgba(245, 158, 11, 0.4)'
      },
      
      // Processing status
      processing: {
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/60 dark:hover:bg-indigo-900/70',
        solidColor: 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 dark:bg-indigo-600 dark:border-indigo-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-800/20 hover:from-indigo-600 hover:to-indigo-700',
        icon: Box,
        text: 'Procesando',
        description: 'El paquete está siendo procesado',
        pulseColor: 'rgba(99, 102, 241, 0.4)' // indigo-500 with alpha
      },
      procesando: {
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/60 dark:hover:bg-indigo-900/70',
        solidColor: 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 dark:bg-indigo-600 dark:border-indigo-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-800/20 hover:from-indigo-600 hover:to-indigo-700',
        icon: Box,
        text: 'Procesando',
        description: 'El paquete está siendo procesado',
        pulseColor: 'rgba(99, 102, 241, 0.4)'
      },
      
      // Received status (new)
      received: {
        color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60 dark:hover:bg-sky-900/70',
        solidColor: 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700 dark:bg-sky-600 dark:border-sky-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white border-sky-800/20 hover:from-sky-600 hover:to-sky-700',
        icon: Package,
        text: 'Recibido',
        description: 'El paquete ha sido recibido en el centro de distribución',
        pulseColor: 'rgba(14, 165, 233, 0.4)' // sky-500 with alpha
      },
      recibido: {
        color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60 dark:hover:bg-sky-900/70',
        solidColor: 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700 dark:bg-sky-600 dark:border-sky-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white border-sky-800/20 hover:from-sky-600 hover:to-sky-700',
          icon: Package,
        text: 'Recibido',
        description: 'El paquete ha sido recibido en el centro de distribución',
        pulseColor: 'rgba(14, 165, 233, 0.4)'
      },
      
      // Secured status (new)
      secured: {
        color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/60 dark:hover:bg-teal-900/70',
        solidColor: 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700 dark:bg-teal-600 dark:border-teal-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-800/20 hover:from-teal-600 hover:to-teal-700',
        icon: ShieldCheck,
        text: 'Asegurado',
        description: 'El paquete está asegurado durante el envío',
        pulseColor: 'rgba(20, 184, 166, 0.4)' // teal-500 with alpha
      },
      asegurado: {
        color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/60 dark:hover:bg-teal-900/70',
        solidColor: 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700 dark:bg-teal-600 dark:border-teal-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-800/20 hover:from-teal-600 hover:to-teal-700',
        icon: ShieldCheck,
        text: 'Asegurado',
        description: 'El paquete está asegurado durante el envío',
        pulseColor: 'rgba(20, 184, 166, 0.4)'
      },
      
      // Cancelled status
      cancelled: {
        color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60 dark:hover:bg-red-900/70',
        solidColor: 'bg-red-600 text-white border-red-700 hover:bg-red-700 dark:bg-red-600 dark:border-red-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-800/20 hover:from-red-600 hover:to-red-700',
        icon: XCircle,
        text: 'Cancelado',
        description: 'El envío ha sido cancelado',
        pulseColor: 'rgba(239, 68, 68, 0.4)' // red-500 with alpha
      },
      cancelado: {
        color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60 dark:hover:bg-red-900/70',
        solidColor: 'bg-red-600 text-white border-red-700 hover:bg-red-700 dark:bg-red-600 dark:border-red-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-800/20 hover:from-red-600 hover:to-red-700',
          icon: XCircle,
        text: 'Cancelado',
        description: 'El envío ha sido cancelado',
        pulseColor: 'rgba(239, 68, 68, 0.4)'
      },
      
      // Unknown status
      unknown: {
        color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-900/60 dark:hover:bg-slate-900/70',
        solidColor: 'bg-slate-600 text-white border-slate-700 hover:bg-slate-700 dark:bg-slate-600 dark:border-slate-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-800/20 hover:from-slate-600 hover:to-slate-700',
        icon: CircleDashed,
        text: 'Desconocido',
        description: 'Estado del envío desconocido',
        pulseColor: 'rgba(100, 116, 139, 0.4)' // slate-500 with alpha
      },
      desconocido: {
        color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-900/60 dark:hover:bg-slate-900/70',
        solidColor: 'bg-slate-600 text-white border-slate-700 hover:bg-slate-700 dark:bg-slate-600 dark:border-slate-700 dark:text-white',
        gradient: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-800/20 hover:from-slate-600 hover:to-slate-700',
        icon: CircleDashed,
        text: 'Desconocido',
        description: 'Estado del envío desconocido',
        pulseColor: 'rgba(100, 116, 139, 0.4)'
      },
    };

    // Try to find an exact match first
    if (statusMap[statusLower]) {
      return statusMap[statusLower];
    }
    
    // If no exact match, try to find a partial match
    for (const key in statusMap) {
      if (statusLower.includes(key) || key.includes(statusLower)) {
        return statusMap[key];
      }
    }
    
    // If no match found, return a default configuration
        return {
      color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800',
      solidColor: 'bg-gray-600 text-white border-gray-700 hover:bg-gray-700 dark:bg-gray-600 dark:border-gray-700',
      gradient: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-800/20 hover:from-gray-600 hover:to-gray-700',
          icon: AlertCircle,
      text: safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1),
      description: 'Estado personalizado del envío',
      pulseColor: 'rgba(107, 114, 128, 0.4)' // gray-500 with alpha
    };
  };

  const config = getStatusConfig(status);
  
  // Size configurations with extra small option
  const sizeStyles = {
    xs: 'text-xs px-1.5 py-0.5 font-medium',
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-sm px-2.5 py-1 font-medium',
    lg: 'text-base px-3 py-1.5 font-semibold'
  };
  
  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  // Animation properties for the pulse effect
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      boxShadow: [
        `0 0 0 0 ${config.pulseColor}`,
        `0 0 0 4px ${config.pulseColor}`,
        `0 0 0 0 ${config.pulseColor}`
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  return (
    <div className="relative inline-flex">
      <motion.div 
        variants={pulseVariants}
        animate={pulse ? "pulse" : undefined}
        className="relative inline-flex"
        onHoverStart={() => tooltip && setShowTooltip(true)}
        onHoverEnd={() => tooltip && setShowTooltip(false)}
      >
    <Badge 
          variant="outline"
          className={cn(
            solid 
              ? gradient 
                ? config.gradient
                : config.solidColor
              : config.color,
            sizeStyles[size],
            'flex items-center gap-1.5 border rounded-full transition-all duration-150 shadow-sm hover:shadow',
            className
          )}
        >
          <config.icon className={cn(
            iconSizes[size],
            "flex-shrink-0",
            pulse && "animate-pulse"
          )} />
          {!iconOnly && (
            <span className="relative whitespace-nowrap">
              {config.text}
            </span>
          )}
    </Badge>
      </motion.div>
      
      {showTooltip && tooltip && (
        <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 z-50 px-2 py-1 bg-black/90 text-white text-xs rounded shadow-lg whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
}; 