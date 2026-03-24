'use client';

import Image from 'next/image';

interface MemberAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export function MemberAvatar({ name, avatar, size = 'md', className = '' }: MemberAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatar) {
    const dimension = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
    return (
      <Image
        src={avatar}
        alt={name}
        title={name}
        width={dimension}
        height={dimension}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      title={name}
      className={`rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
