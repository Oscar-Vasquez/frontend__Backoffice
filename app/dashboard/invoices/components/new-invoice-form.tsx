"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Trash2, Eye, Upload, FileText, X, Plus, Check, ChevronsUpDown } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoicePreview } from "./invoice-preview";
import { InvoicePDFTemplate } from "./invoice-pdf-template";
import { createRoot } from 'react-dom/client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertError } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { UsersService } from "@/app/services/users.service";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NewInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface InvoiceItem {
  descripcion: string;
  cantidad: number;
  precio: number;
  detalles?: string;
  peso?: number;
}

interface InvoiceFormData {
  numero: string;
  customer_id: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
  total: number;
  subtotal: number;
  estado: string;
  plan: string;
  payment_terms?: string;
  payment_method?: string;
  moneda: string;
  idioma: string;
  discount?: {
    tipo: string;
    valor: number;
  };
  deposit?: {
    tipo: string;
    valor: number;
  };
}

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  plan: string;
}

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
}

const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

export function NewInvoiceForm({ isOpen, onClose, onSubmit }: NewInvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([{ descripcion: "", cantidad: 1, precio: 0 }]);
  const [formData, setFormData] = useState<InvoiceFormData>({
    numero: generateInvoiceNumber(),
    customer_id: 0,
    fechaEmision: new Date(),
    fechaVencimiento: new Date(),
    total: 0,
    subtotal: 0,
    estado: "ENVIADO",
    plan: "",
    moneda: "USD",
    idioma: "es"
  });
  const [showDescuentoDialog, setShowDescuentoDialog] = useState(false);
  const [showDepositoDialog, setShowDepositoDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([
    {
      id: "basic",
      nombre: "Plan Básico WorkExpress",
      precio: 300.50,
      descripcion: "Plan mensual básico de envíos WorkExpress"
    },
    {
      id: "premium",
      nombre: "Plan Premium WorkExpress",
      precio: 500.50,
      descripcion: "Plan mensual premium de envíos WorkExpress"
    }
  ]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await UsersService.getAllUsers();
        setClients(clientsData);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };

    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedClient) {
        throw new Error('Por favor, seleccione un cliente');
      }

      if (!items.some(item => item.descripcion.trim())) {
        throw new Error('Debe agregar al menos un ítem con descripción');
      }

      const invoice_number = generateInvoiceNumber();
      const total_amount = items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

      const formattedData = {
        invoice_number,
        customer_id: selectedClient,
        issue_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        status: "PENDIENTE",
        total_amount,
        invoice_items: items.map(item => ({
          name: item.descripcion,
          description: item.detalles || "",
          quantity: parseInt(item.cantidad.toString()),
          price: parseFloat(item.precio.toString())
        }))
      };

      console.log('📝 Datos de la factura a enviar:', formattedData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la factura');
      }

      const result = await response.json();
      console.log('✅ Factura creada:', result);

      toast({
        title: "¡Factura creada con éxito!",
        description: `La factura #${invoice_number} ha sido creada correctamente.`,
        variant: "default",
        duration: 4000,
      });

      onClose();
    } catch (error) {
      console.error('❌ Error al crear factura:', error);
      setError(error instanceof Error ? error.message : 'Error al crear la factura');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al crear la factura',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { descripcion: "", cantidad: 1, precio: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "cantidad" || field === "precio" ? Number(value) : value
    };
    setItems(newItems);
  };

  const handleDescuento = (tipo: "porcentaje" | "monto", valor: number) => {
    setFormData(prev => ({
      ...prev,
      discount: { tipo, valor }
    }));
    setShowDescuentoDialog(false);
    calculateTotals(items);
  };

  const handleDeposito = (tipo: "porcentaje" | "monto", valor: number) => {
    setFormData(prev => ({
      ...prev,
      deposit: { tipo, valor }
    }));
    setShowDepositoDialog(false);
  };

  const calculateTotals = (currentItems: InvoiceItem[]) => {
    const subtotal = currentItems.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
    let total = subtotal;

    // Aplicar descuento si existe
    if (formData.discount) {
      const descuentoAmount = formData.discount.tipo === "porcentaje"
        ? subtotal * (formData.discount.valor / 100)
        : formData.discount.valor;
      total -= descuentoAmount;
    }

    setFormData(prev => ({ ...prev, subtotal, total }));
  };

  const handleSave = async () => {
    try {
      if (!formData.customer_id) {
        throw new Error('El cliente es obligatorio');
      }

      if (items.length === 0) {
        throw new Error('Debe agregar al menos un ítem a la factura');
      }

      // Preparar los datos en el formato correcto
      const dataToSend = {
        invoice_number: formData.numero,
        customer_id: formData.customer_id,
        issue_date: formData.fechaEmision,
        due_date: formData.fechaVencimiento,
        status: formData.estado,
        total_amount: items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0)
      };

      await onSubmit(dataToSend);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la factura');
    }
  };

  const handleSend = async () => {
    try {
      if (!items.some(item => item.descripcion.trim())) {
        toast({
          title: "Error de validación",
          description: "Debe agregar al menos un ítem con descripción",
          variant: "destructive",
        });
        return;
      }

      // Obtener el cliente seleccionado
      const clienteSeleccionado = clients.find(c => c.id === formData.customer_id);
      if (!clienteSeleccionado?.email) {
        throw new Error('No se encontró el email del cliente');
      }

      toast({
        title: "Generando y enviando factura...",
        description: "Por favor espere mientras preparamos su factura",
        variant: "default",
      });

      const formattedData = {
        invoice_number: formData.numero,
        customer_id: formData.customer_id,
        issue_date: new Date(formData.fechaEmision).toISOString().split('T')[0],
        due_date: new Date(formData.fechaVencimiento).toISOString().split('T')[0],
        status: "ENVIADO",
        total_amount: formData.total,
        paid_amount: 0.00,
        notes: "Gracias por su compra.",
        footer: "Factura generada electrónicamente.",
        invoice_items: items
          .filter(item => item.descripcion.trim())
          .map(item => ({
            name: item.descripcion,
            description: item.detalles || "",
            quantity: parseInt(item.cantidad.toString()),
            price: parseFloat(item.precio.toString())
          }))
      };

      // Crear la factura
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('workexpress_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData)
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear la factura');
      }

      const newInvoice = await response.json();

      // Generar PDF
      const pdf = await generatePDF();
      if (!pdf) {
        throw new Error('Error al generar el PDF');
      }

      // Preparar FormData con el PDF y el email
      const formDataToSend = new FormData();
      formDataToSend.append('pdf', new File([pdf.output('blob')], `factura-${formattedData.invoice_number}.pdf`, { type: 'application/pdf' }));
      formDataToSend.append('email', clienteSeleccionado.email);

      // Enviar email
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices/${newInvoice.id}/send-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('workexpress_token')}`,
          },
          body: formDataToSend
        }
      );

      if (!emailResponse.ok) {
        throw new Error('Error al enviar el email');
      }

      toast({
        title: "¡Factura enviada con éxito!",
        description: `La factura #${formattedData.invoice_number} ha sido creada y enviada a ${clienteSeleccionado.email}`,
        variant: "default",
        duration: 4000,
      });

      onClose();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al procesar la factura',
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => file);
      setAttachments(newAttachments);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

  const calcularSubtotal = () => {
    return items.reduce((total, item) => total + (item.cantidad * item.precio), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    let total = subtotal;

    // Aplicar descuento si existe
    if (formData.discount) {
      const descuento = formData.discount.tipo === "porcentaje"
        ? subtotal * (formData.discount.valor / 100)
        : formData.discount.valor;
      total -= descuento;
    }

    return total;
  };

  const generatePDF = async () => {
    const pdfContent = document.createElement('div');
    document.body.appendChild(pdfContent);
    const root = createRoot(pdfContent);

    root.render(<InvoicePDFTemplate invoice={{ ...formData, items }} />);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (pdfWidth * canvas.height) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      return pdf;
    } catch (error) {
      console.error('Error generando PDF:', error);
      return null;
    } finally {
      root.unmount();
      document.body.removeChild(pdfContent);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nueva Factura</DialogTitle>
            <DialogDescription>
              Crea una nueva factura para un cliente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedClient
                        ? clients.find((client) => client.id === selectedClient)?.name
                        : "Seleccionar cliente..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            onSelect={() => {
                              setSelectedClient(client.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-1">
                      <Label>Descripción</Label>
                      <Input
                        value={item.descripcion}
                        onChange={(e) => updateItem(index, "descripcion", e.target.value)}
                        placeholder="Descripción del ítem"
                      />
                    </div>
                    <div className="w-24">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, "cantidad", e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Precio</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precio}
                        onChange={(e) => updateItem(index, "precio", e.target.value)}
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeItem(index)}
                        className="mt-6"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" onClick={addItem}>
                Agregar ítem
              </Button>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Factura"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <InvoicePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        invoice={{
          ...formData,
          items,
          customer: clients.find(c => c.id === formData.customer_id),
          subtotal: calcularSubtotal(),
          total: calcularTotal()
        }}
        onDownload={handleSave}
        onSend={handleSubmit}
      />

      {/* Diálogo de Descuento */}
      <Dialog open={showDescuentoDialog} onOpenChange={setShowDescuentoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar descuento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de descuento</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDescuento("porcentaje", 10)}
                >
                  Porcentaje (%)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDescuento("monto", 100)}
                >
                  Monto fijo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Depósito */}
      <Dialog open={showDepositoDialog} onOpenChange={setShowDepositoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar depósito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de depósito</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDeposito("porcentaje", 50)}
                >
                  Porcentaje (%)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDeposito("monto", 500)}
                >
                  Monto fijo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
