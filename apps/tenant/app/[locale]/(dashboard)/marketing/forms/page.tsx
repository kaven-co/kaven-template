'use client';

import { Card, Button } from '@kaven/ui-base';
import { Plus, FileText, Eye, EyeOff } from 'lucide-react';

interface MktForm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  submissionCount: number;
  fields: Array<{ name: string; type: string; label: string }>;
  createdBy: { name: string };
  updatedAt: string;
}

const demoForms: MktForm[] = [
  {
    id: '1',
    name: 'Contact Us',
    slug: 'contact-us',
    description: 'Main contact form for website visitors',
    isActive: true,
    submissionCount: 156,
    fields: [
      { name: 'fullName', type: 'text', label: 'Full Name' },
      { name: 'email', type: 'email', label: 'Email' },
      { name: 'phone', type: 'tel', label: 'Phone' },
      { name: 'message', type: 'textarea', label: 'Message' },
    ],
    createdBy: { name: 'Admin' },
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Request a Demo',
    slug: 'request-demo',
    description: 'Demo request form for qualified leads',
    isActive: true,
    submissionCount: 43,
    fields: [
      { name: 'fullName', type: 'text', label: 'Full Name' },
      { name: 'email', type: 'email', label: 'Work Email' },
      { name: 'company', type: 'text', label: 'Company' },
      { name: 'role', type: 'select', label: 'Role' },
      { name: 'teamSize', type: 'select', label: 'Team Size' },
    ],
    createdBy: { name: 'Admin' },
    updatedAt: new Date().toISOString(),
  },
];

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Capture Forms</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create forms to capture leads and track submissions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoForms.map((form) => (
          <Card key={form.id} className="p-6 hover:border-amber-500/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileText className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{form.name}</h3>
                  <p className="text-xs text-muted-foreground">/{form.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {form.isActive ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <Eye className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <EyeOff className="h-3 w-3" /> Inactive
                  </span>
                )}
              </div>
            </div>

            {form.description && (
              <p className="text-sm text-muted-foreground mb-3">{form.description}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {form.fields.length} fields
              </span>
              <span className="font-semibold text-amber-400">
                {form.submissionCount} submissions
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {form.fields.map((field) => (
                <span key={field.name} className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">
                  {field.label}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
