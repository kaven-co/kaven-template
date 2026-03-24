'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@kaven/ui-base';
import {
  ArrowLeft,
  Download,
  Share2,
  Archive,
  Trash2,
  Eye,
  Clock,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  Save,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge } from '@/components/documents/StatusBadge';
import { FileIcon } from '@/components/documents/FileIcon';
import { VersionHistory } from '@/components/documents/VersionHistory';
import { CommentThread } from '@/components/documents/CommentThread';
import { ShareDialog } from '@/components/documents/ShareDialog';
import type { Document, DocumentActivity } from '@/types/documents';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const documentId = params?.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'versions' | 'activity' | 'comments'>('versions');
  const [shareOpen, setShareOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitleOverride, setEditTitleOverride] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Version dialog
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [versionLog, setVersionLog] = useState('');

  // Fetch document
  const { data: document, isLoading } = useQuery<Document>({
    queryKey: ['document', documentId, tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/documents/${documentId}`);
      return res.data?.data || res.data;
    },
    enabled: !!tenant?.id && !!documentId,
  });

  const editTitle = editTitleOverride ?? document?.title ?? '';
  const setEditTitle = (val: string) => setEditTitleOverride(val);

  // Fetch activity
  const { data: activities } = useQuery({
    queryKey: ['document-activity', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/documents/${documentId}/activity`);
      return res.data?.data || [];
    },
    enabled: sidebarTab === 'activity',
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Document>) => {
      const res = await api.patch(`/api/v1/documents/${documentId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document updated');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update document');
    },
  });

  // Create version mutation
  const versionMutation = useMutation({
    mutationFn: async (data: { label?: string; changeLog?: string; richContent?: string }) => {
      const res = await api.post(`/api/v1/documents/${documentId}/version`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      setVersionOpen(false);
      setVersionLabel('');
      setVersionLog('');
      toast.success('Version created');
    },
    onError: () => {
      toast.error('Failed to create version');
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/api/v1/documents/${documentId}`, { status: 'ARCHIVED' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document archived');
    },
    onError: () => {
      toast.error('Failed to archive document');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/v1/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
      router.push('../');
    },
    onError: () => {
      toast.error('Failed to delete document');
    },
  });

  const handleSave = () => {
    const updates: Partial<Document> = {};
    if (editTitle !== document?.title) updates.title = editTitle;
    updateMutation.mutate(updates);
  };

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    versionMutation.mutate({
      label: versionLabel || undefined,
      changeLog: versionLog || undefined,
      richContent: editContent || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 bg-muted/50 animate-pulse rounded" />
        <div className="h-12 w-full bg-muted/50 animate-pulse rounded" />
        <div className="h-96 w-full bg-muted/50 animate-pulse rounded" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <FileText className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Document not found</p>
        <Link href="/documents">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  const sidebarTabs = [
    { key: 'versions' as const, label: 'Versions' },
    { key: 'activity' as const, label: 'Activity' },
    { key: 'comments' as const, label: 'Comments' },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb + header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/documents" className="hover:text-foreground transition-colors">
              Documents
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{document.title}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <FileIcon
                  mimeType={document.mimeType}
                  isRichText={document.isRichText}
                  className="h-6 w-6"
                />
              </div>
              <div>
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold h-auto py-0.5"
                  />
                ) : (
                  <h2
                    className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => {
                      setEditTitle(document.title);
                      setIsEditing(true);
                    }}
                  >
                    {document.title}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={document.status} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {document.viewCount} views
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(document.updatedAt), 'PPp')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <>
                  <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(document.title);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setVersionOpen(true)}>
                Save Version
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
              </Button>
              {document.fileKey && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/v1/documents/${documentId}/download`} download>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => archiveMutation.mutate()}
                disabled={document.status === 'ARCHIVED'}
              >
                <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this document?')) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {document.description && (
            <p className="text-sm text-muted-foreground mb-4">{document.description}</p>
          )}

          {document.tags?.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {document.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {document.isRichText ? (
            <Card>
              <CardContent className="p-4">
                <textarea
                  className="w-full min-h-[400px] bg-transparent border-none outline-none resize-y text-sm font-mono"
                  placeholder="Start writing your document content..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </CardContent>
            </Card>
          ) : document.mimeType?.startsWith('image/') ? (
            <div className="flex justify-center">
              <Image
                src={`/api/v1/documents/${documentId}/download`}
                alt={document.title}
                width={800}
                height={600}
                className="max-w-full max-h-[600px] rounded-lg border object-contain"
                unoptimized
              />
            </div>
          ) : document.mimeType === 'application/pdf' ? (
            <iframe
              src={`/api/v1/documents/${documentId}/download`}
              className="w-full h-[600px] rounded-lg border"
              title={document.title}
            />
          ) : document.fileKey ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileIcon mimeType={document.mimeType} className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">{document.fileName || 'File attachment'}</p>
              <p className="text-sm mt-1">
                {document.mimeType || 'Unknown type'}
                {document.fileSize ? ` — ${(document.fileSize / 1024).toFixed(1)} KB` : ''}
              </p>
              <Button className="mt-4" asChild>
                <a href={`/api/v1/documents/${documentId}/download`} download>
                  <Download className="mr-2 h-4 w-4" /> Download File
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>No content available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      {sidebarOpen && (
        <div className="w-[320px] border-l shrink-0 flex flex-col overflow-hidden">
          {/* Sidebar tabs */}
          <div className="flex border-b">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSidebarTab(tab.key)}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === tab.key
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'versions' && (
              <VersionHistory documentId={documentId} />
            )}

            {sidebarTab === 'activity' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Activity Log</h4>
                {activities?.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No activity yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activities?.map((activity: DocumentActivity) => (
                      <div key={activity.id} className="flex items-start gap-2 text-sm py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs">
                            <span className="font-medium">{activity.actor?.name || 'System'}</span>
                            {' '}
                            {activity.action.toLowerCase().replace(/_/g, ' ')}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.createdAt), 'PPp')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sidebarTab === 'comments' && (
              <CommentThread documentId={documentId} />
            )}
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        documentId={documentId}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      {/* Version Dialog */}
      <Dialog open={versionOpen} onOpenChange={setVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Version</DialogTitle>
            <DialogDescription>
              Create a new version snapshot of this document.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVersion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version-label">Label (optional)</Label>
              <Input
                id="version-label"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder="e.g., v2.0, Final Draft"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version-log">Change Log</Label>
              <Input
                id="version-log"
                value={versionLog}
                onChange={(e) => setVersionLog(e.target.value)}
                placeholder="What changed in this version?"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={versionMutation.isPending}>
                {versionMutation.isPending ? 'Saving...' : 'Save Version'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
