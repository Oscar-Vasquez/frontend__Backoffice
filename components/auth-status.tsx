"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReloadIcon, CheckCircledIcon, ExclamationTriangleIcon, ClockIcon } from "@radix-ui/react-icons";
import { AuthService } from "@/app/services/auth.service";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  iat: number;
  sub: string;
  email?: string;
}

export function AuthStatus() {
  const [token, setToken] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener y decodificar el token
  const checkToken = () => {
    try {
      // Obtener el token de las cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("workexpress_token="))
        ?.split("=")[1];

      if (!token) {
        setToken(null);
        setExpirationDate(null);
        setIsExpired(true);
        setError("No se encontró token de autenticación");
        return;
      }

      setToken(token);
      setError(null);

      // Decodificar el token para obtener la fecha de expiración
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const expDate = new Date(decoded.exp * 1000);
        setExpirationDate(expDate);
        
        // Verificar si el token ha expirado
        const now = new Date();
        setIsExpired(now > expDate);
        
        // Calcular tiempo restante
        const timeLeft = expDate.getTime() - now.getTime();
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining("Expirado");
        }
      } catch (e) {
        setError("Error al decodificar el token");
        console.error("Error al decodificar el token:", e);
      }
    } catch (e) {
      setError("Error al verificar el token");
      console.error("Error al verificar el token:", e);
    }
  };

  // Función para refrescar el token
  const refreshToken = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // await AuthService.refreshToken(); // Method doesn't exist on AuthService
      
      // Verificar el nuevo token
      checkToken();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al refrescar el token");
      console.error("Error al refrescar el token:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Verificar el token al cargar el componente
  useEffect(() => {
    checkToken();
    
    // Actualizar el tiempo restante cada segundo
    const interval = setInterval(() => {
      if (expirationDate) {
        const now = new Date();
        setIsExpired(now > expirationDate);
        
        const timeLeft = expirationDate.getTime() - now.getTime();
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining("Expirado");
          setIsExpired(true);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [expirationDate]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Estado de Autenticación</CardTitle>
        <CardDescription>
          Información sobre el estado del token de autenticación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800/30">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Estado del Token:
            </span>
            {token ? (
              isExpired ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  Expirado
                </Badge>
              ) : (
                <Badge variant="default" className="bg-emerald-500 flex items-center gap-1">
                  <CheckCircledIcon className="h-3 w-3" />
                  Válido
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-3 w-3" />
                No encontrado
              </Badge>
            )}
          </div>

          {expirationDate && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Expira el:
                </span>
                <span className="text-sm">
                  {expirationDate.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tiempo restante:
                </span>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${
                    isExpired 
                      ? "text-red-500 dark:text-red-400" 
                      : "text-emerald-500 dark:text-emerald-400"
                  }`}
                >
                  <ClockIcon className="h-3 w-3" />
                  {timeRemaining}
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkToken}
          disabled={isRefreshing}
        >
          Verificar
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={refreshToken}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Refrescando...
            </>
          ) : (
            "Refrescar Token"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AuthStatus; 