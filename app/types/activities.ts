export interface OperatorActivity {
  id: string;
  operatorId: string;
  operatorName: string;
  action: ActivityAction;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export type ActivityAction = 
  | 'PACKAGE_CREATED'
  | 'PACKAGE_ASSIGNED'
  | 'PACKAGE_USER_UPDATED'
  | 'PACKAGE_STATUS_UPDATED'
  | 'PACKAGE_INVOICED'
  | 'INVOICE_CREATED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'LOGIN'
  | 'LOGOUT'; 