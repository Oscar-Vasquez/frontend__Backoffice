import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customToast } from "@/app/components/ui/custom-toast";
import { PlansService } from '@/services/plans.service';
import { Plan } from '@/types/plans';

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

export function PlanDialog({ open, onOpenChange, plan, onSuccess }: PlanDialogProps) {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    price: '',
    branchReference: ''
  });
  const [selectedBranch, setSelectedBranch] = useState('');
  const plansService = useMemo(() => new PlansService(), []);

  useEffect(() => {
    if (open) {
      fetchBranches();
    }
  }, [open]);

  useEffect(() => {
    if (plan) {
      setFormData({
        planName: plan.planName || '',
        description: plan.description || '',
        price: plan.price?.toString() || '',
        branchReference: plan.branchReference || ''
      });
      
      const branchId = plan.branchReference && typeof plan.branchReference === 'string' 
        ? plan.branchReference.replace('/branches/', '') 
        : '';
      setSelectedBranch(branchId);
    } else {
      // Resetear el formulario cuando es creación
      setFormData({
        planName: '',
        description: '',
        price: '',
        branchReference: ''
      });
      setSelectedBranch('');
    }
  }, [plan, open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        planName: formData.planName,
        description: formData.description,
        price: Number(formData.price),
        branchReference: formData.branchReference
      };

      if (!dataToSend.branchReference) {
        throw new Error('Por favor selecciona una sucursal');
      }

      let result: Plan;

      if (plan) {
        // Actualización
        result = await plansService.update(plan.id as string, dataToSend);
      } else {
        // Creación
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
    setFormData(prev => ({
      ...prev,
      branchReference: `/branches/${value}`
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planName">Nombre del Plan</Label>
            <Input
              id="planName"
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Sucursal</Label>
            <Select
              value={selectedBranch}
              onValueChange={handleBranchChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una sucursal" />
              </SelectTrigger>
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
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : plan ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 