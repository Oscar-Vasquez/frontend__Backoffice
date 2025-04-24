"use client";

import React, { useState, useCallback, memo } from "react";
import { CashClosureHistoryItem, CashClosureFilters } from "@/types/cash-closure";
import { formatCurrency } from "@/app/utils/format";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentMethodSummary } from "./payment-method-summary";
import { Pagination } from "@/components/ui/pagination";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "./date-range-picker";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, SearchXIcon, EyeIcon, UserIcon, DollarSignIcon, ListIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CashClosureHistoryProps {
  cashClosures: CashClosureHistoryItem[];
  isLoading: boolean;
  filters: CashClosureFilters;
  onFilterChange: (filters: CashClosureFilters) => void;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// Componente para los detalles del cierre
const ClosureDetails = memo(({ closure }: { closure: CashClosureHistoryItem }) => {
  return (
    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
      <div className="bg-primary text-white py-4 px-6 border-b">
        <DialogTitle className="text-lg font-semibold flex items-center">
          <span className="w-1.5 h-5 bg-white mr-2 rounded-sm inline-block"></span>
          Detalles del Cierre de Caja
        </DialogTitle>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* Fecha y hora */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Fecha y Hora</h3>
            <p className="text-base font-medium">
              {format(new Date(closure.closedAt || new Date()), "dd MMMM yyyy - HH:mm", { locale: es })} hrs
            </p>
          </div>
        </div>

        {/* Cerrado por */}
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Cerrado por</h3>
            <p className="text-base font-medium">{closure.closedBy?.name || "No disponible"}</p>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="pt-3">
          <h3 className="flex items-center text-base font-medium text-primary mb-3">
            <DollarSignIcon className="h-5 w-5 mr-2" />
            Resumen Financiero
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3">
              <p className="text-xs font-medium text-emerald-600 mb-1">Total Ingresos</p>
              <p className="text-lg font-bold text-emerald-700">
                ${Number(closure.totalCredit || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-md p-3">
              <p className="text-xs font-medium text-rose-600 mb-1">Total Egresos</p>
              <p className="text-lg font-bold text-rose-700">
                ${Number(closure.totalDebit || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
              <p className="text-xs font-medium text-blue-600 mb-1">Balance Final</p>
              <p className="text-lg font-bold text-blue-700">
                ${Number(closure.totalAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Desglose por método de pago */}
        <div className="pt-2">
          <h3 className="flex items-center text-base font-medium text-primary mb-3">
            <ListIcon className="h-5 w-5 mr-2" />
            Desglose por Método de Pago
          </h3>
          
          <div className="border rounded-md overflow-hidden">
            <div className="bg-primary/10 p-3 flex items-center justify-between border-b">
              <div className="text-primary font-medium">Resumen por Método de Pago</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Método de Pago</th>
                    <th className="text-right p-3 font-medium text-emerald-600">Total Ingresos</th>
                    <th className="text-right p-3 font-medium text-rose-600">Total Egresos</th>
                    <th className="text-right p-3 font-medium text-primary">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {closure.paymentMethodDetails?.map((method, index) => (
                    <tr key={method.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                      <td className="p-3 font-medium border-l-2 border-l-primary/40">{method.name}</td>
                      <td className="p-3 text-right text-emerald-600">
                        ${Number(method.credit || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-rose-600">
                        ${Number(method.debit || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 text-right font-medium ${(method.total || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${Number(method.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {(!closure.paymentMethodDetails || closure.paymentMethodDetails.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-muted-foreground">
                        No hay detalles de métodos de pago disponibles
                      </td>
                    </tr>
                  )}
                  <tr className="border-t font-medium bg-muted/20">
                    <td className="p-3 text-primary">Total General</td>
                    <td className="p-3 text-right text-emerald-700">
                      ${Number(closure.totalCredit || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-rose-700">
                      ${Number(closure.totalDebit || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`p-3 text-right font-bold ${(closure.totalAmount || 0) < 0 ? 'text-rose-700' : 'text-blue-700'}`}>
                      ${Number(closure.totalAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
});

ClosureDetails.displayName = "ClosureDetails";

export function CashClosureHistory({
  cashClosures,
  isLoading,
  filters,
  onFilterChange,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
}: CashClosureHistoryProps) {
  const [selectedClosure, setSelectedClosure] = useState<CashClosureHistoryItem | null>(null);
  
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    if (!range) {
      onFilterChange({ ...filters, startDate: undefined, endDate: undefined });
      return;
    }
    
    if (range.from) {
      const startDate = format(range.from, "yyyy-MM-dd");
      const endDate = range.to ? format(range.to, "yyyy-MM-dd") : startDate;
      
      // Solo actualizar si las fechas son diferentes
      if (startDate !== filters.startDate || endDate !== filters.endDate) {
        onFilterChange({ ...filters, startDate, endDate });
      }
    }
  }, [filters, onFilterChange]);

  // Manejador para abrir detalles
  const handleShowDetails = useCallback((closure: CashClosureHistoryItem) => {
    setSelectedClosure(closure);
  }, []);

  // Manejador para cerrar detalles
  const handleCloseDetails = useCallback((open: boolean) => {
    if (!open) setSelectedClosure(null);
  }, []);

  return (
    <Card className="w-full shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-primary flex items-center">
              <span className="inline-block w-2 h-6 bg-primary mr-2 rounded-sm"></span>
              Historial de Cierres de Caja
            </CardTitle>
            <CardDescription className="mt-1 flex items-center text-muted-foreground">
              <CalendarIcon className="h-4 w-4 mr-1 text-primary/60" />
              Visualiza y filtra el historial de cierres de caja
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Filtros */}
        <div className="p-4 bg-muted/10 border-b border-muted/30">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1.5">Rango de Fechas</p>
              <DateRangePicker
                initialDateFrom={filters.startDate ? new Date(filters.startDate) : undefined}
                initialDateTo={filters.endDate ? new Date(filters.endDate) : undefined}
                onUpdate={handleDateRangeChange}
              />
            </div>
          </div>
        </div>

        {/* Tabla de historial */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/40">
                <TableHead className="w-[160px]">Fecha y Hora</TableHead>
                <TableHead className="w-[140px]">Cerrado Por</TableHead>
                <TableHead className="text-right">Total Ingresos</TableHead>
                <TableHead className="text-right">Total Egresos</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Mostrar filas skeleton durante la carga
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className={index % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                    <TableCell>
                      <Skeleton className="h-5 w-32 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28 animate-pulse" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-24 ml-auto animate-pulse bg-emerald-100/50" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-24 ml-auto animate-pulse bg-rose-100/50" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-24 ml-auto animate-pulse bg-primary/10" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-md ml-auto animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : cashClosures.length > 0 ? (
                cashClosures.map((closure) => (
                  <TableRow key={closure.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      {format(new Date(closure.closedAt || new Date()), "dd MMM yyyy - HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {closure.closedBy?.name || "No disponible"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      {formatCurrency(closure.totalCredit || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-rose-600">
                      {formatCurrency(closure.totalDebit || 0)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${(closure.totalAmount || 0) < 0 ? 'text-destructive' : 'text-primary'}`}>
                      {formatCurrency(closure.totalAmount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleShowDetails(closure)}
                      >
                        <span className="sr-only">Ver detalles</span>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <SearchXIcon className="h-8 w-8 mb-2 text-muted-foreground/70" />
                      <p>No se encontraron cierres de caja</p>
                      {(filters.startDate || filters.endDate) && (
                        <Button
                          variant="link"
                          className="text-primary mt-1 h-auto p-0"
                          onClick={() => onFilterChange({ ...filters, startDate: undefined, endDate: undefined })}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {isLoading ? (
          <div className="py-4 flex justify-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
              <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
              <Skeleton className="h-8 w-10 rounded-md animate-pulse bg-primary/20" />
              <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
              <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
            </div>
          </div>
        ) : totalItems > pageSize && (
          <div className="p-4 flex justify-center">
            <Pagination
              totalItems={totalItems}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </CardContent>

      {/* Diálogo de detalles */}
      <Dialog open={!!selectedClosure} onOpenChange={(open) => handleCloseDetails(open)}>
        {selectedClosure && <ClosureDetails closure={selectedClosure} />}
      </Dialog>
    </Card>
  );
} 