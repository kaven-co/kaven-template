'use client';

import { Card } from '@kaven/ui-base';
import { Mail, BarChart3, MousePointer, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ChannelBadge } from './ChannelBadge';
import { StatusBadge } from './StatusBadge';

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

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const openRate = campaign.sentCount > 0
    ? ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)
    : null;
  const clickRate = campaign.sentCount > 0
    ? ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1)
    : null;

  return (
    <Link href={`/marketing/campaigns/${campaign.id}`}>
      <Card className="p-5 hover:border-amber-500/30 transition-colors cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{campaign.name}</h3>
              <StatusBadge status={campaign.status} />
              <ChannelBadge channel={campaign.channel} />
            </div>
            {campaign.description && (
              <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
            )}

            {/* Metrics */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {campaign.sentCount > 0 && (
                <>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {campaign.sentCount.toLocaleString()} sent
                  </span>
                  {openRate && (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {openRate}% opens
                    </span>
                  )}
                  {clickRate && (
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3" />
                      {clickRate}% clicks
                    </span>
                  )}
                </>
              )}
              {campaign.scheduledAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(campaign.scheduledAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {/* Tags */}
            {campaign.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {campaign.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
            {campaign.owner.name}
          </span>
        </div>
      </Card>
    </Link>
  );
}
