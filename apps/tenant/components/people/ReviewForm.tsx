'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kaven/ui-base';
import type { PerformanceReview, PerformanceScore } from '@/types/people';

const scoreLabels: Record<PerformanceScore, string> = {
  BELOW_EXPECTATIONS: '1 - Below Expectations',
  NEEDS_IMPROVEMENT: '2 - Needs Improvement',
  MEETS_EXPECTATIONS: '3 - Meets Expectations',
  EXCEEDS_EXPECTATIONS: '4 - Exceeds Expectations',
  OUTSTANDING: '5 - Outstanding',
};

interface ReviewFormProps {
  review?: PerformanceReview;
  mode: 'self' | 'manager';
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export function ReviewForm({ review, mode, onSubmit, isLoading }: ReviewFormProps) {
  const [score, setScore] = useState<PerformanceScore | ''>(
    mode === 'self' ? (review?.selfScore || '') : (review?.managerScore || ''),
  );
  const [comments, setComments] = useState(
    mode === 'self' ? (review?.selfComments || '') : (review?.managerComments || ''),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = mode === 'self'
      ? { selfScore: score, selfComments: comments }
      : { managerScore: score, managerComments: comments };
    onSubmit(data);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">
            {mode === 'self' ? 'Self Review' : 'Manager Review'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {review?.reviewee?.fullName} - {review?.reviewee?.jobTitle}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Performance Score</Label>
          <Select
            value={score}
            onValueChange={(v) => setScore(v as PerformanceScore)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select score" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scoreLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Comments</Label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide detailed feedback..."
            rows={6}
          />
        </div>

        <Button type="submit" disabled={isLoading || !score}>
          {isLoading ? 'Saving...' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  );
}
