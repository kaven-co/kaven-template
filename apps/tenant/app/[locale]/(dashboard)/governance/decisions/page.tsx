'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Input,
} from '@kaven/ui-base';
import {
  Plus,
  Search,
  Gavel,
  ClipboardList,
  Filter,
} from 'lucide-react';
import { DecisionCard } from '@/components/governance/DecisionCard';
import type { Decision, ActionItem } from '@/types/governance';

type Tab = 'decisions' | 'action-items';

export default function DecisionsPage() {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<Tab>('decisions');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch decisions
  const { data: decisionsData, isLoading: loadingDecisions } = useQuery({
    queryKey: ['governance', 'decisions', tenant?.id],
    queryFn: () => api.get('/api/v1/governance/decisions').then((r) => r.data),
    enabled: !!tenant?.id && activeTab === 'decisions',
  });

  // Fetch action items
  const { data: actionItemsData, isLoading: loadingItems } = useQuery({
    queryKey: ['governance', 'action-items', tenant?.id],
    queryFn: () => api.get('/api/v1/governance/action-items').then((r) => r.data),
    enabled: !!tenant?.id && activeTab === 'action-items',
  });

  const decisions: Decision[] = decisionsData?.data || [];
  const actionItems: ActionItem[] = actionItemsData?.data || [];

  const priorityColors: Record<string, string> = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-amber-500',
    CRITICAL: 'text-red-500',
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-500/10 text-blue-600',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-600',
    DONE: 'bg-green-500/10 text-green-600',
    CANCELLED: 'bg-gray-500/10 text-gray-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decisions & Actions</h1>
          <p className="text-muted-foreground">Decision log and action item tracker</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'decisions' ? 'Log Decision' : 'New Action Item'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'decisions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('decisions')}
        >
          <Gavel className="h-4 w-4 inline mr-1.5" />
          Decisions
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'action-items' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('action-items')}
        >
          <ClipboardList className="h-4 w-4 inline mr-1.5" />
          Action Items
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={activeTab === 'decisions' ? 'Search decisions...' : 'Search action items...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {activeTab === 'decisions' ? (
        loadingDecisions ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 h-40 animate-pulse bg-muted" />
            ))}
          </div>
        ) : decisions.length === 0 ? (
          <Card className="p-12 text-center">
            <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-1">No decisions logged</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start logging important decisions to keep your team aligned.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Decision
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {decisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        )
      ) : (
        loadingItems ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 h-16 animate-pulse bg-muted" />
            ))}
          </div>
        ) : actionItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-1">No action items</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Action items from meetings will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {actionItems.map((item) => (
              <Card key={item.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-medium ${statusColors[item.status] || ''} px-2 py-0.5 rounded-full`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                  <span className={priorityColors[item.priority]}>{item.priority}</span>
                  {item.assignee && <span>{item.assignee.name}</span>}
                  {item.dueDate && (
                    <span className={new Date(item.dueDate) < new Date() && item.status !== 'DONE' ? 'text-red-500 font-medium' : ''}>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
