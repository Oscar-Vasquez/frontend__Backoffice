"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Search, 
  Filter, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  ChevronDown,
  SlidersHorizontal,
  Check,
  X,
  MoreHorizontal,
  User,
  Loader2,
  Mail,
  SendHorizonal,
  DollarSign
} from "lucide-react";
import { ExtendedFirebaseUser, Invoice, InvoiceStatus } from "../types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Definir constantes para los valores de InvoiceStatus
const INVOICE_STATUS = {
  PENDING: 'PENDIENTE',
  PAID: 'PAGADO',
  PARTIAL: 'PARCIAL'
} as const;

// Extender el tipo Invoice para asegurar que incluya campos para pagos parciales
// Esta definición no afecta al tipo importado pero ayuda al editor/IDE
interface ExtendedInvoice extends Omit<Invoice, 'status'> {
  status?: string;
  paid_amount?: number;
  remaining_amount?: number;
  payment_history?: Array<{
    amount: number;
    date: string;
    method: string;
    reference: string;
  }>;
  payment_status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
}

// Define un tipo para las facturas pendientes con información del cliente
interface PendingInvoiceWithClient {
  invoice: ExtendedInvoice;
  client: ExtendedFirebaseUser;
  status: 'pending' | 'overdue' | 'paid' | string; // Permitir cualquier string para compatibilidad
  daysOverdue: number;
}

// Opciones para el filtro de estado
type StatusFilter = 'all' | 'pending' | 'overdue' | InvoiceStatus;

interface PendingInvoicesTableProps {
  pendingInvoices: PendingInvoiceWithClient[];
  onSelectClient: (client: ExtendedFirebaseUser) => void;
  onProcessPayment: (invoice: ExtendedInvoice) => void;
  onSendReminder: (invoice: ExtendedInvoice, client: ExtendedFirebaseUser) => Promise<void>;
  formatCurrency: (amount: number) => string;
  isLoading?: boolean;
}

// Añadir estilos CSS al principio del archivo, después de los imports
export default function PendingInvoicesTable({
  pendingInvoices,
  onSelectClient,
  onProcessPayment,
  onSendReminder,
  formatCurrency,
  isLoading = false
}: PendingInvoicesTableProps) {
  // Estado para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [amountFilter, setAmountFilter] = useState<[number, number] | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [reminderSuccess, setReminderSuccess] = useState<string | null>(null);

  // Estilos CSS para animación de pulse
  useEffect(() => {
    // Añadir estilos para la animación de pulse-border
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-border {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.05);
        }
        100% {
          opacity: 0;
          transform: scale(1.1);
        }
      }
      
      .animate-pulse-border {
        animation: pulse-border 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes success-wave {
        0% {
          opacity: 1;
          transform: scale(0);
        }
        100% {
          opacity: 0;
          transform: scale(1.5);
        }
      }
      
      .success-wave {
        animation: success-wave 1s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    // Limpiar al desmontar
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Función para determinar si una factura está atrasada (más de 30 días)
  const isOverdue = (invoice: ExtendedInvoice): boolean => {
    const invoiceDate = new Date(invoice.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - invoiceDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  };

  // Función para manejar el envío de recordatorio
  const handleSendReminder = async (item: PendingInvoiceWithClient) => {
    // Evitar envío múltiple
    if (sendingReminder) return;

    // ID del toast para poder actualizarlo
    const toastId = `reminder-${item.invoice.id}`;

    try {
      // Limpiar cualquier estado de éxito anterior
      setReminderSuccess(null);
      
      // Establecer estado de envío
      setSendingReminder(item.invoice.id);
      
      // Mostrar toast de carga
      toast.loading(
        `Enviando recordatorio a ${item.client.firstName} ${item.client.lastName}...`, 
        { id: toastId, duration: 100000 }
      );
      
      // Enviar recordatorio
      await onSendReminder(item.invoice, item.client);
      
      // Actualizar toast a éxito
      toast.success(
        `Recordatorio enviado correctamente a ${item.client.email}`, 
        { 
          id: toastId, 
          description: `Se notificó sobre ${item.invoice.totalPackages} paquete(s) pendientes con un valor de ${formatCurrency(item.invoice.amount)}.`,
          duration: 5000
        }
      );
      
      // Mostrar animación de éxito
      setReminderSuccess(item.invoice.id);
      setTimeout(() => setReminderSuccess(null), 2000);
      
    } catch (error) {
      console.error("Error al enviar recordatorio:", error);
      
      // Actualizar toast a error
      toast.error(
        "Error al enviar recordatorio", 
        { 
          id: toastId, 
          description: error instanceof Error ? error.message : "Ocurrió un error inesperado al enviar el correo.",
          duration: 5000
        }
      );
    } finally {
      setSendingReminder(null);
    }
  };

  // Obtener facturas filtradas
  const filteredInvoices = useMemo(() => {
    let filtered = [...pendingInvoices];

    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.client.firstName?.toLowerCase().includes(query) ||
        item.client.lastName?.toLowerCase().includes(query) ||
        item.client.email.toLowerCase().includes(query) ||
        item.invoice.invoiceNumber?.toLowerCase().includes(query) ||
        item.invoice.id.toLowerCase().includes(query)
      );
    }

    // Filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => {
        // Revisar primero si la factura tiene estado PARCIAL en el objeto invoice
        if (statusFilter === "PARCIAL") {
          return item.invoice.status === "PARCIAL";
        }
        
        if (statusFilter === "pending") {
          return item.status === "pending" && item.invoice.status !== "PARCIAL";
        }
        
        if (statusFilter === "overdue") {
          return item.status === "overdue" && item.invoice.status !== "PARCIAL";
        }
        
        return true;
      });
    }

    // Filtro de monto
    if (amountFilter) {
      const [min, max] = amountFilter;
      filtered = filtered.filter(item => 
        item.invoice.amount >= min && item.invoice.amount <= max
      );
    }

    // Filtro de fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(item => {
        const invoiceDate = new Date(item.invoice.date);
        invoiceDate.setHours(0, 0, 0, 0);
        return invoiceDate.getTime() === filterDate.getTime();
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.invoice.date).getTime();
        const dateB = new Date(b.invoice.date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (sortBy === "amount") {
        return sortDirection === "asc" 
          ? a.invoice.amount - b.invoice.amount 
          : b.invoice.amount - a.invoice.amount;
      }
      
      if (sortBy === "daysOverdue") {
        return sortDirection === "asc" 
          ? a.daysOverdue - b.daysOverdue 
          : b.daysOverdue - a.daysOverdue;
      }
      
      if (sortBy === "name") {
        const nameA = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
        const nameB = `${b.client.firstName} ${b.client.lastName}`.toLowerCase();
        return sortDirection === "asc" 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      
      return 0;
    });

    return filtered;
  }, [pendingInvoices, searchQuery, statusFilter, amountFilter, dateFilter, sortBy, sortDirection]);

  // Función para cambiar dirección de ordenamiento
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setAmountFilter(null);
    setDateFilter(null);
    setSortBy("date");
    setSortDirection("desc");
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para manejar errores de carga de imágenes
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const clientName = e.currentTarget.alt || 'Usuario';
    const originalSrc = e.currentTarget.src;
    console.error(`❌ Error al cargar imagen para "${clientName}":`, originalSrc);
    
    // Generar URL para avatar alternativo
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=random&color=fff&size=128&bold=true`;
    console.log(`🔄 Cambiando a avatar de fallback para "${clientName}":`, fallbackUrl);
    
    // Establecer el src al avatar alternativo
    e.currentTarget.src = fallbackUrl;
    
    // Eliminar el evento onerror para evitar bucles
    e.currentTarget.onerror = null;
  };

  // Función para renderizar skeleton loaders mientras carga
  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`} className="animate-pulse">
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-24 rounded-md" />
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-14 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="bg-card/50 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Facturas Pendientes y Atrasadas</span>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Listado de clientes con facturas pendientes o atrasadas
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar cliente o factura..." 
                className="pl-9 h-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filtros</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filtros Avanzados</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-2">
                  <label className="text-xs font-medium mb-1.5 block">Estado:</label>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="overdue">Atrasados</SelectItem>
                      <SelectItem value="PARCIAL">Pago Parcial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-2">
                  <label className="text-xs font-medium mb-1.5 block">Fecha:</label>
                  <Input
                    type="date"
                    className="h-9"
                    placeholder="Seleccionar fecha"
                    value={dateFilter ? dateFilter.toISOString().substring(0, 10) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDateFilter(new Date(e.target.value));
                      } else {
                        setDateFilter(null);
                      }
                    }}
                  />
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={resetFilters} className="text-xs cursor-pointer">
                  <X className="mr-2 h-3.5 w-3.5" />
                  <span>Limpiar Filtros</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 font-medium p-2 -ml-2 h-auto"
                    onClick={() => toggleSort("name")}
                  >
                    Cliente
                    {sortBy === "name" && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                        sortDirection === "desc" ? "rotate-0" : "rotate-180"
                      }`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 font-medium p-2 -ml-2 h-auto"
                  >
                    Factura
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 font-medium p-2 -ml-2 h-auto"
                    onClick={() => toggleSort("amount")}
                  >
                    Monto
                    {sortBy === "amount" && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                        sortDirection === "desc" ? "rotate-0" : "rotate-180"
                      }`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 font-medium p-2 -ml-2 h-auto"
                  >
                    Estado
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 font-medium p-2 -ml-2 h-auto"
                    onClick={() => toggleSort("date")}
                  >
                    Fecha
                    {sortBy === "date" && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                        sortDirection === "desc" ? "rotate-0" : "rotate-180"
                      }`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 font-medium p-2 -ml-2 h-auto"
                    onClick={() => toggleSort("daysOverdue")}
                  >
                    Vencimiento
                    {sortBy === "daysOverdue" && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                        sortDirection === "desc" ? "rotate-0" : "rotate-180"
                      }`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderSkeletonRows()
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Check className="h-10 w-10 text-muted-foreground/30" />
                      <h3 className="text-lg font-medium">No hay facturas pendientes</h3>
                      <p className="text-sm text-muted-foreground">
                        No se encontraron facturas pendientes o atrasadas con los filtros actuales
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((item) => {
                  // Añadir log detallado para depurar problema de fotos
                  console.log(`======= CLIENTE EN TABLA ${item.client.id} =======`);
                  console.log(`Nombre: ${item.client.firstName} ${item.client.lastName}`);
                  console.log(`Email: ${item.client.email}`);
                  console.log(`Photo URL: ${item.client.photo}`);
                  console.log(`Photo Tipo: ${typeof item.client.photo}`);
                  console.log(`Foto vacía?: ${!item.client.photo}`);
                  console.log(`¿Tiene foto válida?: ${Boolean(item.client.photo && typeof item.client.photo === 'string' && item.client.photo.trim() !== '')}`);
                  
                  // Información detallada sobre el estado de la factura
                  console.log(`======= ESTADO DE FACTURA ${item.invoice.id} =======`);
                  console.log(`Estado en item: ${item.status}`);
                  console.log(`Estado en item.invoice: ${item.invoice.status}`);
                  console.log(`Monto total: ${item.invoice.amount}`);
                  console.log(`Monto pagado: ${item.invoice.paid_amount || 0}`);
                  console.log(`Monto restante: ${item.invoice.remaining_amount || 0}`);
                  console.log(`¿Es pago parcial?: ${item.status === 'PARCIAL' || item.invoice.status === 'PARCIAL'}`);
                  console.log('=======================================');
                  
                  return (
                    <TableRow key={item.invoice.id} className="hover:bg-muted/30 cursor-pointer">
                      <TableCell className="py-3" onClick={() => onSelectClient(item.client)}>
                        <div className="flex items-center gap-3">
                          {/* Mostrar foto del cliente con mejor manejo de errores */}
                          {item.client.photo && typeof item.client.photo === 'string' && item.client.photo.trim() !== '' ? (
                            <img 
                              src={item.client.photo} 
                              alt={`${item.client.firstName || ''} ${item.client.lastName || ''}`}
                              className="h-9 w-9 rounded-full object-cover border border-border/30"
                              onError={handleImageError}
                              loading="lazy"
                            />
                          ) : (
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${item.client.firstName || ''} ${item.client.lastName || ''}`)}&background=random&color=fff&size=128&bold=true`}
                              alt={`${item.client.firstName || ''} ${item.client.lastName || ''}`}
                              className="h-9 w-9 rounded-full object-cover border border-border/30"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {item.client.firstName} {item.client.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {item.client.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => onSelectClient(item.client)}>
                        <div className="text-sm">
                          {item.invoice.invoiceNumber || `F-${item.invoice.id.slice(0, 6)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.invoice.totalPackages} paquete{item.invoice.totalPackages !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => onSelectClient(item.client)}>
                        <div className="font-medium text-sm">
                          {formatCurrency(item.invoice.amount)}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => onSelectClient(item.client)}>
                        <Badge 
                          variant={
                            (item.invoice.status === INVOICE_STATUS.PARTIAL || 
                             item.status === INVOICE_STATUS.PARTIAL || 
                             item.invoice.payment_status === 'partial' ||
                             (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0 && 
                              item.invoice.remaining_amount !== undefined && item.invoice.remaining_amount > 0)) 
                              ? "outline" :
                            item.status === "overdue" ? "destructive" : "warning"
                          }
                          className={cn(
                            "inline-flex items-center gap-1",
                            (item.invoice.status === INVOICE_STATUS.PARTIAL || 
                             item.status === INVOICE_STATUS.PARTIAL || 
                             item.invoice.payment_status === 'partial' ||
                             (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0 && 
                              item.invoice.remaining_amount !== undefined && item.invoice.remaining_amount > 0)) 
                              && "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                          )}
                        >
                          {(item.invoice.status === INVOICE_STATUS.PARTIAL || 
                            item.status === INVOICE_STATUS.PARTIAL || 
                            item.invoice.payment_status === 'partial' ||
                            (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0 && 
                             item.invoice.remaining_amount !== undefined && item.invoice.remaining_amount > 0)) ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse mr-0.5" />
                              Pago Parcial
                            </>
                          ) : item.status === "overdue" ? (
                            <>
                              <Clock className="h-3 w-3" />
                              Vencida
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              Pendiente
                            </>
                          )}
                        </Badge>
                        
                        {/* Mostrar monto pendiente por pagar si hay pagos parciales */}
                        {(item.invoice.status === INVOICE_STATUS.PARTIAL || 
                          item.status === INVOICE_STATUS.PARTIAL || 
                          item.invoice.payment_status === 'partial' ||
                          (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0 && 
                           item.invoice.remaining_amount !== undefined && item.invoice.remaining_amount > 0)) && (
                          <div className="flex flex-col space-y-1 mt-2">
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Monto total:</span>
                              <span className="font-medium">{formatCurrency(item.invoice.amount)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
                              <span>Pagado:</span>
                              <span className="font-medium">{formatCurrency(
                                item.invoice.paid_amount !== undefined 
                                  ? item.invoice.paid_amount 
                                  : 0
                              )}</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-emerald-500 dark:bg-emerald-400 h-1.5 rounded-full transition-all duration-500 ease-out"
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, 
                                    (item.invoice.paid_amount !== undefined && item.invoice.amount > 0)
                                      ? (item.invoice.paid_amount / item.invoice.amount) * 100
                                      : 0
                                  ))}%` 
                                }}
                              />
                            </div>
                            
                            <div className="flex justify-between items-center text-xs font-medium text-orange-600 dark:text-orange-400">
                              <span>Pendiente:</span>
                              <span>{formatCurrency(
                                item.invoice.remaining_amount !== undefined 
                                  ? item.invoice.remaining_amount 
                                  : item.invoice.paid_amount !== undefined
                                    ? item.invoice.amount - item.invoice.paid_amount
                                    : 0
                              )}</span>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell onClick={() => onSelectClient(item.client)}>
                        <div className="text-sm">{formatDate(item.invoice.date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.invoice.date), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => onSelectClient(item.client)}>
                        {item.status === "overdue" ? (
                          <div className="text-sm font-medium text-destructive">
                            {item.daysOverdue} días
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {30 - item.daysOverdue} días restantes
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button 
                            variant={(item.invoice.status === INVOICE_STATUS.PARTIAL || 
                                     item.status === INVOICE_STATUS.PARTIAL || 
                                     item.invoice.payment_status === 'partial' ||
                                     (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0 && 
                                      item.invoice.remaining_amount !== undefined && item.invoice.remaining_amount > 0)) 
                                    ? "outline" : "default"}
                            size="sm" 
                            className={cn(
                              "h-8 px-2 sm:px-3 gap-1 min-w-[85px] transition-all duration-200",
                              (item.invoice.status === INVOICE_STATUS.PARTIAL || 
                               item.status === INVOICE_STATUS.PARTIAL || 
                               item.invoice.payment_status === 'partial' ||
                               (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0 && 
                                item.invoice.remaining_amount !== undefined && item.invoice.remaining_amount > 0)) 
                              && "border-emerald-500 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/20"
                            )}
                            onClick={() => onProcessPayment(item.invoice)}
                          >
                            {(item.invoice.status === INVOICE_STATUS.PARTIAL || 
                              item.status === INVOICE_STATUS.PARTIAL || 
                              item.invoice.payment_status === 'partial' ||
                              (item.invoice.paid_amount !== undefined && item.invoice.paid_amount > 0 && 
                               item.invoice.remaining_amount !== undefined && item.invoice.remaining_amount > 0)) ? (
                              <>
                                <div className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-0.5" />
                                <span className="hidden sm:inline">Completar</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Pagar</span>
                              </>
                            )}
                          </Button>
                          
                          {/* Botón de enviar recordatorio con animación de carga */}
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 px-2 sm:px-3 gap-1 transition-all duration-300 relative overflow-hidden ${
                              sendingReminder === item.invoice.id ? 
                              "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" : 
                              reminderSuccess === item.invoice.id ?
                              "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" :
                              "hover:bg-amber-50 hover:text-amber-600 dark:hover:text-amber-400 dark:hover:bg-amber-950/30"
                            }`}
                            onClick={() => handleSendReminder(item)}
                            disabled={sendingReminder === item.invoice.id}
                          >
                            {sendingReminder === item.invoice.id ? (
                              <>
                                {/* Animación de onda (pulse) */}
                                <span className="absolute inset-0 rounded-md animate-pulse-border border-2 border-amber-400/50 dark:border-amber-600/50"></span>
                                
                                {/* Loader con animación */}
                                <div className="relative flex items-center gap-1">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                                  <span className="hidden sm:inline">Enviando...</span>
                                </div>
                              </>
                            ) : reminderSuccess === item.invoice.id ? (
                              <>
                                {/* Animación de éxito */}
                                <span className="absolute inset-0 rounded-full success-wave bg-green-400/30 dark:bg-green-500/30"></span>
                                
                                {/* Icono de éxito */}
                                <div className="relative flex items-center gap-1">
                                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                  <span className="hidden sm:inline">¡Enviado!</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <SendHorizonal className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Recordar</span>
                              </>
                            )}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onSelectClient(item.client)}>
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                disabled={sendingReminder === item.invoice.id}
                                onClick={() => handleSendReminder(item)}
                                className={`relative ${
                                  reminderSuccess === item.invoice.id 
                                  ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                                  : ""
                                }`}
                              >
                                {sendingReminder === item.invoice.id ? (
                                  <>
                                    <div className="absolute inset-0 bg-amber-50 dark:bg-amber-950/30 rounded-sm flex items-center justify-center overflow-hidden">
                                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                        <span>Enviando recordatorio...</span>
                                      </div>
                                    </div>
                                    <Mail className="mr-2 h-3.5 w-3.5 opacity-30" />
                                    <span className="opacity-30">Enviar recordatorio</span>
                                  </>
                                ) : reminderSuccess === item.invoice.id ? (
                                  <>
                                    <Check className="mr-2 h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                    <span>¡Recordatorio enviado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="mr-2 h-3.5 w-3.5" />
                                    <span>Enviar recordatorio</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Reportar problema
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{filteredInvoices.length}</span> de {pendingInvoices.length} facturas pendientes
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 