"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ReloadIcon, 
  CheckIcon, 
  InfoCircledIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import useThemeSettingsStore from "@/store/themeSettingsStore";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OperatorsService, Operator } from "@/app/services/operators.service";
import { OperatorTypesService } from "@/app/services/operator-types.service";

// Interfaces para los datos
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  enabled: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  dateAdded: Date;
  branchName?: string;
  rawData: Operator;
}

interface OperatorType {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Props para el componente principal
export interface PermissionDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedUser: User) => void;
}

// Componente para mostrar un grupo de permisos
const PermissionGroup = ({ 
  title, 
  permissions, 
  onPermissionChange 
}: { 
  title: string; 
  permissions: Permission[]; 
  onPermissionChange: (permissionId: string, enabled: boolean) => void;
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
      <div className="space-y-2">
        {permissions.map((permission) => (
          <div 
            key={permission.id} 
            className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <Checkbox 
              id={permission.id} 
              checked={permission.enabled}
              onCheckedChange={(checked) => onPermissionChange(permission.id, checked as boolean)}
              className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600"
              disabled={true} // Deshabilitar los checkboxes ya que ahora solo se puede cambiar el tipo de operador
            />
            <div className="space-y-1">
              <label 
                htmlFor={permission.id} 
                className="text-sm font-medium text-gray-900 dark:text-gray-200 cursor-pointer"
              >
                {permission.name}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PermissionDialog({ 
  user, 
  open, 
  onOpenChange,
  onSave
}: PermissionDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [operatorType, setOperatorType] = useState<OperatorType | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [operatorTypes, setOperatorTypes] = useState<{id: string, name: string}[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const { themeColor } = useThemeSettingsStore();

  // Función para obtener el token de autenticación
  const getAuthToken = (): string => {
    let token = '';
    
    // Intentar obtener el token de localStorage
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('workexpress_token') || '';
    }
    
    // Si no hay token en localStorage, intentar obtenerlo de las cookies
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'workexpress_token') {
          token = value;
          break;
        }
      }
    }
    
    return token;
  };

  // Función para manejar errores de autenticación
  const handleAuthError = (message: string = "Sesión expirada o inválida") => {
    // Guardar la URL actual para redirigir después del login
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
    
    // Mostrar mensaje y preparar redirección
    toast.error("Sesión expirada. Redirigiendo al login...");
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 2000);
    
    throw new Error(message);
  };

  // Agrupar permisos por módulo
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Cargar tipos de operadores
  const loadOperatorTypes = async () => {
    try {
      const types = await OperatorTypesService.getOperatorTypes();
      setOperatorTypes(types.map(type => ({
        id: type.id,
        name: type.name
      })));
    } catch (error) {
      console.error("Error al cargar tipos de operadores:", error);
      toast.error("No se pudieron cargar los tipos de operadores", {
        description: error instanceof Error ? error.message : "Error desconocido",
        duration: 5000,
      });
    }
  };

  // Función para obtener el ID del tipo de operador del usuario
  const getOperatorTypeId = (userData: User): string | null => {
    if (!userData || !userData.rawData) return null;
    
    // Intentar obtener el ID del tipo de operador de diferentes propiedades posibles
    return userData.rawData.type_operator_id || null;
  };

  // Cargar tipo de operador y permisos
  const loadOperatorTypeAndPermissions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener el ID del tipo de operador del usuario
      console.log("Cargando permisos para usuario:", user);
      
      // Intentar obtener el type_operator_id de diferentes propiedades posibles
      const typeOperatorId = getOperatorTypeId(user);
      
      console.log("ID del tipo de operador:", typeOperatorId);
      
      if (!typeOperatorId) {
        throw new Error("El usuario no tiene un tipo de operador asignado");
      }
      
      // Establecer el tipo de operador seleccionado
      setSelectedTypeId(typeOperatorId);
      
      // Obtener el token de autenticación
      const token = getAuthToken();
      
      if (!token) {
        console.error("No se encontró token de autenticación");
        handleAuthError("No hay sesión activa. Por favor, inicie sesión nuevamente.");
      }
      
      // Configurar la URL y los headers para la petición
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const url = `${apiUrl}/operator-types/${typeOperatorId}`;
      
      console.log("Realizando petición a:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        
        // Si es un error 401, manejar error de autenticación
        if (response.status === 401) {
          handleAuthError();
        }
        
        throw new Error(`Error al obtener permisos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Datos recibidos:", data);
      
      // Verificar si hay datos y permisos
      if (!data) {
        throw new Error("No se recibieron datos del tipo de operador");
      }
      
      // Extraer el tipo de operador y sus permisos
      const operatorTypeData: OperatorType = {
        id: data.id || typeOperatorId,
        name: data.name || "Tipo de operador",
        description: data.description || "",
        permissions: []
      };
      
      // Verificar si hay permisos en la respuesta
      let permissionsData: Permission[] = [];
      
      if (data.permissions) {
        // Si permissions es un objeto (id: boolean), convertirlo a array
        if (typeof data.permissions === 'object' && !Array.isArray(data.permissions)) {
          permissionsData = Object.entries(data.permissions).map(([id, enabled]) => ({
            id,
            name: id, // Usar el ID como nombre por defecto
            description: "Permiso del sistema",
            module: "General",
            enabled: enabled as boolean
          }));
        } 
        // Si permissions es un array, usarlo directamente
        else if (Array.isArray(data.permissions)) {
          permissionsData = data.permissions.map((p: any) => ({
            id: p.id || p.name,
            name: p.name || p.id,
            description: p.description || "Permiso del sistema",
            module: p.module || "General",
            enabled: p.enabled || false
          }));
        }
      }
      
      console.log("Permisos procesados:", permissionsData);
      
      // Actualizar el estado
      setOperatorType(operatorTypeData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      
      // Mostrar mensaje de error
      toast.error("No se pudieron cargar los permisos", {
        description: error instanceof Error ? error.message : "Error desconocido",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open && user && user.id) {
      loadOperatorTypes();
      loadOperatorTypeAndPermissions();
    }
  }, [open, user]);

  // Manejar cambio de permisos
  const handlePermissionChange = (permissionId: string, enabled: boolean) => {
    setPermissions(prevPermissions => 
      prevPermissions.map(permission => 
        permission.id === permissionId 
          ? { ...permission, enabled } 
          : permission
      )
    );
  };

  // Manejar cambio de tipo de operador
  const handleOperatorTypeChange = async (typeId: string) => {
    setSelectedTypeId(typeId);
    
    // Si el tipo seleccionado es diferente al actual, cargar sus permisos
    if (typeId !== operatorType?.id) {
      setIsLoading(true);
      
      try {
        const newType = await OperatorTypesService.getOperatorType(typeId);
        
        // Extraer el tipo de operador y sus permisos
        const operatorTypeData: OperatorType = {
          id: newType.id,
          name: newType.name,
          description: newType.description || "",
          permissions: []
        };
        
        // Verificar si hay permisos en la respuesta
        let permissionsData: Permission[] = [];
        
        if (newType.permissions) {
          // Si permissions es un objeto (id: boolean), convertirlo a array
          if (typeof newType.permissions === 'object' && !Array.isArray(newType.permissions)) {
            permissionsData = Object.entries(newType.permissions).map(([id, enabled]) => ({
              id,
              name: id, // Usar el ID como nombre por defecto
              description: "Permiso del sistema",
              module: "General",
              enabled: enabled as boolean
            }));
          }
        }
        
        // Actualizar el estado
        setOperatorType(operatorTypeData);
        setPermissions(permissionsData);
      } catch (error) {
        console.error("Error al cargar nuevo tipo de operador:", error);
        toast.error("No se pudo cargar el nuevo tipo de operador", {
          description: error instanceof Error ? error.message : "Error desconocido",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Función para guardar los cambios
  const saveOperatorType = async () => {
    if (!selectedTypeId || !user.rawData) return;
    
    try {
      setIsSaving(true);
      
      // Obtener el token de autenticación
      const token = await getAuthToken();
      if (!token) {
        toast.error("No se pudo obtener el token de autenticación");
        return;
      }
      
      // Actualizar el tipo de operador
      const updatedOperator = await OperatorsService.updateOperator(
        user.rawData.operatorId,
        { type_operator_id: selectedTypeId }
      );
      
      // Actualizar el usuario en el estado local
      if (updatedOperator) {
        // Crear una copia actualizada del usuario
        const updatedUser = {
          ...user,
          rawData: {
            ...user.rawData,
            type_operator_id: selectedTypeId
          }
        };
        
        // Notificar éxito
        toast.success("Permisos actualizados correctamente");
        
        // Cerrar el diálogo
        onOpenChange(false);
        
        // Llamar a onSave si existe
        if (onSave) {
          onSave(updatedUser);
        }
      }
    } catch (error) {
      console.error("Error al guardar el tipo de operador:", error);
      toast.error("Error al guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  // Obtener el gradiente del tema activo
  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-500 to-green-500';
      case 'sky':
        return 'from-sky-500 to-blue-500';
      case 'emerald':
        return 'from-emerald-500 to-green-500';
      case 'rose':
        return 'from-rose-500 to-pink-500';
      case 'amber':
        return 'from-amber-500 to-yellow-500';
      case 'purple':
        return 'from-purple-500 to-indigo-500';
      case 'slate':
        return 'from-slate-500 to-gray-600';
      case 'stone':
        return 'from-stone-500 to-gray-600';
      case 'neutral':
        return 'from-neutral-500 to-gray-600';
      case 'indigo':
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80%] max-w-[500px] mx-auto my-8 p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-xl">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className={`p-1.5 rounded-md bg-gradient-to-br ${getThemeGradient()}`}>
              <LockClosedIcon className="h-4 w-4 text-white" />
            </div>
            Permisos de usuario
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona el tipo de operador para {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-5">
          {/* Información del usuario */}
          <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white font-medium text-base">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{user.email}</span>
                <Badge variant="outline" className="ml-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Selector de tipo de operador */}
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">Tipo de operador</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Selecciona el tipo de operador para asignar los permisos correspondientes.
            </p>
            
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={selectedTypeId} 
                onValueChange={handleOperatorTypeChange}
                disabled={isLoading || isSaving}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Seleccionar tipo de operador" />
                </SelectTrigger>
                <SelectContent>
                  {operatorTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Estado de carga */}
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[120px]" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                <h3 className="text-lg font-medium text-red-700 dark:text-red-400">Error</h3>
              </div>
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <Button 
                onClick={loadOperatorTypeAndPermissions} 
                variant="outline" 
                className="mt-2 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <ReloadIcon className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}
          
          {/* Lista de permisos (solo lectura) */}
          {!isLoading && !error && permissions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Permisos del tipo seleccionado</h3>
                <div className="flex items-center space-x-1 text-xs">
                  <Badge variant="outline" className="text-xs py-0 h-5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50">
                    <CheckCircledIcon className="mr-1 h-3 w-3" />
                    {permissions.filter(p => p.enabled).length} activos
                  </Badge>
                  <Badge variant="outline" className="text-xs py-0 h-5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                    <CrossCircledIcon className="mr-1 h-3 w-3" />
                    {permissions.filter(p => !p.enabled).length} inactivos
                  </Badge>
                </div>
              </div>
              
              <ScrollArea className="h-[250px] pr-4 -mr-4">
                <div className="space-y-6">
                  {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                    <div key={module}>
                      <PermissionGroup 
                        title={module} 
                        permissions={modulePermissions}
                        onPermissionChange={handlePermissionChange}
                      />
                      {module !== Object.keys(permissionsByModule).pop() && (
                        <Separator className="my-4 dark:bg-gray-700" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Acciones */}
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 h-9 px-3 text-sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveOperatorType}
              disabled={isLoading || isSaving || !selectedTypeId || selectedTypeId === user.rawData?.type_operator_id}
              className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 dark:bg-${themeColor}-700 dark:hover:bg-${themeColor}-800 h-9 px-3 text-sm`}
            >
              {isSaving ? (
                <>
                  <ReloadIcon className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckIcon className="mr-1.5 h-3.5 w-3.5" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 