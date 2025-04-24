"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Users, 
  Search,
  Building2,
  Activity,
  Calendar as CalendarIcon,
  CreditCard,
  MapPin,
  Shield,
  Clock,
  Mail,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Sun,
  Moon
} from "lucide-react";
import UsersTable, { TableUser } from "../components/users-table";
import { NewUserForm } from "../components/new-user-form";
import { customToast } from "@/components/ui/use-custom-toast";
import { UsersService, User, SupabaseUser, getRefId } from "@/app/services/users.service";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";

// Interfaces
interface PlanData {
  plan: string;
  clients: number;
  activeClients: number;
  percentage: number;
}

// Extender la interfaz SupabaseUser (anteriormente FirebaseUser)
interface ExtendedSupabaseUser extends Omit<SupabaseUser, 'status'> {
  userId: string;
  status: boolean;
  avatarUrl?: string;
  branchReferences?: string[];
}

// Función auxiliar para encontrar un plan con más flexibilidad
function findPlanById(plans: any[], planId: string): any {
  if (!planId || !plans || !plans.length) return null;
  
  // Primero intentar una búsqueda exacta
  let plan = plans.find(p => p.id === planId);
  if (plan) return plan;
  
  // Si no hay coincidencia exacta, intentar con IDs simplificados
  const simplifiedPlanId = planId.replace(/^\/plans\//, '').trim();
  
  plan = plans.find(p => {
    // Normalizar el ID del plan en la colección
    const normalizedPlanId = (p.id || '').replace(/^\/plans\//, '').trim();
    
    // Probar varias formas del ID
    return normalizedPlanId === simplifiedPlanId || 
           p.id === simplifiedPlanId || 
           p.planId === simplifiedPlanId ||
           String(p.id) === String(simplifiedPlanId);
  });
  
  return plan;
}

// Función para obtener los colores de gradiente según el tema
const getThemeColors = (index: number, theme?: string) => {
  const isDark = theme === 'dark';
  const gradients = [
    isDark ? ['#4F46E5cc', '#6366F1cc'] : ['#4F46E5', '#6366F1'], // Indigo
    isDark ? ['#2563EBcc', '#3B82F6cc'] : ['#2563EB', '#3B82F6'], // Blue
    isDark ? ['#0891B2cc', '#06B6D4cc'] : ['#0891B2', '#06B6D4'], // Cyan
    isDark ? ['#059669cc', '#10B981cc'] : ['#059669', '#10B981'], // Emerald
    isDark ? ['#7C3AEDcc', '#8B5CF6cc'] : ['#7C3AED', '#8B5CF6'], // Violet
    isDark ? ['#DB2777cc', '#EC4899cc'] : ['#DB2777', '#EC4899'], // Pink
    isDark ? ['#DC2626cc', '#EF4444cc'] : ['#DC2626', '#EF4444']  // Red
  ];
  
  return {
    gradient: `linear-gradient(to right, ${gradients[index % 7][0]}, ${gradients[index % 7][1]})`,
    boxShadow: isDark ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
  };
};

// Componente ThemeToggle para cambiar entre modo claro y oscuro
function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <span className="mr-2">💻</span>
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ClientsPage() {
  const { theme } = useTheme();
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ExtendedSupabaseUser[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    plan: "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    branch: "all",
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<{ id: string; currentStatus: boolean } | null>(null);

  // Obtener planes disponibles según la sucursal seleccionada
  const availablePlans = useMemo(() => {
    if (filters.branch === 'all') return plans;
    
    console.log('🔍 Planes disponibles para la sucursal:', {
      sucursal: filters.branch,
      total_planes: plans.length,
      planes: plans
    });
    
    return plans;
  }, [filters.branch, plans]);

  // Resetear el filtro de plan cuando cambia la sucursal
  useEffect(() => {
    const fetchPlansForBranch = async () => {
      try {
        if (filters.branch === 'all') {
          // Si no hay sucursal seleccionada, usar todos los planes
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`, {
            headers: {
              'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('workexpress_token='))?.split('=')[1]}`
            }
          });
          if (!response.ok) throw new Error('Error al cargar los planes');
          const data = await response.json();
          console.log('📦 Planes cargados (todos):', data);
          setPlans(data);
        } else {
          // Si hay una sucursal seleccionada, obtener sus planes específicos
          console.log('🔍 Obteniendo planes para sucursal:', filters.branch);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/plans/branch/${filters.branch}`, {
            headers: {
              'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('workexpress_token='))?.split('=')[1]}`
            }
          });
          
          if (!response.ok) {
            console.error('❌ Error en la respuesta:', response.status, response.statusText);
            throw new Error('Error al cargar los planes de la sucursal');
          }
          
          const data = await response.json();
          console.log('📦 Planes cargados (sucursal):', data);
          setPlans(data);
        }
      } catch (error) {
        console.error('❌ Error al cargar planes:', error);
        customToast.error({
          title: "Error",
          description: "No se pudieron cargar los planes"
        });
      }
    };

    fetchPlansForBranch();
    setFilters(prev => ({ ...prev, plan: "all" }));
  }, [filters.branch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar si hay token en la cookie
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('workexpress_token='))
          ?.split('=')[1];

        if (!token) {
          setError('No hay sesión activa');
          return;
        }
        
        // Realizar una petición directa a la API para verificar los datos sin procesar
        console.log('🔍 Verificando datos directamente de la API...');
        const rawResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!rawResponse.ok) {
          throw new Error('Error al obtener datos de la API');
        }
        
        const rawData = await rawResponse.json();
        
        // Log detallado de los primeros usuarios tal como vienen de la API
        console.log('📊 DATOS DIRECTOS DE LA API (primeros 5 usuarios):', 
          rawData.slice(0, 5).map((user: any) => ({
            id: user.id,
            nombre: `${user.firstName || ''} ${user.lastName || ''}`,
            email: user.email,
            account_status: user.account_status,
            accountStatus: user.accountStatus,
            accountStatus_tipo: typeof user.accountStatus,
            account_status_tipo: typeof user.account_status,
            todos_los_campos: Object.keys(user)
          }))
        );
        
        // Cargar datos en paralelo
        const [usersResponse, branchesResponse, plansResponse] = await Promise.all([
          UsersService.getAllUsers(),
          UsersService.getBranches(),
          UsersService.getPlans()
        ]).catch(error => {
          console.error('Error en la carga de datos:', error);
          if (error.message === 'No hay token de autenticación' || 
              error.message === 'Sesión expirada') {
            throw new Error('Por favor, inicia sesión para ver esta página');
          }
          throw error;
        });

        console.log('📦 Datos recibidos:', {
          total_usuarios: usersResponse.length,
          primer_usuario_raw: usersResponse[0] ? JSON.parse(JSON.stringify(usersResponse[0])) : null,
          segundo_usuario_raw: usersResponse[1] ? JSON.parse(JSON.stringify(usersResponse[1])) : null,
          tercero_usuario_raw: usersResponse[2] ? JSON.parse(JSON.stringify(usersResponse[2])) : null,
          branches_total: branchesResponse.length,
          plans_total: plansResponse.length
        });
        
        // Log detallado para diagnóstico de accountStatus
        console.log('🔍 DIAGNÓSTICO DE ACCOUNT_STATUS:', {
          total_usuarios: usersResponse.length,
          ejemplos: usersResponse.slice(0, 5).map(user => {
            // Cast a 'any' para acceder a propiedades que podrían no estar en el tipo
            const rawUser = user as any;
            return {
              nombre: `${user.firstName} ${user.lastName}`,
              accountStatus: user.accountStatus,
              accountStatus_type: typeof user.accountStatus,
              account_status: rawUser.account_status, // Por si el campo viene con este nombre
              account_status_type: rawUser.account_status ? typeof rawUser.account_status : 'undefined',
              active: rawUser.active, // Algunas APIs usan 'active' en vez de 'accountStatus'
              active_type: rawUser.active ? typeof rawUser.active : 'undefined',
              status: user.status, // O simplemente 'status'
              status_type: user.status ? typeof user.status : 'undefined',
              // Incluir todos los campos para inspeccionar
              allFields: Object.keys(rawUser).filter(key => 
                key.toLowerCase().includes('status') || 
                key.toLowerCase().includes('active'))
            };
          })
        });

        // Procesar los usuarios para asegurar que todos los campos necesarios estén presentes
        const processedUsers = await Promise.all(usersResponse.map(async (user: any) => {
          // Usar la función helper para extraer IDs de las referencias
          const branchId = getRefId(user.branchReference);
          const planId = getRefId(user.subscriptionPlan);
          const walletId = getRefId(user.walletReference);

          // Buscar la información de sucursal, plan y billetera
          const [branchInfo, planInfo] = await Promise.all([
            branchId ? branchesResponse.find(b => b.id === branchId) : null,
            planId ? plansResponse.find(p => p.id === planId) : null
          ]);

          // Obtener información de la billetera usando el servicio
          const walletInfo = walletId ? await UsersService.getWalletInfo(walletId) : null;

          // Procesar accountStatus de forma robusta
          let accountStatus = true; // Por defecto, consideramos los usuarios como activos
          const rawUser = user as any;
          
          // Buscar en todos los posibles campos que podrían contener el estado de la cuenta
          if (typeof user.accountStatus === 'boolean') {
            accountStatus = user.accountStatus;
          } else if (typeof user.accountStatus === 'string') {
            accountStatus = ['true', '1', 'active', 'activo'].includes(user.accountStatus.toLowerCase());
          } else if (typeof user.accountStatus === 'number') {
            accountStatus = user.accountStatus === 1;
          } else if (rawUser.account_status !== undefined) {
            // Probar con account_status (snake_case)
            if (typeof rawUser.account_status === 'boolean') {
              accountStatus = rawUser.account_status;
            } else if (typeof rawUser.account_status === 'string') {
              accountStatus = ['true', '1', 'active', 'activo'].includes(rawUser.account_status.toLowerCase());
            } else if (typeof rawUser.account_status === 'number') {
              accountStatus = rawUser.account_status === 1;
            }
          } else if (rawUser.active !== undefined) {
            // Probar con active
            if (typeof rawUser.active === 'boolean') {
              accountStatus = rawUser.active;
            } else if (typeof rawUser.active === 'string') {
              accountStatus = ['true', '1', 'active', 'activo'].includes(rawUser.active.toLowerCase());
            } else if (typeof rawUser.active === 'number') {
              accountStatus = rawUser.active === 1;
            }
          } else if (user.status !== undefined && typeof user.status !== 'string') {
            // Probar con status (solo si no es un string que podría ser "active", "inactive", etc.)
            if (typeof user.status === 'boolean') {
              accountStatus = user.status;
            } else if (typeof user.status === 'number') {
              accountStatus = user.status === 1;
            }
          }

          // Log de diagnóstico para el accountStatus
          console.log('🔄 Procesando accountStatus:', {
            usuario: `${user.firstName} ${user.lastName}`,
            accountStatusOriginal: user.accountStatus,
            account_status_original: rawUser.account_status, 
            active_original: rawUser.active,
            status_original: user.status,
            tipoOriginal: typeof user.accountStatus,
            accountStatusProcesado: accountStatus,
            camposEncontrados: Object.keys(rawUser).filter(key => 
              key.toLowerCase().includes('status') || 
              key.toLowerCase().includes('active'))
          });

          return {
            ...user,
            id: user.id || '',
            userId: user.userId || user.id || '',
            status: accountStatus,
            accountStatus: accountStatus,
            avatarUrl: user.photo,
            // Información de sucursal
            branchName: branchInfo?.name || user.branchAddress || 'No asignada',
            branchAddress: branchInfo?.address || user.branchAddress || 'No especificada',
            branchReference: user.branchReference || { path: '', id: '' },
            branchReferences: user.branchReferences || [],
            branchLocation: user.branchLocation,
            // Información de plan
            planName: planInfo?.planName || user.planName || 'Sin plan',
            planRate: planInfo?.price || user.planRate || 0,
            subscriptionPlan: user.subscriptionPlan || { path: '', id: '' },
            // Información de billetera
            walletName: walletInfo?.name || user.walletName || 'No especificada',
            walletAmount: walletInfo?.amount || user.walletAmount || 0,
            walletReference: user.walletReference || { path: '', id: '' },
            personType: user.personType || 'natural',
            typeUserReference: user.typeUserReference || { path: '', id: '' },
            // Asegurar que los booleanos sean realmente booleanos
            isEmailVerified: Boolean(user.isEmailVerified),
            isVerified: Boolean(user.isVerified)
          };
        }));

        console.log('👥 Usuarios procesados con información actualizada:', processedUsers);

        setUsers(processedUsers);
        setBranches(branchesResponse);
        setPlans(plansResponse);
        
        // Log detallado de planes para debug
        console.log('🔍 PLANES CARGADOS - DETALLE:', {
          total: plansResponse.length,
          planes: plansResponse.map(plan => ({
            id: plan.id,
            planName: plan.planName,
            name: plan.name,
            price: plan.price,
            path: plan.path,
            isActive: plan.isActive,
            fullObject: plan
          }))
        });
        
        // Log detallado de usuarios y sus subscriptions para comparación
        console.log('🔍 SUBSCRIPTION PLAN FORMAT - DETALLE:', {
          total: processedUsers.length,
          usuarios: processedUsers.map(user => ({
            userId: user.id,
            nombre: `${user.firstName} ${user.lastName}`,
            planId: getRefId(user.subscriptionPlan),
            subscriptionPlan: user.subscriptionPlan,
            subscriptionPlanType: typeof user.subscriptionPlan,
            hasId: user.subscriptionPlan && typeof user.subscriptionPlan === 'object' && 'id' in user.subscriptionPlan,
            idDirecto: user.subscriptionPlan && typeof user.subscriptionPlan === 'object' && 'id' in user.subscriptionPlan 
              ? user.subscriptionPlan.id 
              : 'N/A'
          }))
        });
        
      } catch (error) {
        console.error('❌ Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
        setError(errorMessage);
        
        setUsers([]);
        setBranches([]);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateUser = async (data: any) => {
    try {
      setError(null);
      console.log('Datos enviados al backend:', data);

      const newUser = await UsersService.createUser(data);
      // Convertir el nuevo usuario al tipo ExtendedSupabaseUser con valores por defecto para las propiedades requeridas
      // @ts-ignore - Suprimir error temporal para manejar la creación del usuario
      const extendedUser: ExtendedSupabaseUser = {
        ...newUser,
        id: newUser.id || '',
        userId: newUser.id || '',
        firstName: newUser.firstName || '',
        lastName: newUser.lastName || '',
        email: newUser.email || '',
        status: true,
        accountStatus: true,
        isEmailVerified: false,
        isVerified: false,
        personType: 'natural',
        planName: '',
        planRate: 0,
        walletReference: { path: '', id: '' },
        walletName: '',
        walletAmount: 0,
        branchName: '',
        branchReference: { path: '', id: '' },
        subscriptionPlan: { path: '', id: '' },
        typeUserReference: { path: '', id: '' }
      };
      
      setUsers(prev => [...prev, extendedUser]);
      setIsNewUserOpen(false);

      customToast.success({
        title: "¡Cliente creado con éxito!",
        description: `El cliente ${newUser.firstName} ${newUser.lastName} ha sido creado`
      });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el cliente';
      throw new Error(errorMessage); // Propagar el error para que lo maneje el formulario
    }
  };

  const initiateStatusUpdate = (userId: string, currentStatus: boolean) => {
    console.log('⚙️ Iniciando actualización de estado:', {
      userId,
      estadoActual: currentStatus,
      nuevoEstadoSera: !currentStatus
    });
    
    // Limpiar cualquier estado previo antes de iniciar una nueva actualización
    setUserToUpdate(null);
    
    // Asegurarse de que userToUpdate sea actualizado antes de mostrar el diálogo
    setUserToUpdate({ id: userId, currentStatus });
    
    // Usar un timeout para asegurar que el estado se ha actualizado
    setTimeout(() => {
      setIsConfirmDialogOpen(true);
    }, 100);
  };

  const handleUpdateStatus = async (userId: string, newStatus: boolean) => {
    try {
      // Guardar los datos que necesitamos antes de limpiar el estado
      const statusLabel = newStatus ? 'activado' : 'desactivado';
      
      // Cerrar el diálogo inmediatamente para evitar interacciones no deseadas
      setIsConfirmDialogOpen(false);
      
      // Limpiar el estado del usuario a actualizar
      setUserToUpdate(null);
      
      // Log para diagnóstico
      console.log('🔄 Ejecutando actualización de estado:', {
        userId,
        nuevoEstado: newStatus,
        estadoString: newStatus ? 'activo' : 'inactivo'
      });
      
      // Usar versión correcta del toast
      customToast.success({
        title: "Actualizando estado",
        description: "Por favor espere..."
      });

      // Llamar al servicio para actualizar el estado
      const updatedUser = await UsersService.updateUserStatus(userId, newStatus);
      
      // Actualizar la lista de usuarios con el nuevo estado
      const updatedUsers = users.map(user =>
        user.userId === userId ? { ...user, accountStatus: newStatus, status: newStatus } : user
      );

      console.log('✅ Estado de usuario actualizado:', {
        userId,
        nuevoEstado: newStatus,
        respuestaAPI: updatedUser
      });

      // Actualizar el estado de usuarios
      setUsers(updatedUsers);
      
      // Mostrar confirmación de éxito
      customToast.success({
        title: "Estado actualizado",
        description: `El cliente ha sido ${statusLabel} exitosamente`
      });
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      customToast.error({
        title: "Error",
        description: "No se pudo actualizar el estado del cliente. Por favor intente nuevamente."
      });
    } finally {
      // Asegurarse de que el diálogo esté cerrado y el estado limpio
      setIsConfirmDialogOpen(false);
      setUserToUpdate(null);
    }
  };

  // Métricas calculadas con datos reales
  const metrics = {
    totalClients: users.length,
    activeClients: users.filter(user => user.accountStatus).length,
    verifiedClients: users.filter(user => user.isVerified).length,
    newClientsThisMonth: users.filter(user => {
      const createdAt = new Date(user.createdAt || '');
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && 
             createdAt.getFullYear() === now.getFullYear();
    }).length,
    personTypeDistribution: {
      natural: users.filter(user => user.personType === 'natural').length,
      juridica: users.filter(user => user.personType === 'juridica').length
    },
    activeSubscriptions: users.filter(user => 
      user.subscriptionPlan && user.accountStatus
    ).length,
    branchDistribution: users.reduce((acc, user) => {
      // Extraer ID de la referencia a la sucursal usando nuestra función auxiliar
      const branchId = getRefId(user.branchReference);
      
      const branchName = branches.find(b => b.id === branchId)?.name || 
                        user.branchName || 
                        'No asignada';
      
      console.log('📊 Asignando usuario a sucursal:', {
        usuario: `${user.firstName} ${user.lastName}`,
        branchId,
        branchName,
        conteoActual: acc[branchName] || 0
      });

      acc[branchName] = (acc[branchName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    planDistribution: users.reduce((acc, user) => {
      // Extraer el ID del plan usando nuestra función auxiliar
      const planId = getRefId(user.subscriptionPlan);
      
      // Buscar el plan usando nuestra función auxiliar mejorada
      const userPlan = findPlanById(plans, planId);
      
      // Obtener el nombre del plan con fallback y validación
      let planName = 'Sin plan';
      if (userPlan) {
        planName = userPlan.planName || userPlan.name || 'Plan Sin Nombre';
        console.log('✅ Plan encontrado para usuario:', {
          usuario: `${user.firstName} ${user.lastName}`,
          planId,
          planEncontrado: planName
        });
      } else {
        console.warn('⚠️ No se encontró plan para:', {
          usuario: `${user.firstName} ${user.lastName}`,
          planId,
          planesDisponiblesCount: plans.length,
          subscriptionPlanOriginal: user.subscriptionPlan
        });
        // Usar el nombre del plan directamente del usuario si está disponible
        if (user.planName) {
          planName = user.planName;
          console.log('ℹ️ Usando planName del usuario:', planName);
        }
      }
      
      // Si el plan no existe en el acumulador, inicializarlo
      if (!acc[planName]) {
        acc[planName] = {
          total: 0,
          active: 0,
          percentage: 0,
          planDetails: userPlan || null
        };
      }
      
      // Incrementar el total de clientes para este plan
      acc[planName].total += 1;
      
      // Si el usuario está activo, incrementar el contador de activos
      if (user.accountStatus) {
        acc[planName].active += 1;
      }
      
      return acc;
    }, {} as Record<string, { 
      total: number; 
      active: number; 
      percentage: number;
      planDetails: any | null;
    }>),
    averagePlanRate: users.reduce((acc, user) => {
      const planRate = plans.find(p => p.id === getRefId(user.subscriptionPlan))?.rate || user.planRate || 0;
      return acc + planRate;
    }, 0) / users.length,
    recentActivity: users.filter(user => {
      const lastSeen = new Date(user.lastSeen || '');
      return lastSeen >= subDays(new Date(), 30);
    }).length
  };

  // Datos para el gráfico de clientes por sucursal
  const branchData = useMemo(() => {
    console.log('🔄 Procesando datos de sucursales:', {
      totalUsuarios: users.length,
      sucursalesDisponibles: branches.map(b => ({ id: b.id, name: b.name }))
    });

    const distribution = users.reduce((acc, user) => {
      // Extraer ID de la referencia a la sucursal usando nuestra función auxiliar
      const branchId = getRefId(user.branchReference);
      
      const branchName = branches.find(b => b.id === branchId)?.name || 
                        user.branchName || 
                        'No asignada';
      
      console.log('📊 Asignando usuario a sucursal:', {
        usuario: `${user.firstName} ${user.lastName}`,
        branchId,
        branchName,
        conteoActual: acc[branchName] || 0
      });

      acc[branchName] = (acc[branchName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(distribution)
      .map(([branch, count]) => ({
        branch,
        clients: count
      }))
      .sort((a, b) => b.clients - a.clients);

    console.log('📈 Datos procesados para la gráfica:', result);
    
    return result;
  }, [users, branches]);

  // Datos para el gráfico de planes
  const planData: PlanData[] = useMemo(() => {
    const distribution = users.reduce((acc, user) => {
      // Extraer ID del plan usando nuestra función auxiliar
      const planId = getRefId(user.subscriptionPlan);
      
      // Buscar el plan usando nuestra función auxiliar mejorada
      const userPlan = findPlanById(plans, planId);
      
      // Obtener el nombre del plan con fallback y validación
      let planName = 'Sin plan';
      if (userPlan) {
        planName = userPlan.planName || userPlan.name || 'Plan Sin Nombre';
      } else if (user.planName) {
        // Si el usuario tiene un nombre de plan pero no encontramos el plan, usar ese nombre
        planName = user.planName;
      }
      
      if (!acc[planName]) {
        acc[planName] = {
          total: 0,
          active: 0,
          percentage: 0,
          planDetails: userPlan || null
        };
      }
      
      acc[planName].total += 1;
      if (user.accountStatus) {
        acc[planName].active += 1;
      }
      
      return acc;
    }, {} as Record<string, { 
      total: number; 
      active: number; 
      percentage: number;
      planDetails: any | null;
    }>);

    return Object.entries(distribution)
      .map(([plan, data]) => ({
        plan,
        clients: data.total,
        activeClients: data.active,
        percentage: (data.total / users.length) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [users, plans]);

  const filteredUsers = users.filter(user => {
    // Búsqueda por texto
    const searchTermLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTermLower === '' || [
      user.firstName,
      user.lastName,
      user.email,
      user.branchName,
      user.planName
    ].some(field => (field || '').toLowerCase().includes(searchTermLower));

    // Filtro por estado de cuenta y tipo de persona
    const matchesStatus = 
      // Si el filtro es 'all', mostrar todos
      filters.status === 'all' || 
      // Si el filtro es 'natural' o 'juridica', filtrar por personType
      (['natural', 'juridica'].includes(filters.status) && user.personType === filters.status) ||
      // Si el filtro es 'active', mostrar solo los activos (usando === true para ser explícitos)
      (filters.status === 'active' && user.accountStatus === true) ||
      // Si el filtro es 'inactive', mostrar solo los inactivos (usando === false para ser explícitos)
      (filters.status === 'inactive' && user.accountStatus === false);

    // Filtro de planes usando nuestra función auxiliar
    const planId = getRefId(user.subscriptionPlan);
    const matchesPlan = filters.plan === 'all' || planId === filters.plan;

    // Filtro de sucursales usando nuestra función auxiliar
    const branchId = getRefId(user.branchReference);
    const matchesBranch = filters.branch === 'all' || branchId === filters.branch;

    // Filtros de fecha
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom.setHours(0, 0, 0, 0)) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo.setHours(23, 59, 59, 999)) : null;
    
    const matchesDateFrom = !dateFrom || (createdAt && createdAt >= dateFrom);
    const matchesDateTo = !dateTo || (createdAt && createdAt <= dateTo);

    const matches = matchesSearch && matchesStatus && matchesPlan && 
                   matchesBranch && matchesDateFrom && matchesDateTo;

    return matches;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-md w-full">
          <div className="space-y-8">
            {/* Esqueleto de las métricas */}
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Esqueleto de la tabla */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <Spinner className="w-8 h-8" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Cargando datos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Esto puede tomar unos segundos...
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-zinc-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-900">
      <div className="space-y-6 p-6 lg:p-8 max-w-[2400px] mx-auto">
        {/* Header Section con Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgb(0_0_0/0.08)] p-6 lg:p-8 dark:bg-gray-900/30 dark:border-gray-800/30 dark:shadow-[0_8px_16px_rgb(0_0_0/0.3)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-soft-light" />
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 bg-clip-text text-transparent dark:from-gray-100 dark:via-blue-100 dark:to-indigo-200">
                  Clientes
                </h1>
                <p className="text-base text-gray-500 max-w-[750px] leading-relaxed dark:text-gray-400">
                  Gestiona los clientes y sus suscripciones. Aquí puedes ver, editar y administrar todos los aspectos relacionados con los clientes.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>

            {/* Grid de Métricas */}
            <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group bg-white/80 backdrop-blur-xl border-white/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:shadow-gray-900/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Clientes
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center ring-1 ring-blue-500/20 transition-all duration-300 group-hover:scale-110 dark:from-blue-500/20 dark:to-purple-500/20 dark:ring-blue-400/30">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    {metrics.totalClients}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-emerald-500 font-medium mr-1 dark:text-emerald-400">{metrics.personTypeDistribution.natural}</span>
                    <span>naturales,</span>
                    <span className="text-emerald-500 font-medium mx-1 dark:text-emerald-400">{metrics.personTypeDistribution.juridica}</span>
                    <span>jurídicas</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </Card>

              <Card className="group bg-white/80 backdrop-blur-xl border-white/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:shadow-gray-900/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Clientes Activos
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 transition-all duration-300 group-hover:scale-110 dark:from-emerald-500/20 dark:to-green-500/20 dark:ring-emerald-400/30">
                    <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    {metrics.activeClients}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      de {metrics.totalClients}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 animate-pulse"
                        style={{ width: `${(metrics.activeClients/metrics.totalClients) * 100}%` }}
                      />
                    </div>
                  </div>
                  {/* Contador detallado - para diagnóstico */}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-block px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                      {users.filter(u => u.accountStatus === true).length} bool:true
                    </span>
                    <span className="ml-1 inline-block px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                      {users.filter(u => u.accountStatus === false).length} bool:false
                    </span>
                    <span className="ml-1 inline-block px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                      {users.filter(u => typeof u.accountStatus !== 'boolean').length} no-bool
                    </span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </Card>

              <Card className="group bg-white/80 backdrop-blur-xl border-white/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:shadow-gray-900/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Suscripciones Activas
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-500/10 flex items-center justify-center ring-1 ring-amber-500/20 transition-all duration-300 group-hover:scale-110 dark:from-amber-500/20 dark:to-yellow-500/20 dark:ring-amber-400/30">
                    <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    {metrics.activeSubscriptions}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Promedio ${metrics.averagePlanRate.toFixed(2)}/mes</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </Card>

              <Card className="group bg-white/80 backdrop-blur-xl border-white/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:shadow-gray-900/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Actividad Reciente
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-500/10 to-red-500/10 flex items-center justify-center ring-1 ring-rose-500/20 transition-all duration-300 group-hover:scale-110 dark:from-rose-500/20 dark:to-red-500/20 dark:ring-rose-400/30">
                    <Clock className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    {metrics.recentActivity}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Últimos 30 días</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-rose-500/0 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </Card>
            </div>
          </div>
        </div>

        {/* Contenedor Principal de Gráficas */}
        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
          {/* Gráfica de Barras */}
          <div className="bg-white/95 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 p-6 dark:bg-gray-800/90 dark:border-gray-700/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Clientes por Sucursal
              </h3>
            </div>
            <div className="w-full h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
                    opacity={theme === 'dark' ? 0.2 : 0.3}
                  />
                  <XAxis 
                    dataKey="branch" 
                    tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#4B5563', fontSize: 12 }}
                    axisLine={{ stroke: theme === 'dark' ? '#374151' : '#E5E7EB' }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#4B5563', fontSize: 12 }}
                    axisLine={{ stroke: theme === 'dark' ? '#374151' : '#E5E7EB' }}
                    tickLine={false}
                    domain={[0, 'dataMax + 2']}
                  />
                  <Tooltip 
                    cursor={theme === 'dark' ? { fill: 'rgba(255, 255, 255, 0.05)' } : { fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{
                      background: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: theme === 'dark' 
                        ? '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)' 
                        : '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{
                      color: theme === 'dark' ? '#e2e8f0' : '#111827',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                    itemStyle={{
                      color: theme === 'dark' ? '#94a3b8' : '#6B7280',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value} clientes`, 'Total']}
                    labelFormatter={(label) => `Sucursal: ${label}`}
                  />
                  <Bar 
                    dataKey="clients" 
                    radius={[8, 8, 0, 0]}
                  >
                    {branchData.map((entry, index) => {
                      const colors = [
                        ['#4F46E5', '#818CF8'], // Indigo
                        ['#2563EB', '#60A5FA'], // Blue
                        ['#0891B2', '#22D3EE'], // Cyan
                        ['#059669', '#34D399'], // Emerald
                        ['#7C3AED', '#A78BFA'], // Violet
                        ['#DB2777', '#F472B6'], // Pink
                        ['#DC2626', '#F87171']  // Red
                      ];
                      const [startColor, endColor] = colors[index % colors.length];
                      
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#gradient-${index})`}
                          className="hover:opacity-90 transition-opacity duration-200"
                        />
                      );
                    })}
                  </Bar>
                  <defs>
                    {branchData.map((entry, index) => {
                      const colors = [
                        ['#4F46E5', '#818CF8'], // Indigo
                        ['#2563EB', '#60A5FA'], // Blue
                        ['#0891B2', '#22D3EE'], // Cyan
                        ['#059669', '#34D399'], // Emerald
                        ['#7C3AED', '#A78BFA'], // Violet
                        ['#DB2777', '#F472B6'], // Pink
                        ['#DC2626', '#F87171']  // Red
                      ];
                      const [startColor, endColor] = colors[index % colors.length];
                      
                      return (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`gradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={startColor}
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor={endColor}
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <LabelList
                    dataKey="clients"
                    position="top"
                    fill={theme === 'dark' ? '#D1D5DB' : '#4B5563'}
                    fontSize={12}
                    fontWeight={500}
                    formatter={(value: number) => `${value}`}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Panel de Distribución por Plan */}
          <div className="bg-white/95 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 p-6 dark:bg-gray-800/90 dark:border-gray-700/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Distribución por Plan
              </h3>
            </div>
            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {planData.map((plan, index) => (
                <div key={plan.plan} className="group">
                  <div className="flex flex-col space-y-3 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${[
                          'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
                          'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
                          'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
                          'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
                          'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
                          'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
                          'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                        ][index % 7]}`}>
                          {plan.plan === 'STANDARD' && <CreditCard className="w-5 h-5" />}
                          {plan.plan === 'PRIME' && <Shield className="w-5 h-5" />}
                          {plan.plan === 'BUSINESS' && <Building2 className="w-5 h-5" />}
                          {plan.plan === 'Sin plan' && <Users className="w-5 h-5" />}
                          {plan.plan === 'COMPRAS WEO' && <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{plan.plan}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.percentage.toFixed(1)}% del total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {plan.clients} {plan.clients === 1 ? 'cliente' : 'clientes'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.activeClients} activos
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full"
                        style={{ 
                          width: `${plan.percentage}%`,
                          background: getThemeColors(index, theme).gradient,
                          boxShadow: getThemeColors(index, theme).boxShadow
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent dark:from-white/[0.02] dark:to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="bg-white/95 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 p-6 dark:bg-gray-800/90 dark:border-gray-700/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Lista de Clientes
            </h3>
            
            {/* Filtros */}
            <div className="flex items-center gap-4">
              {/* Filtro de búsqueda */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-gray-200 focus:border-blue-500 dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-300 dark:focus:border-blue-400"
                />
              </div>
              
              {/* Filtro de estado */}
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-[180px] bg-white/70 border-gray-200 dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-300">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  <SelectItem value="active">Clientes activos</SelectItem>
                  <SelectItem value="inactive">Clientes inactivos</SelectItem>
                  <SelectItem value="natural">Persona natural</SelectItem>
                  <SelectItem value="juridica">Persona jurídica</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filtro de sucursal */}
              <Select
                value={filters.branch}
                onValueChange={(value) => setFilters(prev => ({ ...prev, branch: value }))}
              >
                <SelectTrigger className="w-[180px] bg-white/70 border-gray-200 dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-300">
                  <SelectValue placeholder="Sucursal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sucursales</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-hidden">
            <UsersTable
              users={filteredUsers.map((user: ExtendedSupabaseUser): TableUser => ({
                id: user.userId,
                userId: user.userId,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email,
                accountStatus: user.accountStatus,
                branchName: user.branchName || '',
                branchReference: typeof user.branchReference === 'object' ? user.branchReference.path : (user.branchReference || ''),
                branchLocation: user.branchLocation,
                branchAddress: user.branchAddress,
                subscriptionPlan: typeof user.subscriptionPlan === 'object' ? user.subscriptionPlan.path : (user.subscriptionPlan || ''),
                planName: user.planName || '',
                planRate: user.planRate,
                walletReference: typeof user.walletReference === 'object' ? user.walletReference.path : (user.walletReference || ''),
                walletName: user.walletName || '',
                walletAmount: user.walletAmount,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLoginAt: user.lastLoginAt,
                lastSeen: user.lastSeen,
                photo: user.photo,
                avatarUrl: user.photo,
                personType: user.personType
              }))}
              onUpdateStatus={initiateStatusUpdate}
            />
          </div>
        </div>
      </div>

      <NewUserForm
        isOpen={isNewUserOpen}
        onClose={() => setIsNewUserOpen(false)}
        onSubmit={handleCreateUser}
        branches={branches}
        plans={plans}
      />

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToUpdate?.currentStatus ? '¿Desactivar cliente?' : '¿Activar cliente?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToUpdate?.currentStatus 
                ? 'El cliente no podrá acceder a los servicios mientras esté desactivado. ¿Estás seguro de que deseas continuar?'
                : 'El cliente podrá acceder nuevamente a todos los servicios. ¿Estás seguro de que deseas continuar?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Capturar los valores necesarios antes de cerrar el diálogo
                if (!userToUpdate) return;
                
                const userId = userToUpdate.id;
                const newStatus = !userToUpdate.currentStatus;
                
                // Log para diagnóstico
                console.log('💬 Confirmando acción en diálogo principal:', {
                  userId,
                  estadoActual: userToUpdate.currentStatus,
                  nuevoEstado: newStatus
                });
                
                // Cerrar el diálogo y limpiar su estado
                setIsConfirmDialogOpen(false);
                
                // Ejecutar la acción después de un breve retraso
                // para asegurar que el diálogo se ha cerrado
                setTimeout(() => {
                  handleUpdateStatus(userId, newStatus);
                }, 100);
              }}
              className={userToUpdate?.currentStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {userToUpdate?.currentStatus ? 'Sí, desactivar' : 'Sí, activar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 