'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Calendar, 
  Info, 
  Truck,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CombinedTrackingInfo } from '../types';
import { getThemeColor } from '../utils/theme-utils';
import { StatusBadge } from './StatusBadge';

interface TrackingResultsListProps {
  results: CombinedTrackingInfo[];
  onSelectTracking: (id: string) => void;
  themeColor: string;
}

/**
 * Componente que muestra la lista de resultados de tracking
 * Presenta cada resultado en una tarjeta con información resumida
 */
const TrackingResultsList: React.FC<TrackingResultsListProps> = ({
  results, 
  onSelectTracking,
  themeColor
}) => {
  // No mostrar nada si no hay resultados
  if (!results || results.length === 0) {
    return null;
  }
  
  // Formatea la fecha en español
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  // Helper para obtener el ID del paquete, independientemente del formato
  const getPackageId = (tracking: any): string => {
    return tracking.id || '';
  };

  // Helper para obtener el número de tracking, independientemente del formato
  const getTrackingNumber = (tracking: any): string => {
    return tracking.tracking || tracking.trackingNumber || '';
  };

  // Helper para obtener el estado, independientemente del formato
  const getStatus = (tracking: any): string => {
    return tracking.status || tracking.trackingStatus || 'pending';
  };

  // Helper para obtener el nombre del estado, independientemente del formato
  const getStatusName = (tracking: any): string => {
    return tracking.statusName || tracking.status_name || '';
  };

  // Helper para obtener la fecha de creación, independientemente del formato
  const getCreatedDate = (tracking: any): string => {
    return tracking.created_at || tracking.createdAt || '';
  };

  // Helper para obtener el carrier, independientemente del formato
  const getCarrier = (tracking: any): string => {
    return (tracking.shipping?.carrier) || tracking.carrier || '';
  };

  // Helper para obtener la posición, independientemente del formato
  const getPosition = (tracking: any): string => {
    // Si ya tiene posición, la retornamos
    if (tracking.position) {
      return tracking.position;
    }
    
    // Si no tiene posición pero tiene tracking number, generamos un código de posición
    // usando la misma lógica que el backend
    if (tracking.tracking || tracking.trackingNumber) {
      const trackingNum = tracking.tracking || tracking.trackingNumber;
      return generarCodigoCasillero(trackingNum);
    }
    
    return 'No asignada';
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

  // Helper para obtener el historial de tracking, independientemente del formato
  const getTrackingHistory = (tracking: any): any[] => {
    return tracking.tracking_history || tracking.trackingEvents || [];
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        {results.length === 1 
          ? '1 envío encontrado' 
          : `${results.length} envíos encontrados`}
      </h3>
      
      {results.map((tracking, index) => (
        <motion.div
          key={getPackageId(tracking) || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div className="flex items-center mb-3 sm:mb-0">
                <Package className={`mr-3 h-6 w-6 ${getThemeColor(themeColor)}`} />
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                  {getTrackingNumber(tracking)}
                </h4>
              </div>
              
              <StatusBadge 
                status={getStatus(tracking)} 
                size="lg"
                pulse={getStatus(tracking)?.toLowerCase().includes('transit') || getStatus(tracking)?.toLowerCase().includes('tránsito')}
                solid={getStatus(tracking)?.toLowerCase().includes('entreg')}
                gradient={getStatus(tracking)?.toLowerCase().includes('entreg')}
                tooltip={`Estado actual: ${getStatusName(tracking) || 'En proceso'}`}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de envío</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {getCreatedDate(tracking) ? formatDate(getCreatedDate(tracking)) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Truck className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Carrier</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {getCarrier(tracking) || 'No especificado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Posición</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {getPosition(tracking) || 'No asignada'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Info className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última actualización</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {getTrackingHistory(tracking).length > 0
                      ? formatDate(getTrackingHistory(tracking)[0].date)
                      : 'Sin actualizaciones'}
                  </p>
                </div>
              </div>
            </div>
            
            {getTrackingHistory(tracking).length > 0 && (
              <>
                <Separator className="my-4" />
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                    Última actualización:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                    {getTrackingHistory(tracking)[0].status}
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getTrackingHistory(tracking)[0].location} - {formatDate(getTrackingHistory(tracking)[0].date)}
                    </span>
                  </p>
                </div>
              </>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => onSelectTracking(getPackageId(tracking))}
                variant="outline"
                className="flex items-center gap-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Ver detalles
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrackingResultsList; 