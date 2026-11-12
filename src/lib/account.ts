'use client';

import type { User } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { forgetUserOnDevice } from './store';
import { supabase } from './supabase/client';
import { flush, hasUnsyncedChanges, stopSync } from './sync';

/** Who is signed in (filled by the app shell after the server-checked sign-in). */
export interface Account {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
  role: 'user' | 'admin';
}

let account: Account | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useAccount(): Account | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => account,
    () => null,
  );
}

export function setAccountFromUser(user: User): Account {
  const meta = user.user_metadata ?? {};
  account = {
    id: user.id,
    email: user.email ?? '',
    name: (meta.full_name as string) || (meta.name as string) || null,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || null,
    provider: (user.app_metadata?.provider as string) ?? 'email',
    role: account?.id === user.id ? account.role : 'user',
  };
  emit();
  return account;
}

/** Load the role from the profile (RLS lets a user read only their own) and note "last seen". */
export async function refreshProfile(): Promise<void> {
  if (!account) return;
  const db = supabase();
  const { data } = await db.from('profiles').select('role, full_name').eq('id', account.id).maybeSingle();
  if (data && account) {
    account = { ...account, role: data.role === 'admin' ? 'admin' : 'user', name: account.name ?? data.full_name ?? null };
    emit();
  }
  // Supabase queries are lazy: they only run when awaited.
  await db.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', account.id);
}

/** True when signing out now would lose changes that never reached the server. */
export async function wouldLoseChanges(): Promise<boolean> {
  await flush();
  return hasUnsyncedChanges();
}

/**
 * Sign out: push pending changes, remove this user's copy from the device
 * (shared phones stay private), end the session and go to the login page.
 */
export async function signOut(): Promise<void> {
  const id = account?.id;
  await flush();
  stopSync();
  if (id) forgetUserOnDevice(id);
  await supabase().auth.signOut();
  window.location.assign('/login');
}

/** Permanently delete the account and all its data (database cascade), then sign out. */
export async function deleteAccount(): Promise<string | null> {
  const id = account?.id;
  const { error } = await supabase().rpc('delete_my_account');
  if (error) return error.message;
  stopSync();
  if (id) forgetUserOnDevice(id);
  await supabase().auth.signOut({ scope: 'local' });
  window.location.assign('/login');
  return null;
}
