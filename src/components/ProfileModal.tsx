'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Camera, Eye, EyeOff, KeyRound, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { changePassword, updateProfile, useAccount } from '@/lib/account';
import { Modal } from './Modal';

const MIN_PASSWORD = 8;

/** Edit name + profile photo, and change password. */
export function ProfileModal({ onClose }: { onClose: () => void }) {
  const account = useAccount();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(account?.name ?? '');
  // undefined = keep current photo, null = remove it, File = upload this one
  const [photo, setPhoto] = useState<File | null | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(account?.avatarUrl ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!(photo instanceof File)) return;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  if (!account) return null;
  const changed = name.trim() !== (account.name ?? '') || photo !== undefined;

  const save = async () => {
    setSaving(true);
    const err = await updateProfile(name, photo);
    setSaving(false);
    if (err) return toast.error(err);
    toast.success('Profile saved');
    setPhoto(undefined);
  };

  return (
    <Modal
      title="Your profile"
      onClose={onClose}
      footer={
        <Button className="h-11 w-full" onClick={save} disabled={!changed || saving}>
          {saving && <Loader2 className="animate-spin" />} Save profile
        </Button>
      }
    >
      <div className="flex items-center gap-4">
        {preview ? (
          <img src={preview} alt="Profile photo" className="size-20 shrink-0 rounded-full border object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-accent text-2xl font-semibold text-accent-foreground uppercase">
            {(name || account.email).slice(0, 1)}
          </span>
        )}
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={() => fileRef.current?.click()}>
            <Camera /> {preview ? 'Change photo' : 'Upload photo'}
          </Button>
          {preview && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-destructive hover:text-destructive"
              onClick={() => {
                setPhoto(null);
                setPreview(null);
              }}
            >
              <Trash2 /> Remove photo
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPhoto(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <Field>
        <FieldLabel htmlFor="profile-name">Name</FieldLabel>
        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" className="h-10" />
        <FieldDescription>
          Email: <span className="text-foreground">{account.email}</span>
        </FieldDescription>
      </Field>

      <Separator />

      {account.provider === 'email' ? (
        <PasswordSection />
      ) : (
        <FieldSet className="gap-1">
          <FieldLegend variant="label">Password</FieldLegend>
          <FieldDescription>You sign in with Google, so your password is managed by your Google account.</FieldDescription>
        </FieldSet>
      )}
    </Modal>
  );
}

function PasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!current) return setError('Enter your current password.');
    if (next.length < MIN_PASSWORD) return setError(`New password must be at least ${MIN_PASSWORD} characters.`);
    if (next !== confirm) return setError('The two new passwords don’t match.');
    if (next === current) return setError('The new password must be different.');
    setBusy(true);
    const err = await changePassword(current, next);
    setBusy(false);
    if (err) return setError(err);
    setCurrent('');
    setNext('');
    setConfirm('');
    toast.success('Password changed');
  };

  const pw = (id: string, label: string, value: string, set: (v: string) => void, auto: string) => (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className="h-10">
        <InputGroupInput id={id} type={show ? 'text' : 'password'} autoComplete={auto} value={value} onChange={(e) => set(e.target.value)} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={show ? 'Hide passwords' : 'Show passwords'} onClick={() => setShow((v) => !v)}>
            {show ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate>
      <FieldSet>
        <FieldLegend variant="label" className="flex items-center gap-2">
          <KeyRound className="size-4" /> Change password
        </FieldLegend>
        <FieldGroup className="gap-3">
          {pw('current-password', 'Current password', current, setCurrent, 'current-password')}
          {pw('new-password', 'New password', next, setNext, 'new-password')}
          {pw('confirm-new-password', 'New password again', confirm, setConfirm, 'new-password')}
          <FieldDescription>At least {MIN_PASSWORD} characters.</FieldDescription>
          {error && <FieldError className="rounded-md bg-destructive/10 px-3 py-2">{error}</FieldError>}
          <Button type="submit" variant="outline" className="h-10" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Change password
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
