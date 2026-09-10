import { User } from './auth';
import { PriceType } from './marketplace';
import { CareRequestResponse } from './care';

export type ContractStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REJECTED';

export type ApprovalParty = 'PATIENT' | 'NURSE';
export type ApprovalAction = 'APPROVED' | 'REJECTED';

export interface ContractApproval {
  id: string;
  contractId: string;
  party: ApprovalParty;
  action: ApprovalAction;
  reason?: string;
  createdAt: string;
}

export interface ContractAuditLog {
  id: string;
  contractId: string;
  action: string;
  actorId: string;
  actorRole: string;
  details?: any;
  createdAt: string;
}

export interface Contract {
  id: string;
  patientId: string;
  nurseId: string;
  sourceOfferId?: string;
  careRequestId?: string;
  price: number;
  priceType: PriceType;
  scopeText: string;
  status: ContractStatus;
  patientApproved: boolean;
  nurseApproved: boolean;
  patientReason?: string;
  nurseReason?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations that backend findContractById includes
  patient?: { id: string; user: User };
  nurse?: { id: string; user: User };
  approvals?: ContractApproval[];
  auditLogs?: ContractAuditLog[];
  sourceOffer?: any;
  careRequest?: CareRequestResponse;
}

export interface CreateContractDto {
  patientId: string;
  nurseId: string;
  sourceOfferId?: string;
  price: number;
  priceType?: PriceType;
  scopeText: string;
}

export interface RejectContractDto {
  reason: string;
}

export interface CancelContractDto {
  reason?: string;
}
