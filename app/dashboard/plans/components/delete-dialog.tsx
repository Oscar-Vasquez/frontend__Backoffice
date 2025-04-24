import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { customToast } from "@/app/components/ui/custom-toast";
import { PlansService } from '@/services/plans.service';
import { Plan } from '@/types/plans';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  onSuccess: () => void;
}

export function DeleteDialog({ open, onOpenChange, plan, onSuccess }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const plansService = useMemo(() => new PlansService(), []);

  const handleDelete = async () => {
    if (!plan || !plan.id) return;
    
    setLoading(true);
    try {
      await plansService.delete(plan.id);

      customToast.success({
        title: "Plan Eliminado",
        description: "El plan se eliminó correctamente"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      customToast.error({
        title: "Error",
        description: error.message || "No se pudo eliminar el plan"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Plan</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el plan "{plan?.planName}"? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 