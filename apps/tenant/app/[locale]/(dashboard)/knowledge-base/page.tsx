'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useSpace } from '@/lib/hooks/use-space';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Badge,
} from '@kaven/ui-base';
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  ThumbsUp,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { StatusBadge } from '@/components/documents/StatusBadge';
import type { KBArticle, KBCategory } from '@/types/documents';

type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'NEEDS_REVIEW';

// Category tree node
function CategoryNode({
  category,
  level,
  selectedCategoryId,
  onSelectCategory,
}: {
  category: KBCategory;
  level: number;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = selectedCategoryId === category.id;
  const hasChildren = (category._count?.children || 0) > 0;

  return (
    <div>
      <div
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-md hover:bg-accent/50 transition-colors ${
          isSelected ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(!expanded);
              }
            }}
            className="p-0.5 hover:bg-accent rounded cursor-pointer"
            aria-label={expanded ? 'Collapse category' : 'Expand category'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        ) : (
          <span className="w-4.5" />
        )}
        <button
          onClick={() => onSelectCategory(category.id)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          {category.icon ? (
            <span className="text-sm">{category.icon}</span>
          ) : expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate flex-1">{category.name}</span>
          {(category._count?.articles || 0) > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {category._count?.articles}
            </span>
          )}
        </button>
      </div>

      {expanded && category.children?.map((child) => (
        <CategoryNode
          key={child.id}
          category={child}
          level={level + 1}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
        />
      ))}
    </div>
  );
}

export default function KnowledgeBasePage() {
  const { tenant } = useTenant();
  const { activeSpaceId } = useSpace();
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Create article dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['kb-categories', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/kb/categories');
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  // Fetch articles
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['kb-articles', tenant?.id, activeSpaceId, selectedCategoryId, searchQuery, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeSpaceId) params.spaceId = activeSpaceId;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/api/v1/kb/articles', { params });
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; excerpt?: string }) => {
      const payload: Record<string, unknown> = {
        ...data,
        content: '',
        status: 'DRAFT',
      };
      if (selectedCategoryId) payload.categoryId = selectedCategoryId;

      const res = await api.post('/api/v1/kb/articles', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewExcerpt('');
      toast.success('Article created successfully');
    },
    onError: () => {
      toast.error('Failed to create article');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title: newTitle, excerpt: newExcerpt });
  };

  const statusFilters: StatusFilter[] = ['ALL', 'DRAFT', 'PUBLISHED', 'NEEDS_REVIEW'];

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Category sidebar */}
      <div className="w-[250px] border-r shrink-0 flex flex-col">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold">Categories</h4>
        </div>
        <div className="p-2 overflow-y-auto flex-1">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent/50 transition-colors ${
              selectedCategoryId === null ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>All Articles</span>
          </button>

          {categoriesLoading ? (
            <div className="space-y-2 mt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 bg-muted/50 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            categories?.map((cat: KBCategory) => (
              <CategoryNode
                key={cat.id}
                category={cat}
                level={0}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
              />
            ))
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Knowledge Base</h3>
              <p className="text-muted-foreground text-sm">
                Internal knowledge articles and guides.
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Article
            </Button>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:bg-accent'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status === 'NEEDS_REVIEW' ? 'Review' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Article list */}
        <div className="flex-1 overflow-y-auto p-4">
          {articlesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : articles?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first knowledge base article.'}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Article
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles?.map((article: KBArticle) => (
                <Link key={article.id} href={`/knowledge-base/${article.slug || article.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <StatusBadge status={article.status} />
                      </div>
                      <CardTitle className="mt-3 text-base line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                        {article.excerpt || 'No excerpt'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(article.updatedAt), 'PP')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {article.viewCount}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <ThumbsUp className="h-3 w-3" />
                            {article.helpfulCount}
                          </span>
                        </div>
                      </div>
                      {article.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {article.category && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Article Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Article</DialogTitle>
            <DialogDescription>
              Create a new knowledge base article.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="article-title">Title</Label>
              <Input
                id="article-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Article title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-excerpt">Excerpt</Label>
              <Input
                id="article-excerpt"
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
                placeholder="Brief summary of the article"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Article'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
