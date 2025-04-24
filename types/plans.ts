import { BranchDto } from './branch.dto';

export interface Plan {
  id?: string;
  planName: string;
  description: string;
  price: number;
  branchReference: string;
  branch?: BranchDto;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 