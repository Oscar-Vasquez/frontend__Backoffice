'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Package, Search, Truck, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CombinedTrackingInfo } from '../types';
import { searchTracking, getTrackingDetails } from '../services';
import useThemeSettingsStore from '@/store/themeSettingsStore';
import { 
  SearchBar,
  TrackingResultsList,
  TrackingDetails,
  AdvancedScanningEffect 
} from './';

// Animation variants for page elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.6
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

const floatingAnimation = {
  y: ['-0.5%', '0.5%'],
  transition: {
    y: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  }
};

/**
 * Componente principal del dashboard de tracking
 * Implementa las últimas tendencias UX/UI para 2025
 * Gestiona la búsqueda, visualización y navegación entre los resultados y detalles
 * Soporta cambio dinámico del color primario utilizando el themeSettingsStore
 */
const TrackingDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [searchStage, setSearchStage] = useState<'analyzing' | 'connecting' | 'searching' | 'finished' | null>(null);
  const [searchResults, setSearchResults] = useState<CombinedTrackingInfo[]>([]);
  const [selectedTracking, setSelectedTracking] = useState<CombinedTrackingInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Obtener el color del tema desde el store
  const themeColor = useThemeSettingsStore(state => 
    state.themeColor === 'default' ? 'purple' : state.themeColor
  );
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Evita problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Verifica si hay un ID en los parámetros de URL para cargar un tracking específico
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadTrackingDetails(id);
    }
  }, [searchParams]);
  
  // Función para buscar envíos
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setSearchResults([]);
      setSelectedTracking(null);
      setIsLoading(true);
      setScanning(true);
      
      // Simular las etapas de búsqueda
      setSearchStage('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchStage('connecting');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSearchStage('searching');
      
      // Realizar la búsqueda real
      const response = await searchTracking(query);
      
      setSearchStage('finished');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mostrar resultados
      if (response && response.success && response.data && response.data.length > 0) {
        // Antes de asignar, asegurarse de que cada elemento cumpla con la estructura necesaria
        const formattedResults = response.data.map(item => {
          // Crear un objeto que satisface la interfaz CombinedTrackingInfo
          return {
            // Campos básicos requeridos
            trackingNumber: item.tracking || '',
            trackingStatus: item.status || 'processing',
            statusName: item.status_name || 'Procesando',
            
            // Crear objetos necesarios con valores por defecto
            package_info: {
              total_weight: item.total_weight || '0',
              vol_weight: item.vol_weight || '0',
              dimensions: {
                length: item.cargo_length || '0',
                width: item.cargo_width || '0',
                height: item.cargo_height || '0',
                unit: item.unit || 'cm'
              },
              pieces: parseInt(item.total_items || '1')
            },
            
            shipping: {
              mode: item.mode || 'standard',
              carrier: item.shipper || '',
              service_type: 'standard',
              estimated_delivery: '',
              origin: {
                city: '',
                state: '',
                country: '',
                postal_code: '',
                departed_at: item.datecreated || ''
              },
              destination: {
                city: '',
                state: '',
                country: '',
                postal_code: '',
                delivered_at: ''
              }
            },
            
            tracking_history: [],
            
            // Metadatos
            created_at: item.datecreated || '',
            updated_at: item.dateupdated || '',
            
            // Pasar el objeto original para mantener todos los datos
            ...item
          };
        });
        
        // Usar type assertion ya que sabemos que hemos construido correctamente
        setSearchResults(formattedResults as unknown as CombinedTrackingInfo[]);
      } else {
        toast.error('No se encontraron envíos con ese criterio de búsqueda', {
          style: { 
            borderRadius: '16px', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }
        });
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      toast.error('Error al realizar la búsqueda. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
      setScanning(false);
      setSearchStage(null);
    }
  };
  
  // Carga los detalles de un tracking específico
  const loadTrackingDetails = async (id: string) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setScanning(true);
      setSearchStage('searching');
      
      const trackingData = await getTrackingDetails(id);
      
      setSearchStage('finished');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSelectedTracking(trackingData);
      
      // Actualizar URL con el ID seleccionado
      router.push(`/dashboard/tracking?id=${id}`);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      toast.error('Error al cargar los detalles del envío');
    } finally {
      setIsLoading(false);
      setScanning(false);
      setSearchStage(null);
    }
  };
  
  // Maneja la selección de un tracking de la lista
  const handleSelectTracking = (id: string) => {
    if (!id) return;
    loadTrackingDetails(id);
  };
  
  // Vuelve a la lista de resultados
  const handleBackToResults = () => {
    setSelectedTracking(null);
    router.push('/dashboard/tracking');
  };
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-${themeColor}-50/30 to-white dark:from-gray-900 dark:via-${themeColor}-950/20 dark:to-gray-950 p-4 md:p-8 pb-16`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 right-[10%] w-64 h-64 rounded-full bg-${themeColor}-400/10 blur-3xl dark:bg-${themeColor}-900/20`} />
        <div className={`absolute bottom-10 left-[5%] w-96 h-96 rounded-full bg-${themeColor}-400/10 blur-3xl dark:bg-${themeColor}-900/20`} />
        <div className={`absolute top-1/4 left-[20%] w-64 h-64 rounded-full bg-gradient-to-br from-${themeColor}-400/10 to-blue-400/5 blur-3xl dark:from-${themeColor}-900/20 dark:to-blue-900/10`} />
        
        {/* Animated floating elements */}
        <motion.div 
          animate={floatingAnimation} 
          className={`absolute top-20 left-1/3 w-6 h-6 rounded-full border border-${themeColor}-400/40 dark:border-${themeColor}-700/40`} 
        />
        <motion.div 
          animate={floatingAnimation} 
          className={`absolute bottom-32 right-1/4 w-8 h-8 rounded-full border border-${themeColor}-400/40 dark:border-${themeColor}-700/40`} 
        />
        <motion.div 
          animate={{
            ...floatingAnimation.y,
            x: ['-0.5%', '0.5%'],
            transition: {
              y: {
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              },
              x: {
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }
            }
          }} 
          className={`absolute top-1/2 right-10 w-4 h-4 rounded-full bg-${themeColor}-400/40 dark:bg-${themeColor}-700/40`} 
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl w-full mx-auto"
      >
        {/* Búsqueda */}
        {!selectedTracking && (
          <motion.div variants={itemVariants}>
            <div className="mb-4 text-center">
              <motion.div 
                className="inline-block"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <Package size={32} className={`inline-block mr-2 text-${themeColor}-500 dark:text-${themeColor}-400`} />
              </motion.div>
              <h1 className={`text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2 inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-${themeColor}-700 dark:from-white dark:to-${themeColor}-400`}>
                Tracking Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Ingresa un número de seguimiento o utiliza la búsqueda avanzada para encontrar tus envíos
              </p>
            </div>
            
            <motion.div
              className="relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className={`absolute inset-0 -m-4 rounded-3xl bg-gradient-to-r from-${themeColor}-500/5 via-${themeColor}-500/10 to-${themeColor}-500/5 dark:from-${themeColor}-900/20 dark:via-${themeColor}-900/30 dark:to-${themeColor}-900/20 blur-xl`} />
              <div className="relative p-0.5 rounded-2xl backdrop-blur-sm">
                <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                  <div className="p-6">
                    <SearchBar 
                      onSearch={handleSearch} 
                      isLoading={isLoading} 
                      themeColor={String(themeColor)} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Animación de escaneo durante la búsqueda */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="my-8"
            >
              <AdvancedScanningEffect searchStage={searchStage} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Contenido principal */}
        <motion.div 
          variants={itemVariants}
          className="mt-8"
        >
          {/* Detalles de un tracking específico */}
          {selectedTracking && !scanning && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 12,
                duration: 0.6 
              }}
              className="mx-auto"
            >
              <div className={`w-full max-w-6xl mx-auto backdrop-blur-md rounded-3xl 
                          shadow-2xl dark:shadow-none p-6 md:p-8 border-t border-l border-r border-b-2 border-${themeColor}-100/60 dark:border-${themeColor}-900/30 
                          bg-white/90 dark:bg-gray-800/60 dark:backdrop-blur-2xl`}>
                <div className="mb-6 flex items-center justify-between">
                  <motion.div
                    whileHover={{ x: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={handleBackToResults}
                      className={`flex items-center gap-2 rounded-xl hover:bg-${themeColor}-50 dark:hover:bg-${themeColor}-900/20
                             border-${themeColor}-200 dark:border-${themeColor}-700/50 text-${themeColor}-700 dark:text-${themeColor}-300
                             transition-all duration-300 shadow-sm`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Volver a resultados</span>
                    </Button>
                  </motion.div>
                  
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-medium bg-${themeColor}-50 dark:bg-${themeColor}-900/30 
                            text-${themeColor}-700 dark:text-${themeColor}-300 border border-${themeColor}-200/50 dark:border-${themeColor}-800/50`}>
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      <span>Tracking: {selectedTracking.tracking?.substring(0, 10) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <TrackingDetails 
                  tracking={selectedTracking} 
                  themeColor={String(themeColor)} 
                />
              </div>
            </motion.div>
          )}
          
          {/* Lista de resultados */}
          {!selectedTracking && !scanning && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 12,
                delay: 0.2,
                duration: 0.6 
              }}
              className="mx-auto"
            >
              <div className={`relative rounded-3xl overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br from-${themeColor}-100 via-white to-${themeColor}-50/50 dark:from-${themeColor}-900/30 dark:via-gray-900/90 dark:to-${themeColor}-900/20 opacity-70 dark:opacity-100`} />
                
                <div className={`relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/70 rounded-3xl
                          shadow-2xl dark:shadow-none p-6 md:p-8 border border-${themeColor}-100/60 dark:border-${themeColor}-900/30`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="relative">
                      <div className={`absolute -left-3 -top-3 w-12 h-12 rounded-full bg-${themeColor}-100 dark:bg-${themeColor}-900/40 flex items-center justify-center`}>
                        <Search className={`h-5 w-5 text-${themeColor}-600 dark:text-${themeColor}-400`} />
                      </div>
                      <h2 className="text-xl font-bold ml-8 text-gray-800 dark:text-white flex items-center gap-2">
                        Resultados de búsqueda
                        <span className={`inline-flex items-center justify-center rounded-full text-xs font-medium h-6 min-w-6 px-2 bg-${themeColor}-100 text-${themeColor}-800 dark:bg-${themeColor}-900/60 dark:text-${themeColor}-200`}>
                          {searchResults.length}
                        </span>
                      </h2>
                    </div>
                    
                    <motion.div 
                      whileHover={{ y: -2, x: 2 }}
                      className={`text-xs flex items-center gap-1 text-${themeColor}-700 dark:text-${themeColor}-300 cursor-pointer`}
                    >
                      <span>Ver todos</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </motion.div>
                  </div>
                  
                  <TrackingResultsList 
                    results={searchResults} 
                    onSelectTracking={handleSelectTracking} 
                    themeColor={String(themeColor)} 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TrackingDashboard; 