import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface BranchDelivery {
  id: string;
  name: string;
  delivered: number;
  inRoute: number;
  pending: number;
  delayed: number;
  efficiency: number;
  lastUpdate: Date;
}

const branchDeliveries: BranchDelivery[] = [
  {
    id: "centro",
    name: "Sucursal Centro",
    delivered: 185,
    inRoute: 45,
    pending: 12,
    delayed: 3,
    efficiency: 94,
    lastUpdate: new Date(),
  },
  {
    id: "norte",
    name: "Sucursal Norte",
    delivered: 142,
    inRoute: 38,
    pending: 8,
    delayed: 2,
    efficiency: 92,
    lastUpdate: new Date(),
  },
  {
    id: "sur",
    name: "Sucursal Sur",
    delivered: 163,
    inRoute: 52,
    pending: 15,
    delayed: 5,
    efficiency: 88,
    lastUpdate: new Date(),
  },
];

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 90) return "text-green-500";
  if (efficiency >= 80) return "text-yellow-500";
  return "text-red-500";
};

export default function DeliveryStatusCard() {
  const [selectedBranch, setSelectedBranch] = useState(branchDeliveries[0].id);

  const currentBranch = branchDeliveries.find(branch => branch.id === selectedBranch)!;
  const totalDeliveries = currentBranch.delivered + currentBranch.inRoute + currentBranch.pending;
  const progressPercentage = (currentBranch.delivered / totalDeliveries) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Estado de Entregas</CardTitle>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branchDeliveries.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progreso general */}
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-2xl font-bold">{currentBranch.delivered}</div>
              <div className="text-sm text-muted-foreground">{progressPercentage.toFixed(0)}%</div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Estadísticas detalladas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <p className="text-muted-foreground">En Ruta</p>
              </div>
              <p className="font-medium">{currentBranch.inRoute} paquetes</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-muted-foreground">Entregados</p>
              </div>
              <p className="font-medium">{currentBranch.delivered} paquetes</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pendientes</span>
              <Badge variant="secondary">{currentBranch.pending} paquetes</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Retrasados</span>
              <Badge variant="destructive">{currentBranch.delayed} paquetes</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eficiencia</span>
              <span className={`font-medium ${getEfficiencyColor(currentBranch.efficiency)}`}>
                {currentBranch.efficiency}%
              </span>
            </div>
          </div>

          {/* Última actualización */}
          <div className="pt-2 text-xs text-muted-foreground text-right">
            Última actualización: {currentBranch.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
