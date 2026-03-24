'use client';

import { Mail, MessageSquare, Smartphone, Bell } from 'lucide-react';

import type { ElementType } from 'react';

const channelConfig: Record<string, { label: string; icon: ElementType; color: string }> = {
  EMAIL: { label: 'Email', icon: Mail, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  SMS: { label: 'SMS', icon: Smartphone, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  WHATSAPP: { label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  PUSH: { label: 'Push', icon: Bell, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

interface ChannelBadgeProps {
  channel: string;
}

export function ChannelBadge({ channel }: ChannelBadgeProps) {
  const config = channelConfig[channel] || {
    label: channel,
    icon: Mail,
    color: 'text-muted-foreground bg-muted border-border',
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
