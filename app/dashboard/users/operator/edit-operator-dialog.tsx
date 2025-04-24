"use client";

import { useState, useEffect, useRef }from "react";
import { getCookie }from "cookies-next";
import { zodResolver }from "@hookform/resolvers/zod";
import { useForm }from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
}from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
}from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}from "@/components/ui/select";
import { 
  ReloadIcon, 
  PersonIcon,
  EnvelopeClosedIcon,
  MobileIcon,
  IdCardIcon,
  CheckIcon,
  InfoCircledIcon,
  AvatarIcon,
  HomeIcon,
  CalendarIcon,
  UploadIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
}from "@radix-ui/react-icons";
import { toast } from "sonner";
import { motion } from "framer-motion";
import useThemeSettingsStore from "@/store/themeSettingsStore";
import { OperatorsService, Operator, EmergencyContact } from "@/app/services/operators.service";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Textarea } from "@/components/ui/textarea";
import { BranchesService } from "@/app/services/branches.service";
import { OperatorTypesService } from "@/app/services/operator-types.service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { processPhotoUrl, getPhotoDisplayUrl, isSupabaseStorageUrl } from "@/lib/photo-utils";

// Definición de la interfaz actualizada para edición de operadores
interface UpdateOperatorDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  phone?: string;
  photo?: string; // Cambiar a string para evitar incompatibilidades
  role?: string;
  status?: string;
  branch_id?: string;
  type_operator_id?: string;
  birth_date?: string | null; // Añadir null para permitir este valor
  address?: string;
  personal_id?: string;
  emergency_contact?: EmergencyContact | null; // Añadir null para permitir este valor
}

// Interfaz del formulario que mapea a los campos del formulario UI
interface FormSchema {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dni?: string;
  address?: string;
  branch_id: string;
  type_operator_id: string;
  identification_number?: string;
  birth_date?: Date | null;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  emergency_contact_address?: string;
  photo?: File | null;
  role?: string;
  status?: string;
}

const formSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1, { message: "El nombre es requerido" }),
  last_name: z.string().min(1, { message: "El apellido es requerido" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  phone: z.string().min(1, { message: "El teléfono es requerido" }),
  dni: z.string().optional(),
  address: z.string().optional(),
  branch_id: z.string().min(1, { message: "La sucursal es requerida" }),
  type_operator_id: z.string().min(1, { message: "El tipo de operador es requerido" }),
  identification_number: z.string().optional(),
  birth_date: z.date().nullable().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  emergency_contact_address: z.string().optional(),
  photo: z.instanceof(File).nullable().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const roleColors = {
  Admin: "from-purple-500 to-indigo-500",
  Manager: "from-blue-500 to-cyan-500",
  Branch_Manager: "from-amber-500 to-orange-500",
  Operator: "from-emerald-500 to-teal-500",
  Programador: "from-pink-500 to-rose-500",
};

// Interfaces para los datos de sucursales y tipos de operadores
interface Branch {
  id: string;
  name: string;
}

interface OperatorType {
  id: string;
  name: string;
}

// Función para obtener color según estado - mover fuera del componente
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
    case 'suspended':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

// Props para el componente
interface EditOperatorDialogProps {
  operator: Operator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedOperator: Operator) => void;
}

export default function EditOperatorDialog({ 
  operator, 
  open, 
  onOpenChange,
  onSave
}: EditOperatorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [operatorTypes, setOperatorTypes] = useState<OperatorType[]>([]);
  const [currentOperatorType, setCurrentOperatorType] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const themeColor = useThemeSettingsStore((state) => state.themeColor);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Mapear el rol del backend al formato del formulario
  const mapRoleToForm = (backendRole: string): "Admin" | "Manager" | "Branch_Manager" | "Operator" | "Programador" => {
    // Verificar que el rol existe
    if (!backendRole) {
      console.log('⚠️ No se encontró un rol definido, usando "Operator" por defecto');
      return "Operator";
    }
    
    // Roles permitidos por el backend: "admin, manager, staff, guest, Contador, gerente_de_sucursal, programador"
    const roleMap: Record<string, "Admin" | "Manager" | "Branch_Manager" | "Operator" | "Programador"> = {
      // Admin
      "admin": "Admin",
      "administrator": "Admin",
      "administrador": "Admin",
      
      // Manager
      "manager": "Manager",
      "gerente": "Manager",
      "contador": "Manager", // Mapear Contador a Manager
      
      // Branch Manager
      "gerente_de_sucursal": "Branch_Manager",
      "branch_manager": "Branch_Manager",
      "branchmanager": "Branch_Manager",
      
      // Programador (mantener como está)
      "programador": "Programador",
      
      // Operator/Staff
      "staff": "Operator",
      "operator": "Operator",
      "operador": "Operator",
      "guest": "Operator", // Mapear guest a Operator
    };
    
    // Si el rol viene en minúsculas pero el mapa está en mayúsculas o viceversa
    const normalizedRole = backendRole.toLowerCase();
    
    console.log(`Mapeando rol del backend "${backendRole}" (normalizado: "${normalizedRole}") a formulario: "${roleMap[normalizedRole] || "Operator"}"`);
    
    // Si el rol exacto es "programador", mantenerlo como Programador sin normalizar
    if (backendRole === "programador") {
      return "Programador";
    }
    
    // Si el rol no está en el mapa, usar Operator como valor por defecto
    return roleMap[normalizedRole] || "Operator";
  };

  // Mapear el rol del formulario al formato del backend
  const mapRoleToBackend = (formRole: string): string => {
    if (!formRole) return "staff"; // Valor por defecto si no hay rol
    
    // Estos valores DEBEN coincidir exactamente con los que el backend espera:
    // "admin, manager, staff, guest, Contador, gerente_de_sucursal, programador"
    const roleMap: Record<string, string> = {
      "Admin": "admin",
      "Manager": "manager", 
      "Branch_Manager": "gerente_de_sucursal",
      "Operator": "staff",  // Cambiado de "operator" a "staff" según requisitos del backend
      "Programador": "programador" // Añadido explícitamente
    };
    
    // Comprobar si existe un mapeo para este rol
    if (!roleMap[formRole]) {
      console.warn(`⚠️ No existe mapeo para el rol "${formRole}", usando valor por defecto "staff"`);
      return "staff";
    }
    
    // Asegurarnos que el rol mapeado es uno de los permitidos por el backend
    const allowedBackendRoles = ['admin', 'manager', 'staff', 'guest', 'Contador', 'gerente_de_sucursal', 'programador'];
    const mappedRole = roleMap[formRole];
    
    if (!allowedBackendRoles.includes(mappedRole)) {
      console.warn(`⚠️ El rol mapeado "${mappedRole}" no está en la lista de roles permitidos, usando valor seguro "staff"`);
      return "staff";
    }
    
    console.log(`Mapeando rol de formulario "${formRole}" a backend: "${mappedRole}"`);
    return mappedRole;
  };

  // Configurar el formulario con los valores iniciales del operador
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: operator.operatorId,
      first_name: operator.firstName || "",
      last_name: operator.lastName || "",
      email: operator.email || "",
      phone: operator.phone || "",
      dni: operator.personal_id || "",
      address: operator.address || "",
      branch_id: operator.branchReference || "",
      type_operator_id: operator.type_operator_id || "",
      identification_number: operator.personal_id || "",
      birth_date: operator.birth_date ? new Date(operator.birth_date) : null,
      emergency_contact_name: operator.emergency_contact?.name || "",
      emergency_contact_phone: operator.emergency_contact?.phone || "",
      emergency_contact_relationship: operator.emergency_contact?.relationship || "",
      emergency_contact_address: operator.emergency_contact?.address || "",
      photo: null,
      role: operator.role ? mapRoleToForm(operator.role) : "Operator",
      status: operator.status || "active",
    },
  });

  // Log de diagnóstico inicial
  console.log('🔍 Operador cargado:', operator);
  console.log('👑 Rol detectado:', operator.role);
  console.log('👑 Rol inicial mapeado:', operator.role ? mapRoleToForm(operator.role) : "Operator");
  console.log('🚦 Estado inicial:', operator.status || "active");

  // Cargar datos de sucursales y tipos de operadores
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsDataLoading(true);
        // Cargar sucursales
        const branchesData = await BranchesService.getBranches();
        setBranches(branchesData.map(branch => ({
          id: branch.id,
          name: branch.name
        })));
        
        // Cargar tipos de operadores
        const typesData = await OperatorTypesService.getOperatorTypes();
        setOperatorTypes(typesData.map(type => ({
          id: type.id,
          name: type.name
        })));
        
        // IMPORTANTE: FORZAR LIMPIEZA DE LOCALSTORAGE para evitar interferencia con URLs persistentes
        localStorage.removeItem('lastUploadedImage');
        
        // También limpiar estados relacionados con la foto al abrir
        setPhoto(null);
        setPhotoPreview(null);
        setSelectedImage(null);
        setUploadedPhotoUrl(null);
        
        // Limpiar el input de archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Obtener detalles completos del operador para cargar todos los datos
        const operatorDetails = await OperatorsService.getOperator(operator.operatorId);
        console.log('🔍 Detalles del operador para edición:', operatorDetails);
        
        // Verificar todas las posibles propiedades donde podría estar el ID del tipo de operador
        const typeOperatorId = operatorDetails.type_operator_id || 
                              operatorDetails.type_operator_id || // Duplicado en lugar de typeOperatorId
                              null;
        
        if (typeOperatorId) {
          console.log('✅ Tipo de operador encontrado para el formulario:', typeOperatorId);
          form.setValue('type_operator_id', typeOperatorId);
          
          // Buscar el nombre del tipo de operador
          const typeOperator = typesData.find(type => type.id === typeOperatorId);
          if (typeOperator) {
            setCurrentOperatorType(typeOperator.name);
            console.log('🏷️ Nombre del tipo de operador encontrado:', typeOperator.name);
          }
        }else {
          console.log('⚠️ No se encontró tipo de operador para el operador:', operator.operatorId);
        }
        
        // Asegurarse de que el branch_id esté establecido
        if (operatorDetails.branchReference) {
          form.setValue('branch_id', operatorDetails.branchReference);
        }
        
        // Verificar y establecer el rol correctamente
        console.log('👑 Rol desde API:', operatorDetails.role);
        
        if (operatorDetails.role) {
        const mappedRole = mapRoleToForm(operatorDetails.role);
          console.log('🔄 Rol mapeado para el formulario:', mappedRole);
          console.log('✅ Estableciendo rol en el formulario a:', mappedRole);
        form.setValue('role', mappedRole);
        
          // Verificar inmediatamente que se haya establecido
          setTimeout(() => {
            const currentRoleValue = form.getValues('role');
            console.log('👀 Valor actual del campo role:', currentRoleValue);
          }, 0);
        } else {
          console.warn('⚠️ No se encontró un rol definido para el operador');
          form.setValue('role', 'Operator'); // Valor por defecto
        }
        
        // Cargar datos personales adicionales si existen
        if (operatorDetails.birth_date) {
          form.setValue('birth_date', new Date(operatorDetails.birth_date));
        }
        
        if (operatorDetails.address) {
          form.setValue('address', operatorDetails.address);
        }
        
        if (operatorDetails.personal_id) {
          form.setValue('identification_number', operatorDetails.personal_id);
        }
        
        // Cargar datos del contacto de emergencia
        const emergencyContact = operatorDetails.emergency_contact;
        console.log('🆘 Contacto de emergencia encontrado:', emergencyContact);
        
        if (emergencyContact) {
          if (emergencyContact.name) {
            form.setValue('emergency_contact_name', emergencyContact.name);
          }
          
          if (emergencyContact.phone) {
            form.setValue('emergency_contact_phone', emergencyContact.phone);
          }
          
          if (emergencyContact.relationship) {
            form.setValue('emergency_contact_relationship', emergencyContact.relationship);
          }
          
          if (emergencyContact.address) {
            form.setValue('emergency_contact_address', emergencyContact.address);
          }
        }
        
        // CRÍTICO: Capturar exactamente la URL de la foto desde el backend
        console.log('📸 Foto recibida del backend (sin modificar):', operatorDetails.photo);
        
        // Si hay foto, establecer la vista previa y guardar el original exactamente como viene de la API
        if (operatorDetails.photo) {
          // Guardar la URL exacta como la recibimos del backend sin transformarla
          setOriginalPhoto(operatorDetails.photo);
          
          // IMPORTANTE: Usar getPhotoDisplayUrl para obtener inmediatamente la URL firmada para visualización
          const signedPhotoUrl = getPhotoDisplayUrl(operatorDetails.photo, operatorDetails.operatorId || operator.operatorId);
          setImagePreview(signedPhotoUrl);
          
          console.log('🔒 URL original guardada para referencia:', operatorDetails.photo);
          console.log('🔐 URL firmada para visualización:', signedPhotoUrl);
          
          // Si son diferentes, significa que se recuperó la versión firmada
          if (signedPhotoUrl !== operatorDetails.photo) {
            console.log('✅ Se está utilizando la URL firmada para visualización');
          }
        } else {
          console.log('⚠️ El operador no tiene foto configurada');
          setOriginalPhoto(null);
          setImagePreview(null);
        }
        
        // Diagnosticar formulario después de carga
        console.log('📝 Valores del formulario después de cargar:', form.getValues());
      }catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar datos necesarios");
      }finally {
        setIsDataLoading(false);
      }
    };
    
    if (open) {
      loadData();
    }
  }, [open, operator.operatorId, form]);

  // Actualizar la foto original cuando cambia el operador
  useEffect(() => {
    if (operator?.photo) {
      console.log('📸 Actualizando referencia a foto original por cambio de operador:', operator.photo);
      setOriginalPhoto(operator.photo);
      setImagePreview(operator.photo);
    } else {
      setOriginalPhoto(null);
      setImagePreview(null);
    }
  }, [operator]);

  // Manejar selección de nueva imagen
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("La imagen no debe superar los 5MB.");
      return;
    }

    try {
      setIsUploading(true);

      // Preparar la imagen para su subida posterior en el submit
      setPhoto(file);
      
      // Crear una vista previa local
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      
      // Actualizar la vista previa inmediatamente para UX
      setImagePreview(previewUrl);
      
      // Marcar que se ha seleccionado una nueva imagen
      setSelectedImage("new");
      
      // Limpiar cualquier URL de imagen previamente subida
      setUploadedPhotoUrl(null);
      
      // Limpiar el estado de error de imagen
      setImageError(false);
      
      // No subir la imagen inmediatamente, esperar a que el usuario guarde los cambios
      toast.success("Imagen seleccionada correctamente. Se subirá al guardar los cambios.");
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      toast.error("Error al procesar la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPhotoPreview(null);
    setPhoto(null);
    setUploadedPhotoUrl(null);
    setImageError(false); // Resetear el estado de error de imagen
    console.log('🔄 Restaurando exactamente la foto original en resetImage:', originalPhoto);
    
    // Obtener la URL firmada para visualización
    const signedPhotoUrl = originalPhoto ? getPhotoDisplayUrl(originalPhoto, operator.operatorId) : null;
    
    // Establecer la imagen de vista previa con la URL firmada
    setImagePreview(signedPhotoUrl);
    
    if (signedPhotoUrl && originalPhoto && signedPhotoUrl !== originalPhoto) {
      console.log('✅ Recuperada URL original con firma para reseteo');
    }
    
    // También limpiar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      // Preparar datos del operador 
      const updatedOperator: UpdateOperatorDto = {
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        phone: values.phone,
        role: mapRoleToBackend(values.role || ''),
        status: values.status || 'active',
        branch_id: values.branch_id,
        type_operator_id: values.type_operator_id,
      };
      
      // SIEMPRE incluir estos campos críticos, incluso si están vacíos
      
      // Convertir address a string explícitamente
      updatedOperator.address = values.address ? String(values.address) : '';
      console.log('🔍 address preparada:', `[${typeof updatedOperator.address}] "${updatedOperator.address}"`);
      
      // Convertir personal_id a string explícitamente
      updatedOperator.personal_id = values.identification_number ? String(values.identification_number) : '';
      console.log('🔍 personal_id preparado:', `[${typeof updatedOperator.personal_id}] "${updatedOperator.personal_id}"`);
      
      // Formatear birth_date correctamente
      if (values.birth_date) {
        // Convertir fecha a formato YYYY-MM-DD
        updatedOperator.birth_date = format(values.birth_date, "yyyy-MM-dd");
        console.log('🔍 birth_date formateada:', `[${typeof updatedOperator.birth_date}] "${updatedOperator.birth_date}"`);
      } else {
        updatedOperator.birth_date = null;
        console.log('🔍 birth_date es null');
      }
      
      // Preparar emergency_contact
      if (values.emergency_contact_name || values.emergency_contact_phone) {
        updatedOperator.emergency_contact = {
          name: values.emergency_contact_name || '',
          phone: values.emergency_contact_phone || '',
          relationship: values.emergency_contact_relationship || '',
          address: values.emergency_contact_address || ''
        };
        console.log('🔍 emergency_contact preparado:', JSON.stringify(updatedOperator.emergency_contact));
      } else {
        updatedOperator.emergency_contact = null;
        console.log('🔍 emergency_contact es null');
      }
      
      // Log para verificar todos los campos
      console.log('📦 Datos completos a enviar:', updatedOperator);
      
      // SOLUCIÓN OPTIMIZADA: Solo subir y enviar la foto si se ha seleccionado una nueva
      if (photo) {
        console.log('📸 Nueva foto seleccionada, procediendo a subir...');
        try {
          const uploadedUrl = await handleFileUpload();
          if (uploadedUrl) {
            // Procesar la URL para tener tanto la firmada (para mostrar) como la pública (para backend)
            const publicUrl = uploadedUrl.includes('/sign/') 
              ? uploadedUrl.replace('/sign/', '/public/').split('?')[0]
              : uploadedUrl;
              
            console.log('🔄 URL para almacenamiento (sin token):', publicUrl);
            
            // Obtener la URL firmada para visualización
            const signedUrl = getPhotoDisplayUrl(publicUrl, operator.operatorId);
            console.log('🔄 URL para visualización (con token):', signedUrl);
            
            // Enviar la versión publica al backend, ya que sabemos que va a limpiarla
            updatedOperator.photo = publicUrl;
            
            // Usar la versión con firma para mostrar localmente
            setUploadedPhotoUrl(signedUrl);
            setImagePreview(signedUrl);
            
            console.log('✅ Foto nueva procesada - envío: ', updatedOperator.photo);
          } else {
            console.warn('⚠️ No se pudo obtener URL de la nueva foto');
          }
        } catch (uploadError) {
          console.error('❌ Error al subir foto:', uploadError);
          toast.error("No se pudo subir la foto, pero se actualizarán los demás datos");
        }
      } else {
        console.log('ℹ️ No se ha seleccionado nueva foto, omitiendo campo photo completamente');
        // IMPORTANTE: NO incluir el campo photo en la actualización si no hay una nueva foto
        // Esto evita que el backend transforme la URL existente
      }
      
      // Actualizar el operador
      console.log('📤 Enviando actualización al backend...');
      const updatedOperatorResponse = await OperatorsService.updateOperator(operator.operatorId, updatedOperator);
      console.log('✅ Respuesta del backend:', updatedOperatorResponse);
      
      // Si se devolvió una foto, asegurarse de que usamos la URL firmada para mostrarla
      if (updatedOperatorResponse && updatedOperatorResponse.photo) {
        console.log('📊 Foto recibida en respuesta:', updatedOperatorResponse.photo);
        
        // Obtener la URL firmada directamente usando getPhotoDisplayUrl
        const signedUrl = getPhotoDisplayUrl(updatedOperatorResponse.photo, operator.operatorId);
        console.log('📊 URL firmada obtenida para visualización:', signedUrl);
        
        if (signedUrl !== updatedOperatorResponse.photo) {
          console.log('✅ URL firmada aplicada para visualización');
          updatedOperatorResponse.photo = signedUrl;
        }
      }
      
      // Limpiar información de diagnóstico
      localStorage.removeItem('lastUploadedImage');
      
      // Usar el toast desde sonner
      toast.success("Los datos del operador han sido actualizados correctamente.");
      
      // CRÍTICO: Cerrar el diálogo primero para evitar recargas innecesarias
      onOpenChange(false);
      
      // Preparar el operador actualizado con la URL firmada para la foto
      const finalOperator = { 
        ...updatedOperatorResponse 
      };
      
      // Si hay foto, asegurarse de que tenga la URL firmada
      if (finalOperator?.photo) {
        const signedPhotoUrl = getPhotoDisplayUrl(finalOperator.photo, operator.operatorId);
        if (signedPhotoUrl) {
          console.log('📸 Usando URL firmada para la foto en la actualizacion de la tabla');
          finalOperator.photo = signedPhotoUrl;
        }
      }
      
      // Llamar a la función onSave si existe para actualizar solo la tabla de datos
      // sin recargar toda la página
      if (onSave) {
        console.log('📊 Actualizando solo la tabla de datos con la respuesta del backend');
        onSave(finalOperator || operator);
      } else {
        console.log('⚠️ No se proporcionó función onSave, no se puede actualizar la tabla sin recargar');
      }
      
    } catch (error) {
      console.error('❌ Error al actualizar operador:', error);
      toast.error("Ocurrió un error al actualizar los datos del operador.");
      
      // En caso de error, restaurar la foto original
      console.log('🔄 Restaurando foto original tras error:', originalPhoto);
      
      // Verificar si la foto es una URL de Supabase
      const isSupabaseUrl = originalPhoto && isSupabaseStorageUrl(originalPhoto);
      
      // Obtener la URL firmada para visualización
      let photoUrlForDisplay = originalPhoto;
      if (isSupabaseUrl && originalPhoto) {
        // Usar getPhotoDisplayUrl para obtener la URL firmada
        const signedUrl = getPhotoDisplayUrl(originalPhoto, operator.operatorId);
        console.log('✅ URL firmada recuperada tras error:', signedUrl);
        photoUrlForDisplay = signedUrl || originalPhoto;
        
        // Si son diferentes, significa que se recuperó la versión firmada
        if (photoUrlForDisplay !== originalPhoto) {
          console.log('✅ Recuperada URL original con firma tras error');
        }
      }
      
      // Establecer la imagen de vista previa
      setImagePreview(photoUrlForDisplay);
      setImageError(false); // Resetear el estado de error de imagen
    } finally {
        setIsLoading(false);
    }
  };

  // Capturar la foto original al abrir el diálogo
  useEffect(() => {
    if (open) {
      // CRÍTICO: Limpiar localStorage cada vez que se abre el diálogo para evitar URLs incorrectas
      localStorage.removeItem('lastUploadedImage');
      
      // Guardar inmediatamente la foto original del operador
      console.log('📸 Foto recibida del backend (sin modificar):', operator.photo);
      
      // Asegurar que estamos utilizando la foto exacta que viene del operador sin manipulación
      const exactPhotoUrl = operator.photo;
      setOriginalPhoto(exactPhotoUrl || null);
      
      // Usar directamente getPhotoDisplayUrl para obtener la URL firmada para visualización
      const signedPhotoUrl = operator.photo ? getPhotoDisplayUrl(operator.photo, operator.operatorId) : null;
      
      // Establecer la imagen de vista previa con la URL firmada
      setImagePreview(signedPhotoUrl);
      console.log('🔒 URL original guardada para referencia:', exactPhotoUrl);
      console.log('📸 URL de visualización para la foto (con firma):', signedPhotoUrl);
      
      // Si son diferentes, significa que se recuperó la versión firmada
      if (signedPhotoUrl && exactPhotoUrl && signedPhotoUrl !== exactPhotoUrl) {
        console.log('✅ Recuperada URL original con firma para visualización');
      }
      
      // Resetear todos los estados de imágenes
      setPhotoPreview(null);
      setPhoto(null);
      setSelectedImage(null);
      setUploadedPhotoUrl(null);
      setImageError(false); // Resetear el estado de error de imagen
      
      // Resetear el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, operator.photo, operator.operatorId]);

  // Función para resetear el formulario y cerrar el diálogo
  const handleCancel = () => {
    console.log('🚫 Cancelando edición y cerrando diálogo sin guardar cambios');
    
    // Resetear estados relacionados con imágenes
    setPhoto(null);
    setPhotoPreview(null);
    setSelectedImage(null);
    setUploadedPhotoUrl(null);
    setImageError(false); // Resetear el estado de error de imagen
    
    // Obtener la URL firmada para visualización
    const signedPhotoUrl = originalPhoto ? getPhotoDisplayUrl(originalPhoto, operator.operatorId) : null;
    
    // Establecer la imagen de vista previa con la URL firmada
    setImagePreview(signedPhotoUrl);
    
    if (signedPhotoUrl && originalPhoto && signedPhotoUrl !== originalPhoto) {
      console.log('✅ Recuperada URL original con firma para cancelación');
    }
    
    // Resetear el formulario
    form.reset();
    
    // Resetear el paso a 1
    setCurrentStep(1);
    
    // Limpiar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Cerrar el diálogo
    onOpenChange(false);
  };

  // Manejar el cierre del diálogo para restaurar estados
  const handleCloseDialog = (isOpen: boolean) => {
    // Si se está cerrando el diálogo
    if (!isOpen) {
      console.log('🧼 Limpiando estados al cerrar diálogo sin ejecutar actualizaciones');
      
      // Limpiar elementos relacionados con la subida de imágenes
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Resetear todos los estados relacionados con imágenes
      setPhoto(null);
      setPhotoPreview(null);
      setSelectedImage(null);
      setUploadedPhotoUrl(null);
      setImageError(false); // Resetear el estado de error de imagen
      
      // Obtener la URL firmada para visualización
      const signedPhotoUrl = originalPhoto ? getPhotoDisplayUrl(originalPhoto, operator.operatorId) : null;
      
      // Establecer la imagen de vista previa con la URL firmada
      setImagePreview(signedPhotoUrl);
      
      if (signedPhotoUrl && originalPhoto && signedPhotoUrl !== originalPhoto) {
        console.log('✅ Recuperada URL original con firma para cierre');
      }
      
      // Resetear el formulario a los valores iniciales
      form.reset({
        id: operator.operatorId,
        first_name: operator.firstName || "",
        last_name: operator.lastName || "",
        email: operator.email || "",
        phone: operator.phone || "",
        dni: operator.personal_id || "",
        address: operator.address || "",
        branch_id: operator.branchReference || "",
        type_operator_id: operator.type_operator_id || "",
        identification_number: operator.personal_id || "",
        birth_date: operator.birth_date ? new Date(operator.birth_date) : null,
        emergency_contact_name: operator.emergency_contact?.name || "",
        emergency_contact_phone: operator.emergency_contact?.phone || "",
        emergency_contact_relationship: operator.emergency_contact?.relationship || "",
        emergency_contact_address: operator.emergency_contact?.address || "",
        photo: null,
        role: operator.role ? mapRoleToForm(operator.role) : "Operator",
        status: operator.status || "active",
      });
      
      // Resetear el paso a 1
      setCurrentStep(1);
    }
    
    // Llamar al handler original
    onOpenChange(isOpen);
  };

  const handleFileUpload = async () => {
    if (!photo) return null;
    
    try {
      console.log('🔄 Intentando subir la nueva foto con Supabase...');
      
      // Crear nombre de archivo único para evitar conflictos
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `operators/${fileName}`;
      
      // Crear cliente de Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      // Importar el cliente directamente desde la biblioteca
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Subir el archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('workexpressimagedata')
        .upload(filePath, photo, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error al subir con Supabase:', error);
        // Si falla Supabase, intentar con la API
        console.log('⚠️ Fallback: Intentando subir con endpoint API...');
        return await uploadWithAPI();
      }
      
      // Obtener URL firmada para mayor duración (1 año)
      const { data: signedUrlData } = await supabase.storage
        .from('workexpressimagedata')
        .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 año
      
      // Si tenemos URL firmada, guardarla para diagnóstico y usarla directamente
      if (signedUrlData?.signedUrl) {
        console.log('✅ Foto subida con URL firmada (con token):', signedUrlData.signedUrl);
        
        // Guardar información para diagnóstico
        localStorage.setItem('lastUploadedImage', JSON.stringify({
          path: filePath,
          signedUrl: signedUrlData.signedUrl,
          uploadedAt: new Date().toISOString()
        }));
        
        // IMPORTANTE: Guardar ambas versiones (firmada y pública) en localStorage
        // para poder recuperarlas después
        processPhotoUrl(signedUrlData.signedUrl, operator.operatorId);
        
        // Devolver la URL firmada para uso inmediato en la UI
        return signedUrlData.signedUrl;
      }
      
      // Fallback a URL pública si no se pudo obtener firmada
      const { data: publicUrlData } = supabase.storage
        .from('workexpressimagedata')
        .getPublicUrl(filePath);
        
      console.log('✅ Foto subida con URL pública:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('❌ Error al subir con Supabase:', error);
      // Si falla por cualquier razón, intentar con la API
      return await uploadWithAPI();
    }
  };
  
  // Función auxiliar para subir usando la API
  const uploadWithAPI = async () => {
    try {
      if (!photo) return null;
      
      console.log('🔄 Subiendo foto con API...');
      
      // Crear FormData para envío
      const formData = new FormData();
      formData.append('file', photo);
      
      // Enviar al endpoint de subida
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error en subida API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.url) {
        throw new Error('La respuesta de la API no incluye URL');
      }
      
      console.log('✅ Imagen subida exitosamente a través de API:', data.url);
      return data.url;
    } catch (error) {
      console.error('❌ Error al subir la imagen con API:', error);
      toast.error("No se pudo subir la imagen a través de la API");
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent 
        className="sm:max-w-[700px] p-0 bg-white dark:bg-gray-900 shadow-xl"
        tabIndex={0}
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            e.preventDefault();
            handleCancel();
          }
        }}
        style={{ 
          overflow: 'visible',
          zIndex: 100
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${roleColors["Operator"]} shadow-sm`}>
              <PersonIcon className="h-5 w-5 text-white" />
            </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Editar Operador
          </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 mt-0.5">
                  {operator.firstName} {operator.lastName}
          </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-start gap-2">
                {operator?.role && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {operator.role}
                  </Badge>
                )}
                
                {operator?.status && (
                  <Badge variant="outline" className={`${getStatusColor(operator.status)} border-${getStatusColor(operator.status)}/20`}>
                    {operator.status}
                  </Badge>
                )}
              </div>
              
              {/* Botón para cerrar el diálogo */}
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
                  onClick={handleCancel}
                >
                  <Cross2Icon className="h-4 w-4" />
                  <span className="sr-only">Cerrar</span>
                </Button>
              </DialogClose>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4">
            <div className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-${themeColor}-500`} 
                style={{ width: currentStep === 1 ? "50%" : "100%" }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Paso {currentStep} de 2
            </span>
          </div>
        </DialogHeader>
        
        {isDataLoading ? (
          <div className="py-12 px-6">
            <div className="space-y-6">
              <div className="flex justify-center items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                    {/* Visualizador de imagen y cargador */}
                    <div className="flex flex-col items-center space-y-3 py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="relative">
                        <Avatar className="h-28 w-28 border-2 border-white dark:border-gray-700 shadow-sm">
                          {imagePreview && !imageError ? (
                            <AvatarImage 
                              src={imagePreview} 
                              alt={`${form.getValues().first_name} ${form.getValues().last_name}`} 
                              className="object-cover"
                              onError={(e) => {
                                console.log(`❌ Error cargando imagen: ${imagePreview}`);
                                
                                // Intentar recuperar con URL firmada si es posible
                                if (originalPhoto) {
                                  const signedUrl = getPhotoDisplayUrl(originalPhoto, operator.operatorId);
                                  if (signedUrl && signedUrl !== imagePreview) {
                                    console.log('🔄 Intentando recuperar con URL firmada alternativa:', signedUrl);
                                    setImagePreview(signedUrl);
                                    e.currentTarget.src = signedUrl;
                                    return;
                                  }
                                }
                                
                                // Si no se pudo recuperar, mostrar fallback
                                setImageError(true);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-2xl font-medium">
                              {form.getValues().first_name?.charAt(0) || ''}{form.getValues().last_name?.charAt(0) || ''}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                      
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Foto de perfil
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Tamaño máximo: 5MB (JPG, PNG)
                        </div>
                      </div>
                      
                      {selectedImage && (
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            Nueva imagen seleccionada
                          </span>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={resetImage}
                          >
                            <Cross2Icon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <PersonIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            Nombre
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre" {...field} className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <PersonIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            Apellido
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Apellido" {...field} className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <EnvelopeClosedIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          Correo electrónico
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="correo@ejemplo.com" {...field} className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <MobileIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          Teléfono
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="+507 6123-4567" {...field} className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                      <IdCardIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      Información del sistema
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <IdCardIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            Rol
                          </FormLabel>
                            {field.value === "Programador" && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium">
                              ⚠️ Este operador tiene un rol especial (Programador). Cambiar el rol podría afectar sus permisos.
                            </div>
                          )}
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                              value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                  <SelectValue placeholder="Seleccionar rol">
                                    {!field.value && "Seleccionar rol"}
                                    {field.value === "Admin" && "Administrador (admin)"}
                                    {field.value === "Manager" && "Gerente (manager)"}
                                    {field.value === "Branch_Manager" && "Gerente de Sucursal"}
                                    {field.value === "Operator" && "Operador (staff)"}
                                    {field.value === "Programador" && "Programador"}
                                  </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent 
                              className="dark:bg-gray-800 dark:border-gray-700 z-[1000]" 
                              align="center" 
                              position="popper" 
                              side="bottom" 
                              sideOffset={5}
                              avoidCollisions={false}
                            >
                                <SelectItem value="Admin" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
                                    Administrador (admin)
                                  </div>
                                </SelectItem>
                                <SelectItem value="Manager" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 mr-2"></div>
                                    Gerente (manager)
                                  </div>
                                </SelectItem>
                                <SelectItem value="Branch_Manager" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-amber-600 mr-2"></div>
                                    Gerente de Sucursal
                                  </div>
                                </SelectItem>
                                <SelectItem value="Operator" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-emerald-600 mr-2"></div>
                                    Operador (staff)
                                  </div>
                                </SelectItem>
                                <SelectItem value="Programador" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-rose-600 mr-2"></div>
                                    Programador
                                  </div>
                                </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <InfoCircledIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            Estado
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                              value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                  <SelectValue placeholder="Seleccionar estado">
                                    {!field.value && "Seleccionar estado"}
                                    {field.value === "active" && (
                                      <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                        Activo
                                      </div>
                                    )}
                                    {field.value === "inactive" && (
                                      <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-gray-500 mr-2"></div>
                                        Inactivo
                                      </div>
                                    )}
                                    {field.value === "suspended" && (
                                      <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                                        Suspendido
                                      </div>
                                    )}
                                  </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent 
                              className="dark:bg-gray-800 dark:border-gray-700 z-[1000]" 
                              align="center" 
                              position="popper" 
                              side="bottom" 
                              sideOffset={5}
                              avoidCollisions={false}
                            >
                                <SelectItem value="active" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                    Activo
                                  </div>
                                </SelectItem>
                                <SelectItem value="inactive" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-gray-500 mr-2"></div>
                                    Inactivo
                                  </div>
                                </SelectItem>
                                <SelectItem value="suspended" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                                    Suspendido
                                  </div>
                                </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                      className="border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setCurrentStep(2)}
                      className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 dark:bg-${themeColor}-700 dark:hover:bg-${themeColor}-800 gap-1.5`}
                    >
                      Siguiente
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Sección de organización y tipo */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                      <IdCardIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      Organización
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField
                      control={form.control}
                      name="branch_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <HomeIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            Sucursal
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                <SelectValue placeholder="Seleccionar sucursal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent 
                              className="dark:bg-gray-800 dark:border-gray-700 z-[1000]" 
                              align="center" 
                              position="popper" 
                              side="bottom" 
                              sideOffset={5}
                              avoidCollisions={false}
                            >
                              {branches.map((branch) => (
                                  <SelectItem key={branch.id} value={branch.id} className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type_operator_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <IdCardIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            Tipo de operador
                          </FormLabel>
                            <div className="relative">
                              {currentOperatorType && (
                                <div className="absolute right-0 -top-5 z-10">
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                                    Actual: {currentOperatorType}
                                  </span>
                                </div>
                              )}
                          <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const selectedType = operatorTypes.find(type => type.id === value);
                                  if (selectedType) {
                                    setCurrentOperatorType(selectedType.name);
                                  }
                                }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent 
                              className="dark:bg-gray-800 dark:border-gray-700 z-[1000]" 
                              align="center" 
                              position="popper" 
                              side="bottom" 
                              sideOffset={5}
                              avoidCollisions={false}
                            >
                              {operatorTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id} className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                            </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                  </div>
                  
                  {/* Sección de datos personales adicionales */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                      <PersonIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      Datos personales adicionales
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <FormField
                        control={form.control}
                        name="identification_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <IdCardIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              Cédula
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="0-000-0000" 
                                {...field}
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <CalendarIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              Fecha de nacimiento
                            </FormLabel>
                            <div>
                              <Button 
                                type="button"
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${!field.value && "text-gray-500 dark:text-gray-400"}`}
                                onClick={() => setCalendarOpen(true)}
                              >
                                {field.value ? (
                                  format(field.value, "dd MMMM yyyy", { locale: es })
                                ) : (
                                  <span>Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                              
                              {calendarOpen && (
                                <div 
                                  className="fixed inset-0 flex items-center justify-center z-[9999]"
                                  onClick={() => setCalendarOpen(false)}
                                >
                                  <div 
                                    className="absolute p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <h3 className="text-sm font-medium">Seleccionar fecha</h3>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full"
                                        onClick={() => setCalendarOpen(false)}
                                      >
                                        <Cross2Icon className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 mb-2">
                                      <div className="flex gap-2 w-full">
                                        <div className="flex-1">
                                          <Select
                                            value={field.value ? (new Date(field.value).getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()}
                                            onValueChange={(value) => {
                                              const newDate = field.value ? new Date(field.value) : new Date();
                                              newDate.setMonth(parseInt(value) - 1);
                                              field.onChange(newDate);
                                            }}
                                          >
                                            <SelectTrigger className="h-9 bg-gray-50/50 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg">
                                              <SelectValue placeholder="Mes" />
                                            </SelectTrigger>
                                            <SelectContent 
                                              className="dark:bg-gray-800 dark:border-gray-700 z-[9999]"
                                              align="center" 
                                              position="popper" 
                                              side="bottom" 
                                              sideOffset={5}
                                              avoidCollisions={false}
                                            >
                                              <SelectItem value="1">Enero</SelectItem>
                                              <SelectItem value="2">Febrero</SelectItem>
                                              <SelectItem value="3">Marzo</SelectItem>
                                              <SelectItem value="4">Abril</SelectItem>
                                              <SelectItem value="5">Mayo</SelectItem>
                                              <SelectItem value="6">Junio</SelectItem>
                                              <SelectItem value="7">Julio</SelectItem>
                                              <SelectItem value="8">Agosto</SelectItem>
                                              <SelectItem value="9">Septiembre</SelectItem>
                                              <SelectItem value="10">Octubre</SelectItem>
                                              <SelectItem value="11">Noviembre</SelectItem>
                                              <SelectItem value="12">Diciembre</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex-1">
                                          <Select
                                            value={field.value ? new Date(field.value).getFullYear().toString() : new Date().getFullYear().toString()}
                                            onValueChange={(value) => {
                                              const newDate = field.value ? new Date(field.value) : new Date();
                                              newDate.setFullYear(parseInt(value));
                                              field.onChange(newDate);
                                            }}
                                          >
                                            <SelectTrigger className="h-9 bg-gray-50/50 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg">
                                              <SelectValue placeholder="Año" />
                                            </SelectTrigger>
                                            <SelectContent 
                                              className="dark:bg-gray-800 dark:border-gray-700 z-[9999] max-h-[240px]"
                                              align="center" 
                                              position="popper" 
                                              side="bottom" 
                                              sideOffset={5}
                                              avoidCollisions={false}
                                            >
                                              {Array.from({ length: (new Date().getFullYear() - 1940) + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                  {year}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Calendar
                                      mode="single"
                                      selected={field.value || undefined}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setCalendarOpen(false);
                                      }}
                                      disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                      }
                                      month={field.value ? new Date(field.value) : undefined}
                                      onMonthChange={(month) => {
                                        // Actualiza el mes seleccionado en el Select
                                        const newDate = field.value ? new Date(field.value) : new Date();
                                        newDate.setMonth(month.getMonth());
                                        newDate.setFullYear(month.getFullYear());
                                        if (!field.value) field.onChange(newDate);
                                      }}
                                      initialFocus
                                      locale={es}
                                      className="rounded-md border shadow"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <HomeIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            Dirección
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Dirección completa del operador" 
                              {...field}
                              className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 min-h-[80px]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Sección de contacto de emergencia */}
                  <div className="bg-gray-50/70 dark:bg-gray-800/30 rounded-lg p-4 border-l-4 border-red-400 dark:border-red-600 border-t border-r border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                      Contacto de emergencia
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <FormField
                        control={form.control}
                        name="emergency_contact_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <PersonIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              Nombre
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nombre del contacto" 
                                {...field}
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emergency_contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <MobileIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              Teléfono
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+507 6123-4567" 
                                {...field}
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emergency_contact_relationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <PersonIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              Relación
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Esposo/a, Padre, Madre, etc." 
                                {...field}
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="emergency_contact_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <HomeIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              Dirección del contacto
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Dirección del contacto de emergencia" 
                                {...field}
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 min-h-[80px]" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                        onClick={handleCancel}
                      className="border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep(1)}
                        className="border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Anterior
                      </Button>
                    </div>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 dark:bg-${themeColor}-700 dark:hover:bg-${themeColor}-800 gap-1.5`}
                    >
                      {isLoading ? (
                        <>
                          <ReloadIcon className="mr-1 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="mr-1 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </Form>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

