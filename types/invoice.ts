export interface Invoice {
  id: string;
  numero: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: string;
  total: number;
  cliente: {
    id: string;
    nombre: string;
    email: string;
  };
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
  }>;
  metodoPago?: string;
  pagada: boolean;
  createdAt: string;
  updatedAt: string;
} 