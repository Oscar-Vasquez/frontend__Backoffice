'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/app/services/auth.service';

export function FixOperatorData() {
  const [result, setResult] = useState<string>('');
  const [isFixed, setIsFixed] = useState<boolean>(false);

  const fixOperatorData = () => {
    try {
      // Obtener el token actual
      const token = AuthService.getToken();
      if (!token) {
        setResult('No hay token disponible. Inicia sesión primero.');
        return;
      }

      // Obtener datos del operador del localStorage (incluso si son inválidos)
      let operatorData = null;
      try {
        const rawData = localStorage.getItem('operator');
        if (rawData) {
          operatorData = JSON.parse(rawData);
        }
      } catch (error) {
        console.error('Error al leer datos del operador:', error);
      }

      // Crear datos de operador válidos
      const fixedOperator = {
        id: operatorData?.id || '8030474c-9c17-42bb-a588-a45c2f8bcc4a',
        email: operatorData?.email || 'jesus@joshtechs.com',
        first_name: operatorData?.firstName || operatorData?.first_name || 'Jesus',
        last_name: operatorData?.lastName || operatorData?.last_name || 'Escobar',
        firstName: operatorData?.firstName || operatorData?.first_name || 'Jesus',
        lastName: operatorData?.lastName || operatorData?.last_name || 'Escobar',
        role: operatorData?.role || 'admin',
        status: operatorData?.status || 'active',
        type_operator_id: operatorData?.type_operator_id || null
      };

      // Guardar datos corregidos
      localStorage.setItem('operator', JSON.stringify(fixedOperator));
      
      // Verificar que se guardaron correctamente
      const savedOperator = AuthService.getOperatorData();
      
      if (savedOperator) {
        setResult('Datos del operador corregidos exitosamente.');
        setIsFixed(true);
      } else {
        setResult('Error: Los datos se guardaron pero no pasan la validación.');
      }
    } catch (error) {
      setResult(`Error al corregir datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Reparar Datos del Operador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Esta herramienta intentará corregir los datos del operador en el localStorage.
          Útil cuando el token está presente pero los datos del operador no son válidos.
        </p>
        
        {result && (
          <div className={`p-3 rounded-md ${isFixed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {result}
          </div>
        )}
        
        <Button 
          onClick={fixOperatorData} 
          variant={isFixed ? "outline" : "default"}
          disabled={isFixed}
        >
          {isFixed ? "Datos Corregidos" : "Corregir Datos del Operador"}
        </Button>
      </CardContent>
    </Card>
  );
} 