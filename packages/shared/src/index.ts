// Minimal shared types needed for template apps to typecheck.

export interface CreateGrantRequestInput {
  requestedRoleId: string;
  reason?: string;
}

export interface ReviewGrantRequestInput {
  decision: 'approve' | 'reject';
  reviewerNotes?: string;
}
