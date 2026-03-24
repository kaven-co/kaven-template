'use client';

import { Card } from '@kaven/ui-base';
import { ClipboardCheck, AlertTriangle, Shield, FileSearch } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: 'Compliance Checklists',
    description: 'LGPD, SOC2, ISO27001 — track controls and generate reports',
    icon: ClipboardCheck,
    href: '/compliance/checklists',
    color: 'text-blue-400',
  },
  {
    title: 'Incident Response',
    description: 'Security incidents — detect, track, resolve with SLA',
    icon: AlertTriangle,
    href: '/compliance/incidents',
    color: 'text-red-400',
  },
  {
    title: 'Insurance Policies',
    description: 'Track cyber and liability insurance coverage',
    icon: Shield,
    href: '/compliance/insurance',
    color: 'text-green-400',
  },
  {
    title: 'Security Assessments',
    description: 'Vulnerability scans, pen tests, code reviews, audits',
    icon: FileSearch,
    href: '/compliance/assessments',
    color: 'text-purple-400',
  },
];

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance & Security</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compliance management, incident response, insurance, and security assessments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
