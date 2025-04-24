export interface PaymentMethod {
  id: string;
  name: string;
  credit: number; // Ingresos
  debit: number;  // Egresos
  total: number;  // Balance (credit - debit)
}

export interface CashClosure {
  id: string;
  createdAt: string;
  closedAt?: string;
  status: 'open' | 'closed';
  paymentMethods: PaymentMethod[];
  totalAmount: number;
  totalCredit: number; // Total de ingresos
  totalDebit: number;  // Total de egresos
  closedBy?: {
    id: string;
    name: string;
  };
  message?: string; // Mensaje opcional del backend
}

export interface CashClosureFilters {
  startDate?: string;
  endDate?: string;
  status?: 'open' | 'closed';
}

export interface CashClosureHistoryItem {
  id: string;
  createdAt: string;
  closedAt: string;
  totalAmount: number;
  totalCredit: number; // Total de ingresos
  totalDebit: number;  // Total de egresos
  paymentMethodDetails: PaymentMethod[];
  closedBy?: {
    id: string;
    name: string;
  };
} 