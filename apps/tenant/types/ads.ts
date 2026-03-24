// Ads Management module types

export type AdPlatform = 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN';
export type AdStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED' | 'ERROR';
export type CampaignObjective = 'AWARENESS' | 'TRAFFIC' | 'ENGAGEMENT' | 'LEADS' | 'APP_PROMOTION' | 'SALES' | 'CONVERSIONS';

export interface AdAccount {
  id: string;
  platform: AdPlatform;
  accountName: string;
  externalId: string;
  currency: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdCampaign {
  id: string;
  accountId: string;
  name: string;
  objective?: CampaignObjective;
  status: AdStatus;
  dailyBudget?: number;
  totalBudget?: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    accountName: string;
    platform: AdPlatform;
  };
  _count?: {
    adSets: number;
    metrics: number;
    rules: number;
  };
}

export interface AdCreative {
  id: string;
  name: string;
  type: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AdsMetric {
  id: string;
  accountId: string;
  campaignId?: string;
  adId?: string;
  platform: AdPlatform;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  reach: number;
  videoViews?: number;
  engagements?: number;
}

export interface AdRule {
  id: string;
  name: string;
  description?: string;
  conditionType: string;
  conditionValue: number;
  actionType: string;
  actionValue?: Record<string, unknown>;
  frequency: string;
  isActive: boolean;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricsSummary {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
}
