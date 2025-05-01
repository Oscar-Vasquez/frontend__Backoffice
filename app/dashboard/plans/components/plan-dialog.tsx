import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customToast } from "@/app/components/ui/custom-toast";
import { PlansService } from '@/services/plans.service';
import { Plan } from '@/types/plans';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from 'react-hook-form';

interface Branch {
  id: string;
  name: string;
  province: string;
  value: string;
  label: string;
}

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  onSuccess: () => void;
}

// Define the schema for the form
const planFormSchema = z.object({
  planName: z.string().min(1, { message: "El nombre es requerido." }),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Debe ser un número." }).min(0, { message: "El precio debe ser positivo." })
  ),
  branchReference: z.string().min(1, { message: "La sucursal es requerida." }),
  isActive: z.boolean().default(true),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export function PlanDialog({ open, onOpenChange, plan, onSuccess }: PlanDialogProps) {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const plansService = useMemo(() => new PlansService(), []);

  // Initialize the form using react-hook-form
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: '',
      description: '',
      price: 0,
      branchReference: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      fetchBranches();
    }
  }, [open]);

  useEffect(() => {
    if (plan) {
      // Use form.reset to update form values when editing
      form.reset({
        planName: plan.planName || '',
        description: plan.description || '',
        price: typeof plan.price === 'number' ? plan.price : parseFloat(plan.price || '0'),
        branchReference: plan.branchReference || '',
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      });
      const branchId = plan.branchReference && typeof plan.branchReference === 'string' 
        ? plan.branchReference.replace('/branches/', '') 
        : '';
      setSelectedBranch(branchId);
    } else {
      // Reset form to defaults when creating
      form.reset({
        planName: '',
        description: '',
        price: 0,
        branchReference: '',
        isActive: true,
      });
      setSelectedBranch('');
    }
  // Add form to dependency array
  }, [plan, open, form]);

  const fetchBranches = async () => {
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('workexpress_token') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
        }
        throw new Error('Error al cargar sucursales');
      }
      
      const data = await response.json();
      setBranches(data);
    } catch (error: any) {
      customToast.error({
        title: "Error",
        description: error.message || "No se pudieron cargar las sucursales"
      });
    }
  };

  // Update handleSubmit to use react-hook-form's onSubmit
  const onSubmit = async (data: PlanFormValues) => {
    setLoading(true);
    try {
      // Ensure branchReference is set correctly from selectedBranch state
      if (!selectedBranch) {
        throw new Error('Por favor selecciona una sucursal');
      }
      const dataToSend = {
        ...data,
        description: data.description ?? '',
        branchReference: `/branches/${selectedBranch}`,
      };

      let result: Plan;
      if (plan) {
        result = await plansService.update(plan.id as string, {
          ...dataToSend, 
          description: dataToSend.description ?? ''
        });
      } else {
        result = await plansService.create(dataToSend);
      }

      customToast.success({
        title: plan ? "Plan Actualizado" : "Plan Creado",
        description: plan ? "El plan se actualizó correctamente" : "El plan se creó correctamente"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      customToast.error({
        title: "Error",
        description: error.message || 'Error al procesar la solicitud'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    // Set branchReference in the form state
    form.setValue('branchReference', `/branches/${value}`); 
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{plan ? "Editar Plan" : "Crear Nuevo Plan"}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {plan ? "Actualiza los detalles del plan." : "Completa los campos para crear un nuevo plan."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="planName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Nombre del Plan</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Plan Básico" {...field} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500" />
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
                  <FormLabel className="dark:text-gray-300">Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe las características del plan" {...field} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Precio (USD)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-gray-700 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="dark:text-gray-300">Estado Activo</FormLabel>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Indica si el plan está disponible para asignación.
                    </p>
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
            <FormField
              control={form.control}
              name="branchReference"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="branch">Sucursal</Label>
                  <Select
                    value={selectedBranch}
                    onValueChange={handleBranchChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sucursal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent 
                      position="popper"
                      className="z-[9999]" 
                      side="bottom" 
                      align="start"
                    >
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.label} - {branch.province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : null}
                {plan ? "Guardar Cambios" : "Crear Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 