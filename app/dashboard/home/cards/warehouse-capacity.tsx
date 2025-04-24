import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, Package, AlertTriangle, ArrowUpDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface WarehouseData {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  customs: {
    pending: number;
    processing: number;
    cleared: number;
  };
  international: {
    inbound: number;
    outbound: number;
  };
  storage: {
    temporary: number;
    longTerm: number;
  };
  priority: {
    express: number;
    standard: number;
  };
  turnoverRate: number;
  lastUpdate: Date;
}

const warehouseData: WarehouseData[] = [
  {
    id: "centro",
    name: "Almacén Centro",
    capacity: 500,
    occupied: 425,
    customs: {
      pending: 45,
      processing: 30,
      cleared: 25
    },
    international: {
      inbound: 85,
      outbound: 40
    },
    storage: {
      temporary: 200,
      longTerm: 100
    },
    priority: {
      express: 125,
      standard: 300
    },
    turnoverRate: 15,
    lastUpdate: new Date(),
  },
  {
    id: "norte",
    name: "Almacén Norte",
    capacity: 350,
    occupied: 280,
    customs: {
      pending: 35,
      processing: 25,
      cleared: 20
    },
    international: {
      inbound: 65,
      outbound: 30
    },
    storage: {
      temporary: 150,
      longTerm: 75
    },
    priority: {
      express: 85,
      standard: 195
    },
    turnoverRate: 12,
    lastUpdate: new Date(),
  },
  {
    id: "sur",
    name: "Almacén Sur",
    capacity: 400,
    occupied: 320,
    customs: {
      pending: 40,
      processing: 28,
      cleared: 20
    },
    international: {
      inbound: 75,
      outbound: 30
    },
    storage: {
      temporary: 175,
      longTerm: 87.5
    },
    priority: {
      express: 95,
      standard: 225
    },
    turnoverRate: 14,
    lastUpdate: new Date(),
  },
];

const getCapacityColor = (percentage: number) => {
  if (percentage >= 90) return "text-red-500";
  if (percentage >= 75) return "text-yellow-500";
  return "text-green-500";
};

export default function WarehouseCapacityCard() {
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouseData[0].id);
  const currentWarehouse = warehouseData.find(wh => wh.id === selectedWarehouse)!;

  const occupiedPercentage = (currentWarehouse.occupied / currentWarehouse.capacity) * 100;
  const availableSpace = currentWarehouse.capacity - currentWarehouse.occupied;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Capacidad del Almacén</CardTitle>
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {warehouseData.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-2xl font-bold">{occupiedPercentage.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">
                {currentWarehouse.occupied}/{currentWarehouse.capacity}
              </div>
            </div>
            <Progress
              value={occupiedPercentage}
              className={`h-2 [&>div]:${getCapacityColor(occupiedPercentage)}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Ocupado</span>
              </div>
              <p className="font-medium">{currentWarehouse.occupied} paquetes</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Disponible</span>
              </div>
              <p className="font-medium">{availableSpace} paquetes</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Reservado</span>
              </div>
              <Badge variant="outline">{currentWarehouse.customs.pending + currentWarehouse.customs.processing} paquetes</Badge>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">En Tránsito</span>
              </div>
              <Badge variant="secondary">{currentWarehouse.customs.cleared} paquetes</Badge>
            </div>
          </div>

          <div className="pt-2 border-t space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Prioridad Alta</span>
              <span className="font-medium text-red-500">{currentWarehouse.priority.express} paquetes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estándar</span>
              <span className="font-medium">{currentWarehouse.priority.standard} paquetes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tasa de Rotación</span>
              <span className="font-medium">{currentWarehouse.turnoverRate}% diario</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-right">
            Última actualización: {currentWarehouse.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
