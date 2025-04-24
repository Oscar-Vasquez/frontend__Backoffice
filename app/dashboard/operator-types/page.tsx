'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { OperatorTypesService, OperatorType } from '@/app/services/operator-types.service';
import { PlusIcon, Pencil1Icon, TrashIcon, ReloadIcon, GearIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Available permissions in the system
const availablePermissions = [
  { key: 'home', label: 'Dashboard' },
  { key: 'tracking', label: 'Rastreo' },
  { key: 'billing', label: 'Facturación' },
  { key: 'invoices', label: 'Facturas' },
  { key: 'clients', label: 'Clientes' },
  { key: 'operators', label: 'Operadores' },
  { key: 'operator_types', label: 'Tipos de Operadores' },
  { key: 'plans', label: 'Planes' },
  { key: 'branches', label: 'Sucursales' },
  { key: 'emails', label: 'Emails' },
];

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  permissions: z.record(z.boolean()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatorTypesPage() {
  const [operatorTypes, setOperatorTypes] = useState<OperatorType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [currentOperatorType, setCurrentOperatorType] = useState<OperatorType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: {},
    },
  });

  useEffect(() => {
    loadOperatorTypes();
  }, []);

  useEffect(() => {
    if (currentOperatorType && (isEditing || isEditingPermissions)) {
      form.reset({
        name: currentOperatorType.name,
        description: currentOperatorType.description || '',
        permissions: currentOperatorType.permissions || {},
      });
    }
  }, [currentOperatorType, isEditing, isEditingPermissions, form]);

  const loadOperatorTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OperatorTypesService.getOperatorTypes();
      setOperatorTypes(data);
    } catch (err) {
      console.error('Error loading operator types:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los tipos de operadores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await OperatorTypesService.createOperatorType({
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      });
      toast.success('Tipo de operador creado correctamente');
      setIsCreating(false);
      form.reset();
      loadOperatorTypes();
    } catch (err) {
      console.error('Error creating operator type:', err);
      toast.error(err instanceof Error ? err.message : 'Error al crear el tipo de operador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: FormValues) => {
    if (!currentOperatorType) return;
    
    try {
      setIsSubmitting(true);
      await OperatorTypesService.updateOperatorType(currentOperatorType.id, {
        name: data.name,
        description: data.description,
        permissions: isEditingPermissions ? data.permissions : currentOperatorType.permissions,
      });
      toast.success('Tipo de operador actualizado correctamente');
      setIsEditing(false);
      setIsEditingPermissions(false);
      setCurrentOperatorType(null);
      form.reset();
      loadOperatorTypes();
    } catch (err) {
      console.error('Error updating operator type:', err);
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el tipo de operador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOperatorType) return;
    
    try {
      setIsSubmitting(true);
      await OperatorTypesService.deleteOperatorType(currentOperatorType.id);
      toast.success('Tipo de operador eliminado correctamente');
      setIsDeleteDialogOpen(false);
      setCurrentOperatorType(null);
      loadOperatorTypes();
    } catch (err) {
      console.error('Error deleting operator type:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar el tipo de operador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (operatorType: OperatorType) => {
    setCurrentOperatorType(operatorType);
    setIsEditing(true);
    setIsEditingPermissions(false);
  };

  const openPermissionsDialog = (operatorType: OperatorType) => {
    setCurrentOperatorType(operatorType);
    setIsEditingPermissions(true);
    setIsEditing(false);
  };

  const openDeleteDialog = (operatorType: OperatorType) => {
    setCurrentOperatorType(operatorType);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tipos de Operadores</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Tipo de Operador</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear un nuevo tipo de operador.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <Tabs defaultValue="basic">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Información Básica</TabsTrigger>
                    <TabsTrigger value="permissions">Permisos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del tipo de operador" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descripción del tipo de operador" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="permissions" className="pt-4">
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Permisos de acceso a módulos</div>
                      <div className="grid grid-cols-2 gap-4">
                        {availablePermissions.map((permission) => (
                          <FormField
                            key={permission.key}
                            control={form.control}
                            name={`permissions.${permission.key}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>{permission.label}</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Operadores</CardTitle>
          <CardDescription>
            Administra los diferentes tipos de operadores en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={loadOperatorTypes}
              >
                <ReloadIcon className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          ) : operatorTypes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No hay tipos de operadores registrados</p>
              <Button onClick={() => setIsCreating(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Crear Tipo de Operador
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operatorTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description || 'Sin descripción'}</TableCell>
                    <TableCell>
                      {type.permissions && Object.keys(type.permissions).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(type.permissions).slice(0, 3).map(([key, value]) => (
                            value ? (
                              <Badge key={key} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                {key}
                              </Badge>
                            ) : null
                          ))}
                          {Object.keys(type.permissions).length > 3 && (
                            <Badge variant="outline" className="bg-gray-50">
                              +{Object.keys(type.permissions).length - 3} más
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Sin permisos</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(type.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openPermissionsDialog(type)}
                          title="Editar permisos"
                        >
                          <GearIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openEditDialog(type)}
                          title="Editar información"
                        >
                          <Pencil1Icon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => openDeleteDialog(type)}
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Operador</DialogTitle>
            <DialogDescription>
              Actualiza la información del tipo de operador.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del tipo de operador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descripción del tipo de operador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isEditingPermissions} onOpenChange={setIsEditingPermissions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Permisos</DialogTitle>
            <DialogDescription>
              Configura los permisos para el tipo de operador: <span className="font-medium">{currentOperatorType?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {availablePermissions.map((permission) => (
                  <FormField
                    key={permission.key}
                    control={form.control}
                    name={`permissions.${permission.key}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>{permission.label}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Permisos'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de operador
              {currentOperatorType && <span className="font-semibold"> "{currentOperatorType.name}"</span>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 