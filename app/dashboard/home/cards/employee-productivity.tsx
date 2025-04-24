"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, DollarSign, Truck, CheckCircle } from "lucide-react";

// Reutilizamos los tipos del componente employee-activities
type ActivityType = 'factura' | 'entrega' | 'cobro' | 'recepcion';

// Extendemos la interfaz Activity existente
interface Activity {
  id: string;
  activityType: ActivityType;
  description: string;
  timestamp: Date;
  amount?: number;
  branch: string;
}

interface EmployeePerformance {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  performance: "excelente" | "bueno" | "aceptable" | "mejorable" | "bajo";
  productividad: number;
  activities: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
  const icons = {
    factura: <DollarSign className="h-4 w-4" />,
    entrega: <Truck className="h-4 w-4" />,
    cobro: <CheckCircle className="h-4 w-4" />,
    recepcion: <Package className="h-4 w-4" />
  };
  return icons[type];
};

const getActivityBadge = (type: ActivityType) => {
  const variants = {
    factura: "default",
    entrega: "success",
    cobro: "warning",
    recepcion: "secondary"
  } as const;

  const labels = {
    factura: "Facturación",
    entrega: "Entrega",
    cobro: "Cobro",
    recepcion: "Recepción"
  };

  return <Badge variant={variants[type]}>{labels[type]}</Badge>;
};

// Datos de ejemplo usando la estructura existente
const employeePerformance: EmployeePerformance[] = [
  {
    id: "1",
    employeeName: "Carlos Méndez",
    employeeAvatar: "/avatars/carlos.png",
    performance: "excelente",
    productividad: 95,
    activities: [
      {
        id: "1",
        activityType: "factura",
        description: "Facturó envío #12345",
        timestamp: new Date(2024, 2, 15, 14, 30),
        amount: 250.00,
        branch: "Sucursal Centro"
      },
      {
        id: "2",
        activityType: "entrega",
        description: "Entregó paquete #54321",
        timestamp: new Date(2024, 2, 15, 13, 45),
        branch: "Sucursal Norte"
      },
      {
        id: "3",
        activityType: "cobro",
        description: "Cobró factura #98765",
        timestamp: new Date(2024, 2, 15, 12, 30),
        amount: 180.50,
        branch: "Sucursal Centro"
      },
      {
        id: "4",
        activityType: "recepcion",
        description: "Recibió lote de 15 paquetes",
        timestamp: new Date(2024, 2, 15, 11, 15),
        branch: "Sucursal Centro"
      },
      {
        id: "5",
        activityType: "entrega",
        description: "Entregó paquete urgente #34567",
        timestamp: new Date(2024, 2, 15, 10, 0),
        branch: "Sucursal Norte"
      }
    ]
  },
  {
    id: "2",
    employeeName: "Ana López",
    employeeAvatar: "/avatars/ana.png",
    performance: "bueno",
    productividad: 85,
    activities: [
      {
        id: "6",
        activityType: "factura",
        description: "Facturó envío internacional #78901",
        timestamp: new Date(2024, 2, 15, 15, 20),
        amount: 450.75,
        branch: "Sucursal Sur"
      },
      {
        id: "7",
        activityType: "cobro",
        description: "Cobró facturas pendientes",
        timestamp: new Date(2024, 2, 15, 14, 15),
        amount: 875.25,
        branch: "Sucursal Sur"
      },
      {
        id: "8",
        activityType: "recepcion",
        description: "Recibió paquetes de proveedor",
        timestamp: new Date(2024, 2, 15, 12, 45),
        branch: "Sucursal Sur"
      }
    ]
  },
  {
    id: "3",
    employeeName: "Roberto García",
    employeeAvatar: "/avatars/roberto.png",
    performance: "aceptable",
    productividad: 75,
    activities: [
      {
        id: "9",
        activityType: "entrega",
        description: "Ruta de entregas completada",
        timestamp: new Date(2024, 2, 15, 16, 30),
        branch: "Sucursal Norte"
      },
      {
        id: "10",
        activityType: "recepcion",
        description: "Procesó devoluciones",
        timestamp: new Date(2024, 2, 15, 15, 45),
        branch: "Sucursal Norte"
      },
      {
        id: "11",
        activityType: "factura",
        description: "Facturó servicios express",
        timestamp: new Date(2024, 2, 15, 14, 30),
        amount: 325.50,
        branch: "Sucursal Norte"
      }
    ]
  },
  {
    id: "4",
    employeeName: "María Sánchez",
    employeeAvatar: "/avatars/maria.png",
    performance: "bueno",
    productividad: 88,
    activities: [
      {
        id: "12",
        activityType: "cobro",
        description: "Procesó pagos mensuales",
        timestamp: new Date(2024, 2, 15, 16, 45),
        amount: 1250.00,
        branch: "Sucursal Centro"
      },
      {
        id: "13",
        activityType: "factura",
        description: "Facturó envíos corporativos",
        timestamp: new Date(2024, 2, 15, 15, 30),
        amount: 780.25,
        branch: "Sucursal Centro"
      },
      {
        id: "14",
        activityType: "recepcion",
        description: "Recibió importación",
        timestamp: new Date(2024, 2, 15, 14, 15),
        branch: "Sucursal Centro"
      }
    ]
  },
  {
    id: "5",
    employeeName: "Luis Torres",
    employeeAvatar: "/avatars/luis.png",
    performance: "excelente",
    productividad: 92,
    activities: [
      {
        id: "15",
        activityType: "entrega",
        description: "Completó entregas prioritarias",
        timestamp: new Date(2024, 2, 15, 17, 0),
        branch: "Sucursal Sur"
      },
      {
        id: "16",
        activityType: "cobro",
        description: "Cobró facturas vencidas",
        timestamp: new Date(2024, 2, 15, 16, 15),
        amount: 945.75,
        branch: "Sucursal Sur"
      },
      {
        id: "17",
        activityType: "factura",
        description: "Facturó servicios premium",
        timestamp: new Date(2024, 2, 15, 15, 0),
        amount: 550.00,
        branch: "Sucursal Sur"
      },
      {
        id: "18",
        activityType: "recepcion",
        description: "Procesó entrada de inventario",
        timestamp: new Date(2024, 2, 15, 13, 45),
        branch: "Sucursal Sur"
      }
    ]
  }
];

export default function EmployeeProductivityCard({ className }: { className?: string }) {
  const [selectedEmployee, setSelectedEmployee] = React.useState<string>(employeePerformance[0].id);
  const [progress, setProgress] = useState(0);
  const currentEmployee = employeePerformance.find(emp => emp.id === selectedEmployee);

  useEffect(() => {
    if (currentEmployee) {
      // Resetear el progreso
      setProgress(0);

      // Animación suave usando requestAnimationFrame
      const startTime = Date.now();
      const duration = 1500; // 1.5 segundos
      const targetProgress = currentEmployee.productividad;

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Función de suavizado (easing)
        const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        setProgress(Math.round(targetProgress * eased));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [currentEmployee]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Productividad del Empleado</CardTitle>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar empleado" />
          </SelectTrigger>
          <SelectContent>
            {employeePerformance.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={employee.employeeAvatar} />
                    <AvatarFallback>
                      {employee.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {employee.employeeName}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {currentEmployee && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentEmployee.employeeAvatar} />
                  <AvatarFallback>
                    {currentEmployee.employeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentEmployee.employeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    Productividad: {currentEmployee.productividad}%
                  </p>
                </div>
              </div>
              <Badge variant={
                currentEmployee.performance === "excelente" ? "success" :
                currentEmployee.performance === "bueno" ? "default" :
                currentEmployee.performance === "aceptable" ? "secondary" :
                currentEmployee.performance === "mejorable" ? "warning" : "destructive"
              }>
                {currentEmployee.performance.toUpperCase()}
              </Badge>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Productividad General</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
              />
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {currentEmployee.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 relative pl-6 pb-4 border-l-2 border-muted last:border-l-0">
                    <div className="absolute -left-[7px] p-1 bg-background border-2 border-muted rounded-full">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        {getActivityBadge(activity.activityType)}
                        <span className="text-sm text-muted-foreground">
                          {formatDistance(activity.timestamp, new Date(), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{activity.description}</p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{activity.branch}</span>
                        {activity.amount && <span>${activity.amount.toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
