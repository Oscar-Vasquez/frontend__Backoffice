import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { customToast } from "@/app/components/ui/custom-toast";
import { PlansService } from '@/services/plans.service';
import { Plan } from '@/types/plans';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  onSuccess: () => void;
}

export function DeleteDialog({ open, onOpenChange, plan, onSuccess }: DeleteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const plansService = useMemo(() => new PlansService(), []);

  const handleDelete = async () => {
    if (!plan || !plan.id) return;
    
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-gray-100">¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-400">
            Esta acción no se puede deshacer. Esto eliminará permanentemente el plan 
            <span className="font-medium text-foreground dark:text-gray-200">{plan?.planName || 'seleccionado'}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
          >
            {isSubmitting ? (
              <Spinner size="sm" className="mr-2" />
            ) : null}
            {isSubmitting ? 'Eliminando...' : 'Eliminar Plan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 