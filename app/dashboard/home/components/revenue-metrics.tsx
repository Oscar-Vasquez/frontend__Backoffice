"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, DollarSign, Truck, CheckCircle, Clock, Search, Filter, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipos
interface Activity {
  id: string;
  type: 'package' | 'payment' | 'delivery' | 'pickup';
  description: string;
  timestamp: Date;
  status: 'completed' | 'in_progress' | 'pending';
  operator: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    branch: string;
  };
  details?: {
    amount?: number;
    trackingNumber?: string;
    location?: string;
  };
}

interface Branch {
  id: string;
  name: string;
  reference: string;
}

// Datos de ejemplo de sucursales
const branches: Branch[] = [
  { id: '1', name: 'Sucursal Centro', reference: '/branches/centro' },
  { id: '2', name: 'Sucursal Norte', reference: '/branches/norte' },
  { id: '3', name: 'Sucursal Sur', reference: '/branches/sur' }
];

// Datos de ejemplo de actividades
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'package',
    description: 'Nuevo paquete registrado',
    timestamp: new Date(),
    status: 'completed',
    operator: {
      id: '1',
      name: 'Ana Martínez',
      role: 'Operador',
      branch: 'Sucursal Centro'
    },
    details: {
      trackingNumber: 'PKG-2024-001'
    }
  },
  {
    id: '2',
    type: 'payment',
    description: 'Pago procesado',
    timestamp: new Date(Date.now() - 3600000),
    status: 'completed',
    operator: {
      id: '2',
      name: 'Carlos Ruiz',
      role: 'Supervisor',
      branch: 'Sucursal Norte'
    },
    details: {
      amount: 150.00,
      trackingNumber: 'PAY-2024-002'
    }
  },
  {
    id: '3',
    type: 'delivery',
    description: 'Entrega completada',
    timestamp: new Date(Date.now() - 7200000),
    status: 'completed',
    operator: {
      id: '3',
      name: 'Laura Soto',
      role: 'Operador',
      branch: 'Sucursal Sur'
    },
    details: {
      trackingNumber: 'DEL-2024-003',
      location: 'Zona Residencial'
    }
  }
];

function ActivityCard() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [activityType, setActivityType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Función para filtrar actividades
  const filteredActivities = activities.filter(activity => {
    // Filtro por búsqueda
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      activity.operator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.details?.trackingNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    // Filtro por tipo de actividad
    const matchesType = activityType === 'all' || activity.type === activityType;
    
    // Filtro por sucursal
    const matchesBranch = selectedBranch === 'all' || 
      activity.operator.branch === branches.find(b => b.id === selectedBranch)?.name;

    return matchesSearch && matchesType && matchesBranch;
  });

  // Ordenar actividades por fecha más reciente
  const sortedActivities = [...filteredActivities].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Función para manejar el cambio de sucursal
  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    // Resetear el tipo de actividad al cambiar de sucursal
    setActivityType('all');
  };

  // Función para obtener el icono según el tipo de actividad
  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      package: <Package className="h-5 w-5 text-purple-500" />,
      payment: <DollarSign className="h-5 w-5 text-green-500" />,
      delivery: <Truck className="h-5 w-5 text-blue-500" />,
      pickup: <CheckCircle className="h-5 w-5 text-amber-500" />
    };
    return icons[type];
  };

  // Función para obtener el color de estado
  const getStatusColor = (status: Activity['status']) => {
    const colors = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      pending: 'bg-amber-500'
    };
    return colors[status];
  };

  return (
    <Card className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Actividad de Operadores</CardTitle>
          <Badge variant="outline" className="px-4 py-1">
            {sortedActivities.length} actividades
          </Badge>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por operador, actividad o tracking..."
              className="pl-10 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Selector de Sucursal */}
            <div className="flex-1">
              <Select value={selectedBranch} onValueChange={handleBranchChange}>
                <SelectTrigger className="w-full bg-transparent">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Seleccionar Sucursal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Sucursales</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Tipo de Actividad */}
            <div className="flex-1">
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="w-full bg-transparent">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Tipo de Actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Actividades</SelectItem>
                  <SelectItem value="package">Paquetes</SelectItem>
                  <SelectItem value="payment">Pagos</SelectItem>
                  <SelectItem value="delivery">Entregas</SelectItem>
                  <SelectItem value="pickup">Recogidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <AnimatePresence>
            {sortedActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-4">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  No se encontraron actividades que coincidan con los filtros
                </p>
              </motion.div>
            ) : (
              sortedActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  <div className="relative flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                    <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${getStatusColor(activity.status)} m-2`} />
                    
                    <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700">
                      <AvatarImage src={activity.operator.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                        {activity.operator.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{activity.operator.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {activity.operator.role}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: es })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {activity.description}
                        </p>
                      </div>

                      {activity.details && (
                        <div className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
                          {activity.details.trackingNumber && (
                            <div>Tracking: {activity.details.trackingNumber}</div>
                          )}
                          {activity.details.amount && (
                            <div>Monto: ${activity.details.amount.toFixed(2)}</div>
                          )}
                          {activity.details.location && (
                            <div>Ubicación: {activity.details.location}</div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.operator.branch}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ActivityCard; 