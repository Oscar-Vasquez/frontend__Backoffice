'use client';

import { useNavigation as useNavigationFromProvider } from '../providers/navigation-provider';

/**
 * Hook para acceder a las funciones de navegación de la aplicación
 * Este hook es un re-export del hook del proveedor de navegación
 * para mantener la compatibilidad con el código existente
 */
export function useNavigation() {
  return useNavigationFromProvider();
} 