'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Account } from '@/lib/account';
import { cn } from '@/lib/utils';

/** The signed-in user's photo, or the first letter of their name/email. */
export function UserAvatar({ account, className }: { account: Pick<Account, 'name' | 'email' | 'avatarUrl'>; className?: string }) {
  const initial = (account.name || account.email || '?').trim().slice(0, 1).toUpperCase();
  return (
    <Avatar className={cn('size-8', className)}>
      {account.avatarUrl && <AvatarImage src={account.avatarUrl} alt="" className="object-cover" referrerPolicy="no-referrer" />}
      <AvatarFallback className="bg-accent font-semibold text-accent-foreground">{initial}</AvatarFallback>
    </Avatar>
  );
}
