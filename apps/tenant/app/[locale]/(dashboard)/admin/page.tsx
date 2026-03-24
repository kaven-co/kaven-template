/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Input,
  Label,
} from '@kaven/ui-base';
import {
  Settings,
  Users,
  Shield,
  FileText,
  Webhook,
  Key,
  Plug,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminDashboardPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings', tenant?.id],
    queryFn: () => api.get('/api/v1/admin/settings').then((r) => r.data),
    enabled: !!tenant?.id,
  });

  // Fetch billing
  const { data: billing } = useQuery({
    queryKey: ['admin-billing', tenant?.id],
    queryFn: () => api.get('/api/v1/admin/billing').then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const [name, setName] = useState('');
  const [locale, setLocale] = useState('');
  const [timezone, setTimezone] = useState('');

  const updateSettings = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch('/api/v1/admin/settings', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings updated');
    },
    onError: () => toast.error('Failed to update settings'),
  });

  const adminLinks = [
    { href: '/admin/members', icon: Users, label: 'Members', description: 'Manage team members and invitations' },
    { href: '/admin/groups', icon: Shield, label: 'Groups', description: 'User groups for bulk RBAC' },
    { href: '/admin/audit-log', icon: FileText, label: 'Audit Log', description: 'Track all actions in your workspace' },
    { href: '/admin/webhooks', icon: Webhook, label: 'Webhooks', description: 'Outbound webhook configuration' },
    { href: '/admin/api-keys', icon: Key, label: 'API Keys', description: 'Manage tenant-scoped API keys' },
    { href: '/admin/integrations', icon: Plug, label: 'Integrations', description: 'Third-party integration settings' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Workspace settings and management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Members</div>
          <div className="text-2xl font-bold">
            {billing?.seats?.used || 0} / {billing?.seats?.allocated || 10}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Plan</div>
          <div className="text-2xl font-bold">{billing?.plan?.name || 'Free'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="text-2xl font-bold capitalize">{settings?.status?.toLowerCase() || 'Active'}</div>
        </Card>
      </div>

      {/* Settings Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Workspace Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Workspace Name</Label>
            <Input
              value={name || settings?.name || ''}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
            />
          </div>
          <div>
            <Label>Locale</Label>
            <Input
              value={locale || settings?.locale || ''}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="en"
            />
          </div>
          <div>
            <Label>Default Timezone</Label>
            <Input
              value={timezone || settings?.defaultTimezone || ''}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="UTC"
            />
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() => {
            const data: Record<string, unknown> = {};
            if (name) data.name = name;
            if (locale) data.locale = locale;
            if (timezone) data.defaultTimezone = timezone;
            if (Object.keys(data).length > 0) updateSettings.mutate(data);
          }}
          disabled={updateSettings.isPending}
        >
          Save Settings
        </Button>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{link.label}</div>
                    <div className="text-sm text-muted-foreground">{link.description}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
