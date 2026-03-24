'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@kaven/ui-base';
import {
  Plus,
  Search,
  Building2,
  Globe,
  Users,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Organization } from '@/types/clients';

export default function OrganizationsPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newSize, setNewSize] = useState('');

  // Fetch organizations
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations', tenant?.id, deferredSearch],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch) params.search = deferredSearch;

      const res = await api.get('/api/v1/clients/organizations', { params });
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      domain?: string;
      industry?: string;
      size?: string;
    }) => {
      const res = await api.post('/api/v1/clients/organizations', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsCreateOpen(false);
      setNewName('');
      setNewDomain('');
      setNewIndustry('');
      setNewSize('');
      toast.success('Organization created successfully');
    },
    onError: () => {
      toast.error('Failed to create organization');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const data: { name: string; domain?: string; industry?: string; size?: string } = {
      name: newName,
    };
    if (newDomain) data.domain = newDomain;
    if (newIndustry) data.industry = newIndustry;
    if (newSize) data.size = newSize;
    createOrgMutation.mutate(data);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Organizations</h3>
            <p className="text-muted-foreground text-sm">
              Manage companies and organizations in your CRM.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Organization
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Organization list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : organizations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Building2 className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No organizations found</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'Try adjusting your search.'
                : 'Add your first organization to get started.'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Organization
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations?.map((org: Organization) => (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold line-clamp-1">{org.name}</h3>
                      {org.domain && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{org.domain}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {org.industry && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span>{org.industry}</span>
                      </div>
                    )}
                    {org.size && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Size</span>
                        <span>{org.size}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{org._count?.contacts ?? 0} contacts</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(org.createdAt), 'PP')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to your CRM.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Acme Inc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-domain">Domain</Label>
              <Input
                id="org-domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="acme.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="org-industry">Industry</Label>
                <Input
                  id="org-industry"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="Technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-size">Size</Label>
                <select
                  id="org-size"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Select...</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-1000">201-1000</option>
                  <option value="1001+">1001+</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createOrgMutation.isPending}>
                {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
