"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Clock, CreditCard, Loader2, Receipt, MapPin, ArrowLeft, Filter, Search
} from "lucide-react";
import { Invoice, InvoiceStatus } from "../types";

interface InvoiceListProps {
  invoices: Invoice[];
  onPayInvoice: (invoice: Invoice) => void;
  processingPayment: string | null;
  isInvoicePaid: (invoice: Invoice) => boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  isFiltered?: boolean; // Indica si se están filtrando resultados
  isSearching?: boolean; // Indica si se está buscando
  isLoading?: boolean; // Indica si los datos están cargando
}

export default function InvoiceList({ 
  invoices, 
  onPayInvoice, 
  processingPayment, 
  isInvoicePaid,
  formatCurrency,
  formatDate,
  isFiltered = false,
  isSearching = false,
  isLoading = false
}: InvoiceListProps) {
  // Función auxiliar para comprobar si hay paquetes de manera segura
  const hasPackages = (invoice: Invoice): boolean => {
    return Array.isArray(invoice.packages) && invoice.packages.length > 0;
  };

  // Función para obtener el número de paquetes de manera segura
  const getPackageCount = (invoice: Invoice): number => {
    // Si la factura tiene un campo totalPackages, usarlo
    if (typeof invoice.totalPackages === 'number') {
      return invoice.totalPackages;
    }
    
    // Si la factura tiene un array de paquetes, usar su longitud
    if (Array.isArray(invoice.packages)) {
      return invoice.packages.length;
    }
    
    // Buscar en propiedades alternativas
    const possiblePackageCountProps = ['packageCount', 'packagesCount', 'numPackages'];
    for (const prop of possiblePackageCountProps) {
      if (typeof (invoice as any)[prop] === 'number') {
        return (invoice as any)[prop];
      }
    }
    
    // Default: sin paquetes
    return 0;
  };

  // Función para renderizar paquetes de manera segura
  const renderPackages = (invoice: Invoice) => {
    // Asegurarse de que packages exista y sea un array
    const packages = Array.isArray(invoice.packages) ? invoice.packages : [];
    
    if (packages.length === 0) {
      return (
        <div className="text-xs text-muted-foreground italic">
          No hay paquetes registrados
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1 mt-1 max-h-[120px] overflow-y-auto">
        {packages.map((pkg, index) => (
          <div key={pkg.packageId || `pkg-${index}`} className="flex flex-col gap-0.5 py-0.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
              <span className="truncate max-w-[100px] md:max-w-[160px]">
                {pkg.trackingNumber || `TN-${index}`} ({pkg.weight || 0} lb)
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-3 text-xs text-muted-foreground/70">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span className="font-mono">
                {pkg.position || 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Función para formatear la fecha de manera segura
  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error('Error al formatear fecha:', dateString, error);
      return 'Formato inválido';
    }
  };

  // Renderizar mensaje cuando no hay facturas
  const renderEmptyState = () => {
    let icon = <Receipt className="h-12 w-12 text-muted-foreground/40" />;
    let title = "No hay facturas";
    let message = "No hay facturas disponibles para este usuario";
    
    if (isFiltered) {
      icon = <Filter className="h-12 w-12 text-muted-foreground/40" />;
      title = "No hay coincidencias";
      message = "Ninguna factura coincide con los filtros actuales";
    } else if (isSearching) {
      icon = <Search className="h-12 w-12 text-muted-foreground/40" />;
      title = "No se encontraron resultados";
      message = "Intenta con otra búsqueda o selecciona otro cliente";
    }
    
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  };

  // Renderizar filas de skeleton durante la carga
  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-3 w-32 bg-muted/70 rounded"></div>
          </div>
        </td>
        <td className="px-3 sm:px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-20 bg-muted rounded"></div>
            <div className="mt-1 flex flex-col gap-1">
              <div className="h-3 w-24 bg-muted/70 rounded"></div>
              <div className="h-3 w-28 bg-muted/70 rounded"></div>
            </div>
          </div>
        </td>
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          <div className="h-6 w-24 bg-muted rounded"></div>
          <div className="h-3 w-20 bg-muted/70 rounded mt-1 hidden sm:block"></div>
        </td>
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          <div className="h-4 w-20 bg-muted rounded"></div>
          <div className="h-3 w-16 bg-muted/70 rounded mt-1 hidden sm:block"></div>
        </td>
        <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
          <div className="h-4 w-28 bg-muted rounded"></div>
        </td>
        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-muted rounded"></div>
            <div className="h-8 w-8 bg-muted rounded-full"></div>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="py-3 px-4 sm:px-6 flex flex-row items-center border-b bg-muted/30">
        <div className="flex-1">
          <h3 className="text-base font-medium">Facturas del cliente</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Cargando facturas...</span>
              </span>
            ) : (
              `${invoices.length} facturas encontradas`
            )}
          </p>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Número Factura
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Paquetes
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Monto
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card">
            {isLoading ? (
              renderSkeletonRows()
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 sm:px-6 py-12 text-center">
                  {renderEmptyState()}
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/25 transition-colors">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {invoice.invoiceNumber || `F-${invoice.id.slice(0, 6)}`}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {invoice.description || "Factura"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {getPackageCount(invoice)} {getPackageCount(invoice) === 1 ? 'paquete' : 'paquetes'}
                      </span>
                      {renderPackages(invoice)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={isInvoicePaid(invoice) ? 'success' : 'warning'}
                      className="inline-flex items-center gap-1"
                    >
                      {isInvoicePaid(invoice) ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pagado</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Pendiente</span>
                        </>
                      )}
                    </Badge>
                    {invoice.paymentDate && (
                      <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        {safeFormatDate(invoice.paymentDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {formatCurrency(invoice.amount || 0)}
                    </div>
                    {invoice.transactionId && (
                      <div className="text-xs text-muted-foreground mt-1 font-mono hidden sm:block">
                        ID: {invoice.transactionId.slice(0, 8)}
                      </div>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {safeFormatDate(invoice.date)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onPayInvoice(invoice)}
                        disabled={isInvoicePaid(invoice) || processingPayment === invoice.id}
                        size="sm"
                        variant={isInvoicePaid(invoice) ? "outline" : "default"}
                        className="h-8 px-2 sm:px-3"
                      >
                        {processingPayment === invoice.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin sm:mr-1" />
                            <span className="hidden sm:inline">Procesando</span>
                          </>
                        ) : isInvoicePaid(invoice) ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Pagado</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Pagar</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={isInvoicePaid(invoice) || processingPayment === invoice.id}
                      >
                        <span className="sr-only">Menú</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando <span className="font-medium">{invoices.length}</span> facturas
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={true}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={true}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
} 