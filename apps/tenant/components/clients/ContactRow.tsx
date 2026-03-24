'use client';

import { User, Mail } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { LifecycleBadge } from './LifecycleBadge';
import type { Contact } from '@/types/clients';

interface ContactRowProps {
  contact: Contact;
}

export function ContactRow({ contact }: ContactRowProps) {
  return (
    <Link
      href={`/clients/${contact.id}`}
      className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors"
    >
      {/* Avatar */}
      <div className="w-8 shrink-0">
        {contact.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={contact.fullName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Name + Organization */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{contact.fullName}</p>
        {contact.organization && (
          <p className="text-xs text-muted-foreground truncate">{contact.organization.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="w-48 hidden md:flex items-center gap-1 text-sm text-muted-foreground truncate">
        {contact.email && (
          <>
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </>
        )}
      </div>

      {/* Lifecycle Stage */}
      <div className="w-28">
        <LifecycleBadge stage={contact.lifecycleStage} />
      </div>

      {/* Lead Score */}
      <div className="w-16 text-right hidden lg:block">
        <span className="text-sm tabular-nums">{contact.leadScore ?? '-'}</span>
      </div>

      {/* Tags */}
      <div className="w-32 hidden xl:flex gap-1 flex-wrap">
        {contact.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
        {contact.tags.length > 2 && (
          <span className="text-xs text-muted-foreground">+{contact.tags.length - 2}</span>
        )}
      </div>

      {/* Assigned To */}
      <div className="w-24 text-right hidden md:block">
        <span className="text-xs text-muted-foreground">{contact.assignedTo?.name ?? '-'}</span>
      </div>

      {/* Interactions */}
      <div className="w-16 text-right hidden lg:block">
        <span className="text-xs text-muted-foreground">{contact._count?.interactions ?? 0}</span>
      </div>

      {/* Last updated */}
      <div className="w-24 text-right">
        <span className="text-xs text-muted-foreground">
          {format(new Date(contact.updatedAt), 'PP')}
        </span>
      </div>
    </Link>
  );
}
