// Documents & Knowledge Base module types

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  visibility: 'PUBLIC' | 'SPACE' | 'PRIVATE';
  ownerId: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    children: number;
  };
  children?: Folder[];
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'NEEDS_REVIEW';
  visibility: 'PUBLIC' | 'SPACE' | 'PRIVATE';
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isRichText: boolean;
  tags: string[];
  linkedModule?: string;
  ownerId: string;
  folderId?: string;
  versionCount: number;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    name: string;
  };
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  label?: string;
  fileKey?: string;
  richContent?: unknown;
  changeLog?: string;
  createdBy: string;
  createdAt: string;
  summary?: string;
  creator?: {
    name: string;
  };
}

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'NEEDS_REVIEW' | 'ARCHIVED';
  categoryId?: string;
  content: string;
  excerpt?: string;
  tags: string[];
  expertId?: string;
  verifiedAt?: string;
  viewCount: number;
  likeCount: number;
  helpfulCount: number;
  ownerId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  linkedModule?: string;
  owner?: {
    name: string;
  };
  category?: KBCategory;
}

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order: number;
  isSystem: boolean;
  _count?: {
    articles: number;
    children: number;
  };
  children?: KBCategory[];
}

export interface DocumentComment {
  id: string;
  documentId: string;
  content: string;
  authorId: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DELETED';
  createdAt: string;
  author?: {
    name: string;
  };
}

export interface DocumentShare {
  id: string;
  documentId: string;
  userId?: string;
  email?: string;
  permission: 'VIEW' | 'COMMENT' | 'EDIT';
  token?: string;
  expiresAt?: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  action: string;
  metadata?: Record<string, unknown>;
  actorId: string;
  createdAt: string;
  actor?: {
    name: string;
  };
}
