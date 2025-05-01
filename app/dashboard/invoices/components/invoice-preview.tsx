"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Eye, Printer, Download, Send } from "lucide-react";
import Image from "next/image";
import { Invoice } from "@/app/services/invoices.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Define formatDateOnly locally
function formatDateOnly(date: string | Date): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn("Invalid date provided to formatDateOnly:", date);
      return 'Fecha inválida';
    }
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Error fecha';
  }
}

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    numero: string;
    fechaEmision: string | Date;
    fechaVencimiento: string | Date;
    customer?: {
      name: string;
      email: string;
      direccion: string;
      telefono: string;
    };
    items: Array<{
      descripcion: string;
      detalles?: string;
      cantidad: number;
      precio: number;
    }>;
    subtotal: number;
    total: number;
    descuento?: {
      tipo: "porcentaje" | "monto";
      valor: number;
    };
    deposito?: {
      tipo: "porcentaje" | "monto";
      valor: number;
    };
    empresa?: {
      direccion: string;
      email: string;
      telefono: string;
    };
  };
  onDownload: () => void;
  onSend: () => void;
}

export function InvoicePreview({ isOpen, onClose, invoice, onDownload, onSend }: InvoicePreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 bg-gray-100 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold">Vista Previa de Factura</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onDownload}><Download className="w-4 h-4 mr-2"/> Descargar</Button>
              <Button variant="outline" size="sm" onClick={onSend}><Send className="w-4 h-4 mr-2"/> Enviar</Button>
            </div>
          </div>
        </DialogHeader>
        <div className="p-8">
          {/* Encabezado con logo y detalles de la empresa */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <Image src="/LOGO-WORKEXPRESS.png" alt="Logo Empresa" width={100} height={100} />
              <div>
                <h2 className="text-xl font-bold">WorkExpress</h2>
                <p className="text-sm text-gray-500">{invoice.empresa?.direccion}</p>
                <p className="text-sm text-gray-500">{invoice.empresa?.email}</p>
                <p className="text-sm text-gray-500">{invoice.empresa?.telefono}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold mb-2">FACTURA</h2>
              <p className="text-gray-500">Nº {invoice.numero}</p>
            </div>
          </div>

          {/* Grid de información principal */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">DATOS DEL CLIENTE</h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Nombre:</span> {invoice.customer?.name}</p>
                  <p><span className="font-medium">Dirección:</span> {invoice.customer?.direccion}</p>
                  <p><span className="font-medium">Email:</span> {invoice.customer?.email}</p>
                  <p><span className="font-medium">Teléfono:</span> {invoice.customer?.telefono}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">DETALLES DE FACTURA</h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Fecha Emisión:</span> {formatDateOnly(invoice.fechaEmision)}</p>
                  <p><span className="font-medium">Fecha Vencimiento:</span> {formatDateOnly(invoice.fechaVencimiento)}</p>
                  <p><span className="font-medium">Método de Pago:</span> Transferencia Bancaria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Items */}
          <div className="overflow-hidden rounded-lg border border-gray-200 mb-8">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-black to-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Concepto</th>
                  <th className="py-3 px-4 text-center">Cantidad</th>
                  <th className="py-3 px-4 text-right">Precio</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{item.descripcion}</td>
                    <td className="py-3 px-4 text-center">{item.cantidad}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.precio)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.cantidad * item.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sección de totales y notas */}
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Notas</h4>
                <p className="text-sm text-blue-600">
                  El servicio tiene una validez de 30 días desde la fecha de emisión.
                </p>
              </div>
            </div>
            <div className="w-1/3">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (21%)</span>
                  <span>{formatCurrency(invoice.subtotal * 0.21)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IRPF (7%)</span>
                  <span>-{formatCurrency(invoice.subtotal * 0.07)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con información de empresa y firma */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-sm text-gray-600">
                <h4 className="font-bold text-gray-800 mb-2">EMPRESA</h4>
                <p>WorkExpress</p>
                <p>{invoice.empresa?.direccion}</p>
                <p>{invoice.empresa?.email}</p>
                <p>{invoice.empresa?.telefono}</p>
              </div>
              <div className="text-right">
                <div className="inline-block border-t border-gray-400 pt-4 mt-4">
                  <p className="text-sm text-gray-600">{invoice.customer?.name}</p>
                  <p className="text-xs text-gray-500">Firma del cliente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
