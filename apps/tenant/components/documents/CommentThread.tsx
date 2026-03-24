'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input } from '@kaven/ui-base';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { DocumentComment } from '@/types/documents';

interface CommentThreadProps {
  documentId: string;
}

export function CommentThread({ documentId }: CommentThreadProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/documents/${documentId}/comments`);
      return res.data?.data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/api/v1/documents/${documentId}/comments`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments', documentId] });
      setNewComment('');
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addMutation.mutate(newComment);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comments
        {comments?.length > 0 && (
          <span className="text-xs text-muted-foreground">({comments.length})</span>
        )}
      </h4>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      ) : comments?.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No comments yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {comments?.map((comment: DocumentComment) => (
            <div key={comment.id} className="p-2.5 rounded-md bg-muted/30 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-xs">
                  {comment.author?.name || 'Unknown'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.createdAt), 'PP')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="text-sm"
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={addMutation.isPending || !newComment.trim()}
          className="shrink-0"
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
