export interface Operator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  photo?: string;
  branchReference: string | null;
  branchName: string | null;
  lastActivity?: Date;
}

export interface Branch {
  id: string;
  name: string;
  reference: string;
  province: string;
  address: string;
}

export interface Activity {
  id: string;
  type: 'package' | 'payment' | 'delivery' | 'pickup';
  description: string;
  timestamp: Date;
  status: 'completed' | 'in_progress' | 'pending';
  details?: {
    amount?: number;
    trackingNumber?: string;
    location?: string;
  };
  operatorId: string;
}

export interface UseOperatorsResult {
  operators: Operator[];
  branches: Branch[];
  loading: boolean;
  error: string | null;
} 