'use client';

import { Card, CardContent, CardHeader } from '@kaven/ui-base';
import { Calendar, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { AdCampaign } from '@/types/ads';

interface CampaignCardProps {
  campaign: AdCampaign;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-green-500/10 text-green-600',
  PAUSED: 'bg-yellow-500/10 text-yellow-600',
  ARCHIVED: 'bg-gray-500/10 text-gray-600',
  DELETED: 'bg-red-500/10 text-red-600',
  ERROR: 'bg-red-500/10 text-red-600',
};

const platformColors: Record<string, string> = {
  META: 'text-blue-500',
  GOOGLE: 'text-red-500',
  TIKTOK: 'text-pink-500',
  LINKEDIN: 'text-sky-600',
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/ads/campaigns/${campaign.id}`} aria-label={`View campaign: ${campaign.name}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            {campaign.account?.platform && (
              <span className={`text-xs font-medium ${platformColors[campaign.account.platform] || ''}`}>
                {campaign.account.platform}
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[campaign.status] || ''}`}
            >
              {campaign.status}
            </span>
          </div>
          <h3 className="font-semibold mt-2 line-clamp-1">{campaign.name}</h3>
          {campaign.objective && (
            <p className="text-sm text-muted-foreground capitalize">
              {campaign.objective.toLowerCase().replace('_', ' ')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {campaign.dailyBudget && (
              <div className="flex items-center gap-1" aria-label="Daily budget">
                <DollarSign className="h-3 w-3" />
                <span>${campaign.dailyBudget.toFixed(2)}/day</span>
              </div>
            )}
            {campaign._count && (
              <>
                <div className="flex items-center gap-1" aria-label="Ad sets count">
                  <TrendingUp className="h-3 w-3" />
                  <span>{campaign._count.adSets} ad sets</span>
                </div>
                <div className="flex items-center gap-1" aria-label="Metrics count">
                  <Eye className="h-3 w-3" />
                  <span>{campaign._count.metrics} metrics</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1" aria-label="Last updated">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(campaign.updatedAt), 'PP')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
