"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethod } from "@/types/cash-closure";
import { formatCurrency } from "@/app/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentMethodSummaryProps {
  paymentMethods: PaymentMethod[];
  totalAmount: number;
  totalCredit?: number;
  totalDebit?: number;
  isLoading?: boolean;
}

export function PaymentMethodSummary({
  paymentMethods,
  totalAmount,
  totalCredit,
  totalDebit,
  isLoading = false,
}: PaymentMethodSummaryProps) {
  // Calcular totales si no vienen proporcionados
  const calculatedTotalCredit = totalCredit || (!isLoading ? paymentMethods.reduce((sum, method) => sum + method.credit, 0) : 0);
  const calculatedTotalDebit = totalDebit || (!isLoading ? paymentMethods.reduce((sum, method) => sum + method.debit, 0) : 0);

  return (
    <Card className="w-full border-t-4 border-t-primary/70 shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle className="text-xl text-primary flex items-center">
          <span className="inline-block w-2 h-6 bg-primary mr-2 rounded-sm"></span>
          Resumen por Método de Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b-2 border-b-muted/80">
                <TableHead className="w-[180px] font-semibold text-primary/80">Método de Pago</TableHead>
                <TableHead className="text-right font-semibold text-emerald-600/90">Total Ingresos</TableHead>
                <TableHead className="text-right font-semibold text-rose-600/80">Total Egresos</TableHead>
                <TableHead className="text-right font-semibold text-primary/80">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Mostrar filas skeleton durante la carga
                Array(3).fill(0).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell className="border-l-4 border-l-primary/40">
                      <Skeleton className="h-5 w-32 animate-pulse" />
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
                  </TableRow>
                ))
              ) : paymentMethods.length > 0 ? (
                // Mostrar datos reales cuando no está cargando y hay métodos de pago
                paymentMethods.map((method, index) => (
                  <TableRow key={method.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell className="font-medium border-l-4 border-l-primary/40">{method.name}</TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(method.credit)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600">
                      {formatCurrency(method.debit)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${method.total < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                      {formatCurrency(method.total)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Mostrar mensaje cuando no hay métodos de pago
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No hay datos de métodos de pago disponibles
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="border-t-2 border-t-muted/80 bg-muted/30">
                <TableCell className="font-bold text-primary">Total General</TableCell>
                <TableCell className="text-right font-bold text-emerald-700">
                  {isLoading ? (
                    <Skeleton className="h-6 w-28 ml-auto animate-pulse bg-emerald-200/50" />
                  ) : (
                    formatCurrency(calculatedTotalCredit)
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-rose-700">
                  {isLoading ? (
                    <Skeleton className="h-6 w-28 ml-auto animate-pulse bg-rose-200/50" />
                  ) : (
                    formatCurrency(calculatedTotalDebit)
                  )}
                </TableCell>
                <TableCell className={`text-right font-bold text-lg ${!isLoading && totalAmount < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {isLoading ? (
                    <Skeleton className="h-7 w-28 ml-auto animate-pulse bg-primary/20" />
                  ) : (
                    formatCurrency(totalAmount)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 