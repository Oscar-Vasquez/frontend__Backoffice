"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import { customToast } from "@/app/components/ui/custom-toast";
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from "next/navigation";
import { provincesData } from '@/utils/provinces';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ID de compañía que queremos usar
const COMPANY_ID = "ea4af179-bfe1-4c6d-ad21-1c836377ff84";

interface Branch {
  id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  isActive: boolean;
}

const branchFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  address: z.string().min(1, { message: "La dirección es requerida." }),
  province: z.string().min(1, { message: "La provincia es requerida." }),
  phone: z.string().min(1, { message: "El teléfono es requerido." }),
  isActive: z.boolean().default(true),
});

type BranchFormValues = z.infer<typeof branchFormSchema>;

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSuccess: () => void;
}

export function BranchDialog({ open, onOpenChange, branch, onSuccess }: BranchDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      address: '',
      province: '',
      phone: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name || '',
        address: branch.address || '',
        province: branch.province || '',
        phone: branch.phone || '',
        isActive: branch.isActive !== undefined ? branch.isActive : true,
      });
    } else {
      form.reset({
        name: '',
        address: '',
        province: '',
        phone: '',
        isActive: true,
      });
    }
  }, [branch, open, form]);

  const onSubmit = async (data: BranchFormValues) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('workexpress_token');
      if (!token) {
        router.push('/auth/login');
        throw new Error('Token no encontrado');
      }

      const apiUrl = branch
        ? `${process.env.NEXT_PUBLIC_API_URL}/branches/${branch.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/branches`;

      const method = branch ? 'PUT' : 'POST';

      // Enviar datos al backend en el formato esperado (is_active)
      const payload = {
        name: data.name,
        address: data.address,
        province: data.province,
        phone: data.phone,
        is_active: data.isActive, // Convertir isActive a is_active
      };

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.push('/auth/login');
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar la sucursal');
      }

      customToast.success({
        title: branch ? "Sucursal Actualizada" : "Sucursal Creada",
        description: `La sucursal ${data.name} ha sido ${branch ? 'actualizada' : 'creada'} con éxito.`,
      });

      onSuccess(); // Actualiza la lista de sucursales en la página principal
      onOpenChange(false); // Cierra el diálogo
    } catch (error) {
      console.error('Error submitting branch:', error);
      customToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : 'No se pudo guardar la sucursal.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] dark:bg-background dark:border-border">
        <DialogHeader>
          <DialogTitle className="dark:text-foreground">{branch ? "Editar Sucursal" : "Crear Nueva Sucursal"}</DialogTitle>
          <DialogDescription className="dark:text-muted-foreground">
            {branch ? "Actualiza los detalles de la sucursal." : "Completa los campos para crear una nueva sucursal."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la sucursal" {...field} className="dark:bg-input dark:border-input dark:text-foreground dark:placeholder:text-muted-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} className="dark:bg-input dark:border-input dark:text-foreground dark:placeholder:text-muted-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Provincia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-input dark:border-input dark:text-foreground">
                        <SelectValue placeholder="Selecciona una provincia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-popover dark:text-popover-foreground dark:border-border">
                      {provincesData.map((province) => (
                        <SelectItem key={province.value} value={province.value} className="dark:hover:bg-muted">
                          {province.label}
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Teléfono</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Número de teléfono" {...field} className="dark:bg-input dark:border-input dark:text-foreground dark:placeholder:text-muted-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-border p-3 shadow-sm dark:bg-input">
                  <div className="space-y-0.5">
                    <FormLabel className="dark:text-foreground">Estado Activo</FormLabel>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Indica si la sucursal está operativa.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:text-foreground dark:border-border dark:hover:bg-muted">Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                {branch ? "Guardar Cambios" : "Crear Sucursal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 