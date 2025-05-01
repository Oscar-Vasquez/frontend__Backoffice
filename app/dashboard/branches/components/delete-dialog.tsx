"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { customToast } from "@/app/components/ui/custom-toast";
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!branch) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('workexpress_token');
      if (!token) {
        router.push('/auth/login');
        throw new Error('Token no encontrado');
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/branches/${branch.id}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push('/auth/login');
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar la sucursal');
      }

      customToast.success({
        title: "Sucursal Eliminada",
        description: `La sucursal ${branch.name} ha sido eliminada.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting branch:', error);
      customToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : 'No se pudo eliminar la sucursal.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-background dark:border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-foreground">¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-muted-foreground">
            Esta acción no se puede deshacer. Esto eliminará permanentemente la sucursal 
            <span className="font-semibold dark:text-foreground">{branch?.name ?? ''}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading} className="dark:text-foreground dark:border-border dark:hover:bg-muted">
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90">
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Eliminar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 