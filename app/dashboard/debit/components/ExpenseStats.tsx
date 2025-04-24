import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionStats } from "../types";

interface ExpenseStatsProps {
  stats: TransactionStats;
  isLoading: boolean;
}

export default function ExpenseStats({ stats, isLoading }: ExpenseStatsProps) {
  // Función para formatear moneda de manera segura
  const formatCurrency = (amount: number) => {
    try {
      // Verificar si amount es un número válido
      if (typeof amount !== 'number' || isNaN(amount)) {
        console.warn(`Monto inválido para formatear: ${amount}`);
        return '$0.00';
      }
      
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error(`Error al formatear monto: ${amount}`, error);
      return '$0.00';
    }
  };
  
  // Determinar si hay una tendencia positiva o negativa en los gastos mensuales
  // (en este contexto, una tendencia negativa en gastos es positiva para el negocio)
  const isTrendPositive = stats.monthlyDifference < 0;
  
  // Formatear el porcentaje de diferencia mensual
  const formattedPercentage = Math.abs(stats.monthlyDifference).toFixed(1) + '%';
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-7 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-28 mt-1 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-gray-500"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalTransactions} transacciones
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Mes Actual</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-gray-500"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.currentMonthTotal)}</div>
          <div className="flex items-center">
            {isTrendPositive ? (
              <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="mr-1 h-4 w-4 text-destructive" />
            )}
            <p className={`text-xs ${isTrendPositive ? "text-green-500" : "text-destructive"}`}>
              {formattedPercentage} respecto al mes anterior
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Categoría Principal</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-gray-500"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{stats.mostCommonCategory}</div>
          <p className="text-xs text-muted-foreground">
            Categoría con más transacciones
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Gasto Mayor</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-gray-500"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.largestTransaction)}</div>
          <p className="text-xs text-muted-foreground">
            Transacción de mayor valor
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 