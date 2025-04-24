import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Transaction } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Receipt, User, Calendar, CreditCard, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpenseDetailProps {
  expense: Transaction;
}

export default function ExpenseDetail({ expense }: ExpenseDetailProps) {
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
      
      // Verifica si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn(`Fecha inválida: ${dateString}`);
        return 'Fecha inválida';
      }
      
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error(`Error al formatear fecha: ${dateString}`, error);
      return 'Error de formato';
    }
  };

  // Formatear hora
  const formatDateTime = (dateString: string) => {
    try {
      if (!dateString) return 'Fecha/hora no disponible';
      
      // Intenta crear un objeto Date con el string proporcionado
      const date = new Date(dateString);
      
      // Verifica si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn(`Fecha/hora inválida: ${dateString}`);
        return 'Fecha/hora inválida';
      }
      
      return format(date, "d MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      console.error(`Error al formatear fecha/hora: ${dateString}`, error);
      return 'Error de formato';
    }
  };

  // Obtener el texto del método de pago
  const getPaymentMethodText = (transaction: Transaction) => {
    // Intentar obtener el método de pago desde metadata primero
    const metadataMethod = transaction.metadata?.paymentMethod;
    
    // Si existe en metadata, usarlo
    if (metadataMethod) {
      // Normalizar el método para evitar inconsistencias
      const method = typeof metadataMethod === 'string' ? metadataMethod.toLowerCase() : '';
      
      switch (method) {
        case "efectivo":
          return "Efectivo";
        case "tarjeta_debito":
        case "tarjeta debito":
        case "tarjetadebito":
          return "Tarjeta de Débito";
        case "tarjeta_credito":
        case "tarjeta credito":
        case "tarjetacredito":
          return "Tarjeta de Crédito";
        case "transferencia":
        case "transferencia_bancaria":
          return "Transferencia Bancaria";
        case "cheque":
          return "Cheque";
        default:
          // Si es un método personalizado, mostrar con primera letra en mayúscula
          if (method) {
            return method.charAt(0).toUpperCase() + method.slice(1);
          }
      }
    }
    
    // Fallback al método tradicional si no está en metadata
    const method = transaction.paymentMethod;
    switch (method) {
      case "efectivo":
        return "Efectivo";
      case "tarjeta_debito":
        return "Tarjeta de Débito";
      case "tarjeta_credito":
        return "Tarjeta de Crédito";
      case "transferencia":
        return "Transferencia Bancaria";
      case "cheque":
        return "Cheque";
      default:
        return "Otro";
    }
  };

  // Obtener el texto para el estado de la transacción
  const getStatusText = (status: string) => {
    // Normalizar el estado a minúsculas para comparaciones consistentes
    const normalizedStatus = status.toLowerCase();
    
    // Traducir estados en inglés
    switch (normalizedStatus) {
      case "completed":
        return "Completada";
      case "completada":
        return "Completada";
      case "pending":
      case "pendiente":
        return "Pendiente";
      case "canceled":
      case "cancelled":
      case "anulada":
      case "cancelada":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col space-y-1">
        <h3 className="text-lg font-semibold">{expense.description}</h3>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            style={{
              borderColor: expense.category?.color || "#64748b",
              backgroundColor: `${expense.category?.color || "#64748b"}10`,
            }}
          >
            {expense.category?.name || "Sin categoría"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDate(expense.date)}
          </span>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monto</span>
            <span className="text-xl font-bold">{formatCurrency(expense.amount)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Detalles del Gasto</h4>
        <Separator />
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Fecha</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(expense.date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Método de Pago</p>
              <p className="text-sm text-muted-foreground">
                {getPaymentMethodText(expense)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Estado</p>
              <p className="text-sm text-muted-foreground">
                {getStatusText(expense.status)}
              </p>
            </div>
          </div>

          {expense.reference && (
            <div className="flex items-start space-x-3">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Referencia</p>
                <p className="text-sm text-muted-foreground">{expense.reference}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Registrado por</p>
              <p className="text-sm text-muted-foreground">
                {expense.metadata?.processedBy?.name || expense.metadata?.processedBy?.email || expense.createdBy}
              </p>
            </div>
          </div>
          
          {expense.notes && (
            <div className="flex items-start space-x-3 col-span-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Notas</p>
                <p className="text-sm text-muted-foreground">{expense.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {expense.attachment && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Comprobante</h4>
          <Separator />
          <div className="flex justify-center p-2 border rounded-md">
            <a
              href={expense.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-md"
            >
              <img
                src={expense.attachment}
                alt="Comprobante"
                className="max-h-[200px] object-contain"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Ver original
                </Button>
              </div>
            </a>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Creado: {formatDateTime(expense.createdAt)}
        </p>
        {expense.updatedBy && (
          <p className="text-xs text-muted-foreground">
            Última modificación: {formatDateTime(expense.updatedAt)} por {expense.updatedBy}
          </p>
        )}
      </div>
    </div>
  );
} 