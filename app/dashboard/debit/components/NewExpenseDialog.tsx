import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionCategory, CreateTransactionDto } from "../types";
import ExpenseForm from "./ExpenseForm";

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateExpense: (data: CreateTransactionDto) => Promise<void>;
  categories: TransactionCategory[];
  isCreating?: boolean;
}

export default function NewExpenseDialog({
  open,
  onOpenChange,
  onCreateExpense,
  categories,
  isCreating = false,
}: NewExpenseDialogProps) {
  console.log("🔍 NewExpenseDialog - categories recibidas:", categories);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto z-50"
        onInteractOutside={(e) => {
          // Prevenir cierre al interactuar con elementos externos
          if (isCreating) {
            e.preventDefault();
          }
        }}
        forceMount={true}
      >
        <DialogHeader className="sticky top-0 z-10 bg-background pt-4 pb-2">
          <DialogTitle className="text-xl">Registrar Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo gasto en el sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="px-1 py-2">
          <ExpenseForm
            onSubmit={(data) => {
              console.log("📤 NewExpenseDialog - datos a enviar:", data);
              console.log("📂 Categoría seleccionada:", data.categoryId);
              console.log("💳 Método de pago:", data.paymentMethod);
              return onCreateExpense(data as CreateTransactionDto);
            }}
            isSubmitting={isCreating}
            categories={categories}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 