"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/app/config';
import { LoginForm } from './components/login-form';

// Variable global para evitar múltiples redirecciones
declare global {
  var redirectAttempted: boolean;
}

if (typeof global.redirectAttempted === 'undefined') {
  global.redirectAttempted = false;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya estamos redirigiendo, no hacer nada
    if (window.isRedirecting) {
      console.log('🛑 LoginPage: Ya hay una redirección en progreso');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 LoginPage: Verificando autenticación...');
      
      // Verificar si hay un token
      const token = localStorage.getItem('token');
      
      // Verificar si hay datos del operador
      const operatorData = localStorage.getItem('operator');
      
      if (token && operatorData) {
        // Usuario ya autenticado, redirigir al dashboard
        console.log('✅ LoginPage: Usuario ya autenticado, redirigiendo al dashboard...');
        setIsRedirecting(true);
        window.safeRedirect(ROUTES.DASHBOARD);
        return;
      }
      
      // Si no hay token o datos del operador, mostrar el formulario de login
      console.log('🔒 LoginPage: Usuario no autenticado, mostrando formulario de login');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ LoginPage: Error al verificar autenticación:', error);
      setError('Error al verificar la autenticación. Por favor, intente nuevamente.');
      setIsLoading(false);
    }
    
    // Establecer un timeout de seguridad para evitar quedarse en estado de carga
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ LoginPage: Timeout de verificación de autenticación');
        setIsLoading(false);
      }
    }, 2000); // 2 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Si estamos redirigiendo, mostrar mensaje de redirección
  if (isRedirecting) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
          <p className="text-gray-500">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Error</CardTitle>
            <CardDescription className="text-red-500">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => setIsLoading(true)}
              className="w-full"
            >
              Intentar nuevamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Si está cargando, mostrar pantalla de carga
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
          <p className="text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Mostrar formulario de login
  return <LoginForm />;
} 