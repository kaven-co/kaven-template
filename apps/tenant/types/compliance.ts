// Compliance & Security module types

export type ComplianceFrameworkType =
  | 'LGPD' | 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'CUSTOM';

export type ComplianceItemStatus =
  | 'NOT_STARTED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'VERIFIED' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus =
  | 'OPEN' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED' | 'CLOSED' | 'POST_MORTEM';

export type InsurancePolicyType =
  | 'CYBER' | 'GENERAL_LIABILITY' | 'PROFESSIONAL_LIABILITY'
  | 'DIRECTORS_OFFICERS' | 'PROPERTY' | 'WORKERS_COMP' | 'OTHER';

export type InsurancePolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL';

export type AssessmentType =
  | 'VULNERABILITY_SCAN' | 'PENETRATION_TEST' | 'CODE_REVIEW'
  | 'INFRASTRUCTURE_AUDIT' | 'POLICY_REVIEW' | 'VENDOR_ASSESSMENT' | 'CUSTOM';

export type AssessmentStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface ComplianceChecklist {
  id: string;
  name: string;
  description?: string;
  frameworkType: ComplianceFrameworkType;
  version: string;
  isTemplate: boolean;
  dueDate?: string;
  completedAt?: string;
  score?: number;
  createdBy: { id: string; name: string; avatar?: string };
  _count?: { items: number; reports: number };
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceItem {
  id: string;
  controlRef: string;
  title: string;
  description?: string;
  category?: string;
  status: ComplianceItemStatus;
  weight: number;
  notes?: string;
  assignee?: { id: string; name: string };
  verifiedBy?: { id: string; name: string };
  verifiedAt?: string;
  dueDate?: string;
  order: number;
}

export interface ComplianceReport {
  id: string;
  title: string;
  summary?: string;
  overallScore: number;
  totalControls: number;
  compliantCount: number;
  nonCompliantCount: number;
  notApplicableCount: number;
  generatedBy: { id: string; name: string };
  createdAt: string;
}

export interface IncidentResponse {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category?: string;
  affectedSystems: string[];
  impactDescription?: string;
  rootCause?: string;
  resolution?: string;
  lessonsLearned?: string;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDeadline?: string;
  reportedBy: { id: string; name: string; avatar?: string };
  assignedTo?: { id: string; name: string; avatar?: string };
  _count?: { timeline: number };
  createdAt: string;
}

export interface IncidentTimeline {
  id: string;
  entryType: string;
  description: string;
  createdBy: { id: string; name: string };
  createdAt: string;
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  policyType: InsurancePolicyType;
  provider: string;
  status: InsurancePolicyStatus;
  coverageAmount: number;
  deductible?: number;
  premiumAmount: number;
  premiumFrequency: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
}

export interface SecurityAssessment {
  id: string;
  title: string;
  description?: string;
  assessmentType: AssessmentType;
  status: AssessmentStatus;
  riskLevel?: RiskLevel;
  scope?: string;
  methodology?: string;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  scheduledDate?: string;
  completedDate?: string;
  nextAssessment?: string;
  assessorName?: string;
  assessorOrg?: string;
  createdBy: { id: string; name: string; avatar?: string };
  createdAt: string;
}
