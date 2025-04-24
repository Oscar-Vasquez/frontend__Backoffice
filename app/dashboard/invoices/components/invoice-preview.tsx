"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send } from "lucide-react";
import Image from "next/image";
import { formatInvoiceDate } from "@/lib/utils";

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
      <DialogContent className="max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {/* Header con diseño diagonal y logo */}
          <div className="relative bg-black text-white p-8 -mx-8 -mt-8 mb-8 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            }} />
            <div className="flex justify-between items-center relative z-10">
              <div className="w-[200px] h-[80px] relative bg-white p-2 rounded">
                <Image
                  src="/images/LOGO-FACTURA.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold mb-2">FACTURA</h2>
                <p className="text-gray-300">Nº {invoice.numero}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 mb-8">
            <Button variant="outline" onClick={onDownload} className="flex gap-2">
              <Download size={18} /> Descargar PDF
            </Button>
            <Button onClick={onSend} className="flex gap-2">
              <Send size={18} /> Enviar por Email
            </Button>
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
                  <p><span className="font-medium">Fecha Emisión:</span> {formatInvoiceDate(invoice.fechaEmision)}</p>
                  <p><span className="font-medium">Fecha Vencimiento:</span> {formatInvoiceDate(invoice.fechaVencimiento)}</p>
                  <p><span className="font-medium">Método de Pago:</span> Transferencia Bancaria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de conceptos mejorada */}
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
                    <td className="py-3 px-4 text-right">{item.precio.toFixed(2)} €</td>
                    <td className="py-3 px-4 text-right font-medium">{(item.cantidad * item.precio).toFixed(2)} €</td>
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
                  <span>{invoice.subtotal?.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (21%)</span>
                  <span>{(invoice.subtotal * 0.21).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IRPF (7%)</span>
                  <span>-{(invoice.subtotal * 0.07).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span>{invoice.total?.toFixed(2)} €</span>
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
