import { 
  PackageIcon, 
  CheckCircle2,
  Truck,
  Clock,
  AlertCircle
} from 'lucide-react';
import React from 'react';

/**
 * Formatea un valor de precio para mostrarlo correctamente
 * @param price El precio a formatear
 * @returns El precio formateado con dos decimales
 */
export const formatPrice = (price: any): string => {
  if (typeof price === 'number') {
    return price.toFixed(2);
  }
  
  if (price && !isNaN(Number(price))) {
    return Number(price).toFixed(2);
  }
  
  return '0.00';
};

/**
 * Formatea una fecha en formato legible
 * @param dateString Fecha en formato ISO
 * @returns Fecha formateada
 */
export const formatDate = (dateString?: string) => {
  if (!dateString) return 'No disponible';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

/**
 * Obtiene el color adecuado para el estado del paquete
 * @param status Estado del paquete
 * @returns Clase de color
 */
export const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('entreg') || statusLower === 'delivered') {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  if (statusLower.includes('transit') || statusLower === 'in transit') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (statusLower.includes('proces') || statusLower === 'processing') {
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
  if (statusLower.includes('cancel') || statusLower === 'cancelled') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

/**
 * Obtiene el ícono adecuado para el estado del paquete
 * @param status Estado del paquete
 * @returns Componente de ícono
 */
export const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('entreg') || statusLower === 'delivered') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
  if (statusLower.includes('transit') || statusLower === 'in transit') {
    return <Truck className="h-5 w-5 text-blue-500" />;
  }
  if (statusLower.includes('proces') || statusLower === 'processing') {
    return <Clock className="h-5 w-5 text-yellow-500" />;
  }
  if (statusLower.includes('cancel') || statusLower === 'cancelled') {
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
  
  return <PackageIcon className="h-5 w-5 text-gray-500" />;
}; 