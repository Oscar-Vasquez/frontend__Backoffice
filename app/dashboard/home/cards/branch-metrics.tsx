"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const branchData = [
  {
    nombre: "Sucursal Centro",
    ingresos: 125000,
    paquetesTotal: 450,
    entregados: 380,
    recibidos: 420,
  },
  {
    nombre: "Sucursal Norte",
    ingresos: 98000,
    paquetesTotal: 320,
    entregados: 290,
    recibidos: 310,
  },
  {
    nombre: "Sucursal Sur",
    ingresos: 115000,
    paquetesTotal: 380,
    entregados: 350,
    recibidos: 365,
  },
];

export default function BranchMetricsCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Métricas por Sucursal</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sucursal</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Paquetes</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branchData.map((branch) => (
              <TableRow key={branch.nombre}>
                <TableCell className="font-medium">{branch.nombre}</TableCell>
                <TableCell className="text-right">
                  ${branch.ingresos.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {branch.paquetesTotal}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="success" className="w-fit">
                      {branch.entregados} entregados
                    </Badge>
                    <Badge variant="secondary" className="w-fit">
                      {branch.recibidos} recibidos
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
