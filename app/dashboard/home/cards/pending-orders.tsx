import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface BranchPendingOrders {
  id: string;
  name: string;
  urgent: number;
  normal: number;
  international: {
    inCustoms: number;
    inTransit: number;
    readyForPickup: number;
    origin: {
      usa: number;
      china: number;
      europe: number;
      other: number;
    }
  };
  local: {
    lastMile: number;
    readyForDelivery: number;
  };
  averageTime: {
    customs: number;
    international: number;
    local: number;
  };
  trend: number;
  lastUpdate: Date;
}

const branchOrders: BranchPendingOrders[] = [
  {
    id: "centro",
    name: "Sucursal Centro",
    urgent: 12,
    normal: 13,
    international: {
      inCustoms: 15,
      inTransit: 28,
      readyForPickup: 8,
      origin: {
        usa: 20,
        china: 15,
        europe: 10,
        other: 6
      }
    },
    local: {
      lastMile: 10,
      readyForDelivery: 7
    },
    averageTime: {
      customs: 48,
      international: 168,
      local: 24
    },
    trend: 5,
    lastUpdate: new Date(),
  },
  {
    id: "norte",
    name: "Sucursal Norte",
    urgent: 8,
    normal: 15,
    international: {
      inCustoms: 10,
      inTransit: 18,
      readyForPickup: 6,
      origin: {
        usa: 12,
        china: 8,
        europe: 6,
        other: 4
      }
    },
    local: {
      lastMile: 8,
      readyForDelivery: 5
    },
    averageTime: {
      customs: 36,
      international: 144,
      local: 18
    },
    trend: -3,
    lastUpdate: new Date(),
  },
  {
    id: "sur",
    name: "Sucursal Sur",
    urgent: 10,
    normal: 11,
    international: {
      inCustoms: 7,
      inTransit: 14,
      readyForPickup: 7,
      origin: {
        usa: 10,
        china: 6,
        europe: 4,
        other: 3
      }
    },
    local: {
      lastMile: 6,
      readyForDelivery: 4
    },
    averageTime: {
      customs: 24,
      international: 120,
      local: 12
    },
    trend: 2,
    lastUpdate: new Date(),
  },
];

export default function PendingOrdersCard() {
  const [selectedBranch, setSelectedBranch] = useState(branchOrders[0].id);
  const currentBranch = branchOrders.find(branch => branch.id === selectedBranch)!;
  const totalOrders = currentBranch.urgent + currentBranch.normal;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Pedidos Pendientes</CardTitle>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branchOrders.map((branch) => (
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
          <div>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="destructive">
                {currentBranch.urgent} Prioritarios
              </Badge>
              <Badge variant="outline">
                {currentBranch.normal} Estándar
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">En Aduana</span>
              </div>
              <p className="font-medium">{currentBranch.international.inCustoms} paquetes</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">En Tránsito Internacional</span>
              </div>
              <p className="font-medium">{currentBranch.international.inTransit} paquetes</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">País de Origen</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">USA</span>
                <span className="font-medium">{currentBranch.international.origin.usa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">China</span>
                <span className="font-medium">{currentBranch.international.origin.china}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Europa</span>
                <span className="font-medium">{currentBranch.international.origin.europe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Otros</span>
                <span className="font-medium">{currentBranch.international.origin.other}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Tiempo en Aduana</span>
              </div>
              <span className="font-medium">{currentBranch.averageTime.customs}h</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Tiempo Internacional</span>
              </div>
              <span className="font-medium">{currentBranch.averageTime.international}h</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-right pt-2">
            Última actualización: {currentBranch.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
