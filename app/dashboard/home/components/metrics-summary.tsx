import { 
  Package, 
  Receipt,
  Users,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { DashboardService, DashboardMetrics } from '@/app/services/dashboard.service';

function formatIncremento(valor: number): string {
  return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

function MetricsSummary() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Evitar redirecciones infinitas
    if (window.isRedirecting) {
      console.log('🛑 MetricsSummary: Ya hay una redirección en progreso, evitando ciclo');
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getMetrics();
        setMetrics(data);
      } catch (err) {
        setError('Error al cargar las métricas');
        console.error('Error al cargar las métricas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <p className="text-red-600 dark:text-red-400">
          {error || 'No se pudieron cargar las métricas'}
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Paquetes */}
      <motion.div variants={item}>
        <Card className="relative p-6 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl">
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Paquetes</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.paquetes.total}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="flex items-center text-sm font-medium text-green-500">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {formatIncremento(metrics.paquetes.incremento)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">vs mes anterior</span>
                  </div>
                </div>
              </div>
              <Activity className="w-16 h-16 text-blue-500/10 dark:text-blue-400/20" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-500">{metrics.paquetes.desglose.entregados}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Entregados</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-500">{metrics.paquetes.desglose.enProceso}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">En Proceso</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Facturas */}
      <motion.div variants={item}>
        <Card className="relative p-6 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-xl">
                    <Receipt className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Facturas Pagadas</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.facturas.total}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="flex items-center text-sm font-medium text-green-500">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {formatIncremento(metrics.facturas.incremento)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">vs mes anterior</span>
                  </div>
                </div>
              </div>
              <Activity className="w-16 h-16 text-green-500/10 dark:text-green-400/20" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-500">{formatCurrency(metrics.facturas.montoTotal)}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Facturado</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-500">{metrics.facturas.pendientes}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pendientes</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Usuarios */}
      <motion.div variants={item}>
        <Card className="relative p-6 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Usuarios</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.usuarios.total}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="flex items-center text-sm font-medium text-green-500">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {formatIncremento(metrics.usuarios.incremento)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">vs mes anterior</span>
                  </div>
                </div>
              </div>
              <Activity className="w-16 h-16 text-purple-500/10 dark:text-purple-400/20" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-500">{metrics.usuarios.nuevos}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nuevos</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-indigo-500">{metrics.usuarios.activos}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Activos</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default MetricsSummary; 