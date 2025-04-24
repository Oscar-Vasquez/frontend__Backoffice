"use client"

import {
  LogOut,
  User,
  Settings,
  UserCircle,
  Building,
  Mail,
  Shield,
  ChevronDown,
  ChevronRight,
  Edit,
  Phone,
  Calendar,
  Info,
  AtSign,
  MapPin,
  Check
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { useNavigation } from "@/app/hooks/useNavigation"
import { ROUTES } from "@/app/config"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OperatorsService, Operator as OperatorType } from "@/app/services/operators.service"
import { toast } from "sonner"

interface Operator {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: string;
  avatar?: string;
  photo?: string;
  branch_name?: string;
  branchName?: string;
  branchReference?: string;
  branchId?: string;
  branch_id?: string;
  branchAddress?: string;
  branch_address?: string;
  branchCity?: string;
  branch_city?: string;
  branchProvince?: string;
  branch_province?: string;
  branchPostalCode?: string;
  branch_postal_code?: string;
  branchPhone?: string;
  branch_phone?: string;
  branchEmail?: string;
  branch_email?: string;
  branchManagerName?: string;
  branch_manager_name?: string;
  branchOpeningHours?: string;
  branch_opening_hours?: string;
  status?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  operatorId?: string;
  birth_date?: string | Date | null;
  hire_date?: string | Date | null;
  personal_id?: string | null;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship?: string;
    address?: string;
  } | null;
  skills?: string[];
}

export function NavUser() {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [completeOperator, setCompleteOperator] = useState<OperatorType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const router = useRouter()
  const navigation = useNavigation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Reemplazar el estado complejo por refs para los inputs de contraseña
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Si ya estamos redirigiendo, no hacer nada
    if (window.isRedirecting) {
      console.log('🛑 NavUser: Ya hay una redirección en progreso');
      setIsLoading(false);
      return;
    }

    // Si ya inicializamos, no volver a cargar
    if (isInitialized) {
      console.log('🔄 NavUser: Ya inicializado, no volver a cargar');
      return;
    }

    // Verificar si estamos en la página de login
    const currentPath = window.location.pathname;
    if (currentPath === ROUTES.LOGIN || currentPath.includes('/login')) {
      console.log('📍 NavUser: Ya estamos en la página de login');
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    console.log('🔍 NavUser: Verificando autenticación...');
    
    // Verificar si hay un token
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔒 NavUser: No hay token de autenticación');
      
      // Limpiar cualquier dato de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('operator');
      localStorage.removeItem('permissions');
      
      // Redirigir a login usando la función segura
      console.log('🔄 NavUser: Redirigiendo a login...');
      window.safeRedirect(ROUTES.LOGIN);
      return;
    }

    // Cargar datos del operador
    try {
      const operatorData = localStorage.getItem('operator');
      if (operatorData) {
        const parsedOperator = JSON.parse(operatorData);
        console.log('👤 NavUser: Datos del operador cargados:', parsedOperator);
        
        // Asegurarse de que el operador tenga un nombre
        const processedOperator = {
          ...parsedOperator,
          // Si no hay name, construirlo a partir de firstName y lastName
          name: parsedOperator.name || 
                ((parsedOperator.firstName || parsedOperator.first_name || '') + ' ' + 
                (parsedOperator.lastName || parsedOperator.last_name || '')).trim() || 
                parsedOperator.email?.split('@')[0] || 'Usuario'
        };
        
        console.log('👤 NavUser: Datos del operador procesados:', processedOperator);
        setOperator(processedOperator);
      } else {
        console.log('⚠️ NavUser: No se encontraron datos del operador');
        // No redirigimos aquí, dejamos que el PermissionGuard o el layout se encarguen
      }
    } catch (error) {
      console.error('❌ NavUser: Error al cargar datos del operador:', error);
      // No redirigimos aquí, dejamos que el PermissionGuard o el layout se encarguen
    }

    setIsLoading(false);
    setIsInitialized(true);

    // Establecer un timeout de seguridad para evitar quedarse en estado de carga
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ NavUser: Timeout de carga de datos del operador');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 2000); // 2 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, isInitialized]);

  const handleLogout = () => {
    console.log('🚪 NavUser: Cerrando sesión...');
    
    // Limpiar datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('operator');
    localStorage.removeItem('permissions');
    
    // Redirigir a login usando la función segura
    console.log('🔄 NavUser: Redirigiendo a login después de cerrar sesión...');
    window.safeRedirect(ROUTES.LOGIN);
  };

  const handleGoToProfile = () => {
    setIsProfileOpen(true);
    setIsOpen(false);
    // Cargar datos completos del operador si aún no se han cargado
    if (!completeOperator && operator) {
      loadCompleteOperatorData();
    }
  };

  const handleGoToSettings = () => {
    router.push('/dashboard/settings');
    setIsOpen(false);
  };

  // Función para habilitar la edición
  const enableEditing = () => {
    setIsEditing(true);
  };

  // Función para cargar los datos completos del operador
  const loadCompleteOperatorData = async () => {
    if (!operator) return;
    
    try {
      setIsLoadingProfile(true);
      
      // Obtener el ID del operador desde diferentes propiedades
      const operatorId = operator.operatorId || (operator as any).id;
      
      if (!operatorId) {
        console.error('❌ NavUser: No se pudo obtener el ID del operador');
        toast.error('No se pudo cargar el perfil: ID de operador no disponible');
        setIsLoadingProfile(false);
        return;
      }
      
      console.log('🔍 NavUser: Cargando datos completos del operador:', operatorId);
      const operatorData = await OperatorsService.getOperator(operatorId);
      
      console.log('✅ NavUser: Datos completos del operador cargados:', operatorData);
      setCompleteOperator(operatorData);
    } catch (error) {
      console.error('❌ NavUser: Error al cargar datos completos del operador:', error);
      toast.error('No se pudieron cargar los datos completos del perfil');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Cargar datos completos cuando se abre el perfil
  useEffect(() => {
    if (isProfileOpen && !completeOperator && operator) {
      loadCompleteOperatorData();
    }
  }, [isProfileOpen, completeOperator, operator]);

  // Función para guardar cambios
  const saveChanges = async () => {
    if (!operator) {
      console.error('❌ NavUser: No hay datos del operador básico');
      toast.error('No se puede actualizar el perfil: Información del operador no disponible');
      return;
    }
    
    if (!completeOperator) {
      console.error('❌ NavUser: No hay datos completos del operador');
      toast.error('No se puede actualizar el perfil: Información completa no disponible');
      return;
    }
    
    try {
      // Mostrar que estamos cargando
      setIsLoading(true);
      
      // Mostrar un toast de carga que permanecerá visible durante el proceso
      const loadingToast = toast.loading('Guardando cambios...', {
        duration: Infinity, // Para que no desaparezca automáticamente
      });
      
      // Obtener los valores de los campos editados
      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
      const phone = (document.getElementById('phone') as HTMLInputElement)?.value;
      const address = (document.getElementById('address') as HTMLInputElement)?.value;
      
      // Preparar el objeto con los datos actualizados
      const updateData = {
        firstName,
        lastName,
        phone,
        address
      };
      
      // Imprimir datos para depuración
      console.log('📋 NavUser: Datos a actualizar:', updateData);
      
      // Obtener ID del operador - usar solo la propiedad operatorId que está garantizada
      const operatorId = completeOperator.operatorId;
      
      if (!operatorId) {
        console.error('❌ NavUser: No se pudo obtener el ID del operador para actualizar');
        toast.error('No se pudo actualizar el perfil: ID de operador no disponible');
        toast.dismiss(loadingToast); // Cerrar el toast de carga en caso de error
        setIsLoading(false);
        return;
      }
      
      console.log('🔄 NavUser: Actualizando operador con ID:', operatorId);
      
      // Llamar al servicio para actualizar
      const updatedOperator = await OperatorsService.updateOperator(operatorId, updateData);
      
      console.log('✅ NavUser: Operador actualizado correctamente:', updatedOperator);
      
      // Actualizar el estado local si la respuesta es válida
      if (updatedOperator) {
        setCompleteOperator(updatedOperator);
        
        // Actualizar el localStorage con los datos actualizados
        try {
          const operatorData = localStorage.getItem('operator');
          if (operatorData) {
            const parsedOperator = JSON.parse(operatorData);
            const updatedLocalOperator = {
              ...parsedOperator,
              firstName,
              lastName,
              phone,
              address
            };
            localStorage.setItem('operator', JSON.stringify(updatedLocalOperator));
            console.log('💾 NavUser: Datos en localStorage actualizados');
          }
        } catch (localStorageError) {
          console.error('❌ NavUser: Error al actualizar localStorage:', localStorageError);
          // No fallamos la operación completa por esto
        }
      } else {
        console.warn('⚠️ NavUser: La respuesta del servidor no contiene datos del operador');
      }
      
      // Cerrar el toast de carga y mostrar éxito
      toast.dismiss(loadingToast);
      toast.success('Perfil actualizado correctamente');
      
    } catch (error) {
      console.error('❌ NavUser: Error al actualizar datos del operador:', error);
      // Mostrar el error específico
      toast.error(`No se pudieron actualizar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  // Función para cambiar la contraseña optimizada
  const changePassword = async () => {
    // Obtener valores de los inputs
    const currentPassword = currentPasswordRef.current?.value;
    const newPassword = newPasswordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;
    
    // Validar campos
    if (!currentPassword) {
      setPasswordError('Debe ingresar su contraseña actual');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('Debe ingresar una nueva contraseña');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setIsLoading(true);
      setPasswordError(null);
      
      // Mostrar un toast de carga que permanecerá visible durante el proceso
      const loadingToast = toast.loading('Cambiando contraseña...', {
        duration: Infinity, // Para que no desaparezca automáticamente
      });
      
      // Obtener ID del operador desde localStorage para asegurar que estamos cambiando nuestra propia contraseña
      const operatorData = localStorage.getItem('operator');
      if (!operatorData) {
        toast.dismiss(loadingToast);
        throw new Error('No se encontraron datos del operador autenticado');
      }
      
      const parsedOperator = JSON.parse(operatorData);
      // Usar operatorId del usuario autenticado (no del perfil que estamos viendo)
      const operatorId = parsedOperator.operatorId || (parsedOperator as any).id;
      
      if (!operatorId) {
        toast.dismiss(loadingToast);
        throw new Error('No se pudo determinar el ID del operador autenticado');
      }
      
      console.log('🔐 Cambiando contraseña para el operador autenticado:', operatorId);
      
      // Preparar datos para la actualización
      const updateData = {
        password: newPassword,
        currentPassword: currentPassword
      };
      
      // Llamar al servicio para actualizar
      await OperatorsService.changePassword(operatorId, updateData);
      
      // Limpiar campos
      if (currentPasswordRef.current) currentPasswordRef.current.value = '';
      if (newPasswordRef.current) newPasswordRef.current.value = '';
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
      
      // Cerrar el toast de carga y mostrar éxito
      toast.dismiss(loadingToast);
      toast.success('Contraseña actualizada correctamente');
      
      // Volver al estado normal solo después de que todo haya terminado con éxito
      setIsChangingPassword(false);
      
    } catch (error) {
      console.error('❌ NavUser: Error al cambiar contraseña:', error);
      setPasswordError('No se pudo actualizar la contraseña. Verifique que su contraseña actual sea correcta.');
      toast.error(`Error al cambiar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar cambio de contraseña
  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordError(null);
    
    // Limpiar campos
    if (currentPasswordRef.current) currentPasswordRef.current.value = '';
    if (newPasswordRef.current) newPasswordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
  };

  // El componente de perfil detallado
  const ProfileDialog = () => {
    if (!operator) return null;
    
    // Determinar qué objeto de operador usar (el completo si está disponible)
    const displayOperator = completeOperator || operator;
    
    // Evitar que se cierre el diálogo al cambiar de estado
    const handleOpenChange = (open: boolean) => {
      // Si se está cargando, no permitir cerrar el diálogo
      if (isLoading) {
        return;
      }
      
      if (!open && (isEditing || isChangingPassword)) {
        // Si se intenta cerrar mientras estamos editando, no hacemos nada
        return;
      }
      setIsProfileOpen(open);
      if (!open) {
        // Resetear estados al cerrar
        setIsEditing(false);
        setIsChangingPassword(false);
        setPasswordError(null);
      }
    };
    
    // Determinar el mensaje de carga según el contexto
    const getLoadingMessage = () => {
      if (isChangingPassword) {
        return {
          title: 'Actualizando contraseña...',
          description: 'Estamos procesando la actualización de su contraseña.'
        };
      } else if (isEditing) {
        return {
          title: 'Guardando información...',
          description: 'Estamos actualizando su información personal.'
        };
      } else {
        return {
          title: 'Procesando...',
          description: 'Estamos procesando su solicitud.'
        };
      }
    };
    
    // Usar createdAt de manera consistente - corregir errores de linter
    const createdDate = displayOperator.createdAt || (displayOperator as any).created_at;
    const formattedCreatedDate = createdDate ? new Date(createdDate).toLocaleDateString() : 'No disponible';
    
    // Formatear fecha de nacimiento si existe
    const birthDate = displayOperator.birth_date;
    const formattedBirthDate = birthDate 
      ? new Date(birthDate).toLocaleDateString() 
      : 'No disponible';
    
    // Formatear fecha de contratación si existe
    const hireDate = displayOperator.hire_date;
    const formattedHireDate = hireDate 
      ? new Date(hireDate).toLocaleDateString() 
      : 'No disponible';
    
    // Información de la sucursal - corregir errores de linter
    const branchName = displayOperator.branchName || (displayOperator as any).branch_name || '';
    const branchAddress = displayOperator.branchAddress || (displayOperator as any).branch_address || '';
    const branchCity = displayOperator.branchCity || (displayOperator as any).branch_city || '';
    const branchProvince = displayOperator.branchProvince || (displayOperator as any).branch_province || '';
    const branchPostalCode = (displayOperator as any).branchPostalCode || (displayOperator as any).branch_postal_code || '';
    const branchPhone = (displayOperator as any).branchPhone || (displayOperator as any).branch_phone || '';
    const branchEmail = (displayOperator as any).branchEmail || (displayOperator as any).branch_email || '';
    const branchManagerName = (displayOperator as any).branchManagerName || (displayOperator as any).branch_manager_name || '';
    const branchOpeningHours = (displayOperator as any).branchOpeningHours || (displayOperator as any).branch_opening_hours || '';
    
    // Verificar si hay información detallada de la sucursal
    const hasBranchDetails = branchAddress || branchCity || branchProvince || branchPostalCode || 
                              branchPhone || branchEmail || branchManagerName || branchOpeningHours;
    
    // Obtener mensaje de carga
    const loadingMessage = getLoadingMessage();
    
    return (
      <AlertDialog open={isProfileOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          {/* Overlay de carga para cuando se están guardando cambios */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-muted animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <p className="text-lg font-medium">{loadingMessage.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{loadingMessage.description}</p>
              <p className="text-xs text-muted-foreground/70 mt-4">Por favor no cierre esta ventana</p>
            </div>
          )}
        
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-primary" />
              Perfil de Usuario
            </AlertDialogTitle>
            <AlertDialogDescription>
              Información detallada de tu perfil en el sistema
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {isLoadingProfile ? (
            <div className="py-12 flex flex-col justify-center items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-muted animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">Cargando perfil</h3>
                <p className="text-muted-foreground text-sm">Obteniendo información completa del usuario...</p>
              </div>
            </div>
          ) : isChangingPassword ? (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary/70" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription className="text-xs">
                  Por favor ingrese su contraseña actual y la nueva contraseña.
                  <span className="block mt-1 text-primary/80 font-medium">
                    Nota: Solo puedes cambiar tu propia contraseña.
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {passwordError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    ref={currentPasswordRef}
                    placeholder="Ingrese su contraseña actual"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    ref={newPasswordRef}
                    placeholder="Ingrese la nueva contraseña"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    ref={confirmPasswordRef}
                    placeholder="Confirme la nueva contraseña"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-4 flex justify-end gap-2">
                <Button variant="outline" onClick={cancelPasswordChange} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button 
                  onClick={changePassword} 
                  className={`gap-2 relative ${isLoading ? 'min-w-[120px]' : ''}`} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                      </div>
                      <span className="opacity-0">Guardar Contraseña</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Guardar Contraseña
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {/* Información básica y foto */}
              <div className="md:col-span-1 flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-2 border-muted">
                    <AvatarImage src={displayOperator.photo || ''} alt={`${displayOperator.firstName || ''} ${displayOperator.lastName || ''}`} />
                    <AvatarFallback className="text-2xl">
                      {displayOperator.firstName?.[0] || ''}{displayOperator.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{displayOperator.firstName || ''} {displayOperator.lastName || ''}</h3>
                  <p className="text-muted-foreground">{displayOperator.email}</p>
                  <Badge variant="outline" className="mt-2 capitalize">
                    {displayOperator.role === 'admin' ? 'Administrador' : 
                     displayOperator.role === 'manager' ? 'Gerente' : 
                     displayOperator.role === 'operator' ? 'Operador' : displayOperator.role}
                  </Badge>
                </div>
                
                {/* Botones de acción principales */}
                <div className="flex flex-col w-full gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setIsChangingPassword(true)}
                    disabled={isLoading}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={enableEditing}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Información
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full justify-start relative"
                      onClick={saveChanges}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Columnas de información */}
              <div className="md:col-span-2 space-y-6">
                {/* Información personal */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary/70" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-xs font-medium">Nombre</Label>
                        {isEditing ? (
                          <Input 
                            id="firstName" 
                            defaultValue={displayOperator.firstName || ''} 
                            placeholder="Nombre"
                            disabled={isLoading}
                          />
                        ) : (
                          <p className="text-sm">{displayOperator.firstName || 'No disponible'}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-xs font-medium">Apellido</Label>
                        {isEditing ? (
                          <Input 
                            id="lastName" 
                            defaultValue={displayOperator.lastName || ''} 
                            placeholder="Apellido"
                            disabled={isLoading}
                          />
                        ) : (
                          <p className="text-sm">{displayOperator.lastName || 'No disponible'}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-xs font-medium">Teléfono</Label>
                        {isEditing ? (
                          <Input 
                            id="phone" 
                            defaultValue={displayOperator.phone || ''} 
                            placeholder="Teléfono"
                            disabled={isLoading}
                          />
                        ) : (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground/70" />
                            {displayOperator.phone || 'No disponible'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                        <div className="flex items-center gap-1 text-sm">
                          <AtSign className="h-3 w-3 text-muted-foreground/70" />
                          {displayOperator.email}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="birthDate" className="text-xs font-medium">Fecha de Nacimiento</Label>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground/70" />
                          {formattedBirthDate}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="hireDate" className="text-xs font-medium">Fecha de Contratación</Label>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground/70" />
                          {formattedHireDate}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="createdAt" className="text-xs font-medium">Creación de Cuenta</Label>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground/70" />
                          {formattedCreatedDate}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="address" className="text-xs font-medium">Dirección</Label>
                        {isEditing ? (
                          <Input 
                            id="address" 
                            defaultValue={displayOperator.address || ''} 
                            placeholder="Dirección"
                            disabled={isLoading}
                          />
                        ) : (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground/70" />
                            {displayOperator.address || 'No disponible'}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Información de la Sucursal */}
                {branchName && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary/70" />
                        Información de Sucursal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Nombre</p>
                          <p className="text-sm">{branchName}</p>
                        </div>
                        
                        {branchAddress && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Dirección</p>
                            <p className="text-sm">{branchAddress}</p>
                          </div>
                        )}
                        
                        {(branchCity || branchProvince) && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Ciudad/Provincia</p>
                            <p className="text-sm">{branchCity}{branchCity && branchProvince ? ', ' : ''}{branchProvince}</p>
                          </div>
                        )}
                        
                        {branchPhone && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Teléfono</p>
                            <p className="text-sm">{branchPhone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="flex justify-between items-center">
            <div>
              {isChangingPassword && (
                <Button 
                  variant="ghost" 
                  onClick={() => setIsChangingPassword(false)}
                  disabled={isLoading}
                >
                  Volver al Perfil
                </Button>
              )}
              {isEditing && (
                <Button 
                  variant="ghost" 
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
            
            <AlertDialogCancel disabled={isLoading || isEditing || isChangingPassword}>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return (
      <div className="mt-auto mb-4">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 justify-center">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            {!isCollapsed && (
              <div className="space-y-1.5 flex-grow">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos del operador, mostrar un placeholder
  if (!operator) {
    return (
      <div className="mt-auto mb-4">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 justify-center">
            <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">??</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="text-sm">
                <p className="font-medium">Usuario</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Desconocido</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Obtener la inicial para el avatar fallback
  const getInitial = () => {
    if (operator.name && operator.name.length > 0) {
      return operator.name.charAt(0).toUpperCase();
    }
    if (operator.firstName && operator.firstName.length > 0) {
      return operator.firstName.charAt(0).toUpperCase();
    }
    if (operator.first_name && operator.first_name.length > 0) {
      return operator.first_name.charAt(0).toUpperCase();
    }
    if (operator.email && operator.email.length > 0) {
      return operator.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Obtener el nombre para mostrar
  const getDisplayName = () => {
    if (operator.name) {
      return operator.name;
    }
    if (operator.firstName || operator.lastName) {
      return `${operator.firstName || ''} ${operator.lastName || ''}`.trim();
    }
    if (operator.first_name || operator.last_name) {
      return `${operator.first_name || ''} ${operator.last_name || ''}`.trim();
    }
    if (operator.email) {
      return operator.email.split('@')[0];
    }
    return 'Usuario';
  };

  // Obtener la URL de la imagen
  const getImageUrl = () => {
    // Verificar si hay una URL de imagen y si es válida
    const imageUrl = operator.photo || operator.avatar;
    
    if (!imageUrl) {
      console.log('⚠️ NavUser: No se encontró URL de imagen');
      return undefined;
    }
    
    // Verificar si la URL es válida
    if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.log('⚠️ NavUser: URL de imagen inválida:', imageUrl);
      return undefined;
    }
    
    try {
      // Procesar la URL para hacerla accesible
      let processedUrl = imageUrl;
      
      // Convertir URLs con '/sign/' a '/public/'
      if (processedUrl.includes('/sign/')) {
        processedUrl = processedUrl.replace('/sign/', '/public/');
        console.log('🔄 NavUser: URL convertida de signed a public:', processedUrl);
      }
      
      // Eliminar tokens y parámetros de consulta
      if (processedUrl.includes('?')) {
        processedUrl = processedUrl.split('?')[0];
        console.log('🔄 NavUser: URL limpiada (token eliminado):', processedUrl);
      }
      
      // Validar que la URL resultante es válida
      new URL(processedUrl);
      console.log('✅ NavUser: URL de imagen válida:', processedUrl);
      
      return processedUrl;
    } catch (error) {
      console.error('❌ NavUser: Error al procesar URL de imagen:', error);
      return undefined;
    }
  };

  // Obtener la sucursal
  const getBranchName = () => {
    return operator.branchName || operator.branch_name || '';
  };

  // Obtener el rol formateado
  const getFormattedRole = () => {
    if (!operator.role) return '';
    
    const role = operator.role.toLowerCase();
    
    if (role === 'admin' || role === 'administrator' || role.includes('admin')) {
      return 'Administrador';
    }
    
    if (role === 'manager' || role.includes('gerente')) {
      return 'Gerente';
    }
    
    if (role === 'operator' || role.includes('operador')) {
      return 'Operador';
    }

    if (role === 'programador' || role.includes('developer') || role.includes('programmer')) {
      return 'Programador';
    }
    
    // Capitalizar primera letra
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Obtener el estado del usuario
  const getUserStatus = () => {
    if (!operator.status) return null;
    
    const status = operator.status.toLowerCase();
    
    if (status === 'active' || status === 'activo') {
      return { label: 'Activo', variant: 'success' as const };
    }
    
    if (status === 'inactive' || status === 'inactivo') {
      return { label: 'Inactivo', variant: 'secondary' as const };
    }
    
    if (status === 'pending' || status === 'pendiente') {
      return { label: 'Pendiente', variant: 'warning' as const };
    }
    
    if (status === 'suspended' || status === 'suspendido') {
      return { label: 'Suspendido', variant: 'destructive' as const };
    }
    
    return { label: status.charAt(0).toUpperCase() + status.slice(1), variant: 'default' as const };
  };

  const userStatus = getUserStatus();
  const formattedRole = getFormattedRole();

  return (
    <div className="mt-auto">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full flex items-center px-4 py-3 h-auto rounded-none hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors",
              isOpen && "bg-gray-100/80 dark:bg-gray-800/80",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-10 w-10 rounded-full border-2 border-primary/20 flex-shrink-0 overflow-hidden">
                <AvatarImage src={getImageUrl()} alt={getDisplayName()} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitial()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="text-sm text-left">
                  <p className="font-medium truncate max-w-[140px]">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {formattedRole}
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-64" 
          align={isCollapsed ? "center" : "end"}
          alignOffset={isCollapsed ? 0 : -10}
          sideOffset={10}
          forceMount
        >
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <DropdownMenuLabel className="font-normal p-0">
              <div className="flex flex-col">
                <p className="text-sm font-semibold">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{operator.email}</p>
              </div>
            </DropdownMenuLabel>
            {userStatus && (
              <Badge variant={userStatus.variant} className="text-[10px] h-5 font-medium">
                {userStatus.label}
              </Badge>
            )}
          </div>
          <DropdownMenuSeparator className="mb-1" />
          <div className="px-3 py-2 text-xs text-muted-foreground space-y-2 bg-muted/50 rounded-md mx-2 mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium">Rol:</span>
              <span className="ml-1">{formattedRole}</span>
            </div>
            {getBranchName() && (
              <div className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-primary/70" />
                <span className="font-medium">Sucursal:</span>
                <span className="ml-1 truncate">{getBranchName()}</span>
              </div>
            )}
          </div>
          <DropdownMenuGroup className="px-1.5 py-1">
            <DropdownMenuItem 
              onClick={handleGoToProfile} 
              className="gap-2 rounded-md py-2 cursor-pointer"
            >
              <UserCircle className="h-4 w-4 text-primary/70" />
              <span>Mi Perfil</span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
            </DropdownMenuItem>
           
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mb-1.5" />
          <div className="px-1.5 pb-1.5">
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full gap-2 font-medium"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog />
    </div>
  );
}
