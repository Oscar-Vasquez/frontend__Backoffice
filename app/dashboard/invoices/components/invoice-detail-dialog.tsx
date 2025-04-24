import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Calendar, Clock, Printer, Download, Share2, ExternalLink, CheckCircle2, XCircle, AlertCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Invoice } from "@/app/services/invoices.service";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Process photo URL to ensure it has a proper format
const processPhotoUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // Trim any whitespace
  url = url.trim();
  
  // If empty string after trim, return undefined
  if (!url) return undefined;
  
  // If already starts with http, return as is
  if (url.startsWith('http')) return url;
  
  // Add https:// if missing
  return `https://${url}`;
};

// Paleta de colores actualizada de WorkExpress - Tema Rojo
const workExpressColors = {
  primary: {
    red: '#E63946',
    darkRed: '#D00000',
    brightRed: '#FF3B3F',
  },
  text: {
    light: '#FFFFFF',
    dark: '#000000',
  },
  background: {
    dark: '#1A1A1A',
  }
};

interface InvoiceDetailDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
}: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  // Agregamos depuración para verificar los valores de los campos
  console.log("Datos de factura en InvoiceDetailDialog:", {
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    price_plan: invoice.price_plan,
    shipping_insurance: invoice.shipping_insurance,
    price_plan_type: typeof invoice.price_plan,
    shipping_insurance_type: typeof invoice.shipping_insurance
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalAmount = parseFloat(invoice.total_amount || '0') || invoice.totalAmount || 0;
  
  // Normalización de los campos de la factura
  const normalizedInvoice = {
    ...invoice,
    price_plan: invoice.price_plan !== undefined && invoice.price_plan !== null 
      ? (typeof invoice.price_plan === 'string' 
          ? parseFloat(invoice.price_plan) 
          : typeof invoice.price_plan === 'number' 
            ? invoice.price_plan 
            : 0) 
      : undefined,
    shipping_insurance: invoice.shipping_insurance !== undefined 
      ? (typeof invoice.shipping_insurance === 'string' 
          ? String(invoice.shipping_insurance).toLowerCase() === 'true' 
          : Boolean(invoice.shipping_insurance)) 
      : false,
  };

  // Extraer datos de paquetes o items de factura
  const items = invoice.packages || invoice.packageReferences || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAGADO":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "PENDIENTE":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "ATRASADO":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "ANULADO":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAGADO":
        return "text-green-600 bg-green-50 border-green-100";
      case "PENDIENTE":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "ATRASADO":
        return "text-red-600 bg-red-50 border-red-100";
      case "ANULADO":
        return "text-gray-600 bg-gray-100 border-gray-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const handlePrint = () => {
    // Preparamos los estilos de impresión
    const printStyles = `
      @page {
        size: auto;
        margin: 15mm;
      }
      body {
        background-color: white;
        font-family: 'Inter', sans-serif;
        color: #333;
      }
      .print-content {
        max-width: 800px;
        margin: 0 auto;
        box-shadow: none !important;
      }
      .print-content * {
        color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-header {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;
      }
      .print-logo {
        height: 50px;
      }
      .no-print {
        display: none !important;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        border-bottom: 1px solid #e5e7eb;
        padding: 0.5rem;
        text-align: left;
        font-weight: 500;
      }
      td {
        padding: 0.5rem;
        border-bottom: 1px solid #f3f4f6;
      }
      .print-total {
        font-weight: bold;
        font-size: 1.1rem;
      }
      /* Asegurar que el gradiente de la cabecera se imprima correctamente */
      .gradient-header {
        background: linear-gradient(to right, #E63946, #D00000) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .total-box {
        padding: 0.75rem;
        border-radius: 0.25rem;
        background-color: #F8F8F8 !important;
      }
      /* Estilos para destacar el precio del plan y seguro */
      .price-plan-box {
        background-color: #EBF5FF !important;
        border: 1px solid #BEE3F8 !important;
        padding: 0.5rem;
        border-radius: 0.25rem;
        margin: 0.5rem 0;
      }
      .insurance-box {
        background-color: #F0FDF4 !important;
        border: 1px solid #C6F6D5 !important;
        padding: 0.5rem;
        border-radius: 0.25rem;
        margin: 0.5rem 0;
      }
      .price-plan-text {
        color: #2B6CB0 !important;
      }
      .insurance-text {
        color: #2F855A !important;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1;
      }
      .badge-blue {
        background-color: #EBF5FF !important;
        color: #2B6CB0 !important;
        border: 1px solid #BEE3F8 !important;
      }
      .badge-green {
        background-color: #F0FDF4 !important;
        color: #2F855A !important;
        border: 1px solid #C6F6D5 !important;
      }
      /* Estilos para el badge de seguro en la tabla */
      .insurance-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
        background-color: #F0FDF4 !important;
        color: #2F855A !important;
        border: 1px solid #C6F6D5 !important;
        margin-right: 0.5rem;
      }
      .insurance-description {
        color: #2F855A !important;
        font-size: 0.75rem;
      }
      /* Estilos para el panel informativo de seguro */
      .insurance-panel {
        background-color: #F0FDF4 !important;
        border: 1px solid #C6F6D5 !important;
        border-radius: 0.375rem;
        padding: 0.75rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: flex-start;
      }
      .insurance-panel-icon {
        color: #2F855A !important;
        margin-right: 0.5rem;
        flex-shrink: 0;
      }
      .insurance-panel-title {
        color: #1C4532 !important;
        font-size: 0.875rem;
        font-weight: 500;
      }
      .insurance-panel-text {
        color: #2F855A !important;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
      /* Estilos para el panel informativo del plan de precio */
      .plan-panel {
        background-color: #EBF5FF !important;
        border: 1px solid #BEE3F8 !important;
        border-radius: 0.375rem;
        padding: 0.75rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: flex-start;
      }
      .plan-panel-icon {
        color: #2B6CB0 !important;
        margin-right: 0.5rem;
        flex-shrink: 0;
      }
      .plan-panel-title {
        color: #1A365D !important;
        font-size: 0.875rem;
        font-weight: 500;
      }
      .plan-panel-text {
        color: #2B6CB0 !important;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
      /* Estilos para la tabla de resumen */
      .summary-table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      .summary-table tr {
        border-bottom: 1px solid #E5E7EB !important;
      }
      .summary-table tr:last-child {
        border-bottom: none !important;
      }
      .summary-table td {
        padding: 0.5rem 0 !important;
      }
      .summary-table td:last-child {
        text-align: right !important;
      }
      .summary-total-label {
        font-weight: 600 !important;
        font-size: 1rem !important;
        color: #1F2937 !important;
      }
      .summary-total-value {
        font-weight: 700 !important;
        font-size: 1.25rem !important;
        color: #1F2937 !important;
      }
      .summary-payment-status {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        margin-top: 0.25rem !important;
        color: #10B981 !important;
        font-size: 0.75rem !important;
      }
      /* Ocultar tooltip en impresión */
      .tooltip-hover {
        display: none !important;
      }
      /* Estilos para el cálculo de precio del plan */
      .plan-price-header {
        color: #2B6CB0 !important;
        font-size: 0.75rem !important;
        margin-bottom: 0.25rem !important;
      }
      .plan-calculation {
        font-size: 0.75rem !important;
        color: #4A5568 !important;
      }
      .plan-total {
        font-weight: 500 !important;
        margin-top: 0.25rem !important;
        color: #1A202C !important;
      }
    `;

    // Creamos un nuevo documento para imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes para imprimir');
      return;
    }

    // Clonamos todo el contenido del diálogo
    const contentToPrint = document.getElementById('invoice-content');
    if (!contentToPrint) return;

    // Escribimos el contenido en la nueva ventana
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${invoice.invoice_number}</title>
        <style>${printStyles}</style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="print-content">
          ${contentToPrint.outerHTML}
        </div>
        <script>
          window.onload = function() {
            // Modificar los elementos para la versión de impresión
            const pricePlanElements = document.querySelectorAll('.bg-blue-50');
            pricePlanElements.forEach(el => {
              el.classList.add('price-plan-box');
            });
            
            const insuranceElements = document.querySelectorAll('.bg-green-50');
            insuranceElements.forEach(el => {
              el.classList.add('insurance-box');
            });
            
            const blueBadges = document.querySelectorAll('.bg-blue-100');
            blueBadges.forEach(el => {
              el.classList.add('badge-blue');
            });
            
            const greenBadges = document.querySelectorAll('.bg-green-100');
            greenBadges.forEach(el => {
              el.classList.add('badge-green');
            });
            
            // Añadimos estilos específicos para el badge de seguro en la tabla
            document.querySelectorAll('.bg-green-50.text-green-700.text-xs').forEach(el => {
              el.classList.add('insurance-badge');
            });
            
            document.querySelectorAll('.text-green-600.ml-2').forEach(el => {
              el.classList.add('insurance-description');
            });
            
            // Añadimos estilos para el panel informativo de seguro
            document.querySelectorAll('.mb-4.bg-green-50.border.border-green-100').forEach(el => {
              el.classList.add('insurance-panel');
            });
            
            document.querySelectorAll('.h-5.w-5.text-green-600.mt-0\\.5.mr-2').forEach(el => {
              el.classList.add('insurance-panel-icon');
            });
            
            document.querySelectorAll('.text-sm.font-medium.text-green-800').forEach(el => {
              el.classList.add('insurance-panel-title');
            });
            
            document.querySelectorAll('.text-xs.text-green-700.mt-1').forEach(el => {
              el.classList.add('insurance-panel-text');
            });
            
            // Añadimos estilos para el panel informativo del plan de precio
            document.querySelectorAll('.mb-4.bg-blue-50.border.border-blue-100').forEach(el => {
              el.classList.add('plan-panel');
            });
            
            document.querySelectorAll('.h-5.w-5.text-blue-600.mt-0\\.5.mr-2').forEach(el => {
              el.classList.add('plan-panel-icon');
            });
            
            document.querySelectorAll('.text-sm.font-medium.text-blue-800').forEach(el => {
              el.classList.add('plan-panel-title');
            });
            
            document.querySelectorAll('.text-xs.text-blue-700.mt-1').forEach(el => {
              el.classList.add('plan-panel-text');
            });
            
            // Aplicar estilos a la tabla de resumen
            document.querySelectorAll('.w-full.border-collapse').forEach(el => {
              el.classList.add('summary-table');
            });
            
            document.querySelectorAll('.py-3.text-base.font-semibold.text-gray-800').forEach(el => {
              el.classList.add('summary-total-label');
            });
            
            document.querySelectorAll('.text-xl.font-bold.text-gray-900').forEach(el => {
              el.classList.add('summary-total-value');
            });
            
            document.querySelectorAll('.mt-1.flex.items-center.justify-end.text-xs.text-green-600').forEach(el => {
              el.classList.add('summary-payment-status');
            });
            
            // Ocultar tooltips en la impresión
            document.querySelectorAll('.group-hover\\:block').forEach(el => {
              el.classList.add('tooltip-hover');
            });
            
            // Aplicar estilos a los cálculos de precio del plan
            document.querySelectorAll('.text-xs.text-blue-600.mb-1').forEach(el => {
              el.classList.add('plan-price-header');
            });
            
            document.querySelectorAll('.text-xs:not(.text-blue-600)').forEach(el => {
              if (el.textContent && el.textContent.includes('×')) {
                el.classList.add('plan-calculation');
              }
            });
            
            document.querySelectorAll('.font-medium.mt-1').forEach(el => {
              el.classList.add('plan-total');
            });
            
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[calc(100vw-32px)] max-w-full sm:max-w-3xl md:max-w-4xl p-0 overflow-hidden border-none mx-auto"
        style={{ maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}
      >
        <div id="invoice-content" className="bg-white rounded-md overflow-hidden shadow-sm overflow-x-hidden">
          {/* Cabecera con degradado de color rojo */}
          <div className="bg-gradient-to-r from-[#D00000] to-[#E63946] border-b border-gray-200 px-6 py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex flex-col items-center sm:items-start mb-3 sm:mb-0">
                <Image 
                  src="/LOGO-WORKEXPRES.png" 
                  alt="WorkExpress Logo" 
                  width={350} 
                  height={70} 
                  className="object-contain h-16 sm:h-20"
                  priority
                />
                {/* <p className="text-white/90 text-xs mt-2 font-medium">¡Compra sin estrés, compra con WorkExpress!</p> */}
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-white">FACTURA</h1>
                <p className="text-sm text-white/80">#{invoice.invoice_number}</p>
              </div>
            </div>
          </div>

          {/* Información de factura y cliente */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Cliente</h2>
                <div className="flex items-start">
                  {invoice.customer?.photo ? (
                    <Avatar className="h-8 w-8 mr-2 border border-gray-200">
                      <AvatarImage 
                        src={processPhotoUrl(invoice.customer.photo)} 
                        alt={invoice.customer?.name || "Cliente"}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(invoice.customer?.name || 'Cliente')}&background=random&color=fff&size=128&bold=true`;
                        }}
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  ) : null}
                  <div>
                    <p className="font-medium text-gray-900">{invoice.customer?.name || "Cliente sin nombre"}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{invoice.customer?.email || "Email no disponible"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:text-right">
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Información de Factura</h2>
                  <div className="flex sm:justify-end text-sm">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <p className="text-gray-500">Fecha emisión:</p>
                      <p className="font-medium text-gray-700">{formatDate(invoice.issue_date)}</p>
                      <p className="text-gray-500">Fecha vencimiento:</p>
                      <p className="font-medium text-gray-700">{formatDate(invoice.due_date)}</p>
                      <p className="text-gray-500">Estado:</p>
                      <div className="flex items-center">
                        <Badge className={cn("text-xs px-2 py-0.5 border", getStatusColor(invoice.status))}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de factura */}
          <div className="px-6 py-5">
            <h2 className="font-medium text-gray-900 pb-3 mb-3 border-b border-gray-200">Detalle de Facturación</h2>
            
           
            

            
            {items && items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Descripción</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-500">Precio</th>
                      <th className="py-3 px-4 text-center font-medium text-gray-500">Cantidad</th>
                      <th className="py-3 px-4 text-center font-medium text-gray-500">Peso</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => {
                      // Determinar si es un item de tipo PackageReference o Package
                      const isPackage = 'tracking_number' in item && !('name' in item);
                      const name = isPackage ? `Paquete ${item.tracking_number || ''}` : item.name;
                      const description = isPackage 
                        ? `Tracking: ${item.tracking_number || 'N/A'}` 
                        : (item.description || '');
                      const price = isPackage ? 0 : (item.price || 0);
                      const quantity = isPackage ? 1 : (item.quantity || 1);
                      const weight = isPackage 
                        ? item.weight
                        : ('weight' in item ? item.weight : 'N/A');
                      
                      // Calcular el precio basado en el plan y el peso
                      const weightValue = typeof weight === 'string' ? parseFloat(weight) : (weight || 0);
                      const planPrice = normalizedInvoice.price_plan !== undefined && normalizedInvoice.price_plan > 0 
                        ? normalizedInvoice.price_plan 
                        : 0;
                      const calculatedPrice = planPrice * weightValue;
                      
                      // Añadir el costo del seguro si está activado
                      const insuranceCost = normalizedInvoice.shipping_insurance === true ? 0.99 : 0;
                      const displayPrice = isPackage && planPrice > 0 ? calculatedPrice + (isPackage ? insuranceCost : 0) : price;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800 flex items-center">
                              {name}
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 max-w-sm">{description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {isPackage && planPrice > 0 ? (
                              <div>
                                <div className="font-medium mt-1">{formatCurrency(displayPrice)}</div>
                              </div>
                            ) : (
                              formatCurrency(displayPrice)
                            )}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">{quantity}</td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {weight ? `${weight} lb` : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(displayPrice * quantity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500 border border-dashed border-gray-200 rounded-md bg-gray-50">
                <p className="text-sm font-medium">No hay detalles disponibles para esta factura</p>
              </div>
            )}
          </div>

          {/* Resumen de totales */}
          <div className="px-6 py-5 ">
            <div className="w-full">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm font-medium text-gray-600">Subtotal:</td>
                    <td className="py-2 text-sm text-right font-medium text-gray-900">{formatCurrency(totalAmount)}</td>
                  </tr>
                  
                  {/* Precio del Plan */}
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm font-medium text-gray-600">Plan de Precio:</td>
                    <td className="py-2 text-sm text-right font-medium">
                      {normalizedInvoice.price_plan !== undefined && normalizedInvoice.price_plan > 0 ? (
                        <span className="text-gray-900">
                          {formatCurrency(normalizedInvoice.price_plan)}
                          <span className="text-xs text-gray-500 ml-1">/ lb</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No aplicable</span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Cálculo del precio del plan * peso (si aplica) */}
                  {normalizedInvoice.price_plan !== undefined && normalizedInvoice.price_plan > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-sm font-medium text-gray-600">
                        Cálculo de tarifa:
                        <span className="text-xs text-gray-500 ml-2">
                          (Peso total: {items.reduce((sum, item) => {
                            const weight = typeof item.weight === 'string' 
                              ? parseFloat(item.weight) 
                              : (item.weight || 0);
                            return sum + weight;
                          }, 0).toFixed(2)} lb)
                        </span>
                      </td>
                      <td className="py-2 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(normalizedInvoice.price_plan * items.reduce((sum, item) => {
                          const weight = typeof item.weight === 'string' 
                            ? parseFloat(item.weight) 
                            : (item.weight || 0);
                          return sum + weight;
                        }, 0))}
                      </td>
                    </tr>
                  )}

                  {/* Seguro de Envío */}
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm font-medium text-gray-600">
                      Seguro de Envío:
                      <span className="text-xs text-gray-500 ml-1">($0.99 × {items.length}c/u)</span>
                    </td>
                    <td className="py-2 text-sm text-right font-medium">
                      {normalizedInvoice.shipping_insurance ? (
                        <span className="text-gray-900">
                          {formatCurrency(0.99 * items.length)}

                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No contratado</span>
                      )}
                    </td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm font-medium text-gray-600">Impuestos:</td>
                    <td className="py-2 text-sm text-right font-medium text-gray-900">$0.00</td>
                  </tr>
                  
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm font-medium text-gray-600">Descuentos:</td>
                    <td className="py-2 text-sm text-right font-medium text-gray-900">-$0.00</td>
                  </tr>
                  
                  {/* Total Final */}
                  <tr>
                    <td className="py-3 text-base font-semibold text-gray-800">TOTAL:</td>
                    <td className="py-3 text-right">
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                      {invoice.status === "PAGADO" && (
                        <div className="mt-1 flex items-center justify-end text-xs text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          <span className="font-medium">Pago completado</span>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Información adicional */}
          <div className="px-6 py-5 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Información de Pago</h3>
                <div className="text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Método de pago:</span> {invoice.paymentMethod || "No especificado"}
                  </p>
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Referencia:</span> {invoice.id.slice(0, 8)}
                  </p>
                  {normalizedInvoice.price_plan !== undefined && normalizedInvoice.price_plan > 0 && (
                    <p className="text-gray-600 mt-1">
                      <span className="font-medium">Plan de precio:</span> {" "}
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 ml-1">
                        {formatCurrency(normalizedInvoice.price_plan)}
                      </Badge>
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Términos y Condiciones</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• El pago debe realizarse dentro del plazo especificado en esta factura.</p>
                  <p>• Pasada la fecha de vencimiento, se aplicarán cargos adicionales por mora.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer minimalista */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-2 sm:mb-0">
                <p>© {new Date().getFullYear()} WorkExpress. Todos los derechos reservados.</p>
              </div>
              <div className="flex items-center gap-2">
                <p>soporte@workexpress.com</p>
                <span className="hidden sm:inline">•</span>
                <p className="hidden sm:block">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra de acciones */}
        <div className="mt-4 p-4 bg-white rounded-md border border-gray-200 shadow-sm flex justify-between items-center">
          <div className="text-xs text-gray-500 hidden sm:block">
            <span className="font-medium">Factura:</span> #{invoice.invoice_number}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="text-xs px-4 py-2 h-9 border-gray-300 hover:bg-gray-50"
            >
              Cerrar
            </Button>
            
            <Button 
              variant="outline"
              className="text-xs px-4 py-2 h-9 border-[#E63946]/30 bg-[#E63946]/5 text-[#E63946] hover:bg-[#E63946]/10"
              onClick={() => {
                alert('Funcionalidad para compartir factura');
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-2" />
              <span>Compartir</span>
            </Button>
            
            <Button 
              onClick={handlePrint}
              className="text-xs px-4 py-2 h-9 bg-[#E63946] hover:bg-[#D00000] text-white font-medium"
            >
              <Printer className="h-3.5 w-3.5 mr-2" />
              <span>Imprimir</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 