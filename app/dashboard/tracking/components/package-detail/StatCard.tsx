"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StatCardProps } from './types';
import { itemVariants } from './animations';

/**
 * Componente que muestra una tarjeta de estadísticas con animación
 */
export const StatCard = ({ icon, label, value, unit }: StatCardProps) => (
  <motion.div 
    variants={itemVariants}
    className={cn(
      "group p-6 rounded-2xl",
      "bg-gradient-to-br from-white to-gray-50/50",
      "dark:from-gray-800/50 dark:to-gray-900/50",
      "border border-gray-100 dark:border-gray-700/50",
      "hover:border-orange-200 dark:hover:border-orange-800/30",
      "transform transition-all duration-300",
      "hover:-translate-y-1",
      "hover:shadow-lg"
    )}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300">
        {icon}
      </div>
      <span className="text-sm text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
        {label}
      </span>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
      {value}
      {unit && <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>}
    </p>
  </motion.div>
); 