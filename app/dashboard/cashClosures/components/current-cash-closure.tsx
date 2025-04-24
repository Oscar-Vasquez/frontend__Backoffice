"use client";

import { useState, useEffect } from "react";
import { CashClosure } from "@/types/cash-closure";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentMethodSummary } from "./payment-method-summary";
import { CashClosureActions } from "./cash-closure-actions";
import { TodayTransactions } from "./today-transactions";
import { ClockIcon, CalendarIcon, DollarSignIcon, ListIcon, AlertCircleIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CurrentCashClosureProps {
  cashClosure: CashClosure;
  onCloseCashClosure: () => Promise<void>;
  isLoading: boolean;
}

export function CurrentCashClosure({
  cashClosure,
  onCloseCashClosure,
  isLoading,
}: CurrentCashClosureProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [transactionSummary, setTransactionSummary] = useState({
    totalCredit: 0,
    totalDebit: 0
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Manejador para actualizar los totales de transacciones
  const handleTransactionsDataUpdate = (data: { totalCredit: number; totalDebit: number }) => {
    console.log("Datos de transacciones actualizados:", data);
    setTransactionSummary(data);
    setIsSummaryLoading(false); // Una vez que tenemos datos, quitamos el estado de carga
  };

  // Efecto para establecer un timeout para el estado de carga del resumen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSummaryLoading(false);
    }, 1500); // Tiempo máximo para mostrar el skeleton si no llegan datos

    return () => clearTimeout(timer);
  }, []);

  // Cuando cambian los datos de cashClosure, actualizar el estado de carga
  useEffect(() => {
    if (!isLoading && cashClosure?.paymentMethods?.length > 0) {
      setIsSummaryLoading(false);
    }
  }, [isLoading, cashClosure]);

  // Si la página completa está cargando, mostrar un skeleton completo
  if (isLoading) {
    return (
      <Card className="w-full shadow-md border border-muted/50 overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-background border-b border-muted/30">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-7 w-40 animate-pulse" />
              <Skeleton className="h-5 w-56 mt-2 animate-pulse" />
            </div>
            <Skeleton className="h-8 w-32 rounded-full animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 p-4">
          <div className="bg-muted/20 p-4 rounded-lg border border-muted/50">
            <Skeleton className="h-6 w-48 mb-4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 bg-background p-3 rounded-md shadow-sm border border-muted/30">
                <Skeleton className="h-5 w-32 animate-pulse" />
                <Skeleton className="h-6 w-48 animate-pulse" />
              </div>
              <div className="space-y-2 bg-background p-3 rounded-md shadow-sm border border-muted/30">
                <Skeleton className="h-5 w-32 animate-pulse" />
                <Skeleton className="h-6 w-full animate-pulse" />
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="grid w-full grid-cols-2 mb-4 bg-muted/30 rounded-md">
              <Skeleton className="h-10 w-full mx-1 rounded-md animate-pulse" />
              <Skeleton className="h-10 w-full mx-1 rounded-md animate-pulse" />
            </div>
            
            <PaymentMethodSummary
              paymentMethods={[]}
              totalAmount={0}
              totalCredit={0}
              totalDebit={0}
              isLoading={true}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-muted/10 border-t border-muted/30 py-4">
          <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
        </CardFooter>
      </Card>
    );
  }

  const startTime = cashClosure.createdAt
    ? new Date(cashClosure.createdAt)
    : new Date();
  
  // Determinar período del cierre de caja (considerando la hora de corte de 6:00 PM)
  const startDate = format(startTime, "dd MMM yyyy", { locale: es });
  const cutoffHour = "18:00"; // 6:00 PM

  return (
    <Card className="w-full shadow-md border border-muted/50 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-background border-b border-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-primary flex items-center">
              <span className="inline-block w-2 h-6 bg-primary mr-2 rounded-sm"></span>
              Caja Actual
            </CardTitle>
            <CardDescription className="mt-1 flex items-center text-muted-foreground">
              <CalendarIcon className="h-4 w-4 mr-1 text-primary/60" />
              Periodo: {startDate} desde {format(startTime, "HH:mm")} hrs
            </CardDescription>
          </div>
          <Badge
            variant={cashClosure.status === "open" ? "outline" : "secondary"}
            className={`text-sm font-semibold px-4 py-1.5 ${
              cashClosure.status === "open" 
                ? "border-2 border-emerald-500/70 text-emerald-600 bg-emerald-50"
                : "bg-amber-100 text-amber-700 border-amber-200"
            }`}
          >
            {cashClosure.status === "open" ? "Caja Abierta" : "Caja Cerrada"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 p-4">
        {cashClosure.message && (
          <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircleIcon className="h-5 w-5" />
            <AlertTitle className="text-amber-800 font-semibold">Nota Importante</AlertTitle>
            <AlertDescription>
              {cashClosure.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/20 p-4 rounded-lg border border-muted/50">
          <h3 className="text-lg font-semibold mb-4 text-primary flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-primary/70" />
            Información General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-background p-3 rounded-md shadow-sm border border-muted/30">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ClockIcon className="h-4 w-4 mr-1 text-primary/60" />
                Hora de Apertura
              </p>
              <p className="font-medium text-foreground">
                {format(startTime, "dd MMMM yyyy - HH:mm", { locale: es })} hrs
              </p>
            </div>
            <div className="space-y-2 bg-background p-3 rounded-md shadow-sm border border-muted/30">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ClockIcon className="h-4 w-4 mr-1 text-primary/60" />
                Hora de Corte
              </p>
              <p className="font-medium text-foreground">
                {cutoffHour} hrs 
                <span className="text-xs text-muted-foreground ml-1">
                  (Transacciones después de esta hora se 
                  contabilizarán en el siguiente día)
                </span>
              </p>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="summary"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="summary" className="flex items-center">
              <DollarSignIcon className="h-4 w-4 mr-2" />
              Resumen Financiero
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center">
              <ListIcon className="h-4 w-4 mr-2" />
              Transacciones del Período
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4 mt-2">
            {/* Mostrar el resumen predeterminado con estado de carga si estamos en la pestaña "summary" */}
            {activeTab === "summary" && (
              <PaymentMethodSummary
                paymentMethods={cashClosure.paymentMethods}
                totalAmount={cashClosure.totalAmount}
                totalCredit={transactionSummary.totalCredit || cashClosure.totalCredit}
                totalDebit={transactionSummary.totalDebit || cashClosure.totalDebit}
                isLoading={isSummaryLoading}
              />
            )}
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4 mt-2">
            <TodayTransactions 
              onDataUpdate={handleTransactionsDataUpdate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end bg-muted/10 border-t border-muted/30 py-4">
        <CashClosureActions
          cashClosure={cashClosure}
          onCloseCashClosure={onCloseCashClosure}
        />
      </CardFooter>
    </Card>
  );
} 