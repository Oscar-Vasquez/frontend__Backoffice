import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvoiceSummaryCardProps {
  amount: number;
  count?: number;
  percentage?: number;
}

export function PendingInvoicesCard({ amount = 0, count = 0 }: InvoiceSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Facturas Pendientes
        </CardTitle>
        <Clock className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? 'factura pendiente' : 'facturas pendientes'}
        </p>
      </CardContent>
    </Card>
  );
}

export function OverdueInvoicesCard({ amount = 0, count = 0 }: InvoiceSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Facturas Atrasadas
        </CardTitle>
        <AlertCircle className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">{formatCurrency(amount)}</div>
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? 'factura atrasada' : 'facturas atrasadas'}
        </p>
      </CardContent>
    </Card>
  );
}

export function TotalPaidCard({ amount = 0, percentage = 0 }: InvoiceSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Pagado
        </CardTitle>
        <DollarSign className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">{formatCurrency(amount)}</div>
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(1)}% de facturas pagadas
        </p>
      </CardContent>
    </Card>
  );
}
