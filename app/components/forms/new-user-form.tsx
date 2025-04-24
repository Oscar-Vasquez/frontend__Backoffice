import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { UsersService, TypeUser } from "@/app/services/users.service";

const formSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  birthDate: z.string(),
  branchReference: z.string(),
  subscriptionPlan: z.string(),
  typeUserReference: z.string().min(1, 'El tipo de usuario es requerido'),
});

type FormValues = z.infer<typeof formSchema>;

export function NewUserForm() {
  const [typeUsers, setTypeUsers] = useState<TypeUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      birthDate: '',
      branchReference: '',
      subscriptionPlan: '',
      typeUserReference: '',
    },
  });

  useEffect(() => {
    const loadTypeUsers = async () => {
      try {
        setIsLoading(true);
        const types = await UsersService.getTypeUsers();
        setTypeUsers(types);
      } catch (error) {
        console.error('Error al cargar tipos de usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTypeUsers();
  }, []);

  return (
    <div className="grid gap-4 py-4">
      {/* Campos existentes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            placeholder="Nombre"
            {...register('firstName')}
          />
          {errors.firstName && (
            <span className="text-red-500 text-sm">{errors.firstName.message}</span>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            placeholder="Apellido"
            {...register('lastName')}
          />
          {errors.lastName && (
            <span className="text-red-500 text-sm">{errors.lastName.message}</span>
          )}
        </div>
      </div>

      {/* Campo de dirección */}
      <div className="grid gap-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          placeholder="Ingrese su dirección completa"
          {...register('address')}
        />
        {errors.address && (
          <span className="text-red-500 text-sm">{errors.address.message}</span>
        )}
      </div>

      {/* Resto de los campos existentes */}
      <div className="grid gap-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          placeholder="Correo electrónico"
          {...register('email')}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          placeholder="Contraseña"
          {...register('password')}
        />
        {errors.password && (
          <span className="text-red-500 text-sm">{errors.password.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          placeholder="Teléfono"
          {...register('phone')}
        />
        {errors.phone && (
          <span className="text-red-500 text-sm">{errors.phone.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
        <Input
          id="birthDate"
          placeholder="Fecha de nacimiento"
          {...register('birthDate')}
        />
        {errors.birthDate && (
          <span className="text-red-500 text-sm">{errors.birthDate.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="branchReference">Referencia de sucursal</Label>
        <Input
          id="branchReference"
          placeholder="Referencia de sucursal"
          {...register('branchReference')}
        />
        {errors.branchReference && (
          <span className="text-red-500 text-sm">{errors.branchReference.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subscriptionPlan">Plan de suscripción</Label>
        <Input
          id="subscriptionPlan"
          placeholder="Plan de suscripción"
          {...register('subscriptionPlan')}
        />
        {errors.subscriptionPlan && (
          <span className="text-red-500 text-sm">{errors.subscriptionPlan.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="typeUserReference">Tipo de Usuario</Label>
        <Select 
          onValueChange={(value) => setValue('typeUserReference', value)}
          disabled={isLoading}
        >
          <SelectTrigger className="bg-background h-11">
            <SelectValue placeholder="Seleccione el tipo de usuario" />
          </SelectTrigger>
          <SelectContent>
            {typeUsers.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.typeUserReference && (
          <span className="text-red-500 text-sm">{errors.typeUserReference.message}</span>
        )}
      </div>
    </div>
  );
} 