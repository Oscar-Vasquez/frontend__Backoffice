// Tipos para transacciones
export interface Transaction {
  id: string;
  date: string; // Formato ISO
  amount: number;
  description: string;
  categoryId: string;
  category?: TransactionCategory;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  status: TransactionStatus;
  reference?: string; // Número de referencia o factura
  attachment?: string; // URL o path al comprobante escaneado
  notes?: string;
  userId: string; // Usuario que realizó la transacción
  branchId?: string; // Sucursal relacionada
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  // Metadata puede contener información adicional como método de pago o quién procesó la transacción
  metadata?: {
    amount?: number;
    paymentMethod?: string;
    invoiceId?: string;
    paymentId?: string;
    paymentDate?: string;
    processedBy?: {
      id: string;
      name: string;
      email: string;
    };
    [key: string]: any; // Permitir propiedades adicionales que no conocemos
  };
}

// Tipos para categorías de transacciones
export interface TransactionCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  transactionType?: TransactionType; // Tipo de transacción asociado a la categoría
  createdAt: string;
  updatedAt: string;
}

// Tipo para los métodos de pago
export type PaymentMethod = 
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'cheque'
  | 'otro';

// Tipo de transacción (ingreso o gasto)
export type TransactionType = 'ingreso' | 'gasto';

// Estado de la transacción
export type TransactionStatus = 'completada' | 'pendiente' | 'cancelada';

// Tipos para los filtros
export type TransactionFilter = 'todos' | 'recientes' | 'mayores';

// Tipo para la ordenación
export type SortOrder = 'asc' | 'desc';

// Tipo para estadísticas
export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  avgTransactionAmount: number;
  mostCommonCategory: string;
  largestTransaction: number;
  lastMonthTotal: number;
  currentMonthTotal: number;
  monthlyDifference: number; // Porcentaje de diferencia
  lastUpdate: string;
}

// Tipo para datos de análisis por categoría
export interface CategoryWithAmount {
  id: string;
  name: string;
  color: string;
  icon?: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

// Tipo para el estado de selección de categorías
export interface SelectedCategories {
  [categoryId: string]: boolean;
}

// Tipos para la creación y actualización de transacciones
export interface CreateTransactionDto {
  date: string;
  amount: number;
  description: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  status: TransactionStatus;
  reference?: string;
  attachment?: string;
  notes?: string;
  userId?: string;
  branchId?: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {
  id: string;
}

// Respuesta de API para la lista de transacciones
export interface TransactionsResponse {
  data: Transaction[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
  };
}

// Estado del diálogo de transacciones
export interface NewTransactionDialogState {
  open: boolean;
  transaction: Transaction | null;
} 