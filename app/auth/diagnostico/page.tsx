'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/app/services/auth.service';
import { OperatorsService } from '@/app/services/operators.service';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/config';
import { FixOperatorData } from './fix-operator';

export default function DiagnosticoPage() {
  const router = useRouter();
  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [operatorData, setOperatorData] = useState<any>(null);

  useEffect(() => {
    const realizarDiagnostico = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos del operador
        const operator = AuthService.getOperatorData();
        setOperatorData(operator);
        
        // Realizar diagnóstico de conexión
        const resultado = await OperatorsService.diagnosticarConexion();
        setDiagnostico(resultado);
      } catch (error) {
        console.error('Error al realizar diagnóstico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    realizarDiagnostico();
  }, []);

  const handleLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  const handleDashboard = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleLogout = () => {
    AuthService.logout();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Diagnóstico de Autenticación</CardTitle>
            <CardDescription>Analizando el estado de la autenticación...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Diagnóstico de Autenticación</CardTitle>
          <CardDescription>Resultados del análisis de autenticación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Estado de Autenticación</h3>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm">
                <span className="font-medium">Autenticado: </span>
                <span className={AuthService.isAuthenticated() ? "text-green-600" : "text-red-600"}>
                  {AuthService.isAuthenticated() ? "Sí" : "No"}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Token: </span>
                <span className={diagnostico?.tokenPresente ? "text-green-600" : "text-red-600"}>
                  {diagnostico?.tokenPresente ? diagnostico?.tokenParcial : "No presente"}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Datos del Operador</h3>
            <div className="rounded-md bg-gray-50 p-4 overflow-auto max-h-40">
              {operatorData ? (
                <pre className="text-xs">{JSON.stringify(operatorData, null, 2)}</pre>
              ) : (
                <p className="text-sm text-red-600">No hay datos de operador almacenados</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Conectividad API</h3>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm">
                <span className="font-medium">URL API: </span>
                <span>{diagnostico?.apiUrl}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Conectividad: </span>
                <span className={diagnostico?.conectividadApi ? "text-green-600" : "text-red-600"}>
                  {diagnostico?.conectividadApi ? "OK" : "Error"}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Endpoint Operadores: </span>
                <span className={diagnostico?.respuestaOperadores?.ok ? "text-green-600" : "text-red-600"}>
                  {diagnostico?.respuestaOperadores?.status} {diagnostico?.respuestaOperadores?.ok ? "OK" : "Error"}
                </span>
              </p>
              {diagnostico?.respuestaOperadores?.mensaje && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Mensaje: </span>
                  <span>{diagnostico?.respuestaOperadores?.mensaje}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Cookies</h3>
            <div className="rounded-md bg-gray-50 p-4 overflow-auto max-h-40">
              {diagnostico?.cookies?.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {diagnostico.cookies.map((cookie: string, index: number) => (
                    <li key={index}>{cookie}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-600">No hay cookies almacenadas</p>
              )}
            </div>
          </div>

          <FixOperatorData />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="space-x-2">
            <Button variant="outline" onClick={handleLogin}>
              Ir al Login
            </Button>
            <Button variant="outline" onClick={handleDashboard}>
              Ir al Dashboard
            </Button>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 