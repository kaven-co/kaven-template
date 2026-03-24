// Operations module types

export type SOPCategory =
  | 'FINANCIAL' | 'COMMERCIAL' | 'OPERATIONAL' | 'HR' | 'IT'
  | 'LEGAL' | 'COMPLIANCE' | 'QUALITY' | 'SECURITY'
  | 'CUSTOMER_SUCCESS' | 'MARKETING' | 'OTHER';

export type SOPStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';

export type SOPExecutionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'COMPLETED_WITH_DEVIATIONS' | 'ABANDONED' | 'BLOCKED';

export type SOPStepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'BLOCKED';

export type VendorCategory =
  | 'TECHNOLOGY' | 'PROFESSIONAL_SERVICES' | 'INFRASTRUCTURE' | 'MARKETING'
  | 'LOGISTICS' | 'LEGAL' | 'FINANCIAL' | 'HR_BENEFITS' | 'FACILITIES'
  | 'SUPPLIERS' | 'OTHER';

export type VendorStatus = 'PROSPECT' | 'ONBOARDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'BLACKLISTED';
export type VendorTier = 'STRATEGIC' | 'PREFERRED' | 'STANDARD' | 'OCCASIONAL';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED' | 'RENEWED';

export type ToolCategory =
  | 'PRODUCTIVITY' | 'COMMUNICATION' | 'PROJECT_MANAGEMENT' | 'DESIGN'
  | 'DEVELOPMENT' | 'ANALYTICS' | 'CRM' | 'FINANCE' | 'HR' | 'SECURITY'
  | 'INFRASTRUCTURE' | 'AI' | 'MARKETING' | 'LEGAL' | 'OTHER';

export type ToolStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED' | 'EVALUATING';

export interface SOPStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  instructions: string;
  expectedOutput?: string;
  estimatedMinutes?: number;
  roleRequired?: string;
  assignee?: { id: string; name: string };
  isConditional: boolean;
  checklistItems: string[];
  attachments: string[];
}

export interface SOP {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: SOPCategory;
  department?: string;
  version: string;
  status: SOPStatus;
  estimatedMinutes?: number;
  owner: { id: string; name: string; avatar?: string };
  tags: string[];
  steps?: SOPStep[];
  _count?: { steps: number; executions: number };
  createdAt: string;
  updatedAt: string;
}

export interface SOPExecution {
  id: string;
  sop: { id: string; title: string; slug: string };
  executor: { id: string; name: string };
  triggerType: string;
  status: SOPExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  totalSteps: number;
  completedSteps: number;
  skippedSteps: number;
  completionRate?: number;
  notes?: string;
  stepExecutions?: Array<{
    id: string;
    step: { id: string; title: string; order: number; instructions?: string };
    status: SOPStepStatus;
    startedAt?: string;
    completedAt?: string;
    notes?: string;
    executor?: { id: string; name: string };
  }>;
}

export interface Vendor {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string;
  website?: string;
  category: VendorCategory;
  status: VendorStatus;
  tier: VendorTier;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  scoreOverall?: number;
  scoreQuality?: number;
  scorePontuality?: number;
  scoreCost?: number;
  scoreSupport?: number;
  lastScoredAt?: string;
  tags: string[];
  _count?: { contracts: number; contacts: number; toolItems: number };
  createdAt: string;
  updatedAt: string;
}

export interface VendorContract {
  id: string;
  title: string;
  contractNumber?: string;
  contractType: string;
  currency: string;
  totalValue?: number;
  monthlyValue?: number;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  vendor: { id: string; name: string };
}

export interface ToolRegistryItem {
  id: string;
  name: string;
  vendorName?: string;
  category: ToolCategory;
  description?: string;
  billingType: string;
  currency: string;
  costPerMonth: number;
  seats?: number;
  activeUsers?: number;
  totalSeats?: number;
  status: ToolStatus;
  department?: string;
  owner: { id: string; name: string };
  tags: string[];
  createdAt: string;
}
