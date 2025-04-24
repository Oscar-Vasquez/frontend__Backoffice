"use client";

import { motion } from "framer-motion";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download, LayoutDashboard } from "lucide-react";
import { generateMetricsReport } from "@/lib/reports";
import MetricsSummary from './components/metrics-summary';
import PackageMetrics from './components/package-metrics';
import { useEffect, useState, useRef } from 'react';
import { DashboardService } from '@/app/services/dashboard.service';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PendingPackagesCard from './components/pending-packages-card';
import RecentUsersCard from './components/recent-users-card';
import TrackingSearchCard from './components/tracking-search-card';

interface DashboardMetrics {
  paquetes: {
    total: number;
    incremento: number;
    desglose: {
      entregados: number;
      enProceso: number;
    }
  };
  facturas: {
    total: number;
    incremento: number;
    montoTotal: number;
    pendientes: number;
  };
  usuarios: {
    total: number;
    incremento: number;
    nuevos: number;
    activos: number;
  };
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Evitar redirecciones infinitas y múltiples llamadas a la API
    if (window.isRedirecting || dataFetchedRef.current) {
      console.log('🛑 DashboardHome: Ya hay una redirección en progreso o datos ya cargados, evitando ciclo');
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getMetrics();
        setMetrics(data);
        dataFetchedRef.current = true;
      } catch (error) {
        console.error('Error al obtener métricas:', error);
        setError('No se pudieron cargar las métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Limpiar la bandera de redirección al montar el componente
    window.isRedirecting = false;
  }, []); // Solo se ejecuta una vez al montar el componente

  const handleDownloadReport = async () => {
    const csvContent = await generateMetricsReport();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `metricas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
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

  if (!metrics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div 
          className="relative mb-8 p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 rounded-2xl"></div>
          <div className="relative flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Panel de Control
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Resumen de operaciones
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <CalendarDateRangePicker />
              <Button 
                variant="default" 
                onClick={handleDownloadReport}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Reporte
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 gap-8">
          {/* Métricas principales */}
          <div>
            <motion.div {...fadeInUp}>
              <MetricsSummary />
            </motion.div>
          </div>
          
          {/* Búsqueda de paquetes - Ancho completo */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <TrackingSearchCard />
          </motion.div>
          
          {/* Métricas de paquetes */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Métricas de Paquetes</CardTitle>
              </CardHeader>
              <CardContent>
                <PackageMetrics />
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Tarjetas de paquetes pendientes y usuarios recientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <PendingPackagesCard />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <RecentUsersCard />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

