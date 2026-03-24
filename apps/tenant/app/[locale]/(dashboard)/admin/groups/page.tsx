/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
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
import { Plus, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupsPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-groups', tenant?.id],
    queryFn: () => api.get('/api/v1/admin/groups').then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      api.post('/api/v1/admin/groups', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setIsCreateOpen(false);
      setNewName('');
      setNewDescription('');
      toast.success('Group created');
    },
    onError: () => toast.error('Failed to create group'),
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) => api.delete(`/api/v1/admin/groups/${groupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      toast.success('Group deleted');
    },
    onError: () => toast.error('Failed to delete group'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Organize users into groups for bulk RBAC</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div className="col-span-full text-center text-muted-foreground p-8">Loading...</div>}
        {data?.data?.map((group: any) => (
          <Card key={group.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#6B7280' }} />
                <h3 className="font-medium">{group.name}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(group.id)}>
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {group.memberCount || 0} members
            </div>
            <Badge variant={group.isActive ? 'default' : 'secondary'} className="mt-2">
              {group.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Card>
        ))}
        {!isLoading && !data?.data?.length && (
          <div className="col-span-full text-center text-muted-foreground p-8">No groups yet</div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Engineering" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({ name: newName, description: newDescription || undefined })}
              disabled={!newName || createMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
