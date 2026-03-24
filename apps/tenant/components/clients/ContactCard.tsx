'use client';

import { Card, CardContent, CardHeader } from '@kaven/ui-base';
import { User, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { LifecycleBadge } from './LifecycleBadge';
import type { Contact } from '@/types/clients';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Link href={`/clients/${contact.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-semibold line-clamp-1">{contact.fullName}</h3>
                {contact.organization && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {contact.jobTitle ? `${contact.jobTitle} at ` : ''}
                    {contact.organization.name}
                  </p>
                )}
              </div>
            </div>
            <LifecycleBadge stage={contact.lifecycleStage} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {contact.email && (
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <MessageSquare className="h-3 w-3" />
              <span>{contact._count?.interactions ?? 0}</span>
            </div>
          </div>
          {contact.leadScore != null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(contact.leadScore, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums">{contact.leadScore}</span>
            </div>
          )}
          {contact.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {contact.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {contact.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{contact.tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
