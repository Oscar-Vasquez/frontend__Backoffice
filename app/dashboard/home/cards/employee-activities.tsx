"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, DollarSign, Truck, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

// Tipos de actividades
type ActivityType = 'factura' | 'entrega' | 'cobro' | 'recepcion';

interface Operator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  branchReference: string;
  activities: Activity[];
}

interface Branch {
  id: string;
  name: string;
  reference: string;
  operators: Operator[];
}

interface Activity {
  id: string;
  activityType: ActivityType;
  description: string;
  timestamp: Date;
  amount?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
}

// Datos de ejemplo estructurados
const branchData: Branch[] = [
  {
    id: "1",
    name: "Sucursal Centro",
    reference: "/branches/centro",
    operators: [
      {
        id: "1",
        name: "Carlos Méndez",
        avatar: "/avatars/carlos.png",
        role: "Supervisor",
        branchReference: "/branches/centro",
        activities: [
          {
            id: "1",
            activityType: "factura",
            description: "Facturó envío #12345",
            timestamp: new Date(2024, 2, 15, 14, 30),
            amount: 250.00,
            status: 'success'
          },
          {
            id: "5",
            activityType: "cobro",
            description: "Cobró factura #67890",
            timestamp: new Date(2024, 2, 15, 10, 30),
            amount: 150.00,
            status: 'success'
          }
        ]
      },
      {
        id: "4",
        name: "María Sánchez",
        avatar: "/avatars/maria.png",
        role: "Operador",
        branchReference: "/branches/centro",
        activities: [
          {
            id: "4",
            activityType: "recepcion",
            description: "Recibió paquete #45678",
            timestamp: new Date(2024, 2, 15, 11, 30),
            status: 'info'
          }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Sucursal Norte",
    reference: "/branches/norte",
    operators: [
      {
        id: "2",
        name: "Ana López",
        avatar: "/avatars/ana.png",
        role: "Operador",
        branchReference: "/branches/norte",
        activities: [
          {
            id: "2",
            activityType: "entrega",
            description: "Entregó paquete #54321",
            timestamp: new Date(2024, 2, 15, 13, 45),
            status: 'success'
          }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Sucursal Sur",
    reference: "/branches/sur",
    operators: [
      {
        id: "3",
        name: "Roberto García",
        avatar: "/avatars/roberto.png",
        role: "Operador",
        branchReference: "/branches/sur",
        activities: [
          {
            id: "3",
            activityType: "cobro",
            description: "Cobró envío #98765",
            timestamp: new Date(2024, 2, 15, 12, 15),
            amount: 180.00,
            status: 'warning'
          }
        ]
      }
    ]
  }
];

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
    factura: "bg-gradient-to-r from-blue-500 to-blue-600",
    entrega: "bg-gradient-to-r from-green-500 to-green-600",
    cobro: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    recepcion: "bg-gradient-to-r from-purple-500 to-purple-600"
  };

  const labels = {
    factura: "Facturación",
    entrega: "Entrega",
    cobro: "Cobro",
    recepcion: "Recepción"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${variants[type]}`}>
      {labels[type]}
    </span>
  );
};

const getStatusIcon = (status?: Activity['status']) => {
  const variants = {
    success: "text-green-500 bg-green-50 dark:bg-green-900/20",
    warning: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
    error: "text-red-500 bg-red-50 dark:bg-red-900/20",
    info: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
  };

  const className = `h-8 w-8 p-1.5 rounded-full ${variants[status || 'info']}`;

  switch (status) {
    case 'success':
      return <CheckCircle className={className} />;
    case 'warning':
      return <AlertCircle className={className} />;
    case 'error':
      return <AlertCircle className={className} />;
    case 'info':
    default:
      return <Clock className={className} />;
  }
};

export default function EmployeeActivitiesCard({ className }: { className?: string }) {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [expandedOperators, setExpandedOperators] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBranches, setFilteredBranches] = useState(branchData);

  useEffect(() => {
    const filtered = selectedBranch === 'all' 
      ? branchData 
      : branchData.filter(b => b.reference === selectedBranch);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredBranches(filtered.map(branch => ({
        ...branch,
        operators: branch.operators.filter(op => 
          op.name.toLowerCase().includes(query) ||
          op.activities.some(act => act.description.toLowerCase().includes(query))
        )
      })).filter(branch => branch.operators.length > 0));
    } else {
      setFilteredBranches(filtered);
    }
  }, [selectedBranch, searchQuery]);

  return (
    <Card className={`${className} backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50`}>
      <CardHeader className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <CardTitle className="text-xl font-bold">Actividad de Operadores</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar actividades..."
                className="pl-8 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[180px] bg-transparent">
                <SelectValue placeholder="Seleccionar Sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Sucursales</SelectItem>
                {branchData.map((branch) => (
                  <SelectItem key={branch.id} value={branch.reference}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-1 p-4">
            <AnimatePresence>
              {filteredBranches.map((branch) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-800/90 p-2 rounded-lg">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      {branch.name}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {branch.operators.map((operator) => (
                      <motion.div
                        key={operator.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div
                          onClick={() => {
                            setExpandedOperators(prev => {
                              const next = new Set(prev);
                              if (next.has(operator.id)) {
                                next.delete(operator.id);
                              } else {
                                next.add(operator.id);
                              }
                              return next;
                            });
                          }}
                          className="cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700">
                              <AvatarImage src={operator.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                                {operator.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">{operator.name}</div>
                              <div className="text-sm text-muted-foreground">{operator.role}</div>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedOperators.has(operator.id) ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </motion.div>
                          </div>

                          <AnimatePresence>
                            {expandedOperators.has(operator.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-14 pr-4 mt-2 space-y-2">
                                  {operator.activities.map((activity) => (
                                    <motion.div
                                      key={activity.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 20 }}
                                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          {getActivityIcon(activity.activityType)}
                                          {getActivityBadge(activity.activityType)}
                                        </div>
                                        {getStatusIcon(activity.status)}
                                      </div>
                                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                        {activity.description}
                                      </p>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                          {formatDistanceToNow(activity.timestamp, {
                                            addSuffix: true,
                                            locale: es
                                          })}
                                        </span>
                                        {activity.amount && (
                                          <span className="font-medium text-green-600 dark:text-green-400">
                                            ${activity.amount.toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 