'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Database, Server, ShieldCheck, Search, PackageCheck, BarChart4, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import useThemeSettingsStore from '@/store/themeSettingsStore';

interface AdvancedScanningEffectProps {
  searchStage?: 'analyzing' | 'connecting' | 'searching' | 'finished' | null;
}

/**
 * Componente que muestra una animación avanzada de escaneo durante la búsqueda
 * Implementa diseño 3D con efectos de profundidad, neumorfismo y animaciones fluidas
 * Sigue las últimas tendencias UX/UI para 2025 con microinteracciones y feedback visual
 */
const AdvancedScanningEffect: React.FC<AdvancedScanningEffectProps> = ({ 
  searchStage = null 
}) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const logoRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Obtener el color del tema desde el store
  const themeColor = useThemeSettingsStore(state => 
    state.themeColor === 'default' ? 'purple' : state.themeColor
  );
  
  const scanPhases = [
    'Inicializando búsqueda en base de datos',
    'Conectando a servidor principal',
    'Verificando credenciales de usuario',
    'Accediendo a Cloud Firestore',
    'Buscando coincidencias de tracking',
    'Analizando datos de envío',
    'Compilando resultados',
  ];

  // Simula los pasos completados
  const completedSteps = Math.min(Math.floor(scanProgress / 15), scanPhases.length);

  // Efecto 3D para el logotipo giratorio
  useEffect(() => {
    if (!logoRef.current || !searchStage) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return;
      
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calcular ángulo de inclinación basado en la posición del cursor
      const rotateX = (e.clientY - centerY) / 15;
      const rotateY = (centerX - e.clientX) / 15;
      
      logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    // Animación automática cuando no hay movimiento del mouse
    const interval = setInterval(() => {
      if (!logoRef.current) return;
      
      const time = Date.now() / 1000;
      const rotateX = Math.sin(time) * 10;
      const rotateY = Math.cos(time) * 10;
      
      logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }, 50);
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [searchStage]);

  // Actualiza la fase del escaneo
  useEffect(() => {
    if (!searchStage) return;
    
    const interval = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev >= scanPhases.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [searchStage, scanPhases.length]);

  // Actualiza el progreso del escaneo
  useEffect(() => {
    if (!searchStage) return;
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Avance no linear para hacerlo más realista
        const increment = Math.max(1, Math.floor(10 / Math.sqrt(prev + 1)));
        return Math.min(100, prev + increment);
      });
    }, 200);
    
    controls.start({
      rotate: [0, 360],
      transition: {
        duration: 3,
        ease: "linear",
        repeat: Infinity
      }
    });
    
    return () => clearInterval(interval);
  }, [searchStage, controls]);

  if (!searchStage) return null;

  // Función para obtener el ícono correspondiente por etapa
  const getPhaseIcon = (index: number) => {
    switch (index) {
      case 0: return <Database className="h-4 w-4" />;
      case 1: return <Server className="h-4 w-4" />;
      case 2: return <ShieldCheck className="h-4 w-4" />;
      case 3: return <Database className="h-4 w-4" />;
      case 4: return <Search className="h-4 w-4" />;
      case 5: return <BarChart4 className="h-4 w-4" />;
      case 6: return <PackageCheck className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Para saber qué etapas están completadas, en progreso o pendientes
  const getStepStatus = (index: number) => {
    if (index < currentPhase) return 'completed';
    if (index === currentPhase) return 'current';
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 w-full h-screen flex items-center justify-center z-50"
    >
      {/* Fondo sólido blanco en lugar de transparente */}
      <div className="absolute inset-0 bg-white" />
      
      <div className="relative z-10 flex flex-col items-center justify-center p-6 md:p-10 w-full max-w-xl mx-auto">
        <div className={`bg-gradient-to-br from-${themeColor}-50 to-white p-12 rounded-3xl border border-${themeColor}-100 shadow-xl 
                      flex flex-col items-center justify-center relative overflow-hidden`}>
          
          {/* Efectos de partículas/luces de fondo */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className={`absolute w-1 h-1 rounded-full bg-${themeColor}-400 opacity-40`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  boxShadow: `0 0 15px 2px var(--${themeColor}-400)`,
                  animation: `pulse ${2 + Math.random() * 4}s infinite ${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Logotipo 3D interactivo */}
          <div 
            ref={logoRef}
            className="relative mb-8 transition-transform duration-200 ease-out will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Círculos concéntricos */}
            <motion.div 
              animate={controls}
              className={`absolute -inset-4 rounded-full border-2 border-${themeColor}-400/30 opacity-75`}
            />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity }}
              className={`absolute -inset-8 rounded-full border border-${themeColor}-500/20 opacity-50`}
            />
            
            {/* Logo principal */}
            <motion.div
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-600
                        flex items-center justify-center shadow-lg relative z-10
                        border-4 border-${themeColor}-400/50`}
              style={{ 
                boxShadow: `0 10px 30px -5px var(--${themeColor}-500/50), 
                           inset 0 0 30px rgba(255, 255, 255, 0.2)` 
              }}
            >
              {/* Diseño geométrico dentro del círculo (similar al de la imagen) */}
              <div className="grid grid-cols-2 gap-2 p-2">
                <div className={`h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center`}>
                  <div className={`h-2 w-2 rounded-full bg-${themeColor}-600`} />
                </div>
                <div className={`h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center`}>
                  <div className={`h-2 w-2 rounded-full bg-${themeColor}-600`} />
                </div>
                <div className={`h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center`}>
                  <div className={`h-2 w-2 rounded-full bg-${themeColor}-600`} />
                </div>
                <div className={`h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center`}>
                  <div className={`h-5 w-2 rounded-full bg-${themeColor}-600`} />
                </div>
              </div>
            </motion.div>
            
            {/* Efecto de resplandor detrás del logo */}
            <div 
              className={`absolute inset-0 rounded-full blur-md bg-${themeColor}-500/30 z-0`}
              style={{ transform: 'translateZ(-10px)' }}
            />
          </div>
          
          {/* Mensaje de estado */}
          <Badge 
            className={`mb-8 py-2 px-4 text-base font-medium bg-${themeColor}-100 text-${themeColor}-800 
                      border border-${themeColor}-200 flex items-center gap-2`}
          >
            <Database className="h-5 w-5 animate-pulse" />
            Buscando en base de datos Firebase
          </Badge>
          
          {/* Barra de progreso avanzada */}
          <div className="w-full mb-6 relative">
            <div className="flex justify-between text-sm mb-2 text-gray-700">
              <span>Procesando solicitud</span>
              <span>{scanProgress}% Completado</span>
            </div>
            
            {/* Track de la barra de progreso */}
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              {/* Fill de la barra de progreso */}
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-400 rounded-full
                          relative overflow-hidden`}
              >
                {/* Efecto de brillo en la barra */}
                <div className="absolute top-0 bottom-0 right-0 w-24 
                               bg-gradient-to-r from-transparent to-gray-200 
                               skew-x-30 animate-shimmer-fast" />
              </motion.div>
            </div>
          </div>
          
          {/* Lista de pasos con animación */}
          <div className="w-full px-2 py-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
            <ul className="space-y-3 text-sm">
              {scanPhases.map((phase, index) => (
                <AnimatePresence key={index}>
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: index <= currentPhase ? 1 : 0.5,
                      y: 0 
                    }}
                    transition={{ delay: index * 0.2 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300",
                      getStepStatus(index) === 'completed' ? `text-${themeColor}-600` : 
                      getStepStatus(index) === 'current' ? `text-${themeColor}-800` : "text-gray-400"
                    )}
                  >
                    <span className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                      getStepStatus(index) === 'completed' ? `bg-${themeColor}-100 text-${themeColor}-600` :
                      getStepStatus(index) === 'current' ? `bg-${themeColor}-200 text-${themeColor}-700 animate-pulse` :
                      "bg-gray-100 text-gray-400"
                    )}>
                      {getStepStatus(index) === 'completed' ? (
                        <motion.svg 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          width="12" 
                          height="12" 
                          viewBox="0 0 12 12"
                        >
                          <motion.path
                            d="M2,6 L5,9 L10,3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      ) : (
                        getPhaseIcon(index)
                      )}
                    </span>
                    <span className="flex-1">{phase}</span>
                    {getStepStatus(index) === 'current' && (
                      <span className="w-5 h-5 relative flex-shrink-0">
                        <span className="animate-ping absolute inset-0 h-full w-full rounded-full bg-gray-200 opacity-75"></span>
                        <span className={`relative rounded-full h-4 w-4 bg-${themeColor}-500`}></span>
                      </span>
                    )}
                  </motion.li>
                </AnimatePresence>
              ))}
            </ul>
          </div>
          
          {/* Mensaje de estado inferior */}
          <p className={`mt-6 text-${themeColor}-600 text-sm font-medium tracking-wider`}>
            {searchStage === 'analyzing' && 'Analizando patrones de datos...'}
            {searchStage === 'connecting' && 'Estableciendo conexión segura...'}
            {searchStage === 'searching' && 'Buscando información de tracking...'}
            {searchStage === 'finished' && 'Finalizando proceso de búsqueda...'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedScanningEffect; 