'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kaven/ui-base';
import type { KeyResult } from '@/types/governance';

interface CheckInFormProps {
  keyResult: KeyResult;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { keyResultId: string; value: number; confidence: string; notes?: string; blockers?: string }) => void;
  isLoading?: boolean;
}

export function CheckInForm({ keyResult, open, onClose, onSubmit, isLoading }: CheckInFormProps) {
  const [value, setValue] = useState(String(keyResult.currentValue));
  const [confidence, setConfidence] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [blockers, setBlockers] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      keyResultId: keyResult.id,
      value: Number(value),
      confidence,
      notes: notes || undefined,
      blockers: blockers || undefined,
    });
  };

  const confidenceOptions = [
    { value: 'LOW' as const, label: 'Low', color: 'bg-red-500/10 text-red-600 border-red-200' },
    { value: 'MEDIUM' as const, label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { value: 'HIGH' as const, label: 'High', color: 'bg-green-500/10 text-green-600 border-green-200' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in: {keyResult.title}</DialogTitle>
          <DialogDescription>
            Current: {keyResult.currentValue} | Target: {keyResult.targetValue} ({keyResult.unit || '%'})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">New Value</Label>
            <Input
              id="value"
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Confidence</Label>
            <div className="flex gap-2 mt-1">
              {confidenceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    confidence === opt.value ? opt.color : 'bg-muted text-muted-foreground border-transparent'
                  }`}
                  onClick={() => setConfidence(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none"
              placeholder="What progress was made?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="blockers">Blockers</Label>
            <textarea
              id="blockers"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none"
              placeholder="Any blockers or risks?"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Submit Check-in'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
