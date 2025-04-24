"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { AuthService } from "@/app/services/auth.service";
import { toast } from "@/components/ui/use-toast";
import { ROUTES } from "@/app/config";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validación simple de entradas
    if (!email) {
      setError("Por favor ingrese su correo electrónico");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Limpiar cualquier dato de autenticación previo
      AuthService.clearAuth();
      
      console.log('🔐 Intentando iniciar sesión con email:', email);
      
      // Realizar el login
      const response = await AuthService.login(email, password);
      
      console.log('✅ Login exitoso, token recibido');
      
      // Guardar el token en localStorage y cookies
      AuthService.saveToken(response.token);
      
      // Verificar que el token y los datos del operador se guardaron correctamente
      const token = localStorage.getItem('token');
      const operatorData = localStorage.getItem('operator');
      
      console.log('🔍 Verificando datos guardados:', {
        token: !!token,
        operatorData: !!operatorData
      });
      
      if (!token || !operatorData) {
        throw new Error("Error al guardar datos de autenticación");
      }
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Inicio de sesión exitoso!",
        description: `Bienvenido(a) ${response.operator.firstName || 'Usuario'}`,
        variant: "default",
      });
      
      console.log('🔄 Redirigiendo al dashboard...');
      
      // Usar window.location para forzar una recarga completa
      setTimeout(() => {
        window.location.href = ROUTES.DASHBOARD;
      }, 500);
      
    } catch (error) {
      console.error("❌ Error de login:", error);
      
      // Mostrar mensaje de error
      setError(error instanceof Error ? error.message : "Credenciales incorrectas");
      
      // Limpiar cualquier dato de autenticación parcial
      AuthService.clearAuth();
      
      setIsLoading(false);
    }
  };

  // Si hay un error, mostrar mensaje de error integrado en el formulario
  if (error) {
    toast({
      title: "Error de autenticación",
      description: error,
      variant: "destructive",
    });
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 relative">
              <Image
                src="/LOGO-WORKEXPRESS.png"
                alt="WorkExpress Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="operador@workexpress.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Contraseña</Label>
                <a 
                  href="/forgot-password" 
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Verificando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 