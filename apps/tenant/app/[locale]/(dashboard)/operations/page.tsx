'use client';

import { Card } from '@kaven/ui-base';
import { FileText, Building2, Wrench } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: 'SOPs',
    description: 'Standard Operating Procedures — create, version and execute processes',
    icon: FileText,
    href: '/operations/sops',
    color: 'text-blue-400',
  },
  {
    title: 'Vendors',
    description: 'Manage vendors, contracts, and performance scorecards',
    icon: Building2,
    href: '/operations/vendors',
    color: 'text-green-400',
  },
  {
    title: 'Tool Registry',
    description: 'Track internal tools, costs, and utilization',
    icon: Wrench,
    href: '/operations/tools',
    color: 'text-purple-400',
  },
];

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Operations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          SOPs, vendor management and tool registry
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
