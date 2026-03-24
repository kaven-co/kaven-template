'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@kaven/ui-base';
import { FileText, LayoutTemplate, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type TemplateCategory =
  | 'LEGAL'
  | 'HR'
  | 'FINANCE'
  | 'MARKETING'
  | 'PROJECTS'
  | 'CLIENTS'
  | 'GENERAL';

interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  linkedModule?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usages: number;
  };
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  LEGAL: 'Legal',
  HR: 'HR',
  FINANCE: 'Finance',
  MARKETING: 'Marketing',
  PROJECTS: 'Projects',
  CLIENTS: 'Clients',
  GENERAL: 'General',
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  LEGAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  HR: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  FINANCE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MARKETING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  PROJECTS: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  CLIENTS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  GENERAL: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const ALL_CATEGORIES: TemplateCategory[] = [
  'LEGAL',
  'HR',
  'FINANCE',
  'MARKETING',
  'PROJECTS',
  'CLIENTS',
  'GENERAL',
];

type CategoryFilter = 'ALL' | TemplateCategory;

export default function TemplatesPage() {
  const { tenant } = useTenant();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');

  // Fetch templates
  const { data: templates, isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['templates', tenant?.id, categoryFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;

      const res = await api.get('/api/v1/templates', { params });
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  // Use template mutation
  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await api.post(`/api/v1/templates/${templateId}/use`);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      toast.success('Document created from template');
      if (data?.id) {
        router.push(`/documents/${data.id}`);
      }
    },
    onError: () => {
      toast.error('Failed to create document from template');
    },
  });

  // Filter by search locally
  const filteredTemplates = templates?.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <LayoutTemplate className="h-6 w-6" />
              Templates
            </h3>
            <p className="text-muted-foreground text-sm">
              Start from a pre-built template to create documents faster.
            </p>
          </div>
        </div>

        {/* Search and category filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                categoryFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'
              }`}
            >
              All
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  categoryFilter === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTemplates?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <LayoutTemplate className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm mt-1">
              {searchQuery || categoryFilter !== 'ALL'
                ? 'Try adjusting your search or filters.'
                : 'No templates available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates?.map((template) => (
              <Card
                key={template.id}
                className="flex flex-col hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold truncate">
                        {template.name}
                      </CardTitle>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${
                        CATEGORY_COLORS[template.category]
                      }`}
                    >
                      {CATEGORY_LABELS[template.category]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {template.description || 'No description available.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {template._count?.usages ?? 0} uses
                    </span>
                    <Button
                      size="sm"
                      onClick={() => useTemplateMutation.mutate(template.id)}
                      disabled={useTemplateMutation.isPending}
                      className="text-xs h-7 px-3"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
