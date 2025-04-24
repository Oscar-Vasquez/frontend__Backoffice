import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { CategoryWithAmount } from "../types";

interface ExpenseCategoriesChartProps {
  data: CategoryWithAmount[];
  isLoading: boolean;
}

export default function ExpenseCategoriesChart({
  data,
  isLoading,
}: ExpenseCategoriesChartProps) {
  const chartContainer = useRef<HTMLDivElement>(null);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Ordenar categorías por monto total
  const sortedData = [...data].sort((a, b) => b.totalAmount - a.totalAmount);

  // Calcular total general
  const total = data.reduce((sum, category) => sum + category.totalAmount, 0);

  // Calcular la altura de cada barra
  const calculateBarHeight = (amount: number): number => {
    const maxHeight = 180; // Altura máxima en px
    const maxAmount = sortedData[0]?.totalAmount || 0;
    
    if (maxAmount === 0) return 0;
    return (amount / maxAmount) * maxHeight;
  };

  // Si no hay datos o está cargando
  if (isLoading) {
    return (
      <div className="flex h-[250px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          No hay datos disponibles para mostrar.
        </p>
        <p className="text-xs text-muted-foreground">
          Registre gastos para visualizar estadísticas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm font-medium">Distribución de gastos</p>
        <p className="text-sm font-medium">{formatCurrency(total)}</p>
      </div>

      {/* Gráfico de barras */}
      <div className="space-y-4" ref={chartContainer}>
        {sortedData.map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm truncate">{category.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{formatCurrency(category.totalAmount)}</span>
                <span className="text-xs text-muted-foreground">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda de colores */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-4">
        {sortedData.slice(0, 6).map((category) => (
          <div key={`legend-${category.id}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color }}
            ></div>
            <span className="text-xs truncate">{category.name}</span>
          </div>
        ))}
        {sortedData.length > 6 && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-300"></div>
            <span className="text-xs truncate">Otros ({sortedData.length - 6})</span>
          </div>
        )}
      </div>
    </div>
  );
} 