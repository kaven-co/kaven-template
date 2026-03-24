/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Badge,
} from '@kaven/ui-base';
import { Plus, Search, Download, UserMinus, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function MembersPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('USER');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-members', tenant?.id, deferredSearch],
    queryFn: () =>
      api.get('/api/v1/admin/members', { params: { search: deferredSearch || undefined } }).then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; role: string }) =>
      api.post('/api/v1/admin/members/invite', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      setIsInviteOpen(false);
      setInviteEmail('');
      toast.success('Invitation sent');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to send invite'),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => api.delete(`/api/v1/admin/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      toast.success('Member removed');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to remove member'),
  });

  const exportCsv = async () => {
    try {
      const response = await api.get('/api/v1/admin/members/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'members.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export');
    }
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'destructive';
      case 'TENANT_ADMIN': return 'default';
      default: return 'secondary';
    }
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'BANNED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage workspace members and invitations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setIsInviteOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <div className="divide-y">
          {isLoading && <div className="p-4 text-center text-muted-foreground">Loading...</div>}
          {data?.data?.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
                  {member.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={roleBadgeColor(member.role) as any}>{member.role}</Badge>
                <Badge variant={statusBadgeColor(member.status) as any}>{member.status}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMutation.mutate(member.id)}
                  disabled={member.role === 'SUPER_ADMIN'}
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && !data?.data?.length && (
            <div className="p-8 text-center text-muted-foreground">No members found</div>
          )}
        </div>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@example.com"
                type="email"
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="USER">Member</option>
                <option value="TENANT_ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button
              onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
              disabled={!inviteEmail || inviteMutation.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
