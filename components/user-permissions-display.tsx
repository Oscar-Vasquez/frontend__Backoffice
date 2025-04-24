'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { AuthService } from '@/app/services/auth.service';
import { OperatorTypesService } from '@/app/services/operator-types.service';

// Available permissions in the system with friendly names
const permissionLabels: Record<string, string> = {
  home: 'Dashboard',
  tracking: 'Rastreo',
  billing: 'Facturación',
  invoices: 'Facturas',
  clients: 'Clientes',
  operators: 'Operadores',
  operator_types: 'Tipos de Operadores',
  plans: 'Planes',
  branches: 'Sucursales',
  emails: 'Emails',
};

export function UserPermissionsDisplay() {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [operatorType, setOperatorType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Evitar redirecciones infinitas
    if (window.isRedirecting) {
      console.log('🛑 UserPermissionsDisplay: Ya hay una redirección en progreso, evitando ciclo');
      setIsLoading(false);
      return;
    }

    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current operator data
        const operator = AuthService.getOperatorData();
        
        if (!operator) {
          console.log('⚠️ UserPermissionsDisplay: No hay datos del operador');
          setPermissions({
            home: true // Permiso básico por defecto
          });
          setIsLoading(false);
          return;
        }
        
        try {
          // Get permissions
          const permissions = await OperatorTypesService.getOperatorPermissions();
          setPermissions(permissions);

          // Get operator type name if available
          if (operator?.type_operator_id) {
            try {
              const typeData = await OperatorTypesService.getOperatorType(operator.type_operator_id);
              setOperatorType(typeData.name);
            } catch (err) {
              console.error('Error fetching operator type:', err);
            }
          } else if (operator?.role === 'admin') {
            setOperatorType('Administrador');
          }
        } catch (err) {
          console.error('Error loading permissions:', err);
          // En caso de error, establecer permisos básicos
          setPermissions({
            home: true // Permiso básico por defecto
          });
        }
      } catch (err) {
        console.error('Error loading permissions:', err);
        setError('No se pudieron cargar los permisos');
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-2 mt-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 text-red-800 rounded-lg bg-red-50">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  const permissionEntries = Object.entries(permissionLabels).map(([key, label]) => ({
    key,
    label,
    granted: permissions[key] || false,
  }));

  return (
    <div className="space-y-4">
      {operatorType && (
        <div className="text-sm text-muted-foreground">
          Tipo de operador: <span className="font-medium">{operatorType}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {permissionEntries.map((permission) => (
          <div 
            key={permission.key}
            className={`flex items-center justify-between p-2 rounded-md border ${
              permission.granted 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <span className="text-sm font-medium">{permission.label}</span>
            <Badge variant={permission.granted ? 'default' : 'outline'} className={permission.granted ? 'bg-emerald-500' : 'text-gray-500'}>
              {permission.granted ? 'Permitido' : 'Denegado'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
} 