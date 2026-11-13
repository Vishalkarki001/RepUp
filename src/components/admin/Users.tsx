'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Dumbbell, Footprints, KeyRound, Loader2, RefreshCw, Search, ShieldCheck, ShieldOff, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAccount } from '@/lib/account';
import { cn } from '@/lib/utils';
import { confirmDialog } from '../Confirm';
import { UserAvatar } from '../UserAvatar';
import { adminApi, ago, displayName, shortDate, type AdminUser } from './api';

type Filter = 'all' | 'admins' | 'blocked' | 'new';
const WEEK = 7 * 86_400_000;

/** Everyone who has an account: search, filter, open a person to manage them. */
export function AdminUsers({
  onOpenWorkouts,
  onOpenRuns,
}: {
  onOpenWorkouts: (u: { id: string; label: string }) => void;
  onOpenRuns: (u: { id: string; label: string }) => void;
}) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.users();
    setLoading(false);
    setError(res.error);
    if (res.data) setUsers(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const list = users ?? [];
    const now = Date.now();
    return {
      all: list.length,
      admins: list.filter((u) => u.role === 'admin').length,
      blocked: list.filter((u) => u.blocked).length,
      new: list.filter((u) => now - Date.parse(u.created_at) < WEEK).length,
    };
  }, [users]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return (users ?? []).filter((u) => {
      if (filter === 'admins' && u.role !== 'admin') return false;
      if (filter === 'blocked' && !u.blocked) return false;
      if (filter === 'new' && now - Date.parse(u.created_at) >= WEEK) return false;
      return !q || (u.email ?? '').toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q);
    });
  }, [users, query, filter]);

  const open = users?.find((u) => u.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-9 sm:max-w-xs">
          <InputGroupInput placeholder="Search name or email" aria-label="Search users" value={query} onChange={(e) => setQuery(e.target.value)} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={filter}
          onValueChange={(v) => v && setFilter(v as Filter)}
          className="flex-wrap"
          aria-label="Filter users"
        >
          <ToggleGroupItem value="all">All {users ? counts.all : ''}</ToggleGroupItem>
          <ToggleGroupItem value="new">New {users ? counts.new : ''}</ToggleGroupItem>
          <ToggleGroupItem value="admins">Admins {users ? counts.admins : ''}</ToggleGroupItem>
          <ToggleGroupItem value="blocked">Blocked {users ? counts.blocked : ''}</ToggleGroupItem>
        </ToggleGroup>
        <Button variant="outline" size="sm" className="sm:ml-auto" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Card className="gap-0 overflow-hidden py-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">User</TableHead>
              <TableHead className="hidden w-36 md:table-cell">Joined</TableHead>
              <TableHead className="hidden w-32 sm:table-cell">Last active</TableHead>
              <TableHead className="w-24 pr-4 text-right">Workouts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users === null
              ? [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="px-4">
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : shown.map((u) => (
                  <TableRow key={u.id} className="cursor-pointer" onClick={() => setOpenId(u.id)} data-state={openId === u.id ? 'selected' : undefined}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar account={{ name: u.full_name ?? '', email: u.email ?? '', avatarUrl: u.avatar_url }} className="size-8" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-medium">
                            <span className="truncate">{displayName(u)}</span>
                            {u.role === 'admin' && <Badge variant="destructive">Admin</Badge>}
                            {u.blocked && <Badge variant="outline">Blocked</Badge>}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{shortDate(u.created_at)}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{ago(u.last_seen_at ?? u.last_sign_in_at)}</TableCell>
                    <TableCell className="pr-4 text-right font-semibold tabular">{u.workouts}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {users && shown.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No users match.</p>}
      </Card>

      <UserSheet
        user={open}
        onClose={() => setOpenId(null)}
        onChanged={load}
        onOpenWorkouts={(u) => {
          setOpenId(null);
          onOpenWorkouts(u);
        }}
        onOpenRuns={(u) => {
          setOpenId(null);
          onOpenRuns(u);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function UserSheet({
  user,
  onClose,
  onChanged,
  onOpenWorkouts,
  onOpenRuns,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onChanged: () => Promise<void> | void;
  onOpenWorkouts: (u: { id: string; label: string }) => void;
  onOpenRuns: (u: { id: string; label: string }) => void;
}) {
  const me = useAccount();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState<null | string>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setName(user?.full_name ?? ''), [user?.id, user?.full_name]);

  if (!user) return <Sheet open={false} />;
  const isMe = me?.id === user.id;
  const label = displayName(user);

  const run = async (key: string, fn: () => Promise<{ error: string | null }>, done: string) => {
    setBusy(key);
    const { error } = await fn();
    setBusy(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(done);
    await onChanged();
  };

  const toggleAdmin = async () => {
    const makeAdmin = user.role !== 'admin';
    const ok = await confirmDialog({
      title: makeAdmin ? `Make ${label} an admin?` : `Remove admin from ${label}?`,
      message: makeAdmin
        ? 'They will see the admin panel and be able to manage every user, including making or removing admins.'
        : isMe
          ? 'You will lose access to the admin panel.'
          : 'They will become a normal user again.',
      confirmLabel: makeAdmin ? 'Make admin' : 'Remove admin',
      danger: !makeAdmin,
    });
    if (!ok) return;
    await run('role', () => adminApi.setRole(user.id, makeAdmin ? 'admin' : 'user'), makeAdmin ? `${label} is now an admin` : `${label} is no longer an admin`);
    if (!makeAdmin && isMe) window.location.assign('/');
  };

  const toggleBlock = async () => {
    const block = !user.blocked;
    const ok = await confirmDialog({
      title: block ? `Block ${label}?` : `Unblock ${label}?`,
      message: block
        ? 'They will be signed out and won’t be able to log in until you unblock them. Their data stays.'
        : 'They will be able to log in again.',
      confirmLabel: block ? 'Block' : 'Unblock',
      danger: block,
    });
    if (!ok) return;
    await run('block', () => adminApi.setBlocked(user.id, block), block ? `${label} is blocked` : `${label} is unblocked`);
  };

  const sendReset = async () => {
    const ok = await confirmDialog({
      title: 'Send a password reset email?',
      message: `We’ll email ${user.email} a link to choose a new password.`,
      confirmLabel: 'Send email',
    });
    if (!ok) return;
    await run('reset', () => adminApi.sendPasswordReset(user), 'Password reset email sent');
  };

  return (
    <>
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b">
            <div className="flex items-center gap-3 pr-8">
              <UserAvatar account={{ name: user.full_name ?? '', email: user.email ?? '', avatarUrl: user.avatar_url }} className="size-12" />
              <div className="min-w-0">
                <SheetTitle className="truncate">{label}</SheetTitle>
                <SheetDescription className="truncate">{user.email}</SheetDescription>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role === 'admin' ? 'Admin' : 'User'}</Badge>
                  {user.blocked && <Badge variant="outline">Blocked</Badge>}
                  {isMe && <Badge variant="outline">You</Badge>}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-5 p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Fact label="Login">{user.provider === 'google' ? 'Google' : 'Email & password'}</Fact>
              <Fact label="Email confirmed">{user.email_confirmed ? 'Yes' : 'Not yet'}</Fact>
              <Fact label="Joined">{shortDate(user.created_at)}</Fact>
              <Fact label="Last active">{ago(user.last_seen_at ?? user.last_sign_in_at)}</Fact>
              <Fact label="Workouts">{user.workouts}</Fact>
              <Fact label="Last workout">{user.last_workout_at ? ago(user.last_workout_at) : '—'}</Fact>
              <Fact label="Runs & walks">{user.runs}</Fact>
              <Fact label="Last run">{user.last_run_at ? ago(user.last_run_at) : '—'}</Fact>
            </dl>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onOpenWorkouts({ id: user.id, label })} disabled={!user.workouts}>
                <Dumbbell /> {user.workouts ? `${user.workouts} workout${user.workouts === 1 ? '' : 's'}` : 'No workouts'}
              </Button>
              <Button variant="outline" onClick={() => onOpenRuns({ id: user.id, label })} disabled={!user.runs}>
                <Footprints /> {user.runs ? `${user.runs} run${user.runs === 1 ? '' : 's'}` : 'No runs'}
              </Button>
            </div>

            <Separator />

            <Field>
              <FieldLabel htmlFor="admin-name">Name</FieldLabel>
              <div className="flex gap-2">
                <Input id="admin-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="No name" />
                <Button
                  variant="secondary"
                  disabled={busy !== null || name.trim() === (user.full_name ?? '')}
                  onClick={() => void run('name', () => adminApi.setName(user.id, name), 'Name saved')}
                >
                  {busy === 'name' && <Loader2 className="animate-spin" />} Save
                </Button>
              </div>
            </Field>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Access</p>
              <Button variant="outline" className="justify-start" disabled={busy !== null || (user.blocked && user.role !== 'admin')} onClick={toggleAdmin}>
                {busy === 'role' ? <Loader2 className="animate-spin" /> : user.role === 'admin' ? <ShieldOff /> : <ShieldCheck />}
                {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
              </Button>
              <Button variant="outline" className="justify-start" disabled={busy !== null || isMe || user.role === 'admin'} onClick={toggleBlock}>
                {busy === 'block' ? <Loader2 className="animate-spin" /> : user.blocked ? <UserCheck /> : <Ban />}
                {user.blocked ? 'Unblock' : 'Block'}
              </Button>
              <Button variant="outline" className="justify-start" disabled={busy !== null || !user.email} onClick={sendReset}>
                {busy === 'reset' ? <Loader2 className="animate-spin" /> : <KeyRound />} Send password reset email
              </Button>
              {user.role === 'admin' && !isMe && <FieldDescription>Admins can’t be blocked or deleted. Remove admin first.</FieldDescription>}
              {user.blocked && user.role !== 'admin' && <FieldDescription>Unblock before making them an admin.</FieldDescription>}
            </div>

            <Separator />

            <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 p-3">
              <p className="text-sm font-medium text-destructive">Danger zone</p>
              <p className="text-xs text-muted-foreground">Deleting removes the account, every workout, plan and photo. It can’t be undone.</p>
              <Button variant="destructive" disabled={busy !== null || isMe || user.role === 'admin'} onClick={() => setDeleting(true)}>
                <Trash2 /> Delete user
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {deleting && (
        <DeleteUserDialog
          user={user}
          onClose={() => setDeleting(false)}
          onDeleted={async () => {
            setDeleting(false);
            onClose();
            await onChanged();
          }}
        />
      )}
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children}</dd>
    </div>
  );
}

/**
 * Second confirmation for deleting: type the person's email exactly.
 * (The database checks the typed email again, so a mistake can't slip through.)
 */
function DeleteUserDialog({ user, onClose, onDeleted }: { user: AdminUser; onClose: () => void; onDeleted: () => void }) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const email = user.email ?? '';
  const matches = typed.trim().toLowerCase() === email.toLowerCase() && email !== '';

  const remove = async () => {
    setBusy(true);
    const { error } = await adminApi.deleteUser(user.id, typed);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`${displayName(user)}’s account was deleted`);
    onDeleted();
  };

  return (
    <AlertDialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">Delete {displayName(user)} permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            Their account, {user.workouts} workout{user.workouts === 1 ? '' : 's'}, plans and photo will be deleted forever. They will be signed out.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="confirm-email">
            <span className="min-w-0">
              Type <span className="font-mono font-semibold break-all">{email}</span> to confirm
            </span>
          </FieldLabel>
          <Input
            id="confirm-email"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={email}
            onPaste={(e) => e.preventDefault()}
          />
          <FieldDescription>Pasting is turned off so this is always typed on purpose.</FieldDescription>
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={!matches || busy} onClick={remove}>
            {busy ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete forever
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
