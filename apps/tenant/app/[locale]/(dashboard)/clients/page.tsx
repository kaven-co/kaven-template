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
  LayoutGrid,
  List,
  Users,
  Tag,
  UserCheck,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { ContactCard } from '@/components/clients/ContactCard';
import { ContactRow } from '@/components/clients/ContactRow';
import type { Contact, LifecycleStage } from '@/types/clients';

type ViewMode = 'grid' | 'list';
type StageFilter = 'ALL' | LifecycleStage;

const lifecycleStages: StageFilter[] = [
  'ALL',
  'LEAD',
  'MQL',
  'SQL',
  'OPPORTUNITY',
  'ACTIVE_CLIENT',
  'AT_RISK',
  'CHURNED',
  'ADVOCATE',
];

const stageLabels: Record<StageFilter, string> = {
  ALL: 'All',
  LEAD: 'Lead',
  MQL: 'MQL',
  SQL: 'SQL',
  OPPORTUNITY: 'Opportunity',
  ACTIVE_CLIENT: 'Active',
  AT_RISK: 'At Risk',
  CHURNED: 'Churned',
  ADVOCATE: 'Advocate',
};

export default function ClientsPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Create contact dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newContactType, setNewContactType] = useState<string>('PERSON');

  // Fetch contacts
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', tenant?.id, deferredSearch, stageFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch) params.search = deferredSearch;
      if (stageFilter !== 'ALL') params.lifecycleStage = stageFilter;

      const res = await api.get('/api/v1/clients/contacts', { params });
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: {
      fullName: string;
      email?: string;
      phone?: string;
      contactType: string;
    }) => {
      const res = await api.post('/api/v1/clients/contacts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsCreateOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewContactType('PERSON');
      toast.success('Contact created successfully');
    },
    onError: () => {
      toast.error('Failed to create contact');
    },
  });

  // Bulk actions
  const bulkMutation = useMutation({
    mutationFn: async (payload: { action: string; contactIds: string[]; value?: string }) => {
      const res = await api.post('/api/v1/clients/contacts/bulk', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSelectedIds(new Set());
      toast.success('Bulk action applied');
    },
    onError: () => {
      toast.error('Bulk action failed');
    },
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    const data: { fullName: string; email?: string; phone?: string; contactType: string } = {
      fullName: newFullName,
      contactType: newContactType,
    };
    if (newEmail) data.email = newEmail;
    if (newPhone) data.phone = newPhone;
    createContactMutation.mutate(data);
  };


  const hasSelection = selectedIds.size > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Contacts</h3>
            <p className="text-muted-foreground text-sm">
              Manage your clients, leads, and organizations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Contact
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {lifecycleStages.map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors whitespace-nowrap ${
                  stageFilter === stage
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent'
                }`}
              >
                {stageLabels[stage]}
              </button>
            ))}
          </div>

          <div className="flex items-center border rounded-md ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-accent' : ''}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-accent' : ''}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {hasSelection && (
          <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-md">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({
                  action: 'tag',
                  contactIds: Array.from(selectedIds),
                  value: 'important',
                })
              }
            >
              <Tag className="mr-1.5 h-3.5 w-3.5" /> Tag
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({
                  action: 'assign',
                  contactIds: Array.from(selectedIds),
                })
              }
            >
              <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Assign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({
                  action: 'lifecycle',
                  contactIds: Array.from(selectedIds),
                })
              }
            >
              <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" /> Lifecycle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-muted/50 animate-pulse rounded" />
              ))}
            </div>
          )
        ) : contacts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No contacts found</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'Try adjusting your search or filters.'
                : 'Add your first contact to get started.'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {contacts?.map((contact: Contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        ) : (
          <Card>
            {/* List header */}
            <div className="flex items-center gap-4 px-4 py-2 border-b text-xs font-medium text-muted-foreground">
              <span className="w-8" />
              <span className="flex-1">Name</span>
              <span className="w-48 hidden md:block">Email</span>
              <span className="w-28">Stage</span>
              <span className="w-16 text-right hidden lg:block">Score</span>
              <span className="w-32 hidden xl:block">Tags</span>
              <span className="w-24 text-right hidden md:block">Assigned</span>
              <span className="w-16 text-right hidden lg:block">Activity</span>
              <span className="w-24 text-right">Updated</span>
            </div>
            {contacts?.map((contact: Contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </Card>
        )}
      </div>

      {/* Create Contact Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your CRM.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-type">Type</Label>
              <select
                id="contact-type"
                value={newContactType}
                onChange={(e) => setNewContactType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="PERSON">Person</option>
                <option value="COMPANY">Company</option>
                <option value="PARTNER">Partner</option>
                <option value="VENDOR">Vendor</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Full Name</Label>
              <Input
                id="contact-name"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createContactMutation.isPending}>
                {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
