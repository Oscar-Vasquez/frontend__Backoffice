"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  PlusCircledIcon, 
  ReloadIcon, 
  PersonIcon,
  EnvelopeClosedIcon,
  MobileIcon,
  LockClosedIcon,
  IdCardIcon,
  CheckIcon,
  InfoCircledIcon,
  AvatarIcon,
  StarIcon,
  RocketIcon,
  HomeIcon,
  CalendarIcon,
  CardStackIcon,
  UploadIcon,
  Cross2Icon,
  ImageIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import useThemeSettingsStore from "@/store/themeSettingsStore";
import { OperatorsService, CreateOperatorDto } from "@/app/services/operators.service";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from '@supabase/supabase-js';
import { getCookie } from "cookies-next";
import { useOperators } from "./context/operators-context";

const formSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  photo: z.string().default(""),
  role: z.string().min(1, "Debe seleccionar un rol"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  branchId: z.string().min(1, "Debe seleccionar una sucursal"),
  typeOperatorId: z.string().min(1, "Debe seleccionar un tipo de operador"),
  birthdate: z.date().optional(),
  address: z.string().min(3, "La dirección debe tener al menos 3 caracteres"),
  personal_id: z.string().min(5, "La cédula debe tener al menos 5 caracteres"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  identificationNumber: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
    relationship: z.string().optional(),
    address: z.string().optional()
  }).optional(),
  hire_date: z.date().optional(),
  skills: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const roleColors = {
  Admin: "from-purple-500 to-indigo-500",
  Manager: "from-blue-500 to-cyan-500",
  Branch_Manager: "from-amber-500 to-orange-500",
  Operator: "from-emerald-500 to-teal-500",
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

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * IMPORTANTE: Configuración de Supabase Storage para URLs permanentes
 * 
 * Para asegurar que las URLs de las imágenes sean permanentes, sigue estos pasos:
 * 
 * 1. Ve al panel de Supabase > Storage > Policies
 * 2. Para el bucket 'workexpressimagedata', configura las siguientes políticas:
 * 
 *    a) Política para SELECT (lectura pública):
 *       - Tipo de política: SELECT
 *       - Nombre: "Permitir acceso público de lectura"
 *       - Roles permitidos: public (anon, authenticated)
 *       - Definición de la política: bucket_id = 'workexpressimagedata'
 * 
 *    b) Política para INSERT (subida de archivos):
 *       - Tipo de política: INSERT
 *       - Nombre: "Permitir subida de archivos para usuarios autenticados"
 *       - Roles permitidos: authenticated
 *       - Definición de la política: bucket_id = 'workexpressimagedata'
 * 
 *    c) Política para DELETE (eliminación de archivos):
 *       - Tipo de política: DELETE
 *       - Nombre: "Permitir eliminación de archivos para usuarios autenticados"
 *       - Roles permitidos: authenticated
 *       - Definición de la política: bucket_id = 'workexpressimagedata'
 * 
 * 3. Configuración del bucket:
 *    - Asegúrate de que el bucket 'workexpressimagedata' esté configurado como público
 *    - En la configuración del bucket, habilita "Public bucket" si está disponible
 * 
 * Con esta configuración, las URLs generadas por getPublicUrl() serán permanentes
 * y accesibles sin necesidad de tokens de autenticación o fechas de expiración.
 */

const PhoneInput = ({ 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  name, 
  id,
  className 
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  name: string;
  id: string;
  className?: string;
}) => {
  // Lista de prefijos comunes con sus países
  const prefijos = [
    { valor: "+507", pais: "Panamá" },
    { valor: "+1", pais: "Estados Unidos/Canadá" },
    { valor: "+52", pais: "México" },
    { valor: "+34", pais: "España" },
    { valor: "+57", pais: "Colombia" },
    { valor: "+58", pais: "Venezuela" },
    { valor: "+593", pais: "Ecuador" },
    { valor: "+506", pais: "Costa Rica" },
    { valor: "+503", pais: "El Salvador" },
    { valor: "+502", pais: "Guatemala" },
    { valor: "+504", pais: "Honduras" },
    { valor: "+505", pais: "Nicaragua" },
    { valor: "+51", pais: "Perú" },
    { valor: "+56", pais: "Chile" },
    { valor: "+54", pais: "Argentina" },
    { valor: "+55", pais: "Brasil" },
    { valor: "+591", pais: "Bolivia" },
    { valor: "+595", pais: "Paraguay" },
    { valor: "+598", pais: "Uruguay" },
    { valor: "+44", pais: "Reino Unido" },
    { valor: "+33", pais: "Francia" },
    { valor: "+49", pais: "Alemania" },
    { valor: "+39", pais: "Italia" },
  ];

  // Separar el valor en prefijo y número
  const [prefijo, setPrefijo] = useState("+507");
  const [numero, setNumero] = useState("");
  const { themeColor } = useThemeSettingsStore();

  // Inicializar valores al montar el componente
  useEffect(() => {
    if (value) {
      // Si ya tiene un prefijo, extraerlo
      const match = value.match(/^(\+\d+)\s*(.*)$/);
      if (match) {
        const [_, extractedPrefix, extractedNumber] = match;
        // Comprobar si el prefijo está en nuestra lista
        if (prefijos.some(p => p.valor === extractedPrefix)) {
          setPrefijo(extractedPrefix);
          setNumero(extractedNumber);
        } else {
          // Si no está en la lista, mantener +507 y considerar todo como número
          setPrefijo("+507");
          setNumero(value.replace(/^\+507\s*/, ''));
        }
      } else {
        // Si no tiene formato de prefijo, considerar todo como número
        setNumero(value);
      }
    }
  }, [value]);

  // Cuando cambia el prefijo, actualizar el valor completo
  const handlePrefijoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefijo = e.target.value;
    setPrefijo(newPrefijo);
    
    // Formatear el número si es necesario
    let formattedNumber = numero;
    if (numero && !numero.includes('-') && numero.length >= 4) {
      formattedNumber = `${numero.substring(0, 4)}-${numero.substring(4)}`;
    }
    
    onChange(`${newPrefijo} ${formattedNumber}`.trim());
  };

  // Cuando cambia el número, formatear y actualizar el valor completo
  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Eliminar caracteres no numéricos
    let input = e.target.value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    if (input.length > 8) {
      input = input.substring(0, 8);
    }
    
    // Formatear con guión después del cuarto dígito
    let formattedInput = input;
    if (input.length > 4) {
      formattedInput = `${input.substring(0, 4)}-${input.substring(4)}`;
    }
    
    setNumero(formattedInput);
    onChange(`${prefijo} ${formattedInput}`.trim());
  };

  return (
    <div className="relative flex items-center rounded-xl overflow-hidden">
      <MobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
      
      <select
        value={prefijo}
        onChange={handlePrefijoChange}
        className={`h-10 pl-9 pr-1 w-[85px] bg-gray-50/50 border border-r-0 border-gray-200 rounded-l-xl text-xs font-medium focus:outline-none focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300`}
        aria-label="Prefijo telefónico"
      >
        {prefijos.map((p) => (
          <option key={p.valor} value={p.valor} title={p.pais}>
            {p.valor}
          </option>
        ))}
      </select>
      
      <input
        type="text"
        value={numero}
        onChange={handleNumeroChange}
        onBlur={onBlur}
        placeholder={placeholder || "xxxx-xxxx"}
        name={name}
        id={id}
        className={`h-10 pl-3 flex-1 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-r-xl text-sm ${className}`}
      />
    </div>
  );
};

export default function CreateOperatorDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [operatorTypes, setOperatorTypes] = useState<OperatorType[]>([]);
  const [hireDateOpen, setHireDateOpen] = useState(false);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "Administrador", 
    "Gerente", 
    "Gerente De Sucursal", 
    "Operador", 
    "Contador", 
    "Programador", 
    "Invitado"
  ]);
  const [error, setError] = useState<string | null>(null);
  const { themeColor } = useThemeSettingsStore();
  // Acceder al contexto de operadores
  const { createOperator } = useOperators();
  
  // Estados para manejar la foto
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photo: "",
      role: "",
      status: "active",
      branchId: "",
      typeOperatorId: "",
      address: "",
      personal_id: "",
      gender: "prefer_not_to_say",
      identificationNumber: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
        address: ""
      },
      hire_date: undefined,
      skills: [],
      notes: "",
    },
  });

  // Cargar sucursales y tipos de operador al abrir el diálogo
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      setError(null);
      
      // Función para cargar datos del backend
      const loadData = async () => {
        try {
          // Cargar sucursales desde la API
          const branchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/branches`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${getCookie('workexpress_token')}`
            },
            credentials: 'include'
          });
          
          if (!branchesResponse.ok) {
            throw new Error(`Error al cargar sucursales: ${branchesResponse.status}`);
          }
          
          const branchesData = await branchesResponse.json();
          const mappedBranches = Array.isArray(branchesData) 
            ? branchesData.map(branch => ({ 
                id: branch.id || branch.branch_id || branch.branchId, 
                name: branch.name || branch.branch_name || branch.branchName 
              }))
            : [];
          
          // Cargar tipos de operador desde la API
          const typesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/operator-types`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${getCookie('workexpress_token')}`
            },
            credentials: 'include'
          });
          
          if (!typesResponse.ok) {
            throw new Error(`Error al cargar tipos de operador: ${typesResponse.status}`);
          }
          
          const typesData = await typesResponse.json();
          const mappedTypes = Array.isArray(typesData) 
            ? typesData.map(type => ({ 
                id: type.id || type.type_id || type.typeId, 
                name: type.name || type.type_name || type.typeName 
              }))
            : [];
          
          // Cargar roles desde la API
          const rolesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/roles`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${getCookie('workexpress_token')}`
            },
            credentials: 'include'
          });
          
          if (rolesResponse.ok) {
            const rolesData = await rolesResponse.json();
            if (Array.isArray(rolesData) && rolesData.length > 0) {
              const mappedRoles = rolesData.map((role: any) => role.name || role.role_name || role);
              setAvailableRoles(mappedRoles);
            }
          }
          
          setBranches(mappedBranches);
          setOperatorTypes(mappedTypes);
          
          console.log('✅ Datos cargados correctamente:', { 
            branches: mappedBranches, 
            types: mappedTypes,
            roles: availableRoles
          });
        } catch (err) {
          console.error('❌ Error al cargar datos:', err);
          setError('Error al cargar datos. Por favor, intente nuevamente.');
          
          // Cargar datos de respaldo en caso de error
          setBranches([
            { id: "1", name: "Sucursal Principal" },
            { id: "2", name: "Sucursal Norte" },
            { id: "3", name: "Sucursal Sur" },
          ]);
          
          setOperatorTypes([
            { id: "1", name: "Tiempo Completo" },
            { id: "2", name: "Medio Tiempo" },
            { id: "3", name: "Contratista" },
          ]);
        } finally {
          setLoadingData(false);
        }
      };
      
      loadData();
    }
  }, [open]);

  const watchRole = form.watch("role");
  const watchBranchId = form.watch("branchId");
  const watchTypeOperatorId = form.watch("typeOperatorId");

  // Obtener nombres de sucursal y tipo de operador seleccionados
  const selectedBranch = branches.find(branch => branch.id === watchBranchId)?.name || "";
  const selectedType = operatorTypes.find(type => type.id === watchTypeOperatorId)?.name || "";

  // Función para manejar la carga de archivos
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `operators/${fileName}`;

      // Intentar crear el bucket si no existe
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('workexpressimagedata');
        
        if (bucketError && bucketError.message.includes('not found')) {
          // El bucket no existe, intentar crearlo
          const { error: createBucketError } = await supabase.storage.createBucket('workexpressimagedata', {
            public: false,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 5 * 1024 * 1024, // 5MB
          });
          
          if (createBucketError) {
            throw new Error(`Error al crear el bucket: ${createBucketError.message}`);
          }
        } else if (bucketError) {
          throw new Error(`Error al verificar el bucket: ${bucketError.message}`);
        }
      } catch (bucketCheckError) {
        console.error('Error al verificar/crear el bucket:', bucketCheckError);
        // Continuamos de todos modos, ya que el error podría ser por permisos
      }

      // Subir el archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('workexpressimagedata')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw new Error(`Error al subir la imagen: ${error.message}`);
      }

      // Obtener la URL pública del archivo
      const { data: publicUrlData } = supabase.storage
        .from('workexpressimagedata')
        .getPublicUrl(filePath);

      // Obtener una URL firmada con expiración larga (1 año)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('workexpressimagedata')
        .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 año en segundos

      if (signedUrlError) {
        console.error('Error al generar URL firmada:', signedUrlError);
      }

      // Guardar información para diagnóstico
      const diagnosticInfo = {
        path: filePath,
        publicUrl: publicUrlData.publicUrl,
        signedUrl: signedUrlData?.signedUrl || null,
        uploadedAt: new Date().toISOString()
      };
      
      localStorage.setItem('lastUploadedImage', JSON.stringify(diagnosticInfo));

      // Crear una URL para previsualización
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      
      // Actualizar el formulario con la URL firmada (preferida) o pública
      const photoUrl = signedUrlData?.signedUrl || publicUrlData.publicUrl;
      form.setValue('photo', photoUrl);

      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      toast.error(error instanceof Error ? error.message : "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Función para eliminar la foto
  const handleRemovePhoto = async () => {
    try {
      // Obtener la URL de la foto actual
      const photoUrl = form.getValues('photo');
      
      // Verificar si hay una foto para eliminar
      if (!photoUrl) {
        if (photoPreview) {
          URL.revokeObjectURL(photoPreview);
          setPhotoPreview(null);
        }
        return;
      }
      
      // Intentar obtener la ruta del archivo desde localStorage
      let filePath = null;
      const lastUploadedImageStr = localStorage.getItem('lastUploadedImage');
      
      if (lastUploadedImageStr) {
        try {
          const lastUploadedImage = JSON.parse(lastUploadedImageStr);
          
          // Verificar si la URL actual coincide con alguna de las URLs almacenadas
          if (
            photoUrl === lastUploadedImage.signedUrl || 
            photoUrl === lastUploadedImage.publicUrl
          ) {
            filePath = lastUploadedImage.path;
          }
        } catch (e) {
          console.error("Error al parsear datos de localStorage:", e);
        }
      }
      
      // Si no se encontró en localStorage, intentar extraer la ruta de la URL
      if (!filePath) {
        // Patrones para extraer la ruta del archivo de diferentes tipos de URLs
        const patterns = [
          // Para URLs firmadas (contienen token)
          /\/storage\/v1\/object\/public\/workexpressimagedata\/(.+)\?token/,
          // Para URLs públicas
          /\/storage\/v1\/object\/public\/workexpressimagedata\/(.+)/,
          // Para URLs de bucket público
          /\/storage\/v1\/object\/workexpressimagedata\/(.+)/
        ];
        
        for (const pattern of patterns) {
          const match = photoUrl.match(pattern);
          if (match && match[1]) {
            filePath = decodeURIComponent(match[1]);
            break;
          }
        }
      }
      
      // Si se encontró una ruta de archivo, intentar eliminarla de Supabase
      if (filePath) {
        const { error } = await supabase.storage
          .from('workexpressimagedata')
          .remove([filePath]);
          
        if (error) {
          console.error("Error al eliminar archivo de Supabase:", error);
        } else {
          console.log("Archivo eliminado de Supabase:", filePath);
        }
      } else {
        console.warn("No se pudo determinar la ruta del archivo para eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar la foto:", error);
    } finally {
      // Limpiar la previsualización y el valor del formulario
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
      form.setValue('photo', '');
      
      // Limpiar localStorage
      localStorage.removeItem('lastUploadedImage');
      
      toast.success("Foto eliminada");
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      // Verificar que se hayan seleccionado los campos requeridos
      if (!data.branchId) {
        toast.error("Por favor, selecciona una sucursal");
        return;
      }

      if (!data.typeOperatorId) {
        toast.error("Por favor, selecciona un tipo de operador");
        return;
      }

      // Obtener la URL de la última imagen subida (preferir la URL firmada si está disponible)
      let photoUrl = data.photo;
      const lastUploadedImageStr = localStorage.getItem('lastUploadedImage');
      
      if (lastUploadedImageStr) {
        try {
          const lastUploadedImage = JSON.parse(lastUploadedImageStr);
          // Preferir la URL firmada si está disponible
          photoUrl = lastUploadedImage.signedUrl || lastUploadedImage.publicUrl || data.photo;
        } catch (e) {
          console.error("Error al parsear datos de localStorage:", e);
        }
      }

      // Mapear el rol para el backend según los valores aceptados
      let role = "staff"; // Valor por defecto
      
      if (data.role === "Administrador") {
        role = "admin";
      } else if (data.role === "Gerente") {
        role = "manager";
      } else if (data.role === "Gerente De Sucursal") {
        role = "gerente_de_sucursal";
      } else if (data.role === "Contador") {
        role = "Contador";
      } else if (data.role === "Programador") {
        role = "programador";
      } else if (data.role === "Invitado") {
        role = "guest";
      }

      // Consola para depuración
      console.log("Datos del formulario:", {
        ...data,
        hire_date: data.hire_date ? data.hire_date.toISOString() : undefined, 
        birthdate: data.birthdate ? data.birthdate.toISOString() : undefined
      });

      // Crear objeto con los datos del operador
      const operatorData: CreateOperatorDto = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.firstName.toLowerCase() + data.lastName.toLowerCase().substring(0, 3) + '123',
        phone: data.phone,
        photo: photoUrl || "",
        role: role,
        status: data.status,
        branch_id: data.branchId,
        type_operator_id: data.typeOperatorId,
        address: data.address,
        personal_id: data.personal_id,
        birth_date: data.birthdate ? data.birthdate.toISOString() : undefined,
        hire_date: data.hire_date ? data.hire_date.toISOString() : undefined,
        emergency_contact: data.emergencyContact ? {
          name: data.emergencyContact.name,
          phone: data.emergencyContact.phone,
          relationship: data.emergencyContact.relationship,
          address: data.emergencyContact.address
        } : undefined,
        skills: data.skills,
        notes: data.notes,
      };

      // Enviar los datos al backend utilizando la función del contexto
      // Esta función también actualizará el estado local para reflejar el cambio
      const newOperator = await createOperator(operatorData);
      console.log("✅ Operador creado exitosamente:", newOperator);

      toast.success("Operador creado exitosamente");
      
      // Limpiar localStorage
      localStorage.removeItem('lastUploadedImage');
      
      // Resetear el formulario
      form.reset();
      setPhotoPreview(null);
      
      // Cerrar el diálogo sin recargar la página
      setOpen(false);
    } catch (error) {
      console.error("❌ Error al crear el operador:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear el operador");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    // Validar campos según el paso actual
    let fields: string[] = [];
    
    switch (currentStep) {
      case 1:
        fields = ["firstName", "lastName", "email"];
        break;
      case 2:
        fields = ["phone", "personal_id", "address", "hire_date", "birthdate"];
        break;
      case 3:
        fields = ["branchId", "typeOperatorId", "role", "skills"];
        break;
      case 4:
        fields = ["emergencyContact.name", "emergencyContact.phone"];
        break;
    }
    
    form.trigger(fields as any).then((isValid) => {
      if (isValid && currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    });
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-600 via-lime-500 to-green-500 hover:from-lime-700 hover:via-lime-600 hover:to-green-600';
      case 'sky':
        return 'from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:via-blue-700 hover:to-indigo-700';
      case 'emerald':
        return 'from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700';
      case 'rose':
        return 'from-rose-600 via-pink-600 to-fuchsia-600 hover:from-rose-700 hover:via-pink-700 hover:to-fuchsia-700';
      case 'amber':
        return 'from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700';
      case 'purple':
        return 'from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700';
      case 'slate':
        return 'from-slate-600 via-gray-600 to-zinc-600 hover:from-slate-700 hover:via-gray-700 hover:to-zinc-700';
      case 'stone':
        return 'from-stone-600 via-gray-600 to-neutral-600 hover:from-stone-700 hover:via-gray-700 hover:to-neutral-700';
      case 'neutral':
        return 'from-neutral-600 via-gray-600 to-stone-600 hover:from-neutral-700 hover:via-gray-700 hover:to-stone-700';
      case 'indigo':
      default:
        return 'from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700';
    }
  };

  const getThemeShadow = () => {
    switch (themeColor) {
      case 'lime':
        return 'shadow-lime-600/20';
      case 'sky':
        return 'shadow-sky-600/20';
      case 'emerald':
        return 'shadow-emerald-600/20';
      case 'rose':
        return 'shadow-rose-600/20';
      case 'amber':
        return 'shadow-amber-600/20';
      case 'purple':
        return 'shadow-purple-600/20';
      case 'slate':
        return 'shadow-slate-600/20';
      case 'stone':
        return 'shadow-stone-600/20';
      case 'neutral':
        return 'shadow-neutral-600/20';
      case 'indigo':
      default:
        return 'shadow-indigo-600/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`relative overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-gradient-to-r ${getThemeGradient()} text-white border-0`}
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300" />
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Agregar Operador
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="w-[90%] max-w-5xl p-0 bg-white/95 backdrop-blur-xl border-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] rounded-3xl"
        style={{ 
          overflow: 'visible',
          zIndex: 100
        }}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02] pointer-events-none" />
        
        <div className="grid grid-cols-[1fr,320px]">
          {/* Contenido Principal */}
          <div className="relative p-6">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                  <RocketIcon className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Crear nuevo operador
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-500 text-sm">
                Complete la información para crear un nuevo operador en el sistema
              </DialogDescription>
            </DialogHeader>

            {/* Progress Steps con 4 pasos */}
            <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm mt-6">
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-1">Progreso de registro</div>
                
                <div className="flex items-center">
                  {/* Paso 1: Información básica */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      currentStep >= 1 
                        ? `bg-gradient-to-br ${getThemeGradient()} text-white shadow-md ${getThemeShadow()}` 
                        : 'bg-gray-100 text-gray-400'
                    } transition-all duration-300 z-10`}>
                      {currentStep > 1 ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">1</span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium mt-1 text-center w-16">
                      <span className={currentStep >= 1 ? 'text-gray-700' : 'text-gray-400'}>
                        Datos personales
                      </span>
                    </div>
                  </div>
                  
                  {/* Línea de conexión 1-2 */}
                  <div className={`flex-1 h-0.5 mx-1 ${
                    currentStep > 1 ? `bg-gradient-to-r ${getThemeGradient()}` : 'bg-gray-200'
                  } transition-all duration-300`} />
                  
                  {/* Paso 2: Contacto */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      currentStep >= 2 
                        ? `bg-gradient-to-br ${getThemeGradient()} text-white shadow-md ${getThemeShadow()}` 
                        : 'bg-gray-100 text-gray-400'
                    } transition-all duration-300 z-10`}>
                      {currentStep > 2 ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">2</span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium mt-1 text-center w-16">
                      <span className={currentStep >= 2 ? 'text-gray-700' : 'text-gray-400'}>
                        Contacto
                      </span>
                    </div>
                  </div>
                  
                  {/* Línea de conexión 2-3 */}
                  <div className={`flex-1 h-0.5 mx-1 ${
                    currentStep > 2 ? `bg-gradient-to-r ${getThemeGradient()}` : 'bg-gray-200'
                  } transition-all duration-300`} />
                  
                  {/* Paso 3: Configuración */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      currentStep >= 3 
                        ? `bg-gradient-to-br ${getThemeGradient()} text-white shadow-md ${getThemeShadow()}` 
                        : 'bg-gray-100 text-gray-400'
                    } transition-all duration-300 z-10`}>
                      {currentStep > 3 ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">3</span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium mt-1 text-center w-16">
                      <span className={currentStep >= 3 ? 'text-gray-700' : 'text-gray-400'}>
                        Configuración
                      </span>
                    </div>
                  </div>
                  
                  {/* Línea de conexión 3-4 */}
                  <div className={`flex-1 h-0.5 mx-1 ${
                    currentStep > 3 ? `bg-gradient-to-r ${getThemeGradient()}` : 'bg-gray-200'
                  } transition-all duration-300`} />
                  
                  {/* Paso 4: Contacto de emergencia */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      currentStep >= 4 
                        ? `bg-gradient-to-br ${getThemeGradient()} text-white shadow-md ${getThemeShadow()}` 
                        : 'bg-gray-100 text-gray-400'
                    } transition-all duration-300 z-10`}>
                      {currentStep > 4 ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">4</span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium mt-1 text-center w-16">
                      <span className={currentStep >= 4 ? 'text-gray-700' : 'text-gray-400'}>
                        Emergencia
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${getThemeGradient()} transition-all duration-500 ease-in-out`}
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
                
                {/* Texto de progreso */}
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-500">
                    Paso {currentStep} de 4
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {currentStep === 1 && "25% completado"}
                    {currentStep === 2 && "50% completado"}
                    {currentStep === 3 && "75% completado"}
                    {currentStep === 4 && "100% completado"}
                  </div>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-4">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center mb-4">
                        <FormField
                          control={form.control}
                          name="photo"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-gray-700 font-medium text-sm">Foto del operador</FormLabel>
                              <FormControl>
                                <div className="flex flex-col items-center">
                                  <div className="relative mb-4">
                                    <div className={`w-32 h-32 rounded-xl ${photoPreview ? 'bg-transparent' : 'bg-gradient-to-br from-gray-100 to-gray-50'} border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group`}>
                                      {photoPreview ? (
                                        <img 
                                          src={photoPreview} 
                                          alt="Vista previa" 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                          <span className="text-xs text-gray-500">Seleccione una foto</span>
                                        </div>
                                      )}
                                      
                                      {/* Overlay con botones */}
                                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${photoPreview ? '' : 'hidden'}`}>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="rounded-full w-8 h-8 p-0"
                                          onClick={handleRemovePhoto}
                                        >
                                          <Cross2Icon className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Botón para seleccionar archivo */}
                                    <div className="mt-2 flex justify-center">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={`text-xs border-gray-200 hover:bg-${themeColor}-50 hover:text-${themeColor}-600 hover:border-${themeColor}-200 transition-all duration-200`}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                      >
                                        {isUploading ? (
                                          <>
                                            <ReloadIcon className="mr-1 h-3 w-3 animate-spin" />
                                            Cargando...
                                          </>
                                        ) : (
                                          <>
                                            <UploadIcon className="mr-1 h-3 w-3" />
                                            {photoPreview ? 'Cambiar foto' : 'Subir foto'}
                                          </>
                                        )}
                                      </Button>
                                      <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-center" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium text-sm">Nombre</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="John" 
                                    {...field}
                                    className={`h-10 pl-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  />
                                  <PersonIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-${themeColor}-500 transition-colors duration-200`} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium text-sm">Apellido</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="Doe" 
                                    {...field}
                                    className={`h-10 pl-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  />
                                  <PersonIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-${themeColor}-500 transition-colors duration-200`} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Correo electrónico</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input 
                                  placeholder="john@example.com" 
                                  {...field}
                                  className={`h-10 pl-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                />
                                <EnvelopeClosedIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-${themeColor}-500 transition-colors duration-200`} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal y de Contacto</h2>
                        
                        {/* Teléfono - Campo de ancho completo */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-gray-700 font-medium text-sm">Teléfono</FormLabel>
                              <FormControl>
                                <PhoneInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  id="phone"
                                  placeholder="xxxx-xxxx"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        {/* Cédula - Campo de ancho completo */}
                        <FormField
                          control={form.control}
                          name="personal_id"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-gray-700 font-medium text-sm">Cédula de Identidad</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="x-xxxx-xxxx" 
                                    {...field}
                                    onChange={(e) => {
                                      // Eliminar todos los caracteres no numéricos
                                      let value = e.target.value.replace(/[^0-9]/g, '');
                                      
                                      // Formatear como x-xxxx-xxxx
                                      if (value.length > 0) {
                                        // Primer grupo (provincia/letra)
                                        let formatted = value.substring(0, 1);
                                        
                                        // Añadir primer guión si hay más caracteres
                                        if (value.length > 1) {
                                          formatted += '-';
                                          
                                          // Segundo grupo (libro)
                                          formatted += value.substring(1, Math.min(5, value.length));
                                          
                                          // Añadir segundo guión si hay suficientes caracteres
                                          if (value.length > 5) {
                                            formatted += '-';
                                            
                                            // Tercer grupo (tomo)
                                            formatted += value.substring(5, Math.min(9, value.length));
                                          }
                                        }
                                        
                                        field.onChange(formatted);
                                      } else {
                                        field.onChange(value);
                                      }
                                    }}
                                    className={`h-10 pl-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  />
                                  <IdCardIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-${themeColor}-500 transition-colors duration-200`} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        {/* Direccion */}
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-gray-700 font-medium text-sm">Dirección</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="Dirección completa" 
                                    {...field}
                                    className={`h-10 pl-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  />
                                  <HomeIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-${themeColor}-500 transition-colors duration-200`} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        {/* Fechas en grid layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Fecha de contratación */}
                          <FormField
                            control={form.control}
                            name="hire_date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-gray-700 font-medium text-sm">Fecha de contratación</FormLabel>
                                <div>
                                  <Button 
                                    type="button"
                                    variant="outline"
                                    className={`h-10 pl-10 w-full bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm justify-start text-left font-normal`}
                                    onClick={() => setHireDateOpen(true)}
                                  >
                                    <div className="relative w-full">
                                      <CalendarIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-7 w-4 h-4 text-gray-400" />
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span className="text-gray-400">Seleccionar fecha</span>
                                      )}
                                    </div>
                                  </Button>
                                  
                                  {hireDateOpen && (
                                    <div 
                                      className="fixed inset-0 flex items-center justify-center z-[9999]"
                                      onClick={() => setHireDateOpen(false)}
                                    >
                                      <div 
                                        className="absolute p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <h3 className="text-sm font-medium">Seleccionar fecha de contratación</h3>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => setHireDateOpen(false)}
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
                                                <SelectTrigger className={`h-9 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
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
                                                <SelectTrigger className={`h-9 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
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
                                                  {Array.from({ length: (new Date().getFullYear() - 2000) + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                      {year}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          
                                          <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                              field.onChange(date);
                                              setHireDateOpen(false);
                                            }}
                                            disabled={(date) =>
                                              date > new Date() || date < new Date("2000-01-01")
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
                                    </div>
                                  )}
                                </div>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          {/* Fecha de nacimiento */}
                          <FormField
                            control={form.control}
                            name="birthdate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-gray-700 font-medium text-sm">Fecha de nacimiento</FormLabel>
                                <div>
                                  <Button 
                                    type="button"
                                    variant="outline"
                                    className={`h-10 pl-10 w-full bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm justify-start text-left font-normal`}
                                    onClick={() => setBirthDateOpen(true)}
                                  >
                                    <div className="relative w-full">
                                      <CalendarIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-7 w-4 h-4 text-gray-400" />
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span className="text-gray-400">Seleccionar fecha</span>
                                      )}
                                    </div>
                                  </Button>
                                  
                                  {birthDateOpen && (
                                    <div 
                                      className="fixed inset-0 flex items-center justify-center z-[9999]"
                                      onClick={() => setBirthDateOpen(false)}
                                    >
                                      <div 
                                        className="absolute p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <h3 className="text-sm font-medium">Seleccionar fecha de nacimiento</h3>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => setBirthDateOpen(false)}
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
                                                <SelectTrigger className={`h-9 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
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
                                                <SelectTrigger className={`h-9 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
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
                                          
                                          <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                              field.onChange(date);
                                              setBirthDateOpen(false);
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
                                    </div>
                                  )}
                                </div>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={`h-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
                                  <SelectValue placeholder="Seleccionar rol" />
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
                                {availableRoles.map(role => {
                                  // Determinar el color y la descripción según el rol
                                  let gradientClass = "from-purple-500 to-indigo-500";
                                  let description = "Acceso al sistema";
                                  
                                  if (role === "Administrador") {
                                    gradientClass = "from-purple-500 to-indigo-500";
                                    description = "Acceso completo al sistema";
                                  } else if (role === "Gerente") {
                                    gradientClass = "from-blue-500 to-cyan-500";
                                    description = "Gestión general";
                                  } else if (role === "Gerente De Sucursal") {
                                    gradientClass = "from-amber-500 to-orange-500";
                                    description = "Gestión de sucursal";
                                  } else if (role === "Operador") {
                                    gradientClass = "from-emerald-500 to-teal-500";
                                    description = "Operaciones básicas";
                                  } else if (role === "Contador") {
                                    gradientClass = "from-sky-500 to-blue-500";
                                    description = "Gestión financiera";
                                  } else if (role === "Programador") {
                                    gradientClass = "from-slate-500 to-gray-500";
                                    description = "Desarrollo y soporte";
                                  } else if (role === "Invitado") {
                                    gradientClass = "from-gray-400 to-gray-500";
                                    description = "Acceso limitado";
                                  }
                                  
                                  return (
                                    <SelectItem key={role} value={role} className="focus:bg-purple-50 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass}`}>
                                          <StarIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <div className="font-medium">{role}</div>
                                          <div className="text-xs text-gray-500">{description}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="branchId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium text-sm">Sucursal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className={`h-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
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
                                  {loadingData ? (
                                    <div className="flex items-center justify-center p-4">
                                      <ReloadIcon className="h-4 w-4 animate-spin mr-2" />
                                      <span>Cargando sucursales...</span>
                                    </div>
                                  ) : branches.length > 0 ? (
                                    branches.map(branch => (
                                      <SelectItem key={branch.id} value={branch.id} className="focus:bg-blue-50 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="p-1.5 rounded-md bg-blue-100">
                                            <HomeIcon className="w-3 h-3 text-blue-600" />
                                          </div>
                                          <div className="font-medium">{branch.name}</div>
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-4 text-center text-gray-500">
                                      No hay sucursales disponibles
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="typeOperatorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium text-sm">Tipo de Operador</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className={`h-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
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
                                  {loadingData ? (
                                    <div className="flex items-center justify-center p-4">
                                      <ReloadIcon className="h-4 w-4 animate-spin mr-2" />
                                      <span>Cargando tipos...</span>
                                    </div>
                                  ) : operatorTypes.length > 0 ? (
                                    operatorTypes.map(type => (
                                      <SelectItem key={type.id} value={type.id} className="focus:bg-green-50 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="p-1.5 rounded-md bg-green-100">
                                            <CardStackIcon className="w-3 h-3 text-green-600" />
                                          </div>
                                          <div className="font-medium">{type.name}</div>
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-4 text-center text-gray-500">
                                      No hay tipos disponibles
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Estado de la cuenta</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={`h-10 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl`}>
                                  <SelectValue placeholder="Seleccionar estado" />
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
                                <SelectItem value="active" className="focus:bg-green-50 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">Activo</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="inactive" className="focus:bg-gray-50 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">Inactivo</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="suspended" className="focus:bg-red-50 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">Suspendido</div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      {/* Campo de habilidades (skills) */}
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Habilidades</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea 
                                  placeholder="Ingrese las habilidades separadas por comas (ej: Atención al cliente, Ventas, Informática)" 
                                  className={`min-h-[80px] bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  onChange={(e) => {
                                    // Convertir el texto a un array de strings separados por comas
                                    const skillsArray = e.target.value
                                      .split(',')
                                      .map(skill => skill.trim())
                                      .filter(skill => skill !== '');
                                    field.onChange(skillsArray);
                                  }}
                                  value={field.value ? field.value.join(', ') : ''}
                                />
                              </div>
                            </FormControl>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {field.value && field.value.map((skill, index) => (
                                <div 
                                  key={index} 
                                  className={`text-xs px-2 py-1 rounded-full bg-${themeColor}-50 text-${themeColor}-600 border border-${themeColor}-100 flex items-center gap-1`}
                                >
                                  <span>{skill}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSkills = [...field.value];
                                      newSkills.splice(index, 1);
                                      field.onChange(newSkills);
                                    }}
                                    className={`hover:bg-${themeColor}-100 rounded-full p-0.5`}
                                  >
                                    <Cross2Icon className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                          {error}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-4">Información de contacto para casos de emergencia</div>

                        <FormField
                          control={form.control}
                          name="emergencyContact.name"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-gray-700 font-medium text-sm">Nombre</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="Nombre completo" 
                                    {...field}
                                    className={`h-10 pl-10 bg-white border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  />
                                  <PersonIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-${themeColor}-500 transition-colors duration-200`} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emergencyContact.phone"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-gray-700 font-medium text-sm">Teléfono</FormLabel>
                              <FormControl>
                                <PhoneInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  id="emergencyContact.phone"
                                  placeholder="xxxx-xxxx"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="emergencyContact.relationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium text-sm">Relación</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Familiar, amigo, etc." 
                                    {...field}
                                    className={`h-10 bg-white border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="emergencyContact.address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium text-sm">Dirección</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Dirección de contacto" 
                                    {...field}
                                    className={`h-10 bg-white border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-xl text-sm`}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>
          </div>

          {/* Panel Lateral */}
          <div className="bg-gradient-to-b from-gray-50 to-white border-l border-gray-100 p-6 flex flex-col">
            <div className="flex-1">
              <div className="text-base font-semibold text-gray-900 mb-2">Vista previa</div>
              <div className="text-xs text-gray-500 mb-4">
                {currentStep === 1 && "Información personal del operador"}
                {currentStep === 2 && "Datos de contacto, cédula y dirección del operador"}
                {currentStep === 3 && "Configuración y asignación de rol"}
                {currentStep === 4 && "Información de contacto para casos de emergencia"}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Foto del operador" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                      watchRole === 'Admin' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                        : watchRole === 'Manager'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : watchRole === 'Branch_Manager'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`} />
                  </div>
                  
                  <div className="mt-3 text-center">
                    <div className="font-semibold text-gray-900 text-sm">
                      {form.watch("firstName") || "Nombre"} {form.watch("lastName") || "Apellido"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {form.watch("email") || "correo@ejemplo.com"}
                    </div>
                  </div>

                  <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    watchRole === 'Admin' 
                      ? 'bg-purple-50 text-purple-700' 
                      : watchRole === 'Manager' 
                      ? 'bg-blue-50 text-blue-700'
                      : watchRole === 'Branch_Manager'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {watchRole === 'Admin' 
                      ? 'Administrador' 
                      : watchRole === 'Manager' 
                      ? 'Gerente' 
                      : watchRole === 'Branch_Manager'
                      ? 'Gerente De Sucursal'
                      : 'Operador'}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {form.watch("phone") && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MobileIcon className="w-3 h-3" />
                      {form.watch("phone")}
                    </div>
                  )}
                  
                  {form.watch("personal_id") && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <IdCardIcon className="w-3 h-3" />
                      <span>Cédula: {form.watch("personal_id")}</span>
                    </div>
                  )}
                  
                  {form.watch("address") && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <HomeIcon className="w-3 h-3" />
                      {form.watch("address")}
                    </div>
                  )}
                  
                  {selectedBranch && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <IdCardIcon className="w-3 h-3" />
                      <span>Sucursal: {selectedBranch}</span>
                    </div>
                  )}
                  
                  {selectedType && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <PersonIcon className="w-3 h-3" />
                      <span>Tipo: {selectedType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`mt-4 p-3 bg-${themeColor}-50 rounded-xl border border-${themeColor}-100`}>
                <div className="flex gap-2">
                  <div className={`p-1.5 bg-gradient-to-br ${getThemeGradient()} rounded-lg shadow-lg ${getThemeShadow()}`}>
                    <InfoCircledIcon className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <div className={`text-xs font-medium text-${themeColor}-900`}>
                      {currentStep === 1 && "Paso 1 de 4: Datos personales"}
                      {currentStep === 2 && "Paso 2 de 4: Información de contacto"}
                      {currentStep === 3 && "Paso 3 de 4: Configuración del operador"}
                      {currentStep === 4 && "Paso 4 de 4: Contacto de emergencia"}
                    </div>
                    <div className={`text-xs text-${themeColor}-700 mt-0.5`}>
                      {currentStep === 1 && "Complete los datos básicos del operador"}
                      {currentStep === 2 && "Añada información de contacto, cédula y dirección"}
                      {currentStep === 3 && "Configure el rol y tipo de operador"}
                      {currentStep === 4 && "El operador recibirá un correo con sus credenciales"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex justify-end gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="h-9 px-4 border-gray-200 hover:bg-gray-100 transition-all duration-200 rounded-xl text-sm"
                  >
                    Anterior
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className={`h-9 px-4 relative overflow-hidden bg-gradient-to-r ${getThemeGradient()} text-white transition-all duration-200 rounded-xl text-sm`}
                  >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                    Siguiente
                  </Button>
                ) : (
                  <Button 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className={`h-9 px-4 relative overflow-hidden bg-gradient-to-r ${getThemeGradient()} text-white transition-all duration-300 rounded-xl shadow-lg ${getThemeShadow()} text-sm`}
                  >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                    {isLoading ? (
                      <>
                        <ReloadIcon className="mr-1.5 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="mr-1.5 h-4 w-4" />
                        Crear operador
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 