'use client';

import { Card, Button } from '@kaven/ui-base';
import { Plus, Zap, Users, Play, Pause } from 'lucide-react';
import { StatusBadge } from '@/components/marketing/StatusBadge';

interface Automation {
  id: string;
  name: string;
  description?: string;
  status: string;
  triggerType: string;
  enrolledCount: number;
  completedCount: number;
  owner: { name: string };
}

const demoAutomations: Automation[] = [
  {
    id: '1',
    name: 'Welcome Drip Sequence',
    description: 'Send 3-email welcome series when new contact is created',
    status: 'ACTIVE',
    triggerType: 'CONTACT_CREATED',
    enrolledCount: 342,
    completedCount: 289,
    owner: { name: 'Admin' },
  },
  {
    id: '2',
    name: 'MQL Notification',
    description: 'Notify sales team when a lead reaches MQL threshold',
    status: 'ACTIVE',
    triggerType: 'LEAD_SCORE_THRESHOLD',
    enrolledCount: 56,
    completedCount: 56,
    owner: { name: 'Admin' },
  },
  {
    id: '3',
    name: 'Re-engagement Campaign',
    description: 'Send win-back emails to inactive contacts after 30 days',
    status: 'DRAFT',
    triggerType: 'MANUAL',
    enrolledCount: 0,
    completedCount: 0,
    owner: { name: 'Admin' },
  },
];

const triggerLabels: Record<string, string> = {
  CONTACT_CREATED: 'Contact Created',
  LIFECYCLE_CHANGED: 'Lifecycle Changed',
  LEAD_SCORE_THRESHOLD: 'Lead Score Threshold',
  FORM_SUBMITTED: 'Form Submitted',
  TAG_ADDED: 'Tag Added',
  CAMPAIGN_EVENT: 'Campaign Event',
  MANUAL: 'Manual',
};

export default function AutomationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build marketing automation workflows with triggers and actions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      <div className="space-y-4">
        {demoAutomations.map((automation) => (
          <Card key={automation.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  automation.status === 'ACTIVE' ? 'bg-green-500/10' : 'bg-muted'
                }`}>
                  <Zap className={`h-5 w-5 ${
                    automation.status === 'ACTIVE' ? 'text-green-400' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{automation.name}</h3>
                    <StatusBadge status={automation.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{automation.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {triggerLabels[automation.triggerType] || automation.triggerType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {automation.enrolledCount} enrolled
                    </span>
                    <span>{automation.completedCount} completed</span>
                  </div>
                </div>
              </div>
              <div>
                {automation.status === 'ACTIVE' ? (
                  <Button variant="outline" size="sm">
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                ) : automation.status === 'DRAFT' ? (
                  <Button variant="outline" size="sm">
                    <Play className="h-3 w-3 mr-1" />
                    Activate
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
