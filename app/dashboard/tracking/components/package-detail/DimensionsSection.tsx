"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Ruler, Edit, Box, Move3D, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DimensionsSectionProps } from './types';
import { useTheme } from 'next-themes';

/**
 * Componente que muestra la sección de dimensiones del paquete
 * con diseño y animaciones ultra-modernas para 2025+
 */
export const DimensionsSection = ({ length, width, height, onEditClick }: DimensionsSectionProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State for interactive elements
  const [expandedDimension, setExpandedDimension] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // 3D rotation transforms
  const rotateX = useTransform(mouseY, [-300, 300], [3, -3]);
  const rotateY = useTransform(mouseX, [-300, 300], [-3, 3]);
  
  // Spring physics for smoother movement
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });
  
  // Animation variants
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
        ? "0px 12px 30px rgba(0,0,0,0.25)" 
        : "0px 12px 30px rgba(0,0,0,0.07)",
      y: -3,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 20
      }
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
  
  // Calcula el volumen del paquete
  const volume = length * width * height;
  const volumeFormatted = new Intl.NumberFormat('es-ES').format(volume);
  
  // Helper para renderizar visualización de dimensión
  const DimensionVisual = ({ value, color, label }: { value: number, color: string, label: string }) => (
    <div className={`h-${value > 100 ? 10 : value > 50 ? 8 : 6} w-1.5 ${color} rounded-t-full relative group`}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-1.5 py-1 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}: {value}cm</span>
      </motion.div>
    </div>
  );

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
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
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-blue-500/5 dark:from-purple-500/20 dark:to-blue-500/10 rounded-full blur-3xl"></div>

        {/* Encabezado con animación y botón de editar */}
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
                "bg-gradient-to-br from-blue-100/90 via-indigo-50 to-blue-50/80",
                "dark:from-blue-800/40 dark:via-indigo-900/30 dark:to-blue-900/20",
                "shadow-inner shadow-blue-100/40 dark:shadow-blue-900/10",
                "border border-blue-100/70 dark:border-blue-800/20",
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
              <Box className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
            </motion.div>
            
            <div>
              <motion.h2 
                className={cn(
                  "text-2xl font-semibold mb-1",
                  "text-gray-900 dark:text-white"
                )}
                whileHover={{ scale: 1.02 }}
              >
                Dimensiones del Paquete
                <motion.span 
                  className="ml-2 inline-block" 
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4 text-blue-500 inline" />
                </motion.span>
              </motion.h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-light">
                Medidas exactas y volumen calculado
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
              className={cn(
                "gap-2",
                "border-blue-200 dark:border-blue-800",
                "text-blue-700 dark:text-blue-300",
                "hover:bg-blue-50 dark:hover:bg-blue-900/50",
                "shadow-sm hover:shadow",
                "transition-all duration-300"
              )}
            >
              <Edit className="h-4 w-4" />
              <span>Ajustar medidas</span>
            </Button>
          </motion.div>
        </div>

        {/* Grid con visualización mejorada de dimensiones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            variants={itemVariants} 
            whileHover="hover" 
            initial="rest"
            animate={expandedDimension === 0 ? "hover" : "rest"}
            onClick={() => setExpandedDimension(expandedDimension === 0 ? null : 0)}
          >
            <motion.div
              variants={cardHoverVariants}
              className={cn(
                "bg-gradient-to-br from-blue-50/70 via-indigo-50/60 to-white/80",
                "dark:from-blue-900/30 dark:via-indigo-900/25 dark:to-slate-900/30",
                "border border-blue-100/60 dark:border-blue-800/20",
                "rounded-2xl p-6",
                "transition-all duration-300",
                "relative overflow-hidden",
                "cursor-pointer"
              )}
            >
              {/* Background glow effect */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 dark:bg-blue-400/20 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-4">
                <motion.div 
                  whileHover={{ rotate: 15 }}
                  className={cn(
                    "p-3 rounded-xl",
                    "bg-blue-100/80 dark:bg-blue-800/40",
                    "border border-blue-200/50 dark:border-blue-700/30",
                    "shadow-sm"
                  )}
                >
                  <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <motion.div 
                  className="text-xs px-3 py-1 rounded-full bg-blue-100/70 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/30 dark:border-blue-700/20"
                  whileHover={{ scale: 1.05 }}
                >
                  Largo
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-gray-700 dark:text-gray-300 text-sm mb-1">Longitud</h3>
                    <div className="flex items-baseline">
                      <motion.span 
                        className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {length}
                      </motion.span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400 font-medium">cm</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ 
                      rotate: expandedDimension === 0 ? 180 : 0,
                      y: expandedDimension === 0 ? 2 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-blue-500 dark:text-blue-400"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
                
                {expandedDimension === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Proporción:</span>
                        <span className="font-medium">{Math.round((length / (width + height)) * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Relación L:A:</span>
                        <span className="font-medium">{(length / width).toFixed(1)}:1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tipo:</span>
                        <span className="font-medium">
                          {length > 100 ? 'Carga Larga' : length > 50 ? 'Estándar' : 'Compacto'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover="hover" 
            initial="rest"
            animate={expandedDimension === 1 ? "hover" : "rest"}
            onClick={() => setExpandedDimension(expandedDimension === 1 ? null : 1)}
          >
            <motion.div
              variants={cardHoverVariants}
              className={cn(
                "bg-gradient-to-br from-indigo-50/70 via-purple-50/60 to-white/80",
                "dark:from-indigo-900/30 dark:via-purple-900/25 dark:to-slate-900/30",
                "border border-indigo-100/60 dark:border-indigo-800/20",
                "rounded-2xl p-6",
                "transition-all duration-300",
                "relative overflow-hidden",
                "cursor-pointer"
              )}
            >
              {/* Background glow effect */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400/10 dark:bg-indigo-400/20 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-4">
                <motion.div 
                  whileHover={{ rotate: 15 }}
                  className={cn(
                    "p-3 rounded-xl",
                    "bg-indigo-100/80 dark:bg-indigo-800/40",
                    "border border-indigo-200/50 dark:border-indigo-700/30",
                    "shadow-sm"
                  )}
                >
                  <Ruler className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <motion.div 
                  className="text-xs px-3 py-1 rounded-full bg-indigo-100/70 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200/30 dark:border-indigo-700/20"
                  whileHover={{ scale: 1.05 }}
                >
                  Ancho
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-gray-700 dark:text-gray-300 text-sm mb-1">Anchura</h3>
                    <div className="flex items-baseline">
                      <motion.span 
                        className="text-3xl font-bold text-indigo-600 dark:text-indigo-400"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        {width}
                      </motion.span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400 font-medium">cm</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ 
                      rotate: expandedDimension === 1 ? 180 : 0,
                      y: expandedDimension === 1 ? 2 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-indigo-500 dark:text-indigo-400"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
                
                {expandedDimension === 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Proporción:</span>
                        <span className="font-medium">{Math.round((width / (length + height)) * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Relación A:H:</span>
                        <span className="font-medium">{(width / height).toFixed(1)}:1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tipo:</span>
                        <span className="font-medium">
                          {width > 80 ? 'Extra Ancho' : width > 40 ? 'Estándar' : 'Estrecho'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover="hover" 
            initial="rest"
            animate={expandedDimension === 2 ? "hover" : "rest"}
            onClick={() => setExpandedDimension(expandedDimension === 2 ? null : 2)}
          >
            <motion.div
              variants={cardHoverVariants}
              className={cn(
                "bg-gradient-to-br from-purple-50/70 via-violet-50/60 to-white/80",
                "dark:from-purple-900/30 dark:via-violet-900/25 dark:to-slate-900/30",
                "border border-purple-100/60 dark:border-purple-800/20",
                "rounded-2xl p-6",
                "transition-all duration-300",
                "relative overflow-hidden",
                "cursor-pointer"
              )}
            >
              {/* Background glow effect */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/10 dark:bg-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-4">
                <motion.div 
                  whileHover={{ rotate: 15 }}
                  className={cn(
                    "p-3 rounded-xl",
                    "bg-purple-100/80 dark:bg-purple-800/40",
                    "border border-purple-200/50 dark:border-purple-700/30",
                    "shadow-sm"
                  )}
                >
                  <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <motion.div 
                  className="text-xs px-3 py-1 rounded-full bg-purple-100/70 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 font-medium border border-purple-200/30 dark:border-purple-700/20"
                  whileHover={{ scale: 1.05 }}
                >
                  Alto
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-gray-700 dark:text-gray-300 text-sm mb-1">Altura</h3>
                    <div className="flex items-baseline">
                      <motion.span 
                        className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        {height}
                      </motion.span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400 font-medium">cm</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ 
                      rotate: expandedDimension === 2 ? 180 : 0,
                      y: expandedDimension === 2 ? 2 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-purple-500 dark:text-purple-400"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
                
                {expandedDimension === 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Proporción:</span>
                        <span className="font-medium">{Math.round((height / (length + width)) * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Apilabilidad:</span>
                        <span className="font-medium">
                          {height > 60 ? 'Limitada' : height > 30 ? 'Moderada' : 'Alta'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tipo:</span>
                        <span className="font-medium">
                          {height > 70 ? 'Alto' : height > 35 ? 'Estándar' : 'Bajo Perfil'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-violet-500"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Visualización 3D de paquete */}
        <motion.div
          variants={itemVariants}
          className="mt-8 bg-white/40 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 dark:border-gray-700/30"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
              <Box className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              Volumen Total
            </h3>
            <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <span>{volumeFormatted}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-normal">cm³</span>
            </div>
          </div>
          
          <motion.div 
            className="h-28 relative overflow-hidden rounded-lg border border-gray-100/50 dark:border-gray-700/30 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="flex items-end justify-center gap-2 transform-gpu"
                style={{ 
                  rotateX: 20, 
                  rotateY: isHovered ? 0 : 0,
                  transformStyle: 'preserve-3d',
                }}
                animate={isHovered ? {
                  rotateY: [0, 5, -5, 0] as number[],
                } : {}}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <DimensionVisual value={length} color="bg-blue-500" label="Largo" />
                <DimensionVisual value={width} color="bg-indigo-500" label="Ancho" />
                <DimensionVisual value={height} color="bg-purple-500" label="Alto" />
                
                <motion.div 
                  className="absolute opacity-30 w-12 h-12 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-sm"
                  style={{ 
                    rotateX: 55,
                    rotateY: 45,
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center center'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3, rotate: 360 }}
                  transition={{ 
                    opacity: { delay: 0.5, duration: 1 },
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                />
              </motion.div>
            </div>
            
            <div className="absolute bottom-2 right-3 text-xs text-gray-500 dark:text-gray-400">
              Visualización a escala
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 