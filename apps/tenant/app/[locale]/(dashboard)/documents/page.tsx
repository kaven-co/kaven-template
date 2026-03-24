'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useSpace } from '@/lib/hooks/use-space';
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
  Upload,
  Search,
  LayoutGrid,
  List,
  FileText,
  FolderPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { FolderTree } from '@/components/documents/FolderTree';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentRow } from '@/components/documents/DocumentRow';
import type { Document } from '@/types/documents';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'NEEDS_REVIEW';

export default function DocumentsPage() {
  const { tenant } = useTenant();
  const { activeSpaceId } = useSpace();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Create document dialog
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');

  // Create folder dialog
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', tenant?.id, activeSpaceId, selectedFolderId, deferredSearch, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeSpaceId) params.spaceId = activeSpaceId;
      if (selectedFolderId) params.folderId = selectedFolderId;
      if (deferredSearch) params.search = deferredSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const endpoint = selectedFolderId
        ? `/api/v1/folders/${selectedFolderId}/documents`
        : '/api/v1/documents';

      const res = await api.get(endpoint, { params });
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  // Create document mutation
  const createDocMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const payload: Record<string, unknown> = {
        ...data,
        isRichText: true,
      };
      if (selectedFolderId) payload.folderId = selectedFolderId;
      if (activeSpaceId) payload.spaceId = activeSpaceId;

      const res = await api.post('/api/v1/documents', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsDocOpen(false);
      setNewDocTitle('');
      setNewDocDesc('');
      toast.success('Document created successfully');
    },
    onError: () => {
      toast.error('Failed to create document');
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const payload: Record<string, unknown> = { ...data };
      if (selectedFolderId) payload.parentId = selectedFolderId;

      const res = await api.post('/api/v1/folders', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setIsFolderOpen(false);
      setNewFolderName('');
      setNewFolderDesc('');
      toast.success('Folder created successfully');
    },
    onError: () => {
      toast.error('Failed to create folder');
    },
  });

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    createDocMutation.mutate({ title: newDocTitle, description: newDocDesc });
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    createFolderMutation.mutate({ name: newFolderName, description: newFolderDesc });
  };

  const statusFilters: StatusFilter[] = ['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED', 'NEEDS_REVIEW'];

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Folder tree sidebar */}
      <FolderTree
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={() => setIsFolderOpen(true)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Documents</h3>
              <p className="text-muted-foreground text-sm">
                Manage your files and documents.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsDocOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Document
              </Button>
              <Button variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:bg-accent'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status === 'NEEDS_REVIEW' ? 'Review' : status.charAt(0) + status.slice(1).toLowerCase()}
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
        </div>

        {/* Document list */}
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
          ) : documents?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first document to get started.'}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setIsDocOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Document
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents?.map((doc: Document) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <Card>
              {/* List header */}
              <div className="flex items-center gap-4 px-4 py-2 border-b text-xs font-medium text-muted-foreground">
                <span className="w-10" />
                <span className="flex-1">Title</span>
                <span className="w-24">Status</span>
                <span className="w-24 text-right hidden md:block">Owner</span>
                <span className="w-20 text-right hidden lg:block">Size</span>
                <span className="w-20 text-right hidden md:block">Stats</span>
                <span className="w-24 text-right">Modified</span>
              </div>
              {documents?.map((doc: Document) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Create Document Dialog */}
      <Dialog open={isDocOpen} onOpenChange={setIsDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Document</DialogTitle>
            <DialogDescription>
              Create a new document{selectedFolderId ? ' in the selected folder' : ''}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDoc} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Title</Label>
              <Input
                id="doc-title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Document title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-desc">Description</Label>
              <Input
                id="doc-desc"
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createDocMutation.isPending}>
                {createDocMutation.isPending ? 'Creating...' : 'Create Document'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={isFolderOpen} onOpenChange={setIsFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create Folder
            </DialogTitle>
            <DialogDescription>
              Create a new folder to organize your documents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-desc">Description</Label>
              <Input
                id="folder-desc"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createFolderMutation.isPending}>
                {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
