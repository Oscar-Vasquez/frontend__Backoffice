"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Calendar, Clock, History, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { DateInfoSectionProps } from './types';

/**
 * Componente que muestra las fechas de creación y actualización del paquete
 * con diseño y animaciones ultra-modernas para 2025+
 */
export const DateInfoSection = ({ createdAt, updatedAt }: DateInfoSectionProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State for interactive elements
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // 3D rotation transforms
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  
  // Spring physics for smoother movement
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const cardHoverVariants = {
    rest: { 
      scale: 1, 
      boxShadow: isDark 
        ? "0px 0px 0px rgba(0,0,0,0)" 
        : "0px 0px 0px rgba(0,0,0,0)",
      y: 0
    },
    hover: { 
      scale: 1.03, 
      boxShadow: isDark 
        ? "0px 15px 35px rgba(0,0,0,0.3)" 
        : "0px 15px 35px rgba(0,0,0,0.08)",
      y: -5,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };
  
  // Función para convertir diferentes formatos de fecha a Date
  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'string') return new Date(dateValue);
      if (typeof dateValue === 'object' && '_seconds' in dateValue) return new Date(dateValue._seconds * 1000);
      if (dateValue instanceof Date) return dateValue;
      if (typeof dateValue === 'number') return new Date(dateValue);
      if (typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function') return dateValue.toDate();
      
      console.log('Formato de fecha no reconocido:', dateValue);
      return null;
    } catch (e) {
      console.error('Error al parsear fecha:', e, dateValue);
      return null;
    }
  };
  
  // Función para formatear fechas
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'No disponible';
    const date = parseDate(dateValue);
    if (!date) return 'Formato no válido';
    try {
      return format(date, 'PPP', { locale: es });
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return 'Error de formato';
    }
  };
  
  // Función para formatear hora
  const formatTime = (dateValue: any): string => {
    if (!dateValue) return '';
    const date = parseDate(dateValue);
    if (!date) return '';
    try {
      return format(date, 'p', { locale: es });
    } catch (e) {
      console.error('Error al formatear hora:', e);
      return '';
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

  // Para depuración
  console.log('DateInfoSection - Datos recibidos:', {
    createdAt,
    createdAtType: createdAt ? typeof createdAt : 'undefined',
    createdAtProps: createdAt && typeof createdAt === 'object' ? Object.keys(createdAt) : 'no props',
    updatedAt,
    updatedAtType: updatedAt ? typeof updatedAt : 'undefined',
    updatedAtProps: updatedAt && typeof updatedAt === 'object' ? Object.keys(updatedAt) : 'no props'
  });

  return (
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
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-amber-500/5 dark:from-orange-500/20 dark:to-amber-500/10 rounded-full blur-3xl"></div>
      
      {/* Encabezado con animación avanzada */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-5 mb-8"
      >
        <motion.div 
          whileHover={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={cn(
            "p-4 rounded-2xl",
            "bg-gradient-to-br from-amber-100/90 via-orange-50 to-amber-50/80",
            "dark:from-amber-700/40 dark:via-orange-800/30 dark:to-amber-600/20",
            "shadow-inner shadow-orange-100/40 dark:shadow-orange-900/10",
            "border border-amber-100/70 dark:border-amber-800/20"
          )}
        >
          <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
        </motion.div>
        
        <div>
          <motion.h2 
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Información de Fechas
          </motion.h2>
        </div>
      </motion.div>
      
      {/* Contenido principal simplificado */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Fecha de creación */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "p-5 rounded-xl bg-white/70 dark:bg-slate-800/50",
            "border border-amber-100/30 dark:border-amber-800/20",
            "shadow-sm"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                {formatDate(createdAt)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(createdAt)}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Fecha de actualización */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "p-5 rounded-xl bg-white/70 dark:bg-slate-800/50",
            "border border-amber-100/30 dark:border-amber-800/20",
            "shadow-sm"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
              <History className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                {formatDate(updatedAt)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(updatedAt)}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 