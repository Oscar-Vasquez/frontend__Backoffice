"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const data = [
  { mes: "Ene", pedidos: 240, libras: 1200 },
  { mes: "Feb", pedidos: 320, libras: 1600 },
  { mes: "Mar", pedidos: 280, libras: 1400 },
  { mes: "Abr", pedidos: 350, libras: 1750 },
  { mes: "May", pedidos: 400, libras: 2000 },
  { mes: "Jun", pedidos: 380, libras: 1900 },
  { mes: "Jul", pedidos: 420, libras: 2100 },
  { mes: "Ago", pedidos: 390, libras: 1950 },
  { mes: "Sep", pedidos: 450, libras: 2250 },
  { mes: "Oct", pedidos: 480, libras: 2400 },
  { mes: "Nov", pedidos: 520, libras: 2600 },
  { mes: "Dic", pedidos: 600, libras: 3000 }
];

type MetricType = "pedidos" | "libras";

export default function MonthlyOrdersMetricCard({ className }: { className?: string }) {
  const [metricType, setMetricType] = React.useState<MetricType>("pedidos");

  const handleMetricChange = (value: string) => {
    setMetricType(value as MetricType);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Métricas Mensuales</CardTitle>
        <Select value={metricType} onValueChange={handleMetricChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar métrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pedidos">Pedidos</SelectItem>
            <SelectItem value="libras">Libras</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [
                  `${value} ${metricType === "pedidos" ? "pedidos" : "lb"}`,
                  metricType === "pedidos" ? "Pedidos" : "Libras"
                ]}
              />
              <Line
                type="monotone"
                dataKey={metricType}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
