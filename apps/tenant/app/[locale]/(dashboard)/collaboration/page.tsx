'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card } from '@kaven/ui-base';
import { Hash, MessageCircle, Calendar, Users } from 'lucide-react';

export default function CollaborationPage() {
  const { tenant } = useTenant();

  const { data: channels } = useQuery({
    queryKey: ['team-channels', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/team-collaboration/channels', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: updates } = useQuery({
    queryKey: ['team-updates', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/team-collaboration/updates', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: meetings } = useQuery({
    queryKey: ['team-meetings', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/team-collaboration/meetings', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const sections = [
    {
      title: 'Channels',
      description: 'Topic-based channels for team communication',
      icon: Hash,
      count: channels?.meta?.total || 0,
      color: 'text-blue-500',
    },
    {
      title: 'Team Updates',
      description: 'Async status updates and standups',
      icon: MessageCircle,
      count: updates?.meta?.total || 0,
      color: 'text-green-500',
    },
    {
      title: 'Meetings',
      description: 'Meeting scheduling with RSVP',
      icon: Calendar,
      count: meetings?.meta?.total || 0,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Team Collaboration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Channels, team updates, and meeting scheduling
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="p-6">
            <section.icon className={`h-8 w-8 mb-3 ${section.color}`} />
            <h3 className="font-semibold">{section.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
            <p className="text-2xl font-bold">{section.count}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
