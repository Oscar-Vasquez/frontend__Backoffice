'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/config';

export default function FixAuthPage() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<{ present: boolean, value: string | null }>({ present: false, value: null });
  const [operatorInfo, setOperatorInfo] = useState<{ present: boolean, value: any | null }>({ present: false, value: null });

  useEffect(() => {
    // Verificar estado actual
    checkCurrentState();
  }, []);

  const checkCurrentState = () => {
    // Verificar token
    const token = getCookie('workexpress_token');
    setTokenInfo({
      present: !!token,
      value: token
    });

    // Verificar datos del operador
    let operatorData = null;
    try {
      const rawData = localStorage.getItem('operator');
      if (rawData) {
        operatorData = JSON.parse(rawData);
      }
    } catch (error) {
      console.error('Error al leer datos del operador:', error);
    }

    setOperatorInfo({
      present: !!operatorData,
      value: operatorData
    });
  };

  const fixAuth = () => {
    try {
      // Si no hay token, no podemos hacer nada
      if (!tokenInfo.value) {
        setResult('No hay token disponible. Inicia sesión primero.');
        return;
      }

      // Crear datos de operador válidos
      const fixedOperator = {
        id: operatorInfo.value?.id || '8030474c-9c17-42bb-a588-a45c2f8bcc4a',
        email: operatorInfo.value?.email || 'jesus@joshtechs.com',
        first_name: operatorInfo.value?.firstName || operatorInfo.value?.first_name || 'Jesus',
        last_name: operatorInfo.value?.lastName || operatorInfo.value?.last_name || 'Escobar',
        firstName: operatorInfo.value?.firstName || operatorInfo.value?.first_name || 'Jesus',
        lastName: operatorInfo.value?.lastName || operatorInfo.value?.last_name || 'Escobar',
        role: operatorInfo.value?.role || 'admin',
        status: operatorInfo.value?.status || 'active',
        type_operator_id: operatorInfo.value?.type_operator_id || null
      };

      // Guardar datos corregidos
      localStorage.setItem('operator', JSON.stringify(fixedOperator));
      
      // Verificar que se guardaron correctamente
      const savedOperator = localStorage.getItem('operator');
      
      if (savedOperator) {
        setResult('Datos del operador corregidos exitosamente.');
        setIsFixed(true);
        checkCurrentState();
      } else {
        setResult('Error: No se pudieron guardar los datos en localStorage.');
      }
    } catch (error) {
      setResult(`Error al corregir datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleDashboard = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  const handleClearAuth = () => {
    // Eliminar token
    document.cookie = 'workexpress_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Eliminar datos del operador
    localStorage.removeItem('operator');
    
    checkCurrentState();
    setResult('Datos de autenticación eliminados correctamente.');
  };

  // Función auxiliar para obtener cookies
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Reparación de Autenticación</CardTitle>
          <CardDescription>Esta herramienta corrige problemas de autenticación en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Estado Actual</h3>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm">
                <span className="font-medium">Token: </span>
                <span className={tokenInfo.present ? "text-green-600" : "text-red-600"}>
                  {tokenInfo.present ? "Presente" : "No encontrado"}
                </span>
                {tokenInfo.present && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({tokenInfo.value?.substring(0, 10)}...)
                  </span>
                )}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Datos del operador: </span>
                <span className={operatorInfo.present ? "text-green-600" : "text-red-600"}>
                  {operatorInfo.present ? "Presentes" : "No encontrados"}
                </span>
              </p>
              {operatorInfo.present && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <pre>{JSON.stringify(operatorInfo.value, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
          
          {result && (
            <div className={`p-3 rounded-md ${isFixed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {result}
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={fixAuth} 
              variant="default"
              disabled={isFixed || !tokenInfo.present}
            >
              Corregir Datos de Autenticación
            </Button>
            
            <Button 
              onClick={handleClearAuth} 
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Eliminar Datos de Autenticación
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleLogin}>
            Ir al Login
          </Button>
          <Button onClick={handleDashboard}>
            Ir al Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 