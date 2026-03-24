'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@kaven/ui-base';
import { Copy, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentShare } from '@/types/documents';

interface ShareDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ documentId, open, onOpenChange }: ShareDialogProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'COMMENT' | 'EDIT'>('VIEW');

  const { data: shares } = useQuery({
    queryKey: ['document-shares', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/documents/${documentId}/shares`);
      return res.data?.data || [];
    },
    enabled: open,
  });

  const shareMutation = useMutation({
    mutationFn: async (data: { email: string; permission: string }) => {
      const res = await api.post(`/api/v1/documents/${documentId}/shares`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares', documentId] });
      setEmail('');
      toast.success('Document shared successfully');
    },
    onError: () => {
      toast.error('Failed to share document');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (shareId: string) => {
      await api.delete(`/api/v1/documents/${documentId}/shares/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares', documentId] });
      toast.success('Share removed');
    },
    onError: () => {
      toast.error('Failed to remove share');
    },
  });

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    shareMutation.mutate({ email, permission });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/documents/${documentId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share Document
          </DialogTitle>
          <DialogDescription>
            Share this document with others by email or link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="share-email" className="sr-only">Email</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'VIEW' | 'COMMENT' | 'EDIT')}
              className="h-9 px-3 py-1.5 text-sm border border-input rounded-md bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Permission level"
            >
              <option value="VIEW">View</option>
              <option value="COMMENT">Comment</option>
              <option value="EDIT">Edit</option>
            </select>
            <Button type="submit" size="sm" disabled={shareMutation.isPending}>
              Share
            </Button>
          </div>
        </form>

        {shares && shares.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <Label className="text-xs text-muted-foreground">Shared with</Label>
            {shares.map((share: DocumentShare) => (
              <div key={share.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/50">
                <div className="text-sm">
                  <span className="font-medium">
                    {share.user?.email || share.email || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {share.permission.toLowerCase()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMutation.mutate(share.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
