import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Transaction, 
  TransactionCategory, 
  CreateTransactionDto, 
  UpdateTransactionDto,
  TransactionStatus, 
  PaymentMethod
} from "../types";
import { useForm } from "react-hook-form";
import { customToast } from "@/app/lib/toast";
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaz para Transaction Types (categorías)
interface TransactionType {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  color?: string;
}

// Interfaz para Payment Methods
interface PaymentType {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Estados de transacción comunes
const TRANSACTION_STATUSES = [
  { value: 'completed', label: 'Completada' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'rejected', label: 'Rechazada' },
  { value: 'processing', label: 'Procesando' },
];

interface ExpenseFormProps {
  transaction?: Transaction;
  onSubmit: (data: CreateTransactionDto | UpdateTransactionDto) => Promise<void>;
  isSubmitting: boolean;
  categories?: TransactionCategory[];
}

export default function ExpenseForm({
  transaction,
  onSubmit,
  isSubmitting,
  categories = [],
}: ExpenseFormProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Referencias para los contenedores de los dropdowns
  const categoryRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  
  // Estados para controlar la posición de los dropdowns
  const [showAbove, setShowAbove] = useState({
    category: false,
    paymentMethod: false,
    status: false
  });
  
  // Efecto para calcular si hay espacio debajo para mostrar los dropdowns
  useEffect(() => {
    const calculatePositions = () => {
      // Calcular para categoría
      if (categoryRef.current) {
        const rect = categoryRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setShowAbove(prev => ({
          ...prev,
          category: spaceBelow < 200 // Mostrar arriba si hay menos de 200px abajo
        }));
      }
      
      // Calcular para método de pago
      if (paymentMethodRef.current) {
        const rect = paymentMethodRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setShowAbove(prev => ({
          ...prev,
          paymentMethod: spaceBelow < 200
        }));
      }
      
      // Calcular para estado
      if (statusRef.current) {
        const rect = statusRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setShowAbove(prev => ({
          ...prev,
          status: spaceBelow < 200
        }));
      }
    };
    
    calculatePositions();
    
    // Recalcular al cambiar el tamaño de la ventana
    window.addEventListener('resize', calculatePositions);
    
    return () => {
      window.removeEventListener('resize', calculatePositions);
    };
  }, []);
  
  // Efecto para manejar clics fuera de los dropdowns
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Cerrar categoría si está abierto y se hace clic fuera
      if (categoryOpen && 
          categoryRef.current && 
          !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
      
      // Cerrar método de pago si está abierto y se hace clic fuera
      if (paymentMethodOpen && 
          paymentMethodRef.current && 
          !paymentMethodRef.current.contains(event.target as Node)) {
        setPaymentMethodOpen(false);
      }
      
      // Cerrar estado si está abierto y se hace clic fuera
      if (statusOpen && 
          statusRef.current && 
          !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    };
    
    // Añadir el listener
    document.addEventListener('mousedown', handleOutsideClick);
    
    // Limpieza
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [categoryOpen, paymentMethodOpen, statusOpen]);
  
  // Cargar transaction types (categorías)
  useEffect(() => {
    console.log("🔎 Props de categorías recibidas:", categories);
    
    const fetchTransactionTypes = async () => {
      setIsLoadingTypes(true);
      try {
        // Si hay categorías proporcionadas por props, usarlas primero
        if (categories && categories.length > 0) {
          console.log("✅ Usando categorías de props:", categories);
          const mappedCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            code: cat.id,
            description: cat.description || '',
            is_active: cat.isActive,
            color: cat.color,
            created_at: cat.createdAt,
            updated_at: cat.updatedAt
          }));
          console.log("🔄 Categorías mapeadas:", mappedCategories);
          setTransactionTypes(mappedCategories);
          setIsLoadingTypes(false);
          return;
        }

        // Si no hay categorías proporcionadas, hacer la llamada a la API
        console.log("⚠️ No hay categorías en props, cargando datos simulados");
        // Reemplazar esto con una llamada real a tu API
        // En producción: const response = await fetch('/api/transaction-types');
        // Simular una llamada para desarrollo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos simulados - reemplazar con datos reales
        const mockData: TransactionType[] = [
          {
            id: '1',
            name: 'Alquiler',
            code: 'RENT',
            description: 'Pagos de alquiler',
            is_active: true,
            color: '#4f46e5',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Insumos',
            code: 'SUPPLIES',
            description: 'Material y suministros',
            is_active: true,
            color: '#0ea5e9',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '3',
            name: 'Servicios',
            code: 'SERVICES',
            description: 'Servicios básicos',
            is_active: true,
            color: '#ec4899',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '4',
            name: 'Salarios',
            code: 'SALARY',
            description: 'Pagos a empleados',
            is_active: true,
            color: '#f59e0b',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '5',
            name: 'Mantenimiento',
            code: 'MAINTENANCE',
            description: 'Mantenimiento',
            is_active: true,
            color: '#84cc16',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
        ];
        
        setTransactionTypes(mockData);
      } catch (error) {
        console.error('Error al cargar los tipos de transacción:', error);
        customToast.error({
          title: 'Error',
          description: 'No se pudieron cargar las categorías'
        });
      } finally {
        setIsLoadingTypes(false);
      }
    };
    
    fetchTransactionTypes();
  }, [categories]);
  
  // Cargar payment types (métodos de pago)
  useEffect(() => {
    console.log("💳 Iniciando carga de métodos de pago");
    
    const fetchPaymentTypes = async () => {
      setIsLoadingPaymentTypes(true);
      try {
        // Reemplazar esto con una llamada real a tu API
        // En producción: const response = await fetch('/api/payment-types');
        // Simular una llamada para desarrollo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos simulados - reemplazar con datos reales
        const mockData: PaymentType[] = [
          {
            id: '1',
            name: 'Efectivo',
            code: 'cash',
            description: 'Pago en efectivo',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Tarjeta de Débito',
            code: 'debit',
            description: 'Pago con tarjeta de débito',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '3',
            name: 'Tarjeta de Crédito',
            code: 'credit',
            description: 'Pago con tarjeta de crédito',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '4',
            name: 'Transferencia Bancaria',
            code: 'transfer',
            description: 'Transferencia bancaria',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '5',
            name: 'Cheque',
            code: 'check',
            description: 'Pago con cheque',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '6',
            name: 'PayPal',
            code: 'paypal',
            description: 'Pago vía PayPal',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '7',
            name: 'Yappy',
            code: 'yappy',
            description: 'Pago vía Yappy',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
        ];
        
        console.log("✅ Métodos de pago cargados:", mockData);
        setPaymentTypes(mockData);
      } catch (error) {
        console.error('Error al cargar los métodos de pago:', error);
        customToast.error({
          title: 'Error',
          description: 'No se pudieron cargar los métodos de pago'
        });
      } finally {
        setIsLoadingPaymentTypes(false);
      }
    };
    
    fetchPaymentTypes();
  }, []);
  
  // Establecer la vista previa del archivo si existe
  useEffect(() => {
    if (transaction?.attachment) {
      setFilePreview(transaction.attachment);
    }
  }, [transaction]);
  
  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFilePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Subir archivo a Supabase
  const uploadFileToSupabase = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Generar nombre de archivo único con timestamp y nombre original
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `gastos/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('transacciones') // Nombre del bucket
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('transacciones')
        .getPublicUrl(fileName);
      
      setUploadProgress(100);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Quitar archivo seleccionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    form.setValue('attachment', '');
  };
  
  // Configurar react-hook-form con valores por defecto más adecuados
  const form = useForm<CreateTransactionDto>({
    defaultValues: {
      date: transaction?.date || new Date().toISOString(),
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      categoryId: transaction?.categoryId || '',
      paymentMethod: transaction?.paymentMethod || 'cash' as PaymentMethod,
      transactionType: transaction?.transactionType || 'gasto',
      status: transaction?.status || 'completed' as TransactionStatus, 
      reference: transaction?.reference || '',
      notes: transaction?.notes || '',
      attachment: transaction?.attachment || '',
    },
  });
  
  // Función para manejar el envío del formulario
  const handleFormSubmit = async (data: CreateTransactionDto) => {
    console.log("📝 Enviando formulario con datos completos:", JSON.stringify(data, null, 2));
    console.log("📂 Categoría seleccionada (ID):", data.categoryId);
    console.log("📂 Categoría completa:", transactionTypes.find(c => c.id === data.categoryId));
    console.log("💳 Método de pago seleccionado:", data.paymentMethod);
    console.log("💳 Método de pago completo:", paymentTypes.find(p => p.code?.toLowerCase() === data.paymentMethod));
    console.log("📋 Estado seleccionado:", data.status);
    console.log("📅 Fecha seleccionada:", data.date);
    console.log("💰 Monto:", data.amount);
    console.log("📜 Tipo de transacción:", data.transactionType);
    
    try {
      // Si hay un archivo seleccionado, subirlo primero
      let attachmentUrl = data.attachment;
      
      if (selectedFile) {
        attachmentUrl = await uploadFileToSupabase(selectedFile);
        data.attachment = attachmentUrl;
      }

      // Verificar que categoryId sea un UUID completo
      if (data.categoryId && data.categoryId.length < 32) {
        console.warn(`⚠️ ID de categoría (${data.categoryId}) parece no ser un UUID completo`);
      }

      // Validar si la referencia es un UUID válido
      if (data.reference) {
        const isValidUuid = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(data.reference);
        if (!isValidUuid) {
          console.warn(`⚠️ La referencia proporcionada (${data.reference}) no es un UUID válido. Se almacenará en los metadatos.`);
        }
      }

      // Mapear el código de método de pago al formato esperado
      const paymentMap: Record<string, string> = {
        'efectivo': 'cash',
        'tarjeta_credito': 'credit',
        'tarjeta_debito': 'debit',
        'transferencia': 'transfer',
        'cheque': 'check'
      };

      // Si el método no coincide con el mapa, asegurarse de que use el código correcto
      if (data.paymentMethod in paymentMap) {
        data.paymentMethod = paymentMap[data.paymentMethod] as PaymentMethod;
        console.log("🔄 Método de pago normalizado:", data.paymentMethod);
      }
      
      if (transaction) {
        // Si estamos editando, incluir el ID
        console.log("🔄 Actualizando transacción existente", transaction.id);
        await onSubmit({
          id: transaction.id,
          ...data,
        });
      } else {
        // Si estamos creando uno nuevo
        console.log("➕ Creando nueva transacción");
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      customToast.error({
        title: 'Error',
        description: 'No se pudo completar la operación'
      });
    }
  };
  
  // Obtener un color para una categoría
  const getCategoryColor = (categoryId: string): string => {
    const category = transactionTypes.find(c => c.id === categoryId);
    return category?.color || '#64748b';
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Fecha */}
          <FormField
            control={form.control}
            name="date"
            rules={{ required: "La fecha es obligatoria" }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => 
                        field.onChange(date ? date.toISOString() : new Date().toISOString())
                      }
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Monto */}
          <FormField
            control={form.control}
            name="amount"
            rules={{ 
              required: "El monto es obligatorio",
              min: {
                value: 0.01,
                message: "El monto debe ser mayor a 0"
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          rules={{ required: "La descripción es obligatoria" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción del gasto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Categoría */}
          <FormField
            control={form.control}
            name="categoryId"
            rules={{ required: "La categoría es obligatoria" }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Categoría</FormLabel>
                <div className="relative" ref={categoryRef}>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    onClick={() => setCategoryOpen(!categoryOpen)}
                  >
                    {field.value ? (
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{ backgroundColor: getCategoryColor(field.value) }}
                        />
                        <span>
                          {transactionTypes.find(c => c.id === field.value)?.name || "Seleccionar categoría"}
                        </span>
                      </div>
                    ) : (
                      <span>Seleccionar categoría</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  
                  {categoryOpen && (
                    <div 
                      className={cn(
                        "absolute left-0 right-0 z-50 w-full bg-popover shadow-md rounded-md border border-border overflow-hidden",
                        showAbove.category 
                          ? "bottom-full mb-1" // Mostrar arriba
                          : "top-full mt-1"    // Mostrar abajo
                      )}
                    >
                      <div className="p-1">
                        <input
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Buscar categoría..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto p-1">
                        {isLoadingTypes ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        ) : (
                          transactionTypes.map((category) => (
                            <div
                              key={category.id}
                              className={cn(
                                "flex items-center rounded-md px-2 py-2 cursor-pointer hover:bg-accent/50",
                                field.value === category.id && "bg-accent"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                form.setValue("categoryId", category.id, { shouldValidate: true });
                                console.log("✅ Categoría seleccionada:", category.name);
                                setCategoryOpen(false);
                              }}
                            >
                              <div
                                className="mr-2 h-3 w-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm">{category.name}</span>
                              {field.value === category.id && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Método de pago */}
          <FormField
            control={form.control}
            name="paymentMethod"
            rules={{ required: "El método de pago es obligatorio" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pago</FormLabel>
                <div className="relative" ref={paymentMethodRef}>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    onClick={() => setPaymentMethodOpen(!paymentMethodOpen)}
                  >
                    {field.value ? (
                      paymentTypes.find(p => p.code?.toLowerCase() === field.value)?.name || "Seleccionar método de pago"
                    ) : (
                      "Seleccionar método de pago"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  
                  {paymentMethodOpen && (
                    <div 
                      className={cn(
                        "absolute left-0 right-0 z-50 w-full bg-popover shadow-md rounded-md border border-border overflow-hidden",
                        showAbove.paymentMethod 
                          ? "bottom-full mb-1" // Mostrar arriba
                          : "top-full mt-1"    // Mostrar abajo
                      )}
                    >
                      <div className="max-h-[200px] overflow-y-auto p-1">
                        {isLoadingPaymentTypes ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        ) : (
                          paymentTypes.map((paymentType) => (
                            <div
                              key={paymentType.id}
                              className={cn(
                                "flex items-center rounded-md px-2 py-2 cursor-pointer hover:bg-accent/50",
                                field.value === paymentType.code?.toLowerCase() && "bg-accent"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                form.setValue("paymentMethod", (paymentType.code?.toLowerCase() || '') as PaymentMethod, { shouldValidate: true });
                                console.log("✅ Método de pago seleccionado:", paymentType.name);
                                setPaymentMethodOpen(false);
                              }}
                            >
                              <span className="text-sm">{paymentType.name}</span>
                              {field.value === paymentType.code?.toLowerCase() && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Estado de la transacción */}
          <FormField
            control={form.control}
            name="status"
            rules={{ required: "El estado es obligatorio" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <div className="relative" ref={statusRef}>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    onClick={() => setStatusOpen(!statusOpen)}
                  >
                    {field.value ? (
                      TRANSACTION_STATUSES.find(s => s.value === field.value)?.label || "Seleccionar estado"
                    ) : (
                      "Seleccionar estado"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  
                  {statusOpen && (
                    <div 
                      className={cn(
                        "absolute left-0 right-0 z-50 w-full bg-popover shadow-md rounded-md border border-border overflow-hidden",
                        showAbove.status 
                          ? "bottom-full mb-1" // Mostrar arriba
                          : "top-full mt-1"    // Mostrar abajo
                      )}
                    >
                      <div className="max-h-[200px] overflow-y-auto p-1">
                        {TRANSACTION_STATUSES.map((status) => (
                          <div
                            key={status.value}
                            className={cn(
                              "flex items-center rounded-md px-2 py-2 cursor-pointer hover:bg-accent/50",
                              field.value === status.value && "bg-accent"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue("status", status.value as TransactionStatus, { shouldValidate: true });
                              console.log("✅ Estado seleccionado:", status.label);
                              setStatusOpen(false);
                            }}
                          >
                            <span className="text-sm">{status.label}</span>
                            {field.value === status.value && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Referencia */}
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia o Número de Factura</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notas */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre esta transacción"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subir comprobante */}
        <FormField
          control={form.control}
          name="attachment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comprobante</FormLabel>
              <div className="space-y-4">
                {filePreview ? (
                  <div className="relative rounded-md border overflow-hidden">
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      className="max-h-[200px] w-full object-contain" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="h-10 w-10 text-muted-foreground mb-3 text-primary/60" />
                    <p className="text-sm font-medium mb-1">
                      Arrastre aquí su comprobante o haga clic para seleccionarlo
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
                    </p>
                    
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Archivo
                    </Button>
                  </div>
                )}
                
                {isUploading && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Subiendo archivo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <input 
                  type="hidden" 
                  {...field} 
                  value={field.value || ''} 
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo oculto para el tipo de transacción */}
        <FormField
          control={form.control}
          name="transactionType"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="min-w-[120px]"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Subiendo..." : "Guardando..."}
              </>
            ) : (
              transaction ? "Actualizar" : "Crear Gasto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 