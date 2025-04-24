'use client';

import { useEffect, useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import MainLayout from '@/components/main-layout';
import { InvoiceProvider } from '@/app/contexts/InvoiceContext';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { ROUTES } from '@/app/config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verificar autenticación inmediatamente al cargar el componente
  useEffect(() => {
    // Si ya estamos redirigiendo, no hacer nada
    if (window.isRedirecting) {
      console.log('🛑 DashboardLayout: Ya hay una redirección en progreso');
      setIsLoading(false);
      return;
    }

    // Verificar si ya estamos en la página de login
    const currentPath = window.location.pathname;
    if (currentPath === ROUTES.LOGIN || currentPath.includes('/login')) {
      console.log('📍 DashboardLayout: Ya estamos en la página de login');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 DashboardLayout: Verificando autenticación...');
      
      // Verificar si hay un token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔒 DashboardLayout: No hay token de autenticación');
        
        // Limpiar cualquier dato de autenticación
        localStorage.removeItem('token');
        localStorage.removeItem('operator');
        localStorage.removeItem('permissions');
        
        // Redirigir a login usando la función segura
        console.log('🔄 DashboardLayout: Redirigiendo a login...');
        window.safeRedirect(ROUTES.LOGIN);
        return;
      }
      
      // Verificar si hay datos del operador
      const operatorData = localStorage.getItem('operator');
      if (!operatorData) {
        console.log('🔒 DashboardLayout: No hay datos del operador');
        
        // Limpiar cualquier dato de autenticación
        localStorage.removeItem('token');
        localStorage.removeItem('operator');
        localStorage.removeItem('permissions');
        
        // Redirigir a login usando la función segura
        console.log('🔄 DashboardLayout: Redirigiendo a login...');
        window.safeRedirect(ROUTES.LOGIN);
        return;
      }
      
      // Si llegamos aquí, el usuario está autenticado
      console.log('✅ DashboardLayout: Usuario autenticado correctamente');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ DashboardLayout: Error al verificar autenticación:', error);
      setAuthError('Error al verificar la autenticación. Por favor, inicie sesión nuevamente.');
      setIsLoading(false);
    }
    
    // Establecer un timeout de seguridad para evitar quedarse en estado de carga
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ DashboardLayout: Timeout de verificación de autenticación');
        setIsLoading(false);
      }
    }, 3000); // 3 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="text-gray-500">Cargando dashboard...</p>
          <button 
            onClick={() => {
              window.safeRedirect(ROUTES.LOGIN);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Ir a la página de inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de error si hay un problema de autenticación
  if (authError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800">Error de autenticación</h1>
          <p className="text-gray-500">{authError}</p>
          <button 
            onClick={() => {
              window.safeRedirect(ROUTES.LOGIN);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Ir a la página de inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <InvoiceProvider>
      <SidebarProvider defaultOpen={true}>
        <PermissionGuard>
          <MainLayout>{children}</MainLayout>
        </PermissionGuard>
      </SidebarProvider>
    </InvoiceProvider>
  );
}
