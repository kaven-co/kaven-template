// Case/Matter Management module types

export type CaseStatus = 'INTAKE' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED' | 'ARCHIVED';
export type CaseType = 'LITIGATION' | 'ADVISORY' | 'TRANSACTIONAL' | 'ARBITRATION' | 'ADMINISTRATIVE';
export type CaseBillingType = 'HOURLY' | 'FLAT_FEE' | 'CONTINGENCY' | 'RETAINER' | 'PRO_BONO';
export type PartyRole = 'CLIENT' | 'OPPOSING' | 'WITNESS' | 'EXPERT' | 'JUDGE' | 'THIRD_PARTY';
export type CaseTaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type CaseTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type DeadlineType = 'COURT' | 'FILING' | 'HEARING' | 'RESPONSE' | 'APPEAL' | 'DISCOVERY' | 'INTERNAL' | 'CLIENT_DELIVERY' | 'REGULATORY' | 'CONTRACT_EXPIRY';
export type TimeEntryStatus = 'DRAFT' | 'PENDING' | 'BILLED' | 'INVOICED' | 'WRITTEN_OFF' | 'NO_CHARGE';

export interface Case {
  id: string;
  title: string;
  caseNumber?: string;
  courtNumber?: string;
  description?: string;
  caseType: CaseType;
  status: CaseStatus;
  billingType: CaseBillingType;
  clientId: string;
  leadAttorneyId?: string;
  courtName?: string;
  courtCity?: string;
  courtState?: string;
  estimatedValue?: number;
  hourlyRate?: number;
  currency: string;
  tags: string[];
  isConfidential: boolean;
  openedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  leadAttorney?: { id: string; name: string; email: string };
  _count?: {
    matters: number;
    parties: number;
    tasks: number;
    deadlines: number;
    timeEntries: number;
  };
}

export interface CaseMatter {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  billingType?: CaseBillingType;
  hourlyRate?: number;
  status: CaseStatus;
  assignedToId?: string;
  estimatedHours?: number;
  budgetAmount?: number;
  createdAt: string;
  updatedAt: string;
  _count?: { timeEntries: number; tasks: number };
}

export interface CaseParty {
  id: string;
  caseId: string;
  role: PartyRole;
  name: string;
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  opposingCounselName?: string;
  opposingCounselOab?: string;
  createdAt: string;
}

export interface CaseTask {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  status: CaseTaskStatus;
  priority: CaseTaskPriority;
  assignedToId?: string;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
  subtasks?: CaseTask[];
  _count?: { timeEntries: number };
}

export interface CaseDeadline {
  id: string;
  caseId: string;
  title: string;
  deadlineType: DeadlineType;
  dueDate: string;
  responsibleId?: string;
  isFulfilled: boolean;
  isCritical: boolean;
  description?: string;
  createdAt: string;
  case?: { id: string; title: string; caseNumber?: string };
}

export interface CaseTimeEntry {
  id: string;
  caseId: string;
  matterId?: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  isBillable: boolean;
  hourlyRate: number;
  amount?: number;
  status: TimeEntryStatus;
  description?: string;
  timerSessionId?: string;
  case?: { id: string; title: string; caseNumber?: string };
  matter?: { id: string; title: string };
  user?: { id: string; name: string };
}

export interface TrustAccount {
  id: string;
  caseId: string;
  clientId: string;
  balance: number;
  currency: string;
  bankName?: string;
  isActive: boolean;
  transactions?: TrustTransaction[];
}

export interface TrustTransaction {
  id: string;
  type: string;
  amount: number;
  direction: 'credit' | 'debit';
  balanceAfter: number;
  description: string;
  transactionDate: string;
  authorizedBy?: { id: string; name: string };
}
