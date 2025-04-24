'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthNavigation } from '../services/auth.service';
import { ROUTES } from '@/app/config';

// Definir la interfaz para el contexto de navegación
interface NavigationContextType {
  // Funciones básicas de navegación
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  refresh: () => void;
  
  // Funciones de autenticación
  logout: () => void;
  forceRelogin: () => void;
  
  // Funciones de navegación específicas
  goToDashboard: () => void;
  goToUsers: () => void;
  goToSettings: () => void;
  goToProfile: () => void;
}

// Crear el contexto de navegación
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Proveedor de navegación
export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authNavigation = useAuthNavigation();
  
  // Funciones básicas de navegación
  const push = (href: string) => router.push(href);
  const replace = (href: string) => router.replace(href);
  const back = () => router.back();
  const refresh = () => router.refresh();
  
  // Funciones de autenticación
  const logout = () => authNavigation.logout();
  const forceRelogin = () => authNavigation.forceRelogin();
  
  // Funciones de navegación específicas
  const goToDashboard = () => router.push(ROUTES.DASHBOARD);
  const goToUsers = () => router.push('/dashboard/users');
  const goToSettings = () => router.push('/dashboard/settings');
  const goToProfile = () => router.push('/dashboard/profile');
  
  const value = {
    // Funciones básicas de navegación
    push,
    replace,
    back,
    refresh,
    
    // Funciones de autenticación
    logout,
    forceRelogin,
    
    // Funciones de navegación específicas
    goToDashboard,
    goToUsers,
    goToSettings,
    goToProfile,
  };
  
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook para usar el contexto de navegación
export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
} 