// Clients & CRM module types

export type ContactType = 'PERSON' | 'COMPANY' | 'PARTNER' | 'VENDOR';

export type LifecycleStage =
  | 'LEAD'
  | 'MQL'
  | 'SQL'
  | 'OPPORTUNITY'
  | 'ACTIVE_CLIENT'
  | 'AT_RISK'
  | 'CHURNED'
  | 'ADVOCATE';

export type HealthCategory = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';

export interface Contact {
  id: string;
  contactType: ContactType;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  organizationId?: string;
  organization?: { name: string };
  jobTitle?: string;
  lifecycleStage: LifecycleStage;
  status: string;
  source?: string;
  leadScore?: number;
  npsScore?: number;
  assignedTo?: { id: string; name: string };
  tags: string[];
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _count?: { interactions: number };
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  status: string;
  _count?: { contacts: number };
  createdAt: string;
}

export interface CrmInteraction {
  id: string;
  contactId: string;
  type: string;
  channel?: string;
  direction?: string;
  subject?: string;
  body?: string;
  duration?: number;
  outcome?: string;
  occurredAt: string;
  user?: { name: string };
}

export interface TimelineEvent {
  id: string;
  sourceType: string;
  title: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  color?: string;
  memberCount: number;
  lastEvaluatedAt?: string;
}

export interface HealthScore {
  overallScore: number;
  category: HealthCategory;
  dimensions: Record<string, unknown>;
  calculatedAt: string;
}

export interface CustomerFeedback {
  id: string;
  feedbackType: string;
  score?: number;
  comment?: string;
  submittedAt?: string;
}
