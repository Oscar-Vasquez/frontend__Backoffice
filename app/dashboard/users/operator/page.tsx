'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  PlusCircledIcon, 
  EnvelopeClosedIcon,
  MagnifyingGlassIcon,
  ArrowDownIcon,
  PersonIcon,
  ClockIcon,
  CheckCircledIcon,
  DashboardIcon,
  GearIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  ReloadIcon
} from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { NoOperatorsFound } from "./components/no-operators-found";
import useThemeSettingsStore from "@/store/themeSettingsStore";
import { OperatorsProvider, useOperators, User } from "./context/operators-context";

// Dynamically import heavy components
const UsersDataTable = dynamic(() => import("./data-table"), {
  loading: () => <OperatorsTableSkeleton />,
  ssr: false
});

const InlineDiagnostics = dynamic(() => import("./components/inline-diagnostics").then(mod => mod.default), {
  ssr: false
});

const CreateOperatorDialog = dynamic(() => import("./create-operator-dialog").then(mod => mod.default), {
  ssr: false
});

const InviteOperatorDialog = dynamic(() => import("./invite-operator-dialog").then(mod => mod.default), {
  ssr: false
});

// Componente de carga para la tabla
function OperatorsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="border rounded-lg dark:border-gray-700">
        <div className="h-12 border-b bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700 px-4" />
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center h-16 px-4 border-b dark:border-gray-700">
            <Skeleton className="h-8 w-8 rounded-full mr-4 dark:bg-gray-700" />
            <Skeleton className="h-8 w-full dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para las estadísticas
const StatsCards = ({ totalUsers, activeUsers, pendingUsers, inactiveUsers }: { 
  totalUsers: number; 
  activeUsers: number; 
  pendingUsers: number; 
  inactiveUsers: number; 
}) => {
  const { themeColor } = useThemeSettingsStore();
  
  // Obtener el gradiente del tema activo
  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-500 to-green-500';
      case 'sky':
        return 'from-sky-500 to-blue-500';
      case 'emerald':
        return 'from-emerald-500 to-green-500';
      case 'rose':
        return 'from-rose-500 to-pink-500';
      case 'amber':
        return 'from-amber-500 to-yellow-500';
      case 'purple':
        return 'from-purple-500 to-indigo-500';
      case 'slate':
        return 'from-slate-500 to-gray-500';
      case 'stone':
        return 'from-stone-500 to-gray-500';
      case 'neutral':
        return 'from-neutral-500 to-gray-500';
      case 'indigo':
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };
  
  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white/80 dark:bg-gray-800/80 border-white/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Usuarios
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
            <PersonIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {totalUsers}
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ArrowDownIcon className="h-3 w-3 text-emerald-500 dark:text-emerald-400 mr-1" />
            <span className="text-emerald-500 dark:text-emerald-400 font-medium">12%</span>
            <span className="ml-1">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 border-white/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Usuarios Activos
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
            <CheckCircledIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {activeUsers}
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              de {totalUsers}
            </span>
          </div>
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getThemeGradient()}`}
                style={{ width: totalUsers > 0 ? `${(activeUsers/totalUsers) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 border-white/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Pendientes
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
            <ClockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {pendingUsers}
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Esperando activación</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 border-white/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Inactivos
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
            <GearIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {inactiveUsers}
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Requieren atención</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para el contenido de las pestañas
const TabContent = ({ value, data, role }: { value: string; data: User[]; role?: string }) => {
  // Filter data based on role if provided
  const filteredData = useMemo(() => {
    if (!role) return data;
    return data.filter(user => user.role.toLowerCase() === role.toLowerCase());
  }, [data, role]);

  return (
    <TabsContent value={value} className="mt-0 p-6">
      {filteredData.length > 0 ? (
        <UsersDataTable data={filteredData} />
      ) : (
        <NoOperatorsFound />
      )}
    </TabsContent>
  );
};

// Componente principal que usa el contexto
function OperatorsPageContent() {
  const { operators, isLoading, error } = useOperators();
  const { themeColor } = useThemeSettingsStore();

  // Memoized statistics
  const stats = useMemo(() => {
    const totalUsers = operators.length;
    const activeUsers = operators.filter(user => user.status === 'active').length;
    const pendingUsers = operators.filter(user => user.status === 'pending').length;
    const inactiveUsers = operators.filter(user => user.status === 'inactive').length;
    
    return { totalUsers, activeUsers, pendingUsers, inactiveUsers };
  }, [operators]);

  // Obtener el gradiente del tema activo para el fondo
  const getBackgroundGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-50 via-slate-50 to-zinc-50 dark:from-lime-950/30 dark:via-gray-950 dark:to-gray-950';
      case 'sky':
        return 'from-sky-50 via-slate-50 to-zinc-50 dark:from-sky-950/30 dark:via-gray-950 dark:to-gray-950';
      case 'emerald':
        return 'from-emerald-50 via-slate-50 to-zinc-50 dark:from-emerald-950/30 dark:via-gray-950 dark:to-gray-950';
      case 'rose':
        return 'from-rose-50 via-slate-50 to-zinc-50 dark:from-rose-950/30 dark:via-gray-950 dark:to-gray-950';
      case 'amber':
        return 'from-amber-50 via-slate-50 to-zinc-50 dark:from-amber-950/30 dark:via-gray-950 dark:to-gray-950';
      case 'purple':
        return 'from-purple-50 via-slate-50 to-zinc-50 dark:from-purple-950/30 dark:via-gray-950 dark:to-gray-950';
      case 'slate':
        return 'from-slate-50 via-slate-50 to-zinc-50 dark:from-slate-900/30 dark:via-gray-950 dark:to-gray-950';
      case 'stone':
        return 'from-stone-50 via-slate-50 to-zinc-50 dark:from-stone-900/30 dark:via-gray-950 dark:to-gray-950';
      case 'neutral':
        return 'from-neutral-50 via-slate-50 to-zinc-50 dark:from-neutral-900/30 dark:via-gray-950 dark:to-gray-950';
      case 'indigo':
        return 'from-indigo-50 via-slate-50 to-zinc-50 dark:from-indigo-950/30 dark:via-gray-950 dark:to-gray-950';
      default:
        return 'from-sky-50 via-slate-50 to-zinc-50 dark:from-sky-950/30 dark:via-gray-950 dark:to-gray-950';
    }
  };

  return (
    <div className={`min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${getBackgroundGradient()}`}>
      <div className="space-y-8 p-8">
        {/* Header Section - Simplified */}
        <div className="rounded-2xl bg-white/20 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/20 shadow-md p-8">
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DashboardIcon className={`h-6 w-6 ${themeColor === 'default' ? 'text-blue-600 dark:text-blue-400' : `text-${themeColor}-600 dark:text-${themeColor}-400`}`} />
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Grupos de usuarios
                  </h1>
                </div>
                <p className="text-base text-gray-500 dark:text-gray-400 max-w-[750px]">
                  Gestiona los permisos y configuraciones de los usuarios internos del sistema. 
                  Aquí puedes ver, editar y administrar todos los aspectos relacionados con los usuarios.
                  <Link href="/dashboard/users/operator/diagnostico" className={`ml-2 ${themeColor === 'default' ? 'text-blue-600 dark:text-blue-400' : `text-${themeColor}-600 dark:text-${themeColor}-400`} hover:underline`}>
                    Diagnóstico de conexión
                  </Link>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <InviteOperatorDialog />
                <CreateOperatorDialog />
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards 
              totalUsers={stats.totalUsers} 
              activeUsers={stats.activeUsers} 
              pendingUsers={stats.pendingUsers} 
              inactiveUsers={stats.inactiveUsers} 
            />
          </div>
        </div>

        {/* Search and Table Section - Simplified */}
        <div className="rounded-2xl bg-white/20 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/20 shadow-md overflow-hidden">
          {/* Search Bar */}
          

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b border-gray-200/30 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50">
              <TabsList className="p-0 h-12 w-full justify-start bg-transparent">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-900/80 data-[state=active]:shadow-sm rounded-none h-12 px-6 font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                >
                  Todos los usuarios
                </TabsTrigger>
                <TabsTrigger 
                  value="admin"
                  className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-900/80 data-[state=active]:shadow-sm rounded-none h-12 px-6 font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                >
                  Administrador
                </TabsTrigger>
                <TabsTrigger 
                  value="manager"
                  className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-900/80 data-[state=active]:shadow-sm rounded-none h-12 px-6 font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                >
                  Gerente
                </TabsTrigger>
                <TabsTrigger 
                  value="branch_manager"
                  className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-900/80 data-[state=active]:shadow-sm rounded-none h-12 px-6 font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                >
                  Gerente De Sucursal
                </TabsTrigger>
                <TabsTrigger 
                  value="staff"
                  className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-900/80 data-[state=active]:shadow-sm rounded-none h-12 px-6 font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                >
                  Operador
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50">
              {isLoading ? (
                <div className="p-6">
                  <OperatorsTableSkeleton />
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                      <h3 className="text-lg font-medium text-red-700 dark:text-red-400">Error al cargar operadores</h3>
                    </div>
                    <p className="text-red-700 dark:text-red-400 mb-4">
                      {error.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <ReloadIcon className="mr-2 h-4 w-4" />
                        Reintentar
                      </Button>
                      <Link href="/dashboard/users/operator/diagnostico">
                        <Button 
                          variant="outline"
                          className="border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <InfoCircledIcon className="mr-2 h-4 w-4" />
                          Diagnosticar conexión
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4">
                    <InlineDiagnostics />
                  </div>
                </div>
              ) : (
                <>
                  <TabContent value="all" data={operators} />
                  <TabContent value="admin" data={operators} role="admin" />
                  <TabContent value="manager" data={operators} role="manager" />
                  <TabContent value="branch_manager" data={operators} role="Gerente De Sucursal" />
                  <TabContent value="staff" data={operators} role="staff" />
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Componente principal que envuelve todo con el proveedor de contexto
export default function Page() {
  return (
    <OperatorsProvider>
      <OperatorsPageContent />
    </OperatorsProvider>
  );
}
