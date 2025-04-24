"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, User, Calendar, MoreHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { customToast } from "@/app/components/ui/custom-toast";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Invoice } from '../../billing/types';
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

interface InvoicesTableProps {
  data: Invoice[];
  onUpdateStatus: (invoiceId: string, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PAGADO":
      return "bg-green-500";
    case "PENDIENTE":
      return "bg-yellow-500";
    case "ATRASADO":
      return "bg-red-500";
    case "ANULADO":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

export function InvoicesTable({ data, onUpdateStatus }: InvoicesTableProps) {
  const { toast: toastInstance } = useToast();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice;
    direction: "asc" | "desc";
  } | null>(null);

  // Verificar facturas vencidas automáticamente
  useEffect(() => {
    const checkOverdueInvoices = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueInvoices = data.filter(invoice => {
        // Usar next_payment_due_date o date como fallback para la fecha de vencimiento
        const dueDateString = invoice.next_payment_due_date || invoice.date;
        if (!dueDateString) return false;
        const dueDate = new Date(dueDateString);
        dueDate.setHours(0, 0, 0, 0);
        // Verificar que no sea PAGADO ni PARCIAL (asumiendo que PARCIAL no se marca como atrasado)
        // El status "ATRASADO" no está en el tipo, así que no podemos comparar directamente con él
        return dueDate < today && invoice.status !== "PAGADO" && invoice.status !== "PARCIAL";
      });

      for (const invoice of overdueInvoices) {
        try {
          // Aún llamamos a onUpdateStatus con "ATRASADO", asumiendo que el backend lo maneja
          await onUpdateStatus(invoice.id, "ATRASADO");
          customToast.warning({
            title: "Factura Vencida",
            // Usar invoiceNumber
            description: `La factura ${invoice.invoiceNumber || invoice.id} ha sido marcada como atrasada automáticamente.`,
          });
        } catch (error) {
          console.error("Error al actualizar factura vencida:", error);
        }
      }
    };

    checkOverdueInvoices();
    const interval = setInterval(checkOverdueInvoices, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [data, onUpdateStatus]);

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    // Add null/undefined checks for sorting values
    const aValue = a[sortConfig.key as keyof Invoice];
    const bValue = b[sortConfig.key as keyof Invoice];
    
    // Handle null/undefined values - place them at the end perhaps
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1; // a is null/undefined, comes after b
    if (bValue == null) return -1; // b is null/undefined, comes after a

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      if (newStatus === "ANULADO") {
        customToast.warning({
          title: "Confirmar Anulación",
          description: "¿Estás seguro de que deseas anular esta factura? Esta acción no se puede deshacer.",
        });
        return;
      }

      await onUpdateStatus(invoiceId, newStatus);
      
      const statusMessages = {
        PAGADO: {
          title: "¡Pago registrado!",
          description: "La factura ha sido marcada como pagada exitosamente.",
          action: <ToastAction altText="Ver factura">Ver factura</ToastAction>
        },
        PENDIENTE: {
          title: "Estado actualizado",
          description: "La factura ha sido marcada como pendiente.",
          action: <ToastAction altText="Ver detalles">Ver detalles</ToastAction>
        },
        ATRASADO: {
          title: "⚠️ Factura atrasada",
          description: "La factura ha sido marcada como atrasada.",
          action: <ToastAction altText="Ver detalles">Ver detalles</ToastAction>
        },
        ANULADO: {
          title: "Factura Anulada",
          description: "La factura ha sido anulada exitosamente.",
          action: <ToastAction altText="Ver detalles">Ver detalles</ToastAction>
        }
      };

      const message = statusMessages[newStatus as keyof typeof statusMessages] || {
        title: "Estado actualizado",
        description: `La factura ha sido actualizada a: ${newStatus}`
      };

      switch (newStatus) {
        case "PAGADO":
          customToast.success(message);
          break;
        case "PENDIENTE":
          customToast.warning(message);
          break;
        case "ATRASADO":
          customToast.error(message);
          break;
        case "ANULADO":
          customToast.success(message);
          break;
        default:
          customToast.info(message);
      }
    } catch (error: any) {
      customToast.error({
        title: "Error al actualizar",
        description: error?.response?.data?.message || "No se pudo actualizar el estado de la factura. Por favor, intenta de nuevo.",
      });
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Panel de Estadísticas */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        {/* Contenido principal */}
        <div className="relative p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Facturas Pendientes */}
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-500 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    Facturas Pendientes
                  </h3>
                  <div className="mt-3">
                    <p className="text-4xl font-bold text-gray-900">
                      {formatCurrency(sortedData
                        .filter(i => i.status === "PENDIENTE")
                        // Usar amount
                        .reduce((acc, curr) => acc + curr.amount, 0)
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">
                        {sortedData.filter(i => i.status === "PENDIENTE").length} facturas
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">Pendiente</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-50 text-yellow-500"
                >
                  <span className="text-2xl font-bold">
                    {sortedData.filter(i => i.status === "PENDIENTE").length}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Facturas Atrasadas */}
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-500 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Facturas Atrasadas
                  </h3>
                  <div className="mt-3">
                    <p className="text-4xl font-bold text-gray-900">
                      {formatCurrency(sortedData
                         // No filtrar por "ATRASADO" ya que no está en el tipo InvoiceStatus
                        .filter(i => i.status !== 'PAGADO' && i.status !== 'PENDIENTE' && i.status !== 'PARCIAL')
                        // Usar amount
                        .reduce((acc, curr) => acc + curr.amount, 0)
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">
                         {/* Contar facturas no pagadas/pendientes/parciales como atrasadas para la estadística */}
                        {sortedData.filter(i => i.status !== 'PAGADO' && i.status !== 'PENDIENTE' && i.status !== 'PARCIAL').length} facturas
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-red-600">Atrasado</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-500"
                >
                  <span className="text-2xl font-bold">
                    {sortedData.filter(i => i.status !== 'PAGADO' && i.status !== 'PENDIENTE' && i.status !== 'PARCIAL').length}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Total Pagado */}
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-500 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Total Pagado
                  </h3>
                  <div className="mt-3">
                    <p className="text-4xl font-bold text-gray-900">
                      {formatCurrency(sortedData
                        .filter(i => i.status === "PAGADO")
                        // Usar amount
                        .reduce((acc, curr) => acc + curr.amount, 0)
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">
                        {sortedData.filter(i => i.status === "PAGADO").length} facturas
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-600">Pagado</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 text-green-500"
                >
                  <span className="text-2xl font-bold">
                    {sortedData.filter(i => i.status === "PAGADO").length}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Progreso de Pagos</span>
              <span>{((sortedData.filter(i => i.status === "PAGADO").length / sortedData.length) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(sortedData.filter(i => i.status === "PAGADO").length / sortedData.length) * 100}%` 
                }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
              />
            </div>
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Pagadas ({sortedData.filter(i => i.status === "PAGADO").length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Pendientes ({sortedData.filter(i => i.status === "PENDIENTE").length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  {/* TODO: Determine how to count 'Atrasado' invoices based on due date */}
                  <span>Atrasadas (0)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  {/* TODO: Determine how to count 'Anulado' invoices if status !== 'ANULADO' */}
                  <span>Anuladas (0)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>Total:</span>
                <span className="font-medium text-gray-900">{sortedData.length} facturas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de facturas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header de la lista */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
          <div>Nº Factura</div>
          <div>Cliente</div>
          <div>Emisión</div>
          <div>Vencimiento</div>
          <div className="text-right">Total</div>
          <div className="text-center">Estado</div>
        </div>

        {/* Lista de facturas */}
        <div className="divide-y divide-gray-100">
          {sortedData.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "group grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50 transition-colors",
              )}
            >
              {/* Número de factura y acciones */}
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium text-gray-900">{invoice.invoiceNumber || 'N/A'}</p>
                  <p className="text-xs text-gray-500">ID: {invoice.id.slice(0, 8)}</p>
                </div>
              </div>

              {/* Cliente */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-medium">{invoice.client?.name || invoice.client?.email || invoice.userId}</p>
              </div>

              {/* Fecha de emisión */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{new Date(invoice.date).toLocaleDateString()}</span>
              </div>

              {/* Fecha de vencimiento */}
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {invoice.next_payment_due_date ? new Date(invoice.next_payment_due_date).toLocaleDateString() : new Date(invoice.date).toLocaleDateString()}
                </span>
                {invoice.status === "PENDIENTE" && invoice.next_payment_due_date && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    {Math.ceil((new Date(invoice.next_payment_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
              </div>

              {/* Estado y acciones */}
              <div className="flex items-center justify-end space-x-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1",
                    getStatusColor(invoice.status),
                    "text-white"
                  )}
                >
                  {invoice.status}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Remove wrapper checking for ANULADO */}
                    {/* {invoice.status !== "ANULADO" && ( */} 
                      <>
                        {invoice.status === "PAGADO" ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(invoice.id, "ANULADO")}
                            className="text-gray-600"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Anular Factura
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(invoice.id, "PAGADO")}
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Marcar como Pagado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(invoice.id, "PENDIENTE")}
                              className="text-yellow-600"
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Marcar como Pendiente
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(invoice.id, "ATRASADO")}
                              className="text-red-600"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Marcar como Atrasado
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    {/* )} */} 
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 