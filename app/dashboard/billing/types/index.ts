// Tipos para usuarios
export type FirebaseUserBase = {
  id: string;
  uid?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  photo?: string;
  photoURL?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  emailVerified?: boolean;
  birthDate?: string;
  createdAt?: string;
  lastLogin?: string;
  disabled?: boolean;
  status?: boolean;
};

export interface SubscriptionPlan {
  id: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  name: string;
  description?: string;
  price?: number | string;
  billing_cycle?: string;
  color?: string;
  is_active?: boolean;
  branch_id?: string;
  trial_period_days?: number;
  setup_fee?: number | string;
  max_users?: number | null;
  discounts?: any | null;
}

export interface Branch {
  id: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  name: string;
  address?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  prefix?: string;
  company_id?: string;
  manager_name?: string;
  opening_hours?: string | null;
  timezone?: string;
  location?: string;
}

export interface ExtendedFirebaseUser extends FirebaseUserBase {
  userId?: string;
  uid?: string;
  accountStatus?: string;
  planName?: string;
  walletName?: string;
  branchName?: string;
  branchAddress?: string;
  branchProvince?: string;
  branchPhone?: string;
  branchZipcode?: string;
  branchCity?: string;
  branchLocation?: string;
  assignedLocker?: string;
  displayMessage?: string;
  phone?: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  address?: string;
  verification?: any;
  shipping_insurance?: boolean;
  planId?: string;
  planDescription?: string;
  planRate?: number | string;
  planFrequency?: string;
  planStatus?: boolean;
  branchId?: string;
  price?: number | string;
  subscriptionPlan?: SubscriptionPlan;
  branch?: Branch;
}

// Tipos para facturas
export type InvoiceStatus = 'PENDIENTE' | 'PAGADO' | 'PARCIAL';

export type ShippingStage = {
  location: string;
  photo?: string;
  stage: string;
  status: string;
  updatedTimestamp: any;
};

export type Package = {
  packageId: string;
  trackingNumber: string;
  status: string;
  weight: number;
  volumetricWeight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  insurance?: boolean;
  shippingStages?: ShippingStage[];
  position?: string;
};

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  description: string;
  paymentDate?: string;
  transactionId?: string;
  packages: Package[];
  totalPackages: number;
  isPaid?: boolean;
  invoiceStatus?: string;
  invoiceNumber?: string;
  client?: ExtendedFirebaseUser;
  // Campos para pagos parciales
  paid_amount?: number;
  remaining_amount?: number;
  payment_status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  last_payment_date?: string;
  next_payment_due_date?: string;
  payment_history?: Array<{
    amount: number;
    date: string;
    method: PaymentMethod;
    reference?: string;
  }>;
}

// Tipos para stats
export interface BillingStats {
  totalPayments: number;
  activePackages: number;
  pendingPayments: number;
  lastActivity: string;
}

// Tipos para los filtros
export type InvoiceFilter = 'todos' | 'pendientes' | 'pagados';

// Tipos para pagos
export type PaymentMethod = string;

export interface PaymentOptions {
  method: PaymentMethod;
  amountReceived: number;
}

export interface PaymentDialogState {
  open: boolean;
  invoice: Invoice | null;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  isPartialPayment?: boolean;
  partialPaymentAmount?: number;
}