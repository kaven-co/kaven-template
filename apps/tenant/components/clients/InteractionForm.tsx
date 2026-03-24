'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { toast } from 'sonner';

const interactionTypes = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'MESSAGE', 'TASK'] as const;
const channels = ['PHONE', 'EMAIL', 'IN_PERSON', 'VIDEO', 'CHAT', 'SOCIAL'] as const;
const directions = ['INBOUND', 'OUTBOUND'] as const;

interface InteractionFormProps {
  contactId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InteractionForm({ contactId, open, onOpenChange }: InteractionFormProps) {
  const queryClient = useQueryClient();

  const [type, setType] = useState<string>('NOTE');
  const [channel, setChannel] = useState<string>('EMAIL');
  const [direction, setDirection] = useState<string>('OUTBOUND');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const resetForm = () => {
    setType('NOTE');
    setChannel('EMAIL');
    setDirection('OUTBOUND');
    setSubject('');
    setBody('');
  };

  const createMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      channel: string;
      direction: string;
      subject: string;
      body: string;
    }) => {
      const res = await api.post(`/api/v1/clients/contacts/${contactId}/interactions`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', contactId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', contactId] });
      onOpenChange(false);
      resetForm();
      toast.success('Interaction logged successfully');
    },
    onError: () => {
      toast.error('Failed to log interaction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ type, channel, direction, subject, body });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
          <DialogDescription>
            Record a new interaction with this contact.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="interaction-type">Type</Label>
              <select
                id="interaction-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {interactionTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interaction-channel">Channel</Label>
              <select
                id="interaction-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {channels.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interaction-direction">Direction</Label>
              <select
                id="interaction-direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {directions.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interaction-subject">Subject</Label>
            <Input
              id="interaction-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief subject or title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interaction-body">Notes</Label>
            <textarea
              id="interaction-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Interaction details..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Log Interaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
