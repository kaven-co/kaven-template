'use client';

import { Card } from '@kaven/ui-base';
import { Calendar, FileText, Layers, Radio, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: 'Calendars',
    description: 'Editorial calendars — plan and organize content schedules',
    icon: Calendar,
    href: '/content-ops/calendars',
    color: 'text-blue-400',
  },
  {
    title: 'Briefs',
    description: 'Content briefs — define objectives, audience, and KPIs',
    icon: FileText,
    href: '/content-ops/briefs',
    color: 'text-amber-400',
  },
  {
    title: 'Content Pieces',
    description: 'Content pipeline — create, review, schedule, and publish',
    icon: Layers,
    href: '/content-ops/pieces',
    color: 'text-green-400',
  },
  {
    title: 'Channels',
    description: 'Publication channels — manage platforms and accounts',
    icon: Radio,
    href: '/content-ops/channels',
    color: 'text-purple-400',
  },
  {
    title: 'Analytics',
    description: 'Performance tracking — top content, engagement, workload',
    icon: BarChart3,
    href: '/content-ops/pieces?tab=analytics',
    color: 'text-cyan-400',
  },
];

export default function ContentOpsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Operations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Editorial pipeline — from brief to publication to performance
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
