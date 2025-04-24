"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateUserDto, TypeUser, UsersService } from "@/app/services/users.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon,
  Building2,
  CreditCard,
  Shield,
  Loader2
} from "lucide-react";
import { BirthDatePicker } from "@/components/ui/birth-date-picker";
import { customToast } from "@/components/ui/use-custom-toast";

// Función para generar una contraseña segura
const generateSecurePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Asegurar al menos un carácter de cada tipo
  password += charset.match(/[a-z]/)![0]; // minúscula
  password += charset.match(/[A-Z]/)![0]; // mayúscula
  password += charset.match(/[0-9]/)![0]; // número
  password += charset.match(/[!@#$%^&*]/)![0]; // especial
  
  // Completar el resto de la contraseña
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  lastName: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Debe ser un email válido",
  }),
  phone: z.string().min(8, {
    message: "El teléfono debe tener al menos 8 caracteres",
  }),
  branchId: z.string().min(1, {
    message: "Debe seleccionar una sucursal",
  }),
  planId: z.string().min(1, {
    message: "Debe seleccionar un plan",
  }),
  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  address: z.string().min(10, {
    message: "La dirección debe tener al menos 10 caracteres",
  }),
  typeUserReference: z.string().min(1, {
    message: "Debe seleccionar un tipo de usuario",
  }),
});

interface NewUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  branches: { id: string; name: string; }[];
  plans: { 
    id: string; 
    planName: string;
    price: number;
    description?: string;
    branchId?: string;
    isActive?: boolean;
  }[];
}

export function NewUserForm({ isOpen, onClose, onSubmit, branches, plans }: NewUserFormProps) {
  const [typeUsers, setTypeUsers] = useState<TypeUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [filteredPlans, setFilteredPlans] = useState<typeof plans>([]);

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      birthDate: new Date(),
      branchId: '',
      planId: '',
      typeUserReference: ''
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = methods;
  const watchBranchId = watch('branchId');

  useEffect(() => {
    const loadTypeUsers = async () => {
      try {
        setIsLoading(true);
        setFormErrors([]);
        const types = await UsersService.getTypeUsers();
        if (types.length === 0) {
          setFormErrors(['No hay tipos de usuario disponibles']);
          setShowErrorDialog(true);
        } else {
          setTypeUsers(types);
        }
      } catch (error) {
        console.error('Error:', error);
        setFormErrors(['Error al cargar los tipos de usuario']);
        setShowErrorDialog(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadTypeUsers();
  }, []);

  useEffect(() => {
    setValue('planId', '');
    
    if (watchBranchId) {
      const fetchPlansForBranch = async () => {
        try {
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('workexpress_token='))
            ?.split('=')[1];

          if (!token) {
            console.error('No hay token de autenticación');
            return;
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/plans/branch/${watchBranchId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Error al obtener los planes de la sucursal');
          }

          const plansData = await response.json();
          console.log('Planes recibidos:', plansData);
          
          if (Array.isArray(plansData) && plansData.length > 0) {
            setFilteredPlans(plansData);
          } else {
            console.log('No se encontraron planes para la sucursal');
            setFilteredPlans([]);
          }
        } catch (error) {
          console.error('Error al obtener planes:', error);
          setFilteredPlans([]);
        }
      };

      fetchPlansForBranch();
    } else {
      setFilteredPlans([]);
    }
  }, [watchBranchId, setValue]);

  useEffect(() => {
    if (!isOpen) {
      methods.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        birthDate: new Date(),
        branchId: '',
        planId: '',
        typeUserReference: ''
      });
      setCurrentStep(1);
    }
  }, [isOpen, methods]);

  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      console.log(`Campo ${name} actualizado:`, value);
    });

    return () => subscription.unsubscribe();
  }, [methods]);

  const nextStep = async () => {
    const fieldsToValidate = {
      1: ['firstName', 'lastName', 'email', 'phone'],
      2: ['birthDate', 'address'],
      3: ['branchId', 'planId', 'typeUserReference']
    }[currentStep];

    console.log('Estado actual del formulario antes de validar:', methods.getValues());
    const isValid = await trigger(fieldsToValidate as any[]);
    if (isValid) {
      const currentValues = methods.getValues();
      console.log('Guardando valores actuales:', currentValues);
      
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      console.log('Errores de validación:', methods.formState.errors);
      customToast.error({
        title: "Error de validación",
        description: "Por favor complete todos los campos requeridos correctamente"
      });
    }
  };

  const prevStep = () => {
    const currentValues = methods.getValues();
    console.log('Guardando valores antes de retroceder:', currentValues);
    
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitForm = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setFormErrors([]);
      
      // Generar contraseña segura
      const temporaryPassword = generateSecurePassword();
      
      const dataToSubmit = {
        ...values,
        birthDate: values.birthDate.toISOString(),
        password: temporaryPassword,
        forcePasswordChange: true,
        branchReference: `/branches/${values.branchId}`,
        subscriptionPlan: `/plans/${values.planId}`,
        typeUserReference: values.typeUserReference
      };

      // Crear el usuario
      try {
        const newUser = await onSubmit(dataToSubmit);

        // Enviar correo con credenciales
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/send-credentials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('workexpress_token='))?.split('=')[1]}`
            },
            body: JSON.stringify({
              email: values.email,
              password: temporaryPassword,
              firstName: values.firstName,
              lastName: values.lastName
            })
          });

          customToast.success({
            title: "Usuario creado con éxito",
            description: "Se han enviado las credenciales al correo electrónico proporcionado"
          });
        } catch (error) {
          console.error('Error al enviar credenciales:', error);
          customToast.error({
            title: "Advertencia",
            description: "Usuario creado pero hubo un problema al enviar las credenciales por correo. Por favor, intente nuevamente más tarde."
          });
        }

        methods.reset();
        onClose();
      } catch (error: any) {
        console.error('Error en createUser:', error);
        
        let errorMessage = 'Error al crear el usuario';
        
        if (error.response?.status === 429) {
          errorMessage = 'Demasiados intentos. Por favor, espera unos momentos antes de intentar nuevamente.';
        } else if (error.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
          errorMessage = 'Se han realizado demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
        } else if (error.message.includes('auth/email-already-exists')) {
          errorMessage = 'El correo electrónico ya está registrado.';
        } else if (error.message.includes('auth/invalid-email')) {
          errorMessage = 'El correo electrónico no es válido.';
        }

        setFormErrors([errorMessage]);
        setShowErrorDialog(true);
        
        customToast.error({
          title: "Error al crear usuario",
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Error general:', error);
      setFormErrors(['Error inesperado al procesar la solicitud']);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <motion.div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                currentStep === step
                  ? "bg-primary text-white"
                  : currentStep > step
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: currentStep === step ? 1 : 0.8 }}
            >
              {currentStep > step ? "✓" : step}
            </motion.div>
            {step < 3 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2",
                  currentStep > step ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input {...field} className="pl-9" placeholder="Juan" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input {...field} className="pl-9" placeholder="Pérez" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="email"
                        id="email"
                        name="email"
                        className="pl-9" 
                        placeholder="juan.perez@ejemplo.com"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          console.log('Email actualizado:', e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input {...field} className="pl-9" placeholder="+507 6123-4567" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <FormField
              control={methods.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <FormControl>
                    <BirthDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.birthDate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        type="text"
                        id="address"
                        name="address"
                        className="pl-10" 
                        placeholder="Ingrese la dirección completa"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          console.log('Dirección actualizada:', e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <FormField
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sucursal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Seleccione una sucursal" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
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
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!watchBranchId}
                  >
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <SelectTrigger className={cn(
                          "pl-9",
                          !watchBranchId && "bg-gray-100 cursor-not-allowed"
                        )}>
                          <SelectValue placeholder={
                            !watchBranchId 
                              ? "Seleccione primero una sucursal" 
                              : "Seleccione un plan"
                          } />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {filteredPlans.length > 0 ? (
                        filteredPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.planName} - ${plan.price}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="relative flex items-center justify-center py-6 px-2 text-sm text-gray-500">
                          {watchBranchId 
                            ? "No hay planes disponibles para esta sucursal"
                            : "Seleccione primero una sucursal"
                          }
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="typeUserReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Usuario</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Seleccione el tipo de usuario" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {typeUsers.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center mb-2">
            {currentStep === 1 && "Información Personal"}
            {currentStep === 2 && "Ubicación y Fecha de Nacimiento"}
            {currentStep === 3 && "Detalles de Membresía"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-500">
            {currentStep === 1 && "Ingrese los datos básicos del cliente"}
            {currentStep === 2 && "Proporcione la información de contacto"}
            {currentStep === 3 && "Seleccione la sucursal y el plan"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6 mt-4">
            {renderStepIndicator()}
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="bg-primary">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Cliente'
                  )}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </AlertDialogContent>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {formErrors.map((error, index) => (
                  <p key={index} className="text-red-500">{error}</p>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowErrorDialog(false)}>
              Cerrar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialog>
  );
} 