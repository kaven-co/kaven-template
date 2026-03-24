// SaaS Operations module types

export type ChurnType = 'VOLUNTARY' | 'INVOLUNTARY' | 'TRIAL_EXPIRED' | 'DOWNGRADE';
export type ChurnReason = 'PRICE' | 'FEATURES' | 'COMPETITOR' | 'SUPPORT' | 'NOT_USING' | 'BUG' | 'BUSINESS_CLOSED' | 'OTHER';
export type ExpansionType = 'PLAN_UPGRADE' | 'SEAT_EXPANSION' | 'ADDON' | 'REACTIVATION';
export type CustomerHealthCategory = 'HEALTHY' | 'AT_RISK' | 'CRITICAL' | 'CHURNED';

export interface MRRSnapshot {
  id: string;
  snapshotDate: string;
  mrrTotal: number;
  mrrNewBusiness: number;
  mrrExpansion: number;
  mrrContraction: number;
  mrrChurn: number;
  mrrReactivation: number;
  recognizedRevenue: number;
  deferredRevenue: number;
  arrProjected: number;
  arpu: number;
  activeSubscribers: number;
  currency: string;
  calculatedAt: string;
}

export interface ChurnEvent {
  id: string;
  subscriptionId: string;
  planName: string;
  churnType: ChurnType;
  churnReason?: ChurnReason;
  churnReasonText?: string;
  competitor?: string;
  mrrLost: number;
  arrLost: number;
  churnedAt: string;
  subscriptionAgeInDays: number;
  featureUsageScore?: number;
  dunningAttempts: number;
  reactivatedAt?: string;
}

export interface ChurnRate {
  churnCount: number;
  activeSubscribers: number;
  churnRate: number;
  period: string;
}

export interface ChurnReasonSummary {
  reason: ChurnReason;
  count: number;
  mrrLost: number;
}

export interface RevenueMetric {
  id: string;
  subscriptionId: string;
  expansionType: ExpansionType;
  fromPlanName?: string;
  toPlanName: string;
  mrrBefore: number;
  mrrAfter: number;
  mrrDelta: number;
  triggeredBy?: string;
  expandedAt: string;
}

export interface ExpansionSummary {
  totalExpansions: number;
  totalMrrDelta: number;
  byType: Record<string, { count: number; mrrDelta: number }>;
}

export interface FeatureAdoptionLog {
  id: string;
  featureKey: string;
  featureModule: string;
  usageDate: string;
  eventCount: number;
  uniqueUsers: number;
  avgDurationMs?: number;
  errorCount: number;
}

export interface TopFeature {
  featureKey: string;
  featureModule: string;
  totalEvents: number;
  totalUniqueUsers: number;
}
