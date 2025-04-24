'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/app/config';

interface RedirectProps {
  to: string;
  message?: string;
}

/**
 * Componente para redirigir a otra ruta
 * Puede usar navegación del cliente o forzar una recarga completa
 */
export default function Redirect({ to, message = 'Redirigiendo...' }: RedirectProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si ya estamos redirigiendo, no hacer nada
    if (window.isRedirecting) {
      console.log('🛑 Redirect: Ya hay una redirección en progreso');
      return;
    }

    // Verificar si ya estamos en la ruta de destino
    const currentPath = window.location.pathname;
    if (currentPath === to) {
      console.log(`📍 Redirect: Ya estamos en la ruta de destino: ${to}`);
      setIsLoading(false);
      return;
    }

    try {
      console.log(`🔄 Redirect: Redirigiendo a ${to}...`);
      
      // Usar la función segura de redirección
      window.safeRedirect(to);
      
      // Establecer un timeout de seguridad para forzar la recarga si la redirección no ocurre
      const forceReloadTimeout = setTimeout(() => {
        console.warn('⚠️ Redirect: La redirección está tardando demasiado, forzando recarga...');
        window.location.href = to;
      }, 3000); // 3 segundos de timeout
      
      return () => clearTimeout(forceReloadTimeout);
    } catch (error) {
      console.error('❌ Redirect: Error al redirigir:', error);
      setError(`Error al redirigir a ${to}. Por favor, intente manualmente.`);
      setIsLoading(false);
    }
  }, [to]);

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Card className="max-w-md p-6 border-red-200 bg-red-50">
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-red-700">Error de redirección</h2>
            <p className="text-red-600">{error}</p>
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  window.safeRedirect(to);
                }}
                variant="destructive"
              >
                Intentar nuevamente
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar mensaje de carga mientras se redirige
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
} 