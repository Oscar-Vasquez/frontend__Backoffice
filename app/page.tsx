'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/app/config';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya estamos redirigiendo, no hacer nada
    if (window.isRedirecting) {
      console.log('🛑 Home: Ya hay una redirección en progreso');
      return;
    }

    // Verificar si ya estamos en la página de login o dashboard
    const currentPath = window.location.pathname;
    if (currentPath === ROUTES.LOGIN || currentPath.includes('/login')) {
      console.log('📍 Home: Ya estamos en la página de login');
      setIsLoading(false);
      return;
    }
    if (currentPath === ROUTES.DASHBOARD || currentPath.includes('/dashboard')) {
      console.log('📍 Home: Ya estamos en el dashboard');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Home: Verificando autenticación...');
      
      // Verificar si hay un token
      const token = localStorage.getItem('token');
      
      // Verificar si hay datos del operador
      const operatorData = localStorage.getItem('operator');
      
      if (token && operatorData) {
        // Usuario autenticado, redirigir al dashboard
        console.log('✅ Home: Usuario autenticado, redirigiendo al dashboard...');
        window.safeRedirect(ROUTES.DASHBOARD);
      } else {
        // Usuario no autenticado, redirigir a login
        console.log('🔒 Home: Usuario no autenticado, redirigiendo a login...');
        window.safeRedirect(ROUTES.LOGIN);
      }
    } catch (error) {
      console.error('❌ Home: Error al verificar autenticación:', error);
      setError('Error al verificar la autenticación. Por favor, intente acceder directamente a la página de inicio de sesión.');
      setIsLoading(false);
    }
    
    // Establecer un timeout de seguridad para evitar quedarse en estado de carga
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Home: Timeout de verificación de autenticación');
        setIsLoading(false);
        // Redirigir a login por defecto en caso de timeout
        window.safeRedirect(ROUTES.LOGIN);
      }
    }, 2000); // 2 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800">Error de redirección</h1>
          <p className="text-gray-500">{error}</p>
          <Button 
            onClick={() => {
              window.safeRedirect(ROUTES.LOGIN);
            }}
            variant="destructive"
            className="mt-4"
          >
            Ir a la página de inicio de sesión
          </Button>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de carga mientras se verifica la autenticación
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        <p className="text-gray-500">Verificando autenticación...</p>
        <Button 
          onClick={() => {
            window.safeRedirect(ROUTES.LOGIN);
          }}
          variant="outline"
          className="mt-4"
        >
          Ir a la página de inicio de sesión
        </Button>
      </div>
    </div>
  );
} 