// Content Operations module types

export type ContentStatus =
  | 'IDEA' | 'BRIEF' | 'IN_CREATION' | 'IN_REVIEW'
  | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'CANCELLED';

export type ContentType =
  | 'ARTICLE' | 'BLOG_POST' | 'SOCIAL_POST' | 'VIDEO' | 'PODCAST'
  | 'NEWSLETTER' | 'INFOGRAPHIC' | 'EBOOK' | 'CASE_STUDY' | 'WEBINAR' | 'OTHER';

export type AssetType =
  | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'SPREADSHEET'
  | 'PRESENTATION' | 'ARCHIVE' | 'OTHER';

export type ReviewDecision = 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';

export type ChannelPlatform =
  | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN' | 'YOUTUBE'
  | 'TIKTOK' | 'PINTEREST' | 'BLOG' | 'NEWSLETTER' | 'PODCAST' | 'WEBSITE' | 'OTHER';

export interface ContentCalendar {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isDefault: boolean;
  leadTimeDays: number;
  isActive: boolean;
  createdBy: { id: string; name: string; avatar?: string };
  _count?: { pieces: number };
  createdAt: string;
  updatedAt: string;
}

export interface ContentBrief {
  id: string;
  title: string;
  contentType: ContentType;
  objective: string;
  targetAudience?: string;
  toneOfVoice?: string;
  primaryKeyword?: string;
  secondaryKeywords: string[];
  headline?: string;
  cta?: string;
  wordCountTarget?: number;
  durationTarget?: number;
  createdBy: { id: string; name: string; avatar?: string };
  _count?: { pieces: number };
  createdAt: string;
}

export interface ContentPiece {
  id: string;
  title: string;
  body?: string;
  contentType: ContentType;
  status: ContentStatus;
  scheduledAt?: string;
  publishedAt?: string;
  tags: string[];
  calendar: { id: string; name: string; color?: string };
  brief?: { id: string; title: string };
  assignedTo?: { id: string; name: string; avatar?: string };
  channel?: { id: string; name: string; platform: ChannelPlatform };
  createdBy: { id: string; name: string; avatar?: string };
  _count?: { reviews: number; assets: number; children: number };
  createdAt: string;
  updatedAt: string;
}

export interface ContentReview {
  id: string;
  decision: ReviewDecision;
  comments?: string;
  round: number;
  reviewer: { id: string; name: string; avatar?: string };
  createdAt: string;
}

export interface ContentAsset {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  assetType: AssetType;
  storagePath: string;
  width?: number;
  height?: number;
  duration?: number;
  uploadedBy: { id: string; name: string };
  createdAt: string;
}

export interface ContentChannel {
  id: string;
  name: string;
  platform: ChannelPlatform;
  accountName?: string;
  accountUrl?: string;
  isActive: boolean;
  _count?: { pieces: number };
  createdAt: string;
}
