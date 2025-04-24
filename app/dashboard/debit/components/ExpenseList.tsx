import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, ArrowUpDown, Trash2, Edit, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Transaction, SortOrder, UpdateTransactionDto, CreateTransactionDto } from "../types";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpenseDetail from "./ExpenseDetail";
import ExpenseForm from "./ExpenseForm";

interface ExpenseListProps {
  expenses: Transaction[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (data: UpdateTransactionDto) => Promise<void>;
  isLoading: boolean;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

export default function ExpenseList({
  expenses,
  onDelete,
  onUpdate,
  isLoading,
  sortOrder,
  setSortOrder,
}: ExpenseListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Fecha no disponible';
      
      // Intenta crear un objeto Date con el string proporcionado
      const date = new Date(dateString);
      
      // Verifica si la fecha es válida (isNaN retorna true para fechas inválidas)
      if (isNaN(date.getTime())) {
        console.warn(`Fecha inválida: ${dateString}`);
        return 'Fecha inválida';
      }
      
      return format(date, "d MMM yyyy", { locale: es });
    } catch (error) {
      console.error(`Error al formatear fecha: ${dateString}`, error);
      return 'Error de formato';
    }
  };

  // Manejar el cambio de orden de las transacciones
  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  // Manejar la eliminación de una transacción
  const handleDelete = async () => {
    if (!selectedTransaction) return;
    
    try {
      setIsProcessing(true);
      await onDelete(selectedTransaction.id);
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error al eliminar la transacción:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar la actualización de una transacción
  const handleUpdate = async (data: CreateTransactionDto | UpdateTransactionDto) => {
    // Type guard para asegurar que tenemos UpdateTransactionDto antes de llamar a onUpdate
    if (!('id' in data)) {
      console.error("handleUpdate recibió CreateTransactionDto inesperadamente en contexto de edición.");
      // Podrías mostrar un toast de error aquí
      return;
    }
    
    // Ahora TS sabe que data es UpdateTransactionDto aquí
    try {
      setIsProcessing(true);
      await onUpdate(data); // Llamada segura
      setEditDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error al actualizar la transacción:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Obtener el estilo de color para la categoría
  const getCategoryStyle = (transaction: Transaction) => {
    const color = transaction.category?.color || "#64748b";
    return {
      borderColor: color,
      backgroundColor: `${color}10`,
    };
  };

  // Obtener el ícono para el método de pago
  const getPaymentMethodBadge = (transaction: Transaction) => {
    // Intentar obtener el método de pago desde metadata primero
    const metadataMethod = transaction.metadata?.paymentMethod;
    
    // Si existe en metadata, usarlo
    if (metadataMethod) {
      // Normalizar el método para evitar inconsistencias
      const method = typeof metadataMethod === 'string' ? metadataMethod.toLowerCase() : '';
      
      switch (method) {
        case "efectivo":
          return <Badge variant="outline">Efectivo</Badge>;
        case "tarjeta_debito":
        case "tarjeta debito":
        case "tarjetadebito":
          return <Badge variant="outline">Tarjeta débito</Badge>;
        case "tarjeta_credito":
        case "tarjeta credito":
        case "tarjetacredito":
          return <Badge variant="outline">Tarjeta crédito</Badge>;
        case "transferencia":
        case "transferencia_bancaria":
          return <Badge variant="outline">Transferencia</Badge>;
        case "cheque":
          return <Badge variant="outline">Cheque</Badge>;
        default:
          // Si es un método personalizado, mostrar con primera letra en mayúscula
          if (method) {
            const formattedMethod = method.charAt(0).toUpperCase() + method.slice(1);
            return <Badge variant="outline">{formattedMethod}</Badge>;
          }
      }
    }
    
    // Fallback al método tradicional si no está en metadata
    const method = transaction.paymentMethod;
    switch (method) {
      case "efectivo":
        return <Badge variant="outline">Efectivo</Badge>;
      case "tarjeta_debito":
        return <Badge variant="outline">Tarjeta débito</Badge>;
      case "tarjeta_credito":
        return <Badge variant="outline">Tarjeta crédito</Badge>;
      case "transferencia":
        return <Badge variant="outline">Transferencia</Badge>;
      case "cheque":
        return <Badge variant="outline">Cheque</Badge>;
      default:
        return <Badge variant="outline">Otro</Badge>;
    }
  };

  // Obtener el badge para el estado de la transacción
  const getStatusBadge = (status: string) => {
    // Normalizar el estado a minúsculas para comparaciones consistentes
    const normalizedStatus = status.toLowerCase();
    
    // Traducir estados en inglés
    switch (normalizedStatus) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500">Completada</Badge>;
      case "completada":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500">Completada</Badge>;
      case "pending":
      case "pendiente":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500">Pendiente</Badge>;
      case "canceled":
      case "cancelled":
      case "anulada":
      case "cancelada":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                  onClick={handleSortOrderChange}
                >
                  Fecha
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Método</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((transaction) => (
              <TableRow key={transaction.id} className="group hover:bg-muted/50">
                <TableCell className="min-w-[180px] truncate font-medium">
                  {transaction.description}
                  {transaction.reference && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Ref: {transaction.reference}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={getCategoryStyle(transaction)}
                  >
                    {transaction.category?.name || "Sin categoría"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(transaction.status)}
                </TableCell>
                <TableCell className="text-center">
                  {getPaymentMethodBadge(transaction)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La transacción se eliminará permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para ver detalles de la transacción */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Detalle de la Transacción</DialogTitle>
          </DialogHeader>
          {selectedTransaction && <ExpenseDetail expense={selectedTransaction} />}
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar la transacción */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <ExpenseForm
              transaction={selectedTransaction}
              onSubmit={handleUpdate}
              isSubmitting={isProcessing}
              categories={[]}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 