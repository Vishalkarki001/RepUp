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
  const { data } = await db.from('profiles').select('role, full_name, avatar_url').eq('id', account.id).maybeSingle();
  if (data && account) {
    // The profile row is the source of truth for name + photo (edited in the app).
    account = {
      ...account,
      role: data.role === 'admin' ? 'admin' : 'user',
      name: data.full_name ?? account.name,
      avatarUrl: data.avatar_url ?? account.avatarUrl,
    };
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
  // Profile photos live in Storage, outside the database cascade: remove them first.
  if (id) {
    try {
      const storage = supabase().storage.from(AVATAR_BUCKET);
      const { data } = await storage.list(id);
      if (data?.length) await storage.remove(data.map((f) => `${id}/${f.name}`));
    } catch {
      /* keep going: the account itself must still be deleted */
    }
  }
  const { error } = await supabase().rpc('delete_my_account');
  if (error) return error.message;
  stopSync();
  if (id) forgetUserOnDevice(id);
  await supabase().auth.signOut({ scope: 'local' });
  window.location.assign('/login');
  return null;
}

/* ------------------------------------------------------------------ */
/* profile: name, photo, password                                       */
/* ------------------------------------------------------------------ */

const AVATAR_BUCKET = 'avatars';
const AVATAR_SIZE = 256;

/** Crop to a centred square and shrink to 256×256 so uploads are tiny (a few KB). */
async function squareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser can’t process images.');
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  bitmap.close();
  const toBlob = (type: string) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.85));
  // WebP where supported (smaller), JPEG otherwise (older Safari can't encode WebP).
  const webp = await toBlob('image/webp');
  const blob = webp && webp.type === 'image/webp' ? webp : await toBlob('image/jpeg');
  if (!blob) throw new Error('Couldn’t read that image.');
  return blob;
}

/** Delete every file in the user's avatar folder except `keep`. */
async function cleanAvatarFolder(uid: string, keep?: string) {
  const storage = supabase().storage.from(AVATAR_BUCKET);
  const { data } = await storage.list(uid);
  const old = (data ?? []).map((f) => `${uid}/${f.name}`).filter((p) => p !== keep);
  if (old.length) await storage.remove(old);
}

/**
 * Save the profile. `photo`: a File to upload, null to remove the photo, undefined to keep it.
 * Returns an error message, or null when saved.
 */
export async function updateProfile(name: string, photo: File | null | undefined): Promise<string | null> {
  if (!account) return 'Not signed in.';
  const uid = account.id;
  const db = supabase();
  let avatarUrl = account.avatarUrl;

  try {
    if (photo) {
      if (!photo.type.startsWith('image/')) return 'Please choose an image file.';
      if (photo.size > 15 * 1024 * 1024) return 'That image is too big (max 15 MB).';
      const blob = await squareImage(photo);
      const path = `${uid}/avatar-${Date.now()}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
      const { error } = await db.storage.from(AVATAR_BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
      if (error) return error.message;
      avatarUrl = db.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
      await cleanAvatarFolder(uid, path);
    } else if (photo === null) {
      await cleanAvatarFolder(uid);
      avatarUrl = null;
    }
  } catch (err) {
    return err instanceof Error ? err.message : 'Couldn’t upload the photo.';
  }

  const fullName = name.trim().slice(0, 60) || null;
  const { error } = await db.from('profiles').update({ full_name: fullName, avatar_url: avatarUrl }).eq('id', uid);
  if (error) return error.message;
  // Keep the login metadata in step (so the name/photo is right before the profile loads).
  await db.auth.updateUser({ data: { full_name: fullName, avatar_url: avatarUrl } });
  account = { ...account, name: fullName, avatarUrl };
  emit();
  return null;
}

/**
 * Change password. For safety the current password is checked first, so someone
 * holding an unlocked phone can't lock the owner out.
 */
export async function changePassword(current: string, next: string): Promise<string | null> {
  if (!account) return 'Not signed in.';
  const db = supabase();
  const check = await db.auth.signInWithPassword({ email: account.email, password: current });
  if (check.error) return 'Your current password is wrong.';
  const { error } = await db.auth.updateUser({ password: next });
  if (error) return error.message;
  return null;
}
