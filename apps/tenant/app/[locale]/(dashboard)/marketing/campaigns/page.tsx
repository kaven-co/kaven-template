'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@kaven/ui-base';
import { Plus, Search, Filter, Megaphone } from 'lucide-react';
import { CampaignCard } from '@/components/marketing/CampaignCard';

// Types
interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
  status: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledAt?: string;
  owner: { id: string; name: string; avatar?: string };
  tags: string[];
  updatedAt: string;
}

// Demo data for initial render
const demoCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Welcome Campaign',
    slug: 'q1-welcome-campaign',
    description: 'Automated welcome email series for new leads',
    channel: 'EMAIL',
    status: 'DRAFT',
    sentCount: 0,
    openedCount: 0,
    clickedCount: 0,
    owner: { id: '1', name: 'Admin' },
    tags: ['welcome', 'onboarding'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Product Launch 2026',
    slug: 'product-launch-2026',
    description: 'Major product launch announcement campaign',
    channel: 'EMAIL',
    status: 'SCHEDULED',
    sentCount: 0,
    openedCount: 0,
    clickedCount: 0,
    scheduledAt: '2026-04-15T10:00:00Z',
    owner: { id: '1', name: 'Admin' },
    tags: ['launch', 'product'],
    updatedAt: new Date().toISOString(),
  },
];

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Sending', value: 'SENDING' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const campaigns = demoCampaigns;

  const filtered = campaigns.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage marketing campaigns across all channels
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                statusFilter === f.value
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign list */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter
                ? 'Try adjusting your filters'
                : 'Create your first campaign to get started'}
            </p>
            {!search && !statusFilter && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
