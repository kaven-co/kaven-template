'use client';

import { Card } from '@kaven/ui-base';
import { Building2, Star, FileText, Phone } from 'lucide-react';
import type { Vendor } from '@/types/operations';
import Link from 'next/link';

const tierColors: Record<string, string> = {
  STRATEGIC: 'bg-purple-500/10 text-purple-400',
  PREFERRED: 'bg-blue-500/10 text-blue-400',
  STANDARD: 'bg-gray-500/10 text-gray-400',
  OCCASIONAL: 'bg-gray-500/10 text-gray-500',
};

const statusColors: Record<string, string> = {
  PROSPECT: 'bg-yellow-500/10 text-yellow-400',
  ONBOARDING: 'bg-blue-500/10 text-blue-400',
  ACTIVE: 'bg-green-500/10 text-green-400',
  SUSPENDED: 'bg-orange-500/10 text-orange-400',
  TERMINATED: 'bg-red-500/10 text-red-400',
  BLACKLISTED: 'bg-red-500/10 text-red-500',
};

export function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link href={`/operations/vendors/${vendor.id}`}>
      <Card className="p-4 hover:border-amber-500/30 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-amber-500" />
            <h3 className="font-medium text-sm truncate">{vendor.name}</h3>
          </div>
          <div className="flex gap-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${tierColors[vendor.tier] || ''}`}>
              {vendor.tier}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[vendor.status] || ''}`}>
              {vendor.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {vendor._count?.contracts || 0} contracts
          </span>
          {vendor.primaryContactName && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {vendor.primaryContactName}
            </span>
          )}
        </div>

        {vendor.scoreOverall != null && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-medium">{vendor.scoreOverall.toFixed(1)}/10</span>
            <span className="text-[10px] text-muted-foreground ml-1">overall score</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{vendor.category}</span>
        </div>
      </Card>
    </Link>
  );
}
