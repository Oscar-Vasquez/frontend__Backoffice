"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { CashClosure } from "@/types/cash-closure";
import { formatCurrency } from "@/app/utils/format";
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from "lucide-react";

interface CashClosureActionsProps {
  cashClosure: CashClosure;
  onCloseCashClosure: () => Promise<void>;
}

export function CashClosureActions({
  cashClosure,
  onCloseCashClosure,
}: CashClosureActionsProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseCashClosure = async () => {
    setIsLoading(true);
    try {
      await onCloseCashClosure();
      toast({
        title: "Cierre de caja completado",
        description: "El cierre de caja se ha realizado correctamente.",
        variant: "default",
        className: "bg-emerald-50 text-emerald-900 border-emerald-200",
      });
      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Error al cerrar la caja:", error);
      toast({
        title: "Error al cerrar la caja",
        description: "No se pudo completar el cierre de caja. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Si la caja ya está cerrada o hay un mensaje, no mostrar botón de cierre
  if (cashClosure.status === "closed" || cashClosure.message) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsConfirmOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white shadow-sm font-medium px-4 py-2"
      >
        Cerrar Caja
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="border-t-4 border-t-primary/70 shadow-lg">
          <AlertDialogHeader className="bg-gradient-to-r from-primary/10 to-background pb-4">
            <AlertDialogTitle className="text-xl flex items-center">
              <span className="inline-block w-2 h-6 bg-primary mr-2 rounded-sm"></span>
              ¿Confirmar cierre de caja?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Esta acción cerrará la caja actual con un balance final de{" "}
              <span className="font-bold text-primary inline-block bg-primary/10 px-2 py-0.5 rounded">
                {formatCurrency(cashClosure.totalAmount)}
              </span>
              <div className="flex flex-col gap-2 mt-3 bg-muted/20 p-3 rounded-lg border border-muted/40">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-600">Total Ingresos:</span> 
                  <span className="font-semibold text-emerald-700">{formatCurrency(cashClosure.totalCredit)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-rose-600">Total Egresos:</span> 
                  <span className="font-semibold text-rose-700">{formatCurrency(cashClosure.totalDebit)}</span>
                </div>
                <div className="flex justify-between items-center font-medium border-t border-muted/50 pt-1 mt-1">
                  <span className="text-primary">Balance Final:</span> 
                  <span className="font-bold text-primary">{formatCurrency(cashClosure.totalAmount)}</span>
                </div>
              </div>
              <div className="mt-3 text-muted-foreground/80">No podrás deshacer esta acción.</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel 
              disabled={isLoading}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              <XCircleIcon className="h-4 w-4 mr-1" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCloseCashClosure();
              }}
              disabled={isLoading}
              className="bg-primary text-white hover:bg-primary/90 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Sí, cerrar caja
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 