"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { customToast } from "@/app/components/ui/custom-toast";

interface Branch {
  id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  isActive: boolean;
}

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSuccess: () => void;
}

export function DeleteDialog({ open, onOpenChange, branch, onSuccess }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!branch) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches/${branch.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('workexpress_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar la sucursal');
      }

      customToast.success({
        title: "Sucursal Eliminada",
        description: "La sucursal se eliminó correctamente"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      customToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la sucursal"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Sucursal</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la sucursal "{branch?.name}"? Esta acción no se puede deshacer.
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
            disabled={loading || !branch}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 