"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { InvoicesTable } from "./components/invoices-table";
import { NewInvoiceForm } from "./components/new-invoice-form";
import { toast } from "@/components/ui/use-toast";
import { InvoicesService, Invoice } from "@/app/services/invoices.service";
import { Spinner } from "@/components/ui/spinner";

// Función para procesar URLs de fotos
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

export default function InvoicesPage() {
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Iniciando fetch de facturas');
        
        const data = await InvoicesService.getAllInvoices();
        console.log('📦 Datos recibidos:', data);

        // Depuración para identificar los valores de price_plan y shipping_insurance
        data.forEach((invoice, index) => {
          console.log(`Factura #${index + 1} - ${invoice.invoice_number}:`, {
            price_plan: invoice.price_plan,
            price_plan_type: typeof invoice.price_plan,
            shipping_insurance: invoice.shipping_insurance,
            shipping_insurance_type: typeof invoice.shipping_insurance
          });
        });

        // Map status values
        const statusMap: Record<string, string> = {
          'paid': 'PAGADO',
          'pending': 'PENDIENTE',
          'sent': 'PENDIENTE',
          'overdue': 'ATRASADO',
          'cancelled': 'ANULADO'
        };

        // Normalize data to ensure compatibility
        const normalizedData = data.map(invoice => {
          // Si no hay foto del cliente pero sí hay ID de cliente, intentar generar una
          if (invoice.customer && !invoice.customer.photo) {
            // Generar un avatar utilizando API externa (ui-avatars)
            invoice.customer.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(invoice.customer.name)}&background=random&color=fff&size=128&bold=true`;
            console.log(`📸 Generando avatar para cliente ${invoice.customer.name}`);
          }

          return {
            ...invoice,
            totalAmount: invoice.totalAmount || parseFloat(invoice.total_amount || '0'),
            isPaid: invoice.isPaid || invoice.is_paid,
            userReference: invoice.userReference || (invoice.customer ? invoice.customer.name : 'Sin usuario asignado'),
            status: statusMap[invoice.status] || invoice.status.toUpperCase(),
            // Asegurar que los nuevos campos estén correctamente normalizados
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
            customer: invoice.customer ? {
              ...invoice.customer,
              photo: processPhotoUrl(invoice.customer.photo)
            } : undefined,
            // Asegurar que los paquetes tengan formato de peso correcto
            packages: invoice.packages ? invoice.packages.map(pkg => ({
              ...pkg,
              weight: typeof pkg.weight === 'string' ? pkg.weight : String(pkg.weight || '0')
            })) : undefined
          };
        });

        console.log('🔄 Datos normalizados:', normalizedData);
        setInvoices(normalizedData);
      } catch (error) {
        console.error('❌ Error:', error);
        setError(error instanceof Error ? error.message : 'Error inesperado');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (data: any) => {
    try {
      setError(null);
      console.log('Datos enviados al backend:', data);

      const newInvoice = await InvoicesService.createInvoice(data);
      setInvoices(prev => [...prev, newInvoice]);
      setIsNewInvoiceOpen(false);

      toast({
        title: "¡Factura creada con éxito!",
        description: `La factura #${newInvoice.invoice_number} ha sido creada`,
        variant: "default",
        duration: 4000,
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al crear la factura');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al crear la factura',
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      // Map frontend status to backend status
      const backendStatusMap: Record<string, string> = {
        'PAGADO': 'paid',
        'PENDIENTE': 'sent',
        'ATRASADO': 'overdue',
        'ANULADO': 'cancelled'
      };
      
      const backendStatus = backendStatusMap[newStatus] || newStatus.toLowerCase();
      
      const updatedInvoice = await InvoicesService.updateInvoiceStatus(invoiceId, backendStatus);
      
      // Make sure we convert the status back to frontend format
      const frontendStatus = updatedInvoice.status.toUpperCase();
      if (frontendStatus !== newStatus) {
        updatedInvoice.status = newStatus;
      }
      
      const updatedInvoices = invoices.map(invoice =>
        invoice.id === invoiceId ? updatedInvoice : invoice
      );

      setInvoices(updatedInvoices);
      
      toast({
        title: "Estado actualizado",
        description: `La factura ha sido actualizada a: ${newStatus}`,
        variant: "default",
        duration: 4000,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la factura",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative bg-white rounded-lg border border-gray-100 overflow-hidden mb-8">
        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        {/* Contenido del encabezado */}
        <div className="relative px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-light text-gray-900">
              Gestión de Facturas
            </h1>
            <div className="mt-2 h-[2px] w-12 bg-gray-200 mx-auto" />
            <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto">
              Administra y da seguimiento a todas tus facturas en un solo lugar
            </p>
          </div>
        </div>
        
        {/* Línea decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="mt-6">
        <InvoicesTable
          data={invoices}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      <NewInvoiceForm
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
        onSubmit={handleCreateInvoice}
      />
    </div>
  );
}
