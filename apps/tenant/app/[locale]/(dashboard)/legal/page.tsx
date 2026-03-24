'use client';

import { Card } from '@kaven/ui-base';
import { Building2, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LegalPage() {
  const links = [
    {
      href: '/legal/entities',
      icon: Building2,
      label: 'Legal Entities',
      description: 'Manage companies and individuals with CNPJ/CPF validation',
    },
    {
      href: '/legal/contracts',
      icon: FileText,
      label: 'Contracts',
      description: 'Contract lifecycle management with state machine workflow',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Legal & Compliance</h1>
        <p className="text-muted-foreground">
          Legal entity management, contract lifecycle, and compliance tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent">
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{link.label}</div>
                    <div className="text-sm text-muted-foreground">{link.description}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
