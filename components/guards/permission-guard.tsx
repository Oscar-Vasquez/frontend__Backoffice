'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/app/config';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function PermissionGuard({
  children,
  requiredPermission,
}: PermissionGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya estamos redirigiendo, no hacer nada
    if (window.isRedirecting) {
      console.log('🛑 PermissionGuard: Ya hay una redirección en progreso');
      setIsLoading(false);
      return;
    }

    // Verificar si estamos en la página de login
    const currentPath = window.location.pathname;
    if (currentPath === ROUTES.LOGIN || currentPath.includes('/login')) {
      console.log('📍 PermissionGuard: Ya estamos en la página de login');
      setIsLoading(false);
      return;
    }

    console.log('🔍 PermissionGuard: Verificando permisos...');
    
    // Verificar si hay un token
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔒 PermissionGuard: No hay token de autenticación');
      
      // Limpiar cualquier dato de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('operator');
      localStorage.removeItem('permissions');
      
      // Redirigir a login usando la función segura
      console.log('🔄 PermissionGuard: Redirigiendo a login...');
      window.safeRedirect(ROUTES.LOGIN);
      return;
    }

    try {
      // Verificar permisos específicos si se requieren
      if (requiredPermission) {
        console.log(`🔐 PermissionGuard: Verificando permiso específico: ${requiredPermission}`);
        
        // Obtener datos del operador
        const operatorData = localStorage.getItem('operator');
        if (!operatorData) {
          console.log('⚠️ PermissionGuard: No hay datos del operador');
          setHasPermission(false);
          setIsLoading(false);
          return;
        }
        
        // Parsear datos del operador
        const operator = JSON.parse(operatorData);
        
        // Verificar si es administrador (siempre tiene acceso)
        if (operator.role === 'admin') {
          console.log('✅ PermissionGuard: Usuario es administrador, acceso concedido');
          setHasPermission(true);
          setIsLoading(false);
          return;
        }
        
        // Verificar permisos específicos
        const permissions = localStorage.getItem('permissions');
        if (permissions) {
          const parsedPermissions = JSON.parse(permissions);
          const hasRequiredPermission = parsedPermissions.includes(requiredPermission);
          
          console.log(`${hasRequiredPermission ? '✅' : '❌'} PermissionGuard: Permiso ${requiredPermission} ${hasRequiredPermission ? 'concedido' : 'denegado'}`);
          setHasPermission(hasRequiredPermission);
        } else {
          console.log('⚠️ PermissionGuard: No hay permisos definidos');
          setHasPermission(false);
        }
      } else {
        // Si no se requiere un permiso específico, simplemente verificamos que haya datos del operador
        console.log('🔐 PermissionGuard: No se requiere permiso específico, verificando datos del operador');
        const operatorData = localStorage.getItem('operator');
        
        if (operatorData) {
          console.log('✅ PermissionGuard: Hay datos del operador, acceso concedido');
          setHasPermission(true);
        } else {
          console.log('❌ PermissionGuard: No hay datos del operador, acceso denegado');
          setHasPermission(false);
        }
      }
    } catch (error) {
      console.error('❌ PermissionGuard: Error al verificar permisos:', error);
      setError('Error al verificar permisos. Por favor, inicie sesión nuevamente.');
      setHasPermission(false);
    }
    
    setIsLoading(false);
    
    // Establecer un timeout de seguridad para evitar quedarse en estado de carga
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ PermissionGuard: Timeout de verificación de permisos');
        setIsLoading(false);
      }
    }, 2000); // 2 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [requiredPermission]);

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return (
      <div className="w-full p-8">
        <Card className="w-full p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar mensaje de error si ocurrió algún problema
  if (error) {
    return (
      <div className="w-full p-8">
        <Card className="w-full p-6 border-red-200 bg-red-50">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-700">Error de verificación</h2>
            <p className="text-red-600">{error}</p>
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  window.safeRedirect(ROUTES.LOGIN);
                }}
                variant="destructive"
              >
                Ir a inicio de sesión
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar mensaje de acceso denegado si no tiene permisos
  if (!hasPermission) {
    return (
      <div className="w-full p-8">
        <Card className="w-full p-6 border-amber-200 bg-amber-50">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-amber-700">Acceso denegado</h2>
            <p className="text-amber-600">
              {requiredPermission
                ? `No tiene permiso para acceder a esta sección. Se requiere el permiso: ${requiredPermission}`
                : 'No tiene permiso para acceder a esta sección.'}
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => {
                  window.history.back();
                }}
                variant="outline"
              >
                Volver
              </Button>
              <Button 
                onClick={() => {
                  window.safeRedirect(ROUTES.DASHBOARD);
                }}
                variant="default"
              >
                Ir al dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Si tiene permisos, mostrar el contenido
  return <>{children}</>;
}
