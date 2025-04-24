"use client";

import { Card } from "@/components/ui/card";
import { Users, Search, Receipt, DollarSign, Package } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center text-center p-12">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Users className="h-12 w-12 text-muted-foreground/60" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No hay ningún cliente seleccionado</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Busca un cliente utilizando el buscador para ver sus facturas y gestionar sus pagos.
      </p>
      <div className="flex flex-wrap justify-center gap-4 max-w-lg">
        <Card className="p-4 flex flex-col items-center text-center basis-[45%] min-w-[200px]">
          <Search className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-medium mb-1">Buscar Cliente</h3>
          <p className="text-xs text-muted-foreground">
            Busca un cliente por su nombre, correo o teléfono
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center text-center basis-[45%] min-w-[200px]">
          <Receipt className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-medium mb-1">Gestionar Facturas</h3>
          <p className="text-xs text-muted-foreground">
            Visualiza y procesa los pagos pendientes
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center text-center basis-[45%] min-w-[200px]">
          <DollarSign className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-medium mb-1">Procesar Pagos</h3>
          <p className="text-xs text-muted-foreground">
            Registra pagos y gestiona transacciones
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center text-center basis-[45%] min-w-[200px]">
          <Package className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-medium mb-1">Ver Paquetes</h3>
          <p className="text-xs text-muted-foreground">
            Controla los paquetes asociados a cada factura
          </p>
        </Card>
      </div>
    </div>
  );
} 