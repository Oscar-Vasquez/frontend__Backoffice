'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigation } from "@/app/hooks/useNavigation";
import { ApiError } from "@/app/services/api-client";
import { AlertCircle } from "lucide-react";

interface AuthErrorProps {
  error?: ApiError | Error;
  title?: string;
  description?: string;
}

/**
 * Componente para mostrar errores de autenticación
 * y proporcionar opciones para volver a iniciar sesión
 */
export function AuthError({ 
  error, 
  title = "Error de autenticación", 
  description = "Tu sesión ha expirado o no tienes permisos para acceder a esta página."
}: AuthErrorProps) {
  const navigation = useNavigation();
  
  const handleLogin = () => {
    navigation.logout(); // Esto limpiará la autenticación y redirigirá al login
  };
  
  const handleGoHome = () => {
    navigation.goToDashboard();
  };
  
  // Si es un error de API y no es 401, mostrar un mensaje diferente
  const isAuthError = error instanceof ApiError ? error.status === 401 : true;
  
  if (!isAuthError) {
    title = "Error inesperado";
    description = error?.message || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
  }
  
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <p className="font-mono">{error.message}</p>
              {error instanceof ApiError && error.data && (
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(error.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoHome}>
            Ir al Dashboard
          </Button>
          <Button onClick={handleLogin}>
            Iniciar sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 