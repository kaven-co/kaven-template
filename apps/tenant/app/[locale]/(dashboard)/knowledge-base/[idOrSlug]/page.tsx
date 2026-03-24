'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
} from '@kaven/ui-base';
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Save,
  Send,
  ThumbsUp,
  Eye,
  Calendar,
  User,
  Shield,
  ChevronRight,
  FileText,
  Link2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { StatusBadge } from '@/components/documents/StatusBadge';
import type { KBArticle } from '@/types/documents';

/**
 * Lightweight markdown-to-HTML renderer.
 * Handles headings, bold, italic, inline code, code blocks, links, lists, blockquotes, and paragraphs.
 * No external dependency needed.
 */
function renderMarkdown(md: string): string {
  // Escape HTML entities first
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre><code>${code.trimEnd()}</code></pre>`;
  });

  // Process line-by-line for block elements
  const lines = html.split('\n');
  const result: string[] = [];
  let inList: 'ul' | 'ol' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip lines inside pre blocks (already handled)
    if (line.includes('<pre>') || line.includes('</pre>')) {
      result.push(line);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (inList) { result.push(`</${inList}>`); inList = null; }
      const level = headingMatch[1].length;
      result.push(`<h${level}>${applyInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('&gt; ')) {
      if (inList) { result.push(`</${inList}>`); inList = null; }
      result.push(`<blockquote><p>${applyInline(line.slice(5))}</p></blockquote>`);
      continue;
    }

    // Unordered list item
    const ulMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== 'ul') {
        if (inList) result.push(`</${inList}>`);
        result.push('<ul>');
        inList = 'ul';
      }
      result.push(`<li>${applyInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== 'ol') {
        if (inList) result.push(`</${inList}>`);
        result.push('<ol>');
        inList = 'ol';
      }
      result.push(`<li>${applyInline(olMatch[1])}</li>`);
      continue;
    }

    // Close any open list
    if (inList) {
      result.push(`</${inList}>`);
      inList = null;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Paragraph
    result.push(`<p>${applyInline(line)}</p>`);
  }

  if (inList) result.push(`</${inList}>`);

  return result.join('\n');
}

/** Apply inline markdown formatting: bold, italic, inline code, links */
function applyInline(text: string): string {
  return text
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links [text](url)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

export default function KBArticleDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const idOrSlug = params?.idOrSlug as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitleOverride, setEditTitleOverride] = useState<string | null>(null);
  const [editContentOverride, setEditContentOverride] = useState<string | null>(null);
  const [editExcerptOverride, setEditExcerptOverride] = useState<string | null>(null);

  // Fetch article
  const { data: article, isLoading } = useQuery<KBArticle>({
    queryKey: ['kb-article', idOrSlug, tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/kb/articles/${idOrSlug}`);
      return res.data?.data || res.data;
    },
    enabled: !!tenant?.id && !!idOrSlug,
  });

  const editTitle = editTitleOverride ?? article?.title ?? '';
  const setEditTitle = (val: string) => setEditTitleOverride(val);
  const editContent = editContentOverride ?? article?.content ?? '';
  const setEditContent = (val: string) => setEditContentOverride(val);
  const editExcerpt = editExcerptOverride ?? article?.excerpt ?? '';
  const setEditExcerpt = (val: string) => setEditExcerptOverride(val);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<KBArticle>) => {
      const res = await api.patch(`/api/v1/kb/articles/${article?.id || idOrSlug}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-article', idOrSlug] });
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast.success('Article updated');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update article');
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/kb/articles/${article?.id || idOrSlug}/publish`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-article', idOrSlug] });
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast.success('Article published');
    },
    onError: () => {
      toast.error('Failed to publish article');
    },
  });

  // Helpful mutation
  const helpfulMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/kb/articles/${article?.id || idOrSlug}/helpful`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-article', idOrSlug] });
      toast.success('Thanks for your feedback!');
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      title: editTitle,
      content: editContent,
      excerpt: editExcerpt,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-muted/50 animate-pulse rounded" />
        <div className="h-12 w-full bg-muted/50 animate-pulse rounded" />
        <div className="h-96 w-full bg-muted/50 animate-pulse rounded" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <BookOpen className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Article not found</p>
        <Link href="/knowledge-base">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Knowledge Base
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/knowledge-base" className="hover:text-foreground transition-colors">
          Knowledge Base
        </Link>
        {article.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/knowledge-base?category=${article.categoryId}`}
              className="hover:text-foreground transition-colors"
            >
              {article.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{article.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold h-auto py-1"
              />
              <Input
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                placeholder="Article excerpt/summary"
                className="text-sm"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{article.title}</h1>
              {article.excerpt && (
                <p className="text-muted-foreground mt-1">{article.excerpt}</p>
              )}
            </>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <StatusBadge status={article.status} />
            {article.category && (
              <Badge variant="outline">{article.category.name}</Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.owner?.name || 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(article.updatedAt), 'PPp')}
            </span>
            {article.verifiedAt && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Verified {format(new Date(article.verifiedAt), 'PP')}
              </span>
            )}
          </div>

          {article.tags?.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(article.title);
                  setEditContent(article.content || '');
                  setEditExcerpt(article.excerpt || '');
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
              {article.status === 'DRAFT' && (
                <Button
                  size="sm"
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 py-3 px-4 bg-muted/30 rounded-lg mb-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="font-medium">{article.viewCount}</span> views
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ThumbsUp className="h-4 w-4" />
          <span className="font-medium">{article.helpfulCount}</span> found helpful
        </div>
        {article.publishedAt && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Published {format(new Date(article.publishedAt), 'PP')}
          </div>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {isEditing ? (
            <textarea
              className="w-full min-h-[400px] bg-transparent border-none outline-none resize-y text-sm font-mono"
              placeholder="Write your article content here (Markdown supported)..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          ) : article.content ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(article.content),
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3 opacity-20" />
              <p>No content yet. Click Edit to start writing.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helpful section */}
      {!isEditing && article.status === 'PUBLISHED' && (
        <div className="flex items-center justify-center gap-4 mt-8 py-6 border-t">
          <span className="text-sm text-muted-foreground">Was this article helpful?</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => helpfulMutation.mutate()}
            disabled={helpfulMutation.isPending}
            className="gap-1.5"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Yes, it helped
          </Button>
        </div>
      )}

      {/* Related documents placeholder */}
      {article.linkedModule && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Related Documents
          </h3>
          <p className="text-xs text-muted-foreground">
            This article is linked to the <Badge variant="outline">{article.linkedModule}</Badge> module.
          </p>
        </div>
      )}
    </div>
  );
}
