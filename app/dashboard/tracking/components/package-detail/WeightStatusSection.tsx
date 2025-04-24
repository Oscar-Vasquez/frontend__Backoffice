"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Box, Scale, MapPin, ArrowRight, Sparkles, BarChart3, Activity, Clock, Edit, PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeightStatusSectionProps } from './types';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";

/**
 * Componente que muestra la sección de peso y estado actual del paquete
 * con diseño moderno y de alta nitidez
 */
export const WeightStatusSection = ({ 
  weight, 
  volumetricWeight, 
  currentLocation,
  operatorData,
  onEditWeightsClick 
}: WeightStatusSectionProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State for interactive elements
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [showTrend, setShowTrend] = useState(false);
  
  // Scroll-based animations - reduced effect
  const { scrollY } = useScroll();
  
  // Mock data for trends
  const weightTrend = [75, 74, 75, 76, 78, 77, Number(weight)];
  const volumeTrend = [120, 118, 116, 119, 120, 122, Number(volumetricWeight)];
  
  // Animation variants with simpler effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2
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
      scale: 1.01, // Very subtle scale effect
      boxShadow: isDark 
        ? "0px 4px 12px rgba(0,0,0,0.3)" 
        : "0px 4px 12px rgba(0,0,0,0.08)",
      y: -2, // Minimal lift
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };
  
  // Mini chart component for trends
  const MiniChart = ({ data, color }: { data: number[], color: string }) => (
    <div className="relative h-10 mt-2 w-full flex items-end justify-between">
      {data.map((value, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: `${(value / Math.max(...data)) * 100}%` }}
          transition={{ 
            delay: index * 0.05, 
            duration: 0.5, 
            ease: "easeOut" 
          }}
          className={`w-1.5 rounded-t-full ${color}`}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "w-[90%] mx-auto relative",
          // Solid backgrounds instead of gradients with transparency
          "bg-white dark:bg-slate-900",
          // Solid borders with higher contrast
          "border-2 border-gray-200 dark:border-slate-700",
          // Sharper shadows
          "shadow-md dark:shadow-2xl",
          "rounded-xl p-6",
          "transition-all duration-300 ease-out"
        )}
      >
        {/* Status indicator */}
        <motion.div 
          className="absolute top-6 right-6 flex items-center gap-2"
          variants={itemVariants}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">Actualizado</span>
        </motion.div>

        {/* Encabezado con animación simplificada */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-5 mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={cn(
              "p-4 rounded-lg",
              // Solid background colors
              "bg-amber-100 dark:bg-amber-800",
              "shadow-sm",
              "border border-amber-200 dark:border-amber-700",
              "relative"
            )}
          >
            <Box className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
          </motion.div>
          
          <div className="flex-grow">
            <motion.h2 
              className={cn(
                "text-2xl font-semibold mb-1",
                "text-gray-900 dark:text-white"
              )}
              whileHover={{ scale: 1.01 }}
            >
              Detalle de Peso del Paquete
              <motion.span 
                className="ml-2 inline-block" 
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-amber-500 inline" />
              </motion.span>
            </motion.h2>
            <div className="flex items-center">
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                Información actualizada sobre dimensiones y ubicación
              </p>
              <div className="ml-3 flex items-center">
                <Clock className="h-3 w-3 text-gray-700 dark:text-gray-300 mr-1" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Hace 2h</span>
              </div>
            </div>
          </div>
          
          {/* Botón de edición de pesos */}
          {onEditWeightsClick && (
            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditWeightsClick}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 
                           dark:bg-amber-900/30 dark:hover:bg-amber-800/50 dark:text-amber-300 dark:border-amber-700/50
                           transition-all duration-200"
              >
                <PenSquare className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Editar Pesos</span>
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Grid de estadísticas con tarjetas de alta nitidez */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            variants={itemVariants} 
            whileHover="hover" 
            initial="rest"
            animate={activeCard === 0 ? "hover" : "rest"}
            onClick={() => setActiveCard(activeCard === 0 ? null : 0)}
          >
            <motion.div
              variants={cardHoverVariants}
              className={cn(
                "bg-blue-50 dark:bg-blue-900/70",
                "border-2 border-blue-200 dark:border-blue-800",
                "rounded-lg p-5",
                "transition-all duration-300",
                "relative",
                "cursor-pointer",
                "shadow-sm"
              )}
            >              
              <div className="flex justify-between items-start mb-4">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className={cn(
                    "p-3 rounded-lg",
                    "bg-blue-100 dark:bg-blue-800",
                    "border border-blue-200 dark:border-blue-700",
                    "shadow-sm"
                  )}
                >
                  <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <motion.div 
                  className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-700"
                  whileHover={{ scale: 1.03 }}
                >
                  Peso Real
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-gray-800 dark:text-gray-200 text-sm mb-1 flex items-center">
                  <span>Peso medido</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTrend(prev => !prev);
                    }}
                    className="ml-2 text-blue-500 dark:text-blue-400"
                  >
                    <BarChart3 size={14} />
                  </motion.button>
                </h3>
                
                <div className="flex items-baseline">
                  <motion.span 
                    className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {weight}
                  </motion.span>
                  <span className="ml-1 text-gray-800 dark:text-gray-200 font-medium">lb</span>
                </div>
                
                {showTrend && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <MiniChart data={weightTrend} color="bg-blue-500 dark:bg-blue-400" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-700 dark:text-gray-300">7 días atrás</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Hoy</span>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover="hover" 
            initial="rest"
            animate={activeCard === 1 ? "hover" : "rest"}
            onClick={() => setActiveCard(activeCard === 1 ? null : 1)}
          >
            <motion.div
              variants={cardHoverVariants}
              className={cn(
                "bg-amber-50 dark:bg-amber-900/70",
                "border-2 border-amber-200 dark:border-amber-800",
                "rounded-lg p-5",
                "transition-all duration-300",
                "relative",
                "cursor-pointer",
                "shadow-sm"
              )}
            >              
              <div className="flex justify-between items-start mb-4">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className={cn(
                    "p-3 rounded-lg",
                    "bg-amber-100 dark:bg-amber-800",
                    "border border-amber-200 dark:border-amber-700",
                    "shadow-sm"
                  )}
                >
                  <Box className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </motion.div>
                <motion.div 
                  className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-700"
                  whileHover={{ scale: 1.03 }}
                >
                  Peso Vol.
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-gray-800 dark:text-gray-200 text-sm mb-1 flex items-center">
                  <span>Peso volumétrico</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTrend(prev => !prev);
                    }}
                    className="ml-2 text-amber-500 dark:text-amber-400"
                  >
                    <BarChart3 size={14} />
                  </motion.button>
                </h3>
                
                <div className="flex items-baseline">
                  <motion.span 
                    className="text-3xl font-bold text-amber-600 dark:text-amber-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {volumetricWeight}
                  </motion.span>
                  <span className="ml-1 text-gray-800 dark:text-gray-200 font-medium">lb</span>
                </div>
                
                {showTrend && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <MiniChart data={volumeTrend} color="bg-amber-500 dark:bg-amber-400" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-700 dark:text-gray-300">7 días atrás</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Hoy</span>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover="hover" 
            initial="rest"
            animate={activeCard === 2 ? "hover" : "rest"}
            onClick={() => setActiveCard(activeCard === 2 ? null : 2)}
          >
            <motion.div
              variants={cardHoverVariants}
              className={cn(
                "bg-emerald-50 dark:bg-emerald-900/70",
                "border-2 border-emerald-200 dark:border-emerald-800",
                "rounded-lg p-5",
                "transition-all duration-300",
                "relative",
                "cursor-pointer",
                "shadow-sm"
              )}
            >              
              <div className="flex justify-between items-start mb-4">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className={cn(
                    "p-3 rounded-lg",
                    "bg-emerald-100 dark:bg-emerald-800",
                    "border border-emerald-200 dark:border-emerald-700",
                    "shadow-sm"
                  )}
                >
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <motion.div 
                  className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-700"
                  whileHover={{ scale: 1.03 }}
                >
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Ubicación
                  </span>
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-gray-800 dark:text-gray-200 text-sm mb-1 flex items-center">
                  <span>Estado actual</span>
                  <motion.div 
                    className="ml-2 text-emerald-500 dark:text-emerald-400"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatType: "loop" 
                    }}
                  >
                    <Activity size={14} />
                  </motion.div>
                </h3>
                
                <div className="flex items-center">
                  <motion.span 
                    className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 line-clamp-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {currentLocation}
                  </motion.span>
                  <motion.div 
                    whileHover={{ x: 2 }}
                    className="ml-2 text-emerald-600 dark:text-emerald-400"
                  >
                    <ArrowRight size={16} />
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-3 text-xs text-gray-800 dark:text-gray-200 bg-emerald-100 dark:bg-emerald-900 rounded-lg p-2 border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="font-medium">En tránsito hacia destino final</span>
                  </div>
                  <span className="pl-3">Estimado de entrega: 2 días</span>
                </motion.div>
              </div>
              
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 