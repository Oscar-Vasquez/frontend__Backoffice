export interface Operator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branchReference: string;
  status: 'active' | 'inactive';
  lastActivity?: Date;
  photo?: string;
}

export interface Branch {
  id: string;
  name: string;
  reference: string;
  province: string;
  address: string;
}

export interface UseOperatorsResult {
  operators: Operator[];
  branches: Branch[];
  loading: boolean;
  error: string | null;
} 