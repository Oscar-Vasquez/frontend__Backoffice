"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Scale, Building2, TrendingUp, Truck, DollarSign, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOperators } from '@/app/hooks/useOperators';

interface PackageMetrics {
  mes: string;
  cantidad: number;
  pesoTotal: number;
}

interface BranchMetrics {
  id: string;
  name: string;
  province: string;
  metrics: {
    totalPackages: number;
    totalWeight: number;
    deliveredPackages: number;
    inProcessPackages: number;
    deliveryRate: number;
  };
}

export default function PackageMetrics() {
  const [metrics, setMetrics] = useState<PackageMetrics[]>([]);
  const [branchMetrics, setBranchMetrics] = useState<BranchMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('workexpress_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/package-metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error al obtener métricas de paquetes');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error('❌ Error al cargar métricas:', err);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las métricas. Por favor, intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []); // Solo se ejecuta una vez al montar el componente

  useEffect(() => {
    const fetchBranchMetrics = async () => {
      try {
        setLoadingBranches(true);
        setBranchError(null);

        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('workexpress_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/branch-metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error al obtener métricas por sucursal');
        }

        const data = await response.json();
        setBranchMetrics(data);
      } catch (error) {
        console.error('Error al cargar métricas por sucursal:', error);
        setBranchError(error instanceof Error ? error.message : 'Error al cargar métricas por sucursal');
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranchMetrics();
  }, []); // Solo se ejecuta una vez al montar el componente

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Gráficas de Métricas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfica de Cantidad de Paquetes */}
        <Card className="p-6 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Package className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">Paquetes por Mes</h3>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year}`;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cantidad" 
                  name="Cantidad" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfica de Peso Total */}
        <Card className="p-6 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Scale className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Peso Total por Mes (lb)</h3>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year}`;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pesoTotal" 
                  name="Peso Total (lb)" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Sección de Métricas por Sucursal */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Métricas por Sucursal</h2>
        
        {loadingBranches ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : branchError ? (
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{branchError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branchMetrics.map((branch) => (
              <Card key={branch.id} className="p-6 bg-white dark:bg-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{branch.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{branch.province}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Paquetes</span>
                    </div>
                    <p className="text-2xl font-bold">{branch.metrics.totalPackages}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Peso Total</span>
                    </div>
                    <p className="text-2xl font-bold">{branch.metrics.totalWeight} lb</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">En Proceso</span>
                    </div>
                    <p className="text-2xl font-bold">{branch.metrics.inProcessPackages}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium">Tasa Entrega</span>
                    </div>
                    <p className="text-2xl font-bold">{branch.metrics.deliveryRate}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 