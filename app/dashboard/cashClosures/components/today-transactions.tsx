"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency } from "@/app/utils/format";
import { TransactionsService, Transaction } from "@/app/services/transactions.service";
import { ArrowDownIcon, ArrowUpIcon, RefreshCw, CreditCardIcon, ClockIcon, CalendarIcon, TagIcon } from "lucide-react";

interface TodayTransactionsProps {
  onDataUpdate?: (data: { totalCredit: number; totalDebit: number }) => void;
  className?: string;
}

export function TodayTransactions({ onDataUpdate, className }: TodayTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [periodInfo, setPeriodInfo] = useState({
    date: "",
    period: "",
    cutoffTime: ""
  });
  const [summary, setSummary] = useState({
    totalCredit: 0,
    totalDebit: 0
  });

  // Cargar transacciones del período actual
  const loadTransactions = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await TransactionsService.getTodayTransactions(page, pageSize);
      setTransactions(result.data);
      setTotalItems(result.meta.total);
      
      setPeriodInfo({
        date: result.meta.date || "",
        period: result.meta.period || "",
        cutoffTime: result.meta.cutoffTime || "18:00"
      });
      
      // Actualizar el resumen con los totales del backend
      if (result.meta.summary) {
        setSummary(result.meta.summary);
        
        // Notificar al componente padre si se proporciona la función onDataUpdate
        if (onDataUpdate) {
          onDataUpdate(result.meta.summary);
        }
      } else {
        // Si no hay resumen, calcular los totales desde las transacciones
        const totalCredit = result.data
          .filter(tx => isIncome(tx))
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        const totalDebit = result.data
          .filter(tx => !isIncome(tx))
          .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
        
        const calculatedSummary = { totalCredit, totalDebit };
        setSummary(calculatedSummary);
        
        if (onDataUpdate) {
          onDataUpdate(calculatedSummary);
        }
      }
    } catch (error) {
      console.error("Error al cargar las transacciones del período:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadTransactions(page);
  };

  // Manejar recarga de datos
  const handleReload = () => {
    loadTransactions(currentPage);
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatear fecha para mostrar
  const formatDate = (transaction: Transaction) => {
    // Si tenemos la fecha local formateada, la usamos directamente
    if (transaction.transactionDateLocal) {
      // Solo extraemos la parte de la hora (HH:mm) de la fecha local formateada
      const parts = transaction.transactionDateLocal.split(' ');
      if (parts.length > 1) {
        return parts[1]; // Devuelve solo la parte de la hora
      }
      return transaction.transactionDateLocal;
    }
    
    // Fallback: Si no tenemos fecha local, formateamos la fecha UTC
    const date = new Date(transaction.transactionDate);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determinar si una transacción es ingreso o egreso basado en los details
  const isIncome = (transaction: Transaction): boolean => {
    // Si tenemos los detalles del tipo de transacción, usamos affectsBalance como prioridad
    if (transaction.transactionTypeDetails?.affectsBalance) {
      // 'credit' significa ingreso, 'debit' significa egreso
      return transaction.transactionTypeDetails.affectsBalance === 'credit';
    }
    
    // Si no tenemos los detalles del tipo, intentamos inferir por la categoría
    if (transaction.category?.name) {
      const categoryName = transaction.category.name.toLowerCase();
      // Si la categoría es "gastos", "egresos" o similar, es un egreso
      if (categoryName.includes('gasto') || categoryName.includes('egreso')) {
        return false;
      }
      // Si la categoría es "ingresos" o similar, es un ingreso
      if (categoryName.includes('ingreso')) {
        return true;
      }
    }
    
    // Como último recurso, nos basamos en el monto
    return transaction.amount !== undefined && transaction.amount > 0;
  };

  // Obtener badge de tipo de transacción
  const getTransactionTypeBadge = (transaction: Transaction) => {
    const isCredit = isIncome(transaction);
    
    if (isCredit) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200">
          <ArrowDownIcon className="h-3 w-3 mr-1 text-emerald-600" />
          Ingreso
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200">
          <ArrowUpIcon className="h-3 w-3 mr-1 text-rose-600" />
          Egreso
        </Badge>
      );
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pagado':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Pagado
          </Badge>
        );
      case 'pendiente':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pendiente
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            {status}
          </Badge>
        );
    }
  };

  // Función para determinar el método de pago a mostrar
  const getPaymentMethod = (transaction: Transaction): string => {
    let methodName = 'Efectivo'; // Valor por defecto
    let nameFromMetadata = false; // Flag para controlar si el nombre viene de los metadatos
    let isEfectivo = false; // Flag para indicar si es el método efectivo
    
    // 1. Primera prioridad: metadatos.paymentMethod
    if (transaction.metadata && typeof transaction.metadata === 'object') {
      if ('paymentMethod' in transaction.metadata && typeof transaction.metadata.paymentMethod === 'string') {
        nameFromMetadata = true; // Marcar que el nombre viene de los metadatos
        
        // Formatear para que sea presentable
        const metaMethodName = transaction.metadata.paymentMethod.toString().toLowerCase();
        if (metaMethodName === 'efectivo') {
          // Siempre usar "Efectivo" cuando viene "efectivo" en los metadatos
          methodName = 'Efectivo';
          isEfectivo = true; // Marcar que este es el método efectivo
        } else if (metaMethodName === 'tarjeta' || metaMethodName === 'tarjeta-credito' || metaMethodName === 'tarjeta-de-credito') {
          methodName = 'Tarjeta de Crédito';
        } else if (metaMethodName === 'tarjeta-debito' || metaMethodName === 'tarjeta-de-debito') {
          methodName = 'Tarjeta de Débito';
        } else if (metaMethodName === 'transferencia' || metaMethodName === 'transferencia-bancaria') {
          methodName = 'Transferencia Bancaria';
        } else {
          // Capitalizar primera letra de cada palabra
          methodName = metaMethodName.split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }
    }
    
    // 2. Segunda prioridad: objeto paymentMethod
    // Solo usamos esto si no encontramos información en los metadatos o para complementar
    // Y nunca sobreescribimos si es efectivo
    if (transaction.paymentMethod && transaction.paymentMethod.name) {
      // Si el paymentMethod.name es "Pago en Tienda", considerarlo como efectivo
      if (transaction.paymentMethod.name === "Pago en Tienda") {
        methodName = 'Efectivo';
        isEfectivo = true;
      }
      // Solo sobreescribir el nombre si NO lo obtuvimos de los metadatos y NO es efectivo
      else if (!nameFromMetadata && !isEfectivo) {
        methodName = transaction.paymentMethod.name;
      }
    }
    
    return methodName;
  };

  return (
    <Card className={`w-full shadow-sm border-t-4 border-t-primary/50 ${className}`}>
      <CardHeader className="bg-muted/20 pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-primary flex items-center">
              <span className="inline-block w-2 h-6 bg-primary mr-2 rounded-sm"></span>
              Transacciones del Período Actual
            </CardTitle>
            <CardDescription className="space-y-1">
              <span className="flex items-center text-sm">
                <ClockIcon className="h-4 w-4 mr-1 text-primary/60" />
                Hora de corte: {isLoading ? (
                  <Skeleton className="h-4 w-16 ml-1 rounded-sm animate-pulse" />
                ) : (
                  periodInfo.cutoffTime
                )}
              </span>
              {(isLoading || periodInfo.period) && (
                <span className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-1 text-primary/60" />
                  Período: {isLoading ? (
                    <Skeleton className="h-4 w-24 ml-1 rounded-sm animate-pulse" />
                  ) : (
                    periodInfo.period
                  )}
                </span>
              )}
              <div className="flex gap-3 pt-1">
                <span className="text-sm bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                  Ingresos: {isLoading ? (
                    <Skeleton className="h-4 w-20 inline-block rounded-sm animate-pulse bg-emerald-200/50" />
                  ) : (
                    formatCurrency(summary.totalCredit)
                  )}
                </span>
                <span className="text-sm bg-rose-50 text-rose-700 px-2 py-1 rounded-md border border-rose-100">
                  Egresos: {isLoading ? (
                    <Skeleton className="h-4 w-20 inline-block rounded-sm animate-pulse bg-rose-200/50" />
                  ) : (
                    formatCurrency(summary.totalDebit)
                  )}
                </span>
                <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                  Balance: {isLoading ? (
                    <Skeleton className="h-4 w-20 inline-block rounded-sm animate-pulse bg-blue-200/50" />
                  ) : (
                    formatCurrency(summary.totalCredit - summary.totalDebit)
                  )}
                </span>
              </div>
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReload} 
            disabled={isLoading}
            className="border-primary/30 text-primary/80"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/40">
                <TableHead className="w-[100px]">Hora</TableHead>
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[170px]">Método de Pago</TableHead>
                <TableHead className="w-[150px]">Categoría</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(7).fill(0).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                    <TableCell><Skeleton className="h-5 w-16 animate-pulse" /></TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-md animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-md animate-pulse" />
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-full animate-pulse" /></TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full animate-pulse" />
                        <Skeleton className="h-5 w-28 animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full animate-pulse" />
                        <Skeleton className="h-5 w-28 animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-20 ml-auto animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <TableRow 
                    key={transaction.id}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/10"}
                  >
                    <TableCell className="font-medium">
                      {formatDate(transaction)}
                    </TableCell>
                    <TableCell>
                      {getTransactionTypeBadge(transaction)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      {transaction.description || "Sin descripción"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                        {getPaymentMethod(transaction)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                          {transaction.category.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin categoría</span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${
                      isIncome(transaction) 
                        ? "text-emerald-600" 
                        : "text-rose-600"
                    }`}>
                      {transaction.amount !== undefined 
                        ? formatCurrency(Math.abs(transaction.amount))
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-muted-foreground/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>No hay transacciones en el período actual</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleReload} 
                        className="mt-2"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Actualizar datos
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
          <div className="py-4 flex justify-center">
            <Pagination 
              totalItems={totalItems}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 