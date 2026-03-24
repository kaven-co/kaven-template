'use client';

import { Card } from '@kaven/ui-base';
import { Megaphone, Calendar, Zap, FileText, Target, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: 'Campaigns',
    description: 'Create and manage marketing campaigns across email, SMS, WhatsApp and push',
    icon: Megaphone,
    href: '/marketing/campaigns',
    color: 'text-amber-400',
  },
  {
    title: 'Calendar',
    description: 'Marketing calendar with campaign scheduling and conflict detection',
    icon: Calendar,
    href: '/marketing/calendar',
    color: 'text-blue-400',
  },
  {
    title: 'Automations',
    description: 'Build marketing automation workflows with triggers and actions',
    icon: Zap,
    href: '/marketing/automations',
    color: 'text-purple-400',
  },
  {
    title: 'Forms',
    description: 'Lead capture forms with field builder and submission tracking',
    icon: FileText,
    href: '/marketing/forms',
    color: 'text-green-400',
  },
  {
    title: 'Lead Scoring',
    description: '4-dimension lead scoring with auto-qualification to MQL',
    icon: Target,
    href: '/marketing/campaigns?tab=scoring',
    color: 'text-red-400',
  },
  {
    title: 'UTM Analytics',
    description: 'UTM tracking with source/medium analytics and conversion attribution',
    icon: BarChart3,
    href: '/marketing/campaigns?tab=utm',
    color: 'text-cyan-400',
  },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Campaigns, automations, lead scoring and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="p-6 hover:border-amber-500/30 transition-colors cursor-pointer h-full">
              <mod.icon className={`h-8 w-8 ${mod.color} mb-4`} />
              <h2 className="text-lg font-semibold mb-2">{mod.title}</h2>
              <p className="text-sm text-muted-foreground">{mod.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
