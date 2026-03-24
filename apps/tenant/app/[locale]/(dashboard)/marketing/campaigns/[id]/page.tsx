'use client';

import { Card } from '@kaven/ui-base';
import { ArrowLeft, BarChart3, Mail, MousePointer, AlertTriangle } from 'lucide-react';
import type { ElementType } from 'react';
import Link from 'next/link';
import { ChannelBadge } from '@/components/marketing/ChannelBadge';
import { StatusBadge } from '@/components/marketing/StatusBadge';

// Demo data
const campaign = {
  id: '1',
  name: 'Q1 Welcome Campaign',
  slug: 'q1-welcome-campaign',
  description: 'Automated welcome email series for new leads joining the platform',
  channel: 'EMAIL' as const,
  status: 'DRAFT',
  sentCount: 1250,
  deliveredCount: 1200,
  openedCount: 480,
  clickedCount: 96,
  bouncedCount: 50,
  unsubCount: 12,
  convertedCount: 24,
  audienceSize: 1500,
  budget: 2500,
  tags: ['welcome', 'onboarding', 'automated'],
  owner: { id: '1', name: 'Admin', avatar: null },
  segment: { id: '1', name: 'New Leads Q1', memberCount: 1500 },
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-03-20T14:30:00Z',
};

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: ElementType; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function CampaignDetailPage() {
  const openRate = campaign.deliveredCount > 0
    ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1)
    : '0';
  const clickRate = campaign.deliveredCount > 0
    ? ((campaign.clickedCount / campaign.deliveredCount) * 100).toFixed(1)
    : '0';
  const bounceRate = campaign.sentCount > 0
    ? ((campaign.bouncedCount / campaign.sentCount) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/marketing/campaigns" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
            <ChannelBadge channel={campaign.channel} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">{campaign.description}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Sent" value={campaign.sentCount.toLocaleString()} icon={Mail} color="bg-blue-500/10 text-blue-400" />
        <MetricCard label="Open Rate" value={`${openRate}%`} icon={BarChart3} color="bg-green-500/10 text-green-400" />
        <MetricCard label="Click Rate" value={`${clickRate}%`} icon={MousePointer} color="bg-amber-500/10 text-amber-400" />
        <MetricCard label="Bounce Rate" value={`${bounceRate}%`} icon={AlertTriangle} color="bg-red-500/10 text-red-400" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Channel</span>
              <ChannelBadge channel={campaign.channel} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Audience</span>
              <span>{campaign.segment?.name} ({campaign.audienceSize?.toLocaleString()} contacts)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget</span>
              <span>${campaign.budget?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner</span>
              <span>{campaign.owner.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tags</span>
              <div className="flex gap-1">
                {campaign.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-muted">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivered</span>
              <span>{campaign.deliveredCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened</span>
              <span>{campaign.openedCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clicked</span>
              <span>{campaign.clickedCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bounced</span>
              <span>{campaign.bouncedCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unsubscribed</span>
              <span>{campaign.unsubCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Converted</span>
              <span className="text-green-400 font-semibold">{campaign.convertedCount.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
