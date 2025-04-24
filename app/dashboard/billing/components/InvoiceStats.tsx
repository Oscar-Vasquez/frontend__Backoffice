"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Package, Receipt, Clock, HelpCircle } from "lucide-react";
import { BillingStats } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvoiceStatsProps {
  stats: BillingStats;
  formatCurrency: (amount: number) => string;
}

export default function InvoiceStats({ stats, formatCurrency }: InvoiceStatsProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Pagado
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[180px] text-xs">Total de pagos ya realizados por este cliente</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-base sm:text-2xl font-semibold mt-0.5 sm:mt-1">
                  {formatCurrency(stats.totalPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Paquetes Activos
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[180px] text-xs">Número de paquetes en facturas pendientes de pago</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-base sm:text-2xl font-semibold mt-0.5 sm:mt-1">
                  {stats.activePackages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Por Cobrar
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[180px] text-xs">Monto total pendiente de pago en todas las facturas</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-base sm:text-2xl font-semibold mt-0.5 sm:mt-1">
                  {formatCurrency(stats.pendingPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Actividad
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[180px] text-xs">Fecha de la factura más reciente</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-base sm:text-2xl font-semibold mt-0.5 sm:mt-1 truncate max-w-[110px] sm:max-w-none">
                  {stats.lastActivity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
} 