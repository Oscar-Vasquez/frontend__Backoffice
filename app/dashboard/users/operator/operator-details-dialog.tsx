"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Operator, OperatorsService } from "@/app/services/operators.service";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  EyeOpenIcon, 
  ClockIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  MobileIcon,
  IdCardIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  AvatarIcon,
  StarIcon,
  RocketIcon,
  CalendarIcon,
  Link2Icon,
  HomeIcon,
  Cross2Icon,
  ZoomInIcon,
  Pencil1Icon,
  LightningBoltIcon,
  LockClosedIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useThemeSettingsStore from "@/store/themeSettingsStore";
import { getCookie } from "cookies-next";

// Importar la utilidad para obtener URLs de fotos firmadas
import { getPhotoDisplayUrl } from "@/lib/photo-utils";

interface OperatorDetailsDialogProps {
  operator: Operator;
  trigger: React.ReactNode;
}

// Extender la interfaz Operator para incluir los nuevos campos
interface ExtendedOperator extends Operator {
  // Versiones snake_case (formato del backend)
  birth_date?: Date | string | null;
  hire_date?: Date | string | null;
  personal_id?: string | null;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship?: string;
    address?: string;
  } | null;
  // Versiones camelCase (posible formato alternativo)
  birthdate?: Date | string | null;
  hireDate?: Date | string | null;
  personalId?: string | null;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
    address?: string;
  } | null;
  // Campos comunes
  address?: string | null;
  skills?: string[];
}

// Componente para mostrar la sucursal con un diseño mejorado
function BranchDisplay({ branchName, branchReference, themeColor }: { 
  branchName?: string | null, 
  branchReference?: string | null,
  themeColor: string | 'default'
}) {
  // Colores predefinidos para evitar interpolación dinámica de clases
  const getBgColor = () => {
    switch (themeColor) {
      case 'blue': return 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30';
      case 'indigo': return 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30';
      case 'purple': return 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/30';
      case 'pink': return 'bg-pink-50/50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800/30';
      case 'rose': return 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30';
      case 'amber': return 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30';
      case 'emerald': return 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30';
      case 'sky': return 'bg-sky-50/50 border-sky-100 dark:bg-sky-900/20 dark:border-sky-800/30';
      case 'lime': return 'bg-lime-50/50 border-lime-100 dark:bg-lime-900/20 dark:border-lime-800/30';
      case 'slate': return 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/20 dark:border-slate-800/30';
      case 'stone': return 'bg-stone-50/50 border-stone-100 dark:bg-stone-900/20 dark:border-stone-800/30';
      case 'neutral': return 'bg-neutral-50/50 border-neutral-100 dark:bg-neutral-900/20 dark:border-neutral-800/30';
      default: return 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30';
    }
  };

  const getIconBgColor = () => {
    switch (themeColor) {
      case 'blue': return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'indigo': return 'bg-gradient-to-br from-indigo-500 to-indigo-600';
      case 'purple': return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'pink': return 'bg-gradient-to-br from-pink-500 to-pink-600';
      case 'rose': return 'bg-gradient-to-br from-rose-500 to-rose-600';
      case 'amber': return 'bg-gradient-to-br from-amber-500 to-amber-600';
      case 'emerald': return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      case 'sky': return 'bg-gradient-to-br from-sky-500 to-sky-600';
      case 'lime': return 'bg-gradient-to-br from-lime-500 to-lime-600';
      case 'slate': return 'bg-gradient-to-br from-slate-500 to-slate-600';
      case 'stone': return 'bg-gradient-to-br from-stone-500 to-stone-600';
      case 'neutral': return 'bg-gradient-to-br from-neutral-500 to-neutral-600';
      default: return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
  };

  return (
    <div>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sucursal</div>
      {branchName ? (
        <div className={`flex items-center gap-2 ${getBgColor()} rounded-lg p-2 shadow-sm`}>
          <div className={`p-1.5 ${getIconBgColor()} rounded-md shadow-sm`}>
            <HomeIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">{branchName}</div>
            {branchReference && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                ID: {branchReference.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
          <div className="p-1.5 bg-gray-300 dark:bg-gray-600 rounded-md">
            <HomeIcon className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
          </div>
          <span className="text-gray-500 dark:text-gray-400 italic">No asignada</span>
        </div>
      )}
    </div>
  );
}

// Componente para el diálogo de visualización de imagen
function ImageViewerDialog({ 
  imageUrl, 
  altText, 
  isOpen, 
  onClose,
  themeColor = 'default'
}: { 
  imageUrl: string; 
  altText: string; 
  isOpen: boolean; 
  onClose: () => void;
  themeColor?: string | 'default';
}) {
  // Obtener el gradiente del tema activo
  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-600 via-lime-500 to-green-500';
      case 'sky':
        return 'from-sky-600 via-blue-600 to-indigo-600';
      case 'emerald':
        return 'from-emerald-600 via-green-600 to-teal-600';
      case 'rose':
        return 'from-rose-600 via-pink-600 to-fuchsia-600';
      case 'amber':
        return 'from-amber-600 via-yellow-600 to-orange-600';
      case 'purple':
        return 'from-purple-600 via-violet-600 to-indigo-600';
      case 'slate':
        return 'from-slate-600 via-gray-600 to-zinc-600';
      case 'stone':
        return 'from-stone-600 via-gray-600 to-neutral-600';
      case 'neutral':
        return 'from-neutral-600 via-gray-600 to-stone-600';
      case 'indigo':
      default:
        return 'from-indigo-600 via-blue-600 to-purple-600';
    }
  };

  // Función para manejar el cierre de este diálogo
  const handleImageViewerClose = (e: React.MouseEvent) => {
    // Detener la propagación para que no afecte al diálogo principal
    e.stopPropagation();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent 
        className="max-w-4xl p-0 bg-black/95 dark:bg-black/90 backdrop-blur-xl border-0 shadow-[0_0_100px_-15px_rgba(0,0,0,0.7)] dark:shadow-[0_0_100px_-15px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden remove-x-button"
        onClick={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Removing the X button in the top right */}
          
          <div className="flex items-center justify-center h-[80vh] max-h-[80vh] overflow-hidden bg-[url('/grid-pattern.svg')] bg-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
              <img 
                src={imageUrl} 
                alt={altText} 
                className="max-h-full max-w-full object-contain relative z-10 shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                  e.currentTarget.classList.add('opacity-50');
                }}
              />
            </div>
          </div>
          
          <div className="p-4 bg-black/80 dark:bg-black/60 text-white text-sm backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AvatarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{altText}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleImageViewerClose}
                  className={`text-xs bg-gradient-to-r ${getThemeGradient()} text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90 transition-opacity shadow-lg`}
                >
                  <span className="font-medium">Cerrar</span>
                </button>
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 dark:text-blue-300 hover:underline flex items-center gap-1 bg-blue-900/30 px-3 py-1.5 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link2Icon className="h-3 w-3" />
                  Abrir en nueva pestaña
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente principal para mostrar los detalles del operador
const OperatorDetailsDialog = ({ operator, trigger }: OperatorDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [detailedOperator, setDetailedOperator] = useState<Operator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { themeColor } = useThemeSettingsStore();
  const router = useRouter();
  
  // Referencia al contenido del diálogo para detectar clics
  const dialogContentRef = useRef<HTMLDivElement>(null);
  
  // Función para manejar el cierre del diálogo explícitamente
  const handleClose = () => {
    console.log("Cerrando diálogo explícitamente");
    setOpen(false);
  };

  // Manejar eventos de teclado para prevenir cierre con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        e.stopPropagation();
        // No hacemos nada, así prevenimos el cierre por Escape
        console.log('Escape presionado - Prevenido cierre automático');
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  // Cuando el diálogo se abre, enfocamos el contenido para capturar eventos
  useEffect(() => {
    if (open && dialogContentRef.current) {
      dialogContentRef.current.focus();
    }
  }, [open]);
  
  // Manejar clics fuera del diálogo
  const handleDialogInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el clic viene de un botón explícito de cierre, permitir cierre
    const target = e.target as HTMLElement;
    
    if (target.closest('[data-action="close-dialog"]')) {
      handleClose();
      return;
    }
    
    // De lo contrario, prevenir la propagación del evento para evitar cierre
    e.stopPropagation();
  };
  
  // Función para cargar los datos completos del operador
  const loadDetailedOperator = async () => {
    if (!open) return;
    
    try {
      setIsLoading(true);
      console.log("🔍 Cargando datos detallados del operador:", operator.operatorId);
      
      // Hacer un bypass del caché y obtener directamente del backend
      const token = getCookie('workexpress_token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      // Añadir ?refresh=true a la URL para forzar la carga fresca de datos
      const url = `${API_URL}/operators/${operator.operatorId}?refresh=true`;
      
      console.log("🌐 Haciendo petición directa a:", url);
      console.log("🔄 Usando refresh=true para forzar datos actualizados del servidor");
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener operador: ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log("📦 Respuesta cruda del servidor:", rawData);
      
      // Intentar encontrar datos anidados
      const operatorData = rawData.data || rawData.operator || rawData;
      
      // Asegurarnos de mapear correctamente los campos
      const detailedData = {
        ...operator, // Mantener datos originales como fallback
        ...operatorData, // Añadir datos nuevos
        // Mapear campos específicos del backend a nuestra estructura
        birth_date: operatorData.birth_date || operatorData.birthdate,
        hire_date: operatorData.hire_date || operatorData.hireDate,
        personal_id: operatorData.personal_id || operatorData.personalId,
        address: operatorData.address,
        emergency_contact: operatorData.emergency_contact || operatorData.emergencyContact,
        skills: operatorData.skills || []
      };
      
      // Verificar la estructura de los datos recibidos
      console.log("✅ Datos detallados del operador recibidos:", {
        detailedData,
        propiedades: Object.keys(detailedData),
        birth_date: detailedData.birth_date || detailedData.birthdate,
        hire_date: detailedData.hire_date || detailedData.hireDate,
        personal_id: detailedData.personal_id || detailedData.personalId,
        address: detailedData.address,
        emergency_contact: detailedData.emergency_contact || detailedData.emergencyContact,
        dataObject: typeof rawData.data === 'object' ? 'Presente' : 'No presente',
        dataProps: rawData.data ? Object.keys(rawData.data) : []
      });
      
      setDetailedOperator(detailedData);
    } catch (error) {
      console.error("❌ Error al cargar datos detallados del operador:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efecto para cargar los datos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      loadDetailedOperator();
    }
  }, [open]);
  
  // Tratar al operador como la versión extendida con los nuevos campos
  // Usar los datos detallados si están disponibles, de lo contrario usar los datos básicos
  const extendedOperator = (detailedOperator || operator) as ExtendedOperator;
  
  // Función para normalizar los datos del operador
  const normalizeOperatorData = (operator: ExtendedOperator): ExtendedOperator => {
    // Creamos una copia del operador para no mutar el original
    const normalized = { ...operator };
    const rawOperator = operator as any;
    
    // Función auxiliar para buscar propiedad en diferentes formatos
    const findProperty = (obj: any, names: string[]): any => {
      for (const name of names) {
        if (obj[name] !== undefined) {
          return obj[name];
        }
      }
      return undefined;
    };
    
    // Función para buscar en propiedades anidadas
    const findNestedProperty = (obj: any, paths: string[][]): any => {
      for (const path of paths) {
        let current = obj;
        let found = true;
        
        for (const segment of path) {
          if (current && typeof current === 'object' && segment in current) {
            current = current[segment];
          } else {
            found = false;
            break;
          }
        }
        
        if (found && current !== undefined) {
          return current;
        }
      }
      
      return undefined;
    };
    
    // Buscar datos en posibles anidaciones
    const possibleData = findNestedProperty(rawOperator, [
      ['data'],
      ['operator'],
      ['user'],
      ['userData'],
      ['operatorData']
    ]) || rawOperator;
    
    // Normalizar nomenclatura de campos con múltiples variantes
    normalized.birth_date = normalized.birth_date || 
                           normalized.birthdate || 
                           findProperty(rawOperator, ['birth_date', 'birthDate', 'birthdate', 'birth_date']) ||
                           findNestedProperty(rawOperator, [
                             ['data', 'birth_date'],
                             ['data', 'birthdate'],
                             ['user', 'birth_date'],
                             ['operator', 'birth_date']
                           ]);
    
    normalized.hire_date = normalized.hire_date || 
                          normalized.hireDate || 
                          findProperty(rawOperator, ['hire_date', 'hireDate', 'hiredate', 'hire_date']) ||
                          findNestedProperty(rawOperator, [
                            ['data', 'hire_date'],
                            ['data', 'hireDate'],
                            ['user', 'hire_date'],
                            ['operator', 'hire_date']
                          ]);
    
    normalized.personal_id = normalized.personal_id || 
                            normalized.personalId || 
                            findProperty(rawOperator, ['personal_id', 'personalId', 'personalID', 'personId']) ||
                            findNestedProperty(rawOperator, [
                              ['data', 'personal_id'],
                              ['data', 'personalId'],
                              ['user', 'personal_id'],
                              ['operator', 'personal_id']
                            ]);
    
    normalized.address = normalized.address ||
                        findProperty(rawOperator, ['address', 'direccion', 'direction']) ||
                        findNestedProperty(rawOperator, [
                          ['data', 'address'],
                          ['user', 'address'],
                          ['operator', 'address']
                        ]);
    
    // Asegurarnos de que el contacto de emergencia exista y sea accesible
    if (!normalized.emergency_contact) {
      const possibleEmergencyContact = normalized.emergencyContact || 
                                  findProperty(rawOperator, ['emergency_contact', 'emergencyContact']) ||
                                  findNestedProperty(rawOperator, [
                                    ['data', 'emergency_contact'],
                                    ['data', 'emergencyContact'],
                                    ['user', 'emergency_contact'],
                                    ['operator', 'emergency_contact']
                                  ]);
                                  
      // Si no hay contacto, creamos un objeto vacío para evitar errores
      normalized.emergency_contact = possibleEmergencyContact as typeof normalized.emergency_contact || {
        name: '',
        phone: '',
        relationship: '',
        address: ''
      };
    }
    
    // Validar que tenga la estructura correcta
    if (normalized.emergency_contact && typeof normalized.emergency_contact === 'object') {
      // Creamos una copia segura
      const safeEmergencyContact = { ...normalized.emergency_contact } as any;
      
      // Asegurarnos de que tiene todas las propiedades necesarias
      if (!('name' in safeEmergencyContact) || safeEmergencyContact.name === null) {
        safeEmergencyContact.name = '';
      }
      if (!('phone' in safeEmergencyContact) || safeEmergencyContact.phone === null) {
        safeEmergencyContact.phone = '';
      }
      if (!('relationship' in safeEmergencyContact) || safeEmergencyContact.relationship === null) {
        safeEmergencyContact.relationship = '';
      }
      if (!('address' in safeEmergencyContact) || safeEmergencyContact.address === null) {
        safeEmergencyContact.address = '';
      }
      
      // Asignar de vuelta
      normalized.emergency_contact = safeEmergencyContact;
      
      // También asegurar que esté disponible en camelCase
      normalized.emergencyContact = {
        name: safeEmergencyContact.name,
        phone: safeEmergencyContact.phone,
        relationship: safeEmergencyContact.relationship,
        address: safeEmergencyContact.address
      };
    }
    
    // Si no hay skills, intentar buscarlas con otros nombres
    if (!normalized.skills) {
      normalized.skills = findProperty(rawOperator, ['skills', 'abilities', 'competencias', 'habilidades']) ||
                         findNestedProperty(rawOperator, [
                           ['data', 'skills'],
                           ['user', 'skills'],
                           ['operator', 'skills']
                         ]) || [];
    }
    
    // Log para depuración
    console.log('Operador normalizado:', {
      birth_date: normalized.birth_date,
      hire_date: normalized.hire_date,
      personal_id: normalized.personal_id,
      address: normalized.address,
      emergency_contact: normalized.emergency_contact,
      emergencyContact: normalized.emergencyContact, // Añadir la versión camelCase también
      skills: normalized.skills,
      // Información útil para depuración
      availableKeys: Object.keys(rawOperator)
    });
    
    // Log específico para depurar el contacto de emergencia
    console.log('Contacto de emergencia:', {
      snake_case: normalized.emergency_contact,
      camelCase: normalized.emergencyContact,
      hasName: Boolean(normalized.emergency_contact?.name || normalized.emergencyContact?.name),
      hasPhone: Boolean(normalized.emergency_contact?.phone || normalized.emergencyContact?.phone),
      hasRelationship: Boolean(normalized.emergency_contact?.relationship || normalized.emergencyContact?.relationship),
      hasAddress: Boolean(normalized.emergency_contact?.address || normalized.emergencyContact?.address)
    });
    
    return normalized;
  };
  
  // Normalizar los datos del operador
  const normalizedOperator = normalizeOperatorData(extendedOperator);
  
  // Log de depuración
  console.log('Datos de operador original:', {
    birth_date: extendedOperator.birth_date,
    birthdate: extendedOperator.birthdate,
    hire_date: extendedOperator.hire_date,
    hireDate: extendedOperator.hireDate,
    personal_id: extendedOperator.personal_id,
    personalId: extendedOperator.personalId,
    address: extendedOperator.address,
    emergency_contact: extendedOperator.emergency_contact,
    emergencyContact: extendedOperator.emergencyContact,
    skills: extendedOperator.skills,
    rawOperator: operator
  });

  // Función para formatear fechas
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "No disponible";
    try {
      return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Formato inválido";
    }
  };

  // Mapeo de roles para mostrar en la UI
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, { label: string; color: string; icon: any }> = {
      admin: { 
        label: "Administrador", 
        color: "from-purple-500 to-indigo-500",
        icon: StarIcon
      },
      manager: { 
        label: "Gerente", 
        color: "from-blue-500 to-cyan-500",
        icon: IdCardIcon
      },
      gerente_de_sucursal: { 
        label: "Gerente De Sucursal", 
        color: "from-amber-500 to-orange-500",
        icon: IdCardIcon
      },
      operator: { 
        label: "Operador", 
        color: "from-emerald-500 to-teal-500",
        icon: PersonIcon
      },
    };

    const lowerRole = role?.toLowerCase() || "unknown";
    return roleMap[lowerRole] || { 
      label: role || "Desconocido", 
      color: "from-gray-500 to-gray-600",
      icon: PersonIcon
    };
  };

  // Mapeo de estados para mostrar en la UI
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      active: { 
        label: "Activo", 
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: CheckCircledIcon
      },
      inactive: { 
        label: "Inactivo", 
        className: "bg-gray-50 text-gray-700 border-gray-100",
        icon: ExclamationTriangleIcon
      },
      suspended: { 
        label: "Suspendido", 
        className: "bg-amber-50 text-amber-700 border-amber-100",
        icon: ExclamationTriangleIcon
      },
      pending: { 
        label: "Pendiente", 
        className: "bg-blue-50 text-blue-700 border-blue-100",
        icon: InfoCircledIcon
      },
    };

    const lowerStatus = status?.toLowerCase() || "unknown";
    return statusMap[lowerStatus] || { 
      label: status || "Desconocido", 
      className: "bg-gray-50 text-gray-700 border-gray-100",
      icon: InfoCircledIcon
    };
  };

  const roleInfo = getRoleDisplay(operator.role);
  const statusInfo = getStatusDisplay(operator.status);
  const StatusIcon = statusInfo.icon;
  const RoleIcon = roleInfo.icon;

  // Usar el color del tema activo para los gradientes
  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-600 via-lime-500 to-green-500';
      case 'sky':
        return 'from-sky-600 via-blue-600 to-indigo-600';
      case 'emerald':
        return 'from-emerald-600 via-green-600 to-teal-600';
      case 'rose':
        return 'from-rose-600 via-pink-600 to-fuchsia-600';
      case 'amber':
        return 'from-amber-600 via-yellow-600 to-orange-600';
      case 'purple':
        return 'from-purple-600 via-violet-600 to-indigo-600';
      case 'slate':
        return 'from-slate-600 via-gray-600 to-zinc-600';
      case 'stone':
        return 'from-stone-600 via-gray-600 to-neutral-600';
      case 'neutral':
        return 'from-neutral-600 via-gray-600 to-stone-600';
      case 'indigo':
      default:
        return 'from-indigo-600 via-blue-600 to-purple-600';
    }
  };

  // Al renderizar la foto del operador, usar getPhotoDisplayUrl
  const hasPhoto = operator.photo &&
    operator.photo !== "null" &&
    operator.photo !== "undefined" &&
    operator.photo.trim() !== "";

  // Verificar si la URL es de Supabase Storage para saber si necesitamos URL firmada
  const isSupabaseUrl = hasPhoto && (
    operator.photo?.includes('supabase') || 
    operator.photo?.includes('storage') || 
    operator.photo?.includes('workexpressimagedata')
  );

  // Usar getPhotoDisplayUrl para garantizar la URL firmada
  const photoUrl = hasPhoto && operator.photo
    ? getPhotoDisplayUrl(operator.photo, operator.operatorId)
    : '';

  const [imageError, setImageError] = useState(false);

  return (
    <>
      <Dialog 
        open={open} 
        modal={true}
        onOpenChange={(newOpenState) => {
          // Solo permitir que se abra desde afuera
          if (newOpenState === true) {
            setOpen(true);
            return;
          }
          
          // No permitir el cierre automático
          // Solo usar handleClose para cerrar
          console.log("Intento de cierre automático interceptado");
          return false;
        }}
      >
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent 
          ref={dialogContentRef}
          className="max-w-6xl p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-[0_0_80px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_0_80px_-15px_rgba(0,0,0,0.7)] rounded-3xl overflow-hidden dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 remove-x-button"
          onClick={handleDialogInteraction}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onInteractOutside={(e) => {
            // Prevenir cualquier interacción fuera que intente cerrar el diálogo
            e.preventDefault();
          }}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            // Evitar que la tecla Escape cierre el diálogo
            if (e.key === 'Escape') {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          style={{
            margin: 'auto',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '95vh',
            width: '90vw',
            maxWidth: '1200px',
            minWidth: '900px',
            zIndex: 50
          }}
        >
          {/* Efecto de fondo con diseño de glassmorphism mejorado */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] dark:opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02] dark:from-blue-500/[0.04] dark:via-purple-500/[0.04] dark:to-pink-500/[0.04] pointer-events-none" />
          
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center min-h-[500px]">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-200/30 animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-2 border-t-blue-400 border-blue-100/20 animate-spin animation-delay-150"></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-6 font-medium">Cargando información detallada...</p>
              <p className="text-blue-500 dark:text-blue-400 mt-2 text-sm flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2">
                  <InfoCircledIcon className="h-3 w-3" />
                </span>
                Obteniendo datos actualizados del servidor
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[minmax(650px,1fr),340px] grid-cols-1">
            {/* Contenido Principal */}
            <div className="relative p-8">
              <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm -mx-8 px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 mb-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-700/30 rounded-xl blur-[10px]"></div>
                      <div className="p-2.5 relative bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg shadow-blue-600/10 dark:shadow-blue-700/20">
                        <PersonIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased]">
                        Detalles del operador
                      </DialogTitle>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Información completa del perfil del operador
                        </p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30 text-xs px-2 py-0 h-5 prevent-dialog-close">
                          <span className="flex items-center gap-1">
                            <InfoCircledIcon className="h-3 w-3" />
                            Datos actualizados
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {/* Removing the X close button */}
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-4 scroll-content">
                {/* Debug - Solo visible en desarrollo */}
                {process.env.NEXT_PUBLIC_NODE_ENV === 'development' && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-3 rounded-lg mb-4 text-xs prevent-dialog-close">
                    <div className="font-medium text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                      <InfoCircledIcon className="h-3.5 w-3.5" />
                      Debug: Contacto de emergencia
                    </div>
                    <div className="space-y-1 font-mono">
                      <div className="flex gap-2">
                        <span className="text-amber-700 dark:text-amber-400">snake_case:</span>
                        <span>{JSON.stringify(normalizedOperator.emergency_contact)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-700 dark:text-amber-400">camelCase:</span>
                        <span>{JSON.stringify(normalizedOperator.emergencyContact)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-700 dark:text-amber-400">hasName:</span>
                        <span>{String(Boolean(normalizedOperator.emergency_contact?.name || normalizedOperator.emergencyContact?.name))}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-700 dark:text-amber-400">hasPhone:</span>
                        <span>{String(Boolean(normalizedOperator.emergency_contact?.phone || normalizedOperator.emergencyContact?.phone))}</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Información básica */}
                <div className="bg-white dark:bg-gray-800/40 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased]">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800/30 rounded-md">
                      <PersonIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Información básica
                  </h3>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <div className="group">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Nombre completo</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased]">
                        {operator.firstName} {operator.lastName}
                      </div>
                    </div>
                    <div className="group">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Correo electrónico</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <EnvelopeClosedIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">{operator.email}</span>
                      </div>
                    </div>
                    <div className="group">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Teléfono</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <MobileIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        {operator.phone || "No disponible"}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="dark:bg-gray-700/50" />

                {/* Información de acceso */}
                <div className="bg-white dark:bg-gray-800/40 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800/30 rounded-md">
                      <RocketIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Información de acceso
                  </h3>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <div className="group">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">Rol</div>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${roleInfo.color} shadow-sm`}>
                            <RoleIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {roleInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="group">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">Estado</div>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "transition-colors font-medium border px-3 py-1 text-sm flex items-center gap-1.5",
                            statusInfo.className,
                            "dark:bg-opacity-20 dark:border-opacity-30"
                          )}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="group">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">Último acceso</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <ClockIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                        {formatDate(operator.lastLoginAt)}
                      </div>
                    </div>
                    <div className="col-span-3 group">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">Sucursal</div>
                      <div className="bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <BranchDisplay 
                          branchName={operator.branchName} 
                          branchReference={operator.branchReference} 
                          themeColor={typeof themeColor === 'string' ? themeColor : 'blue'} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="dark:bg-gray-700/50" />

                {/* Combinando Información de fechas y personal en una sola sección */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white dark:bg-gray-800/40 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-800/30 rounded-md">
                        <CalendarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Información personal y fechas
                      {!normalizedOperator.birth_date && !normalizedOperator.hire_date && !normalizedOperator.personal_id && (
                        <Badge 
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30 ml-2 text-xs prevent-dialog-close"
                        >
                          <InfoCircledIcon className="h-3 w-3 mr-1" />
                          Datos incompletos
                        </Badge>
                      )}
                    </h3>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                      <div className="group">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">Fecha de creación</div>
                        <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          <CalendarIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          {formatDate(normalizedOperator.createdAt)}
                        </div>
                      </div>
                      <div className="group">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">Última actualización</div>
                        <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          <ClockIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          {formatDate(normalizedOperator.updatedAt)}
                        </div>
                      </div>
                      <div className="group">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">ID del operador</div>
                        <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          <IdCardIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm font-mono truncate">
                            {operator.operatorId.substring(0, 18)}...
                          </code>
                        </div>
                      </div>
                      <div className="group">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">Fecha de nacimiento</div>
                        <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          <CalendarIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          {(normalizedOperator.birth_date || normalizedOperator.birthdate) 
                            ? formatDate(normalizedOperator.birth_date || normalizedOperator.birthdate).split(",")[0] 
                            : "No disponible"}
                        </div>
                      </div>
                      <div className="group">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">Fecha de contratación</div>
                        <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          <CalendarIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          {(normalizedOperator.hire_date || normalizedOperator.hireDate) 
                            ? formatDate(normalizedOperator.hire_date || normalizedOperator.hireDate).split(",")[0] 
                            : "No disponible"}
                        </div>
                      </div>
                      <div className="group">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">Cédula</div>
                        <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          <IdCardIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          {(normalizedOperator.personal_id || normalizedOperator.personalId) || "No disponible"}
                        </div>
                      </div>
                      <div className="col-span-3 group">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">Dirección</div>
                        <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          <HomeIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          {normalizedOperator.address || "No disponible"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continuación de información personal y fechas - Alerta */}
                {!normalizedOperator.birth_date && !normalizedOperator.hire_date && !normalizedOperator.personal_id && !normalizedOperator.address && (
                  <div className="p-4 bg-amber-50/70 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30 rounded-xl prevent-dialog-close">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-full text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Datos personales incompletos</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Los datos personales existen en la base de datos pero no están siendo retornados por la API correctamente. 
                          Use el parámetro <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-md">?refresh=true</code> al solicitar los detalles.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contacto de emergencia y Habilidades */}
                <div className="grid grid-cols-1 gap-6">
                  {(normalizedOperator.emergency_contact?.name || normalizedOperator.emergencyContact?.name || normalizedOperator.emergency_contact?.phone || normalizedOperator.emergencyContact?.phone) && (
                    <>
                      <Separator className="dark:bg-gray-700/50" />
                      <div className="bg-white dark:bg-gray-800/40 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-pink-600"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <div className="p-1.5 bg-red-100 dark:bg-red-800/30 rounded-md">
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          Contacto de emergencia
                        </h3>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                          <div className="group">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">Nombre</div>
                            <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                              <PersonIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                              {(normalizedOperator.emergency_contact?.name || normalizedOperator.emergencyContact?.name) || "No disponible"}
                            </div>
                          </div>
                          <div className="group">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">Teléfono</div>
                            <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                              <MobileIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                              {(normalizedOperator.emergency_contact?.phone || normalizedOperator.emergencyContact?.phone) || "No disponible"}
                            </div>
                          </div>
                          {(normalizedOperator.emergency_contact?.relationship || normalizedOperator.emergencyContact?.relationship) && (
                            <div className="group">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">Relación</div>
                              <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                <PersonIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                                <div className="font-medium truncate">
                                  {(normalizedOperator.emergency_contact?.relationship || normalizedOperator.emergencyContact?.relationship)}
                                </div>
                              </div>
                            </div>
                          )}
                          {(normalizedOperator.emergency_contact?.address || normalizedOperator.emergencyContact?.address) && (
                            <div className="col-span-3 group">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">Dirección de emergencia</div>
                              <div className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                <HomeIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                                {(normalizedOperator.emergency_contact?.address || normalizedOperator.emergencyContact?.address)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Habilidades */}
                  {normalizedOperator.skills && normalizedOperator.skills.length > 0 && (
                    <>
                      <Separator className="dark:bg-gray-700/50" />
                      <div className="bg-white dark:bg-gray-800/40 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <div className="p-1.5 bg-purple-100 dark:bg-purple-800/30 rounded-md">
                            <StarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          Habilidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {normalizedOperator.skills.map((skill, index) => (
                            <Badge 
                              key={index}
                              variant="outline"
                              className={cn(
                                "px-3 py-1.5 font-medium shadow-sm prevent-dialog-close",
                                themeColor === 'blue' && "bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-800/30",
                                themeColor === 'indigo' && "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/30",
                                themeColor === 'purple' && "bg-purple-50/80 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-100 dark:border-purple-800/30",
                                themeColor === 'pink' && "bg-pink-50/80 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border-pink-100 dark:border-pink-800/30",
                                themeColor === 'rose' && "bg-rose-50/80 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 border-rose-100 dark:border-rose-800/30",
                                themeColor === 'amber' && "bg-amber-50/80 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-100 dark:border-amber-800/30",
                                themeColor === 'emerald' && "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/30",
                                themeColor === 'sky' && "bg-sky-50/80 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border-sky-100 dark:border-sky-800/30",
                                themeColor === 'lime' && "bg-lime-50/80 text-lime-700 dark:bg-lime-900/20 dark:text-lime-300 border-lime-100 dark:border-lime-800/30",
                                themeColor === 'slate' && "bg-slate-50/80 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300 border-slate-100 dark:border-slate-800/30",
                                themeColor === 'stone' && "bg-stone-50/80 text-stone-700 dark:bg-stone-900/20 dark:text-stone-300 border-stone-100 dark:border-stone-800/30",
                                themeColor === 'neutral' && "bg-neutral-50/80 text-neutral-700 dark:bg-neutral-900/20 dark:text-neutral-300 border-neutral-100 dark:border-neutral-800/30"
                              )}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Panel Lateral */}
            <div className="bg-gradient-to-b from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 border-l border-gray-100 dark:border-gray-700/70 backdrop-blur-sm p-6 flex flex-col">
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-10rem)] pr-2 sidebar-content">
                {/* Foto e información básica */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-white dark:border-gray-700 shadow-md overflow-hidden">
                      {normalizedOperator.photo && normalizedOperator.photo !== "null" && normalizedOperator.photo !== "undefined" && normalizedOperator.photo.trim() !== "" ? (
                        <div className="relative w-full h-full cursor-pointer group" onClick={() => setImageViewerOpen(true)}>
                          <Avatar className="w-full h-full">
                            {!imageError ? (
                              <AvatarImage
                                src={photoUrl || normalizedOperator.photo}
                                alt={`Foto de ${normalizedOperator.firstName} ${normalizedOperator.lastName}`}
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  console.log(`❌ Error cargando imagen: ${photoUrl}`);
                                  
                                  // Intentar recuperar URL firmada alternativa si es posible
                                  if (normalizedOperator.photo) {
                                    const alternativeSignedUrl = getPhotoDisplayUrl(normalizedOperator.photo, normalizedOperator.operatorId);
                                    if (alternativeSignedUrl && alternativeSignedUrl !== photoUrl) {
                                      console.log('🔄 Intentando recuperar con URL firmada alternativa:', alternativeSignedUrl);
                                      e.currentTarget.src = alternativeSignedUrl;
                                      return;
                                    }
                                  }
                                  
                                  // Si no se pudo recuperar, mostrar fallback
                                  setImageError(true);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 text-blue-700 dark:text-blue-200 font-medium">
                              {`${normalizedOperator.firstName?.[0] || ''}${normalizedOperator.lastName?.[0] || ''}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                            <div className="flex items-center gap-1 text-white text-xs font-medium">
                              <ZoomInIcon className="h-3 w-3" />
                              <span>Ver</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                          <AvatarIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center ${
                      normalizedOperator.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}>
                      {normalizedOperator.status === 'active' && 
                        <CheckCircledIcon className="h-3 w-3 text-white" />
                      }
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {normalizedOperator.firstName} {normalizedOperator.lastName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1.5">
                      <EnvelopeClosedIcon className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{normalizedOperator.email}</span>
                    </div>
                  </div>

                  <div className={`mt-3 px-4 py-1 rounded-full text-xs font-medium shadow-sm ${
                    roleInfo.color === 'from-purple-500 to-indigo-500' 
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30' 
                      : roleInfo.color === 'from-blue-500 to-cyan-500'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30'
                      : roleInfo.color === 'from-amber-500 to-orange-500'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-100 dark:border-amber-800/30'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/30'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <RoleIcon className="h-3 w-3" />
                      <span>{roleInfo.label}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas
                <div className="mb-6 bg-white dark:bg-gray-800/70 rounded-xl p-4 border border-gray-100 dark:border-gray-700/70 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1.5">
                    <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                      <LightningBoltIcon className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    </div>
                    Acciones rápidas
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start bg-white dark:bg-gray-800 h-9 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors border-gray-200 dark:border-gray-700/70"
                      onClick={() => {
                        setOpen(false);
                        router.push(`/dashboard/users/operator/edit/${normalizedOperator.operatorId}`);
                      }}
                    >
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md mr-1.5">
                        <Pencil1Icon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      Editar operador
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start bg-white dark:bg-gray-800 h-9 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors border-gray-200 dark:border-gray-700/70"
                      onClick={() => {
                        // Close this dialog and open password change dialog
                        setOpen(false);
                        // Implement password change logic or dialog
                      }}
                    >
                      <div className="p-1 bg-gray-100 dark:bg-gray-700/70 rounded-md mr-1.5">
                        <LockClosedIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      Cambiar contraseña
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start bg-white dark:bg-gray-800 h-9 px-3 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 border-gray-200 dark:border-gray-700/70"
                      disabled={normalizedOperator.status === 'inactive'}
                      onClick={() => {
                        // Implement deactivation logic
                      }}
                    >
                      <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-md mr-1.5">
                        <ExitIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                      {normalizedOperator.status === 'inactive' ? 'Operador inactivo' : 'Desactivar operador'}
                    </Button>
                  </div>
                </div> */}

                {/* Información de contacto */}
                <div className="mb-6 bg-white dark:bg-gray-800/70 rounded-xl p-4 border border-gray-100 dark:border-gray-700/70 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1.5">
                    <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                      <EnvelopeClosedIcon className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Información de contacto
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/70">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <MobileIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Teléfono</div>
                        <div className="font-medium truncate">{normalizedOperator.phone || "No disponible"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/70">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                        <IdCardIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">ID</div>
                        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{normalizedOperator.operatorId.substring(0, 12)}...</code>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/70">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <CalendarIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Creado</div>
                        <div className="font-medium">{formatDate(normalizedOperator.createdAt).split(',')[0]}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sucursal */}
                <div className="mb-6 bg-white dark:bg-gray-800/70 rounded-xl p-4 border border-gray-100 dark:border-gray-700/70 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1.5">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                      <HomeIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    Sucursal
                  </h3>
                  <div className={`p-3 rounded-lg ${
                    typeof themeColor === 'string' 
                      ? `bg-${themeColor}-50/80 border-${themeColor}-100 dark:bg-${themeColor}-900/20 dark:border-${themeColor}-900/30` 
                      : 'bg-blue-50/80 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30'
                  } border`}>
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg shadow-sm flex-shrink-0 ${
                        typeof themeColor === 'string' 
                          ? `bg-gradient-to-br ${getThemeGradient()}` 
                          : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                        }`}>
                        <HomeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {normalizedOperator.branchName || "No asignada"}
                        </div>
                        {normalizedOperator.branchReference && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            ID: <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{normalizedOperator.branchReference.substring(0, 8)}...</code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contacto de emergencia - Panel Lateral */}
                {(normalizedOperator.emergency_contact?.name || normalizedOperator.emergencyContact?.name || normalizedOperator.emergency_contact?.phone || normalizedOperator.emergencyContact?.phone) && (
                  <div className="mb-6 bg-white dark:bg-gray-800/70 rounded-xl p-4 border border-gray-100 dark:border-gray-700/70 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1.5">
                      <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-md">
                        <ExclamationTriangleIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                      Contacto de emergencia
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-red-50/70 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 prevent-dialog-close">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                          <PersonIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Nombre</div>
                          <div className="font-medium truncate">
                            {(normalizedOperator.emergency_contact?.name || normalizedOperator.emergencyContact?.name) || "No disponible"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-red-50/70 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 prevent-dialog-close">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                          <MobileIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Teléfono</div>
                          <div className="font-medium truncate">
                            {(normalizedOperator.emergency_contact?.phone || normalizedOperator.emergencyContact?.phone) || "No disponible"}
                          </div>
                        </div>
                      </div>
                      
                      {(normalizedOperator.emergency_contact?.relationship || normalizedOperator.emergencyContact?.relationship) && (
                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-red-50/70 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 prevent-dialog-close">
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <InfoCircledIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Relación</div>
                            <div className="font-medium truncate">
                              {(normalizedOperator.emergency_contact?.relationship || normalizedOperator.emergencyContact?.relationship)}
                            </div>
                          </div>
                        </div>
                      )}
                      {(normalizedOperator.emergency_contact?.address || normalizedOperator.emergencyContact?.address) && (
                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-red-50/70 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 prevent-dialog-close">
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <HomeIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Dirección</div>
                            <div className="font-medium truncate">
                              {(normalizedOperator.emergency_contact?.address || normalizedOperator.emergencyContact?.address)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón cerrar */}
              <div className="border-t border-gray-100 dark:border-gray-700/70 pt-4 mt-auto">
                <Button
                  onClick={handleClose}
                  className={`h-12 px-5 w-full relative overflow-hidden bg-gradient-to-r ${getThemeGradient()} text-white transition-all duration-200 rounded-xl text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:focus:ring-blue-400`}
                  //data-action="close-dialog"
                >
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                  <span className="flex items-center justify-center gap-1.5 font-medium">
                    Cerrar
                  </span>
                </Button>
              </div>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para visualizar la imagen */}
      {normalizedOperator.photo && normalizedOperator.photo !== "null" && normalizedOperator.photo !== "undefined" && normalizedOperator.photo.trim() !== "" && (
        <ImageViewerDialog
          imageUrl={photoUrl || normalizedOperator.photo}
          altText={`Foto de perfil de ${normalizedOperator.firstName} ${normalizedOperator.lastName}`}
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          themeColor={typeof themeColor === 'string' ? themeColor : 'default'}
        />
      )}

      <style jsx global>{`
        .scroll-content::-webkit-scrollbar, .sidebar-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .scroll-content::-webkit-scrollbar-track, .sidebar-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scroll-content::-webkit-scrollbar-thumb, .sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        
        .scroll-content::-webkit-scrollbar-thumb:hover, .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        
        .dark .scroll-content::-webkit-scrollbar-thumb, .dark .sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
        }
        
        .dark .scroll-content::-webkit-scrollbar-thumb:hover, .dark .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
        
        /* Fix for blurry text */
        .dialog-content * {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Remove close button from Radix UI dialogs - this should target the X button */
        [role="dialog"] button:has(.lucide-x),
        [role="dialog"] button.absolute.right-4.top-4,
        [role="dialog"] [data-radix-dialog-close],
        button[aria-label="Close"],
        .DialogClose,
        .Primitive\\.button,
        div[class*="DialogContent"] > button[class*="absolute"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        
        /* Direct selector for the X in the DialogClose */
        [role="dialog"] > div > button > svg,
        button[role="button"] > svg[width="15"],
        button[role="button"] > svg[width="12"],
        button[role="button"] > svg[width="16"],
        button[role="button"] > svg[width="24"] {
          display: none !important;
        }
        
        /* Target by position - anything positioned absolutely in the top-right corner */
        button.absolute[style*="top:"][style*="right:"],
        .absolute.right-4.top-4,
        .absolute.top-4.right-4,
        [style*="position: absolute"][style*="top:"][style*="right:"] {
          display: none !important;
        }
        
        /* Extra insurance for Primitive.X component */
        .X {
          display: none !important;
        }
        
        /* Ensure crisp text for all dialog elements */
        .dialog-content {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        /* Sharper text for important UI elements */
        .dialog-content h3, 
        .dialog-content .font-medium,
        .dialog-content .font-semibold,
        .dialog-content .text-base,
        .dialog-content .text-lg,
        .dialog-content .text-sm,
        .dialog-content .badge {
          letter-spacing: -0.01em;
        }
        
        /* Fix dialog positioning to be centered */
        [role="dialog"][data-state="open"] {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Ensure the dialog overlay covers the entire screen */
        [data-radix-popper-content-wrapper] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 95vh;
          max-width: 95vw;
          width: auto !important;
          min-width: 900px !important;
          height: auto;
          margin: 0 !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 950px) {
          [data-radix-popper-content-wrapper] {
            min-width: 90vw !important;
          }
          
          .dialog-content > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default OperatorDetailsDialog; 