'use client';

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { supabase } from '@/lib/supabase/client';
import { friendlyAuthError } from './errors';

const MIN_PASSWORD = 8;

/** Reached from the reset-password email (the link signs the user in first). */
export function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError('The two passwords don’t match.');
    setBusy(true);
    const { error: err } = await supabase().auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(friendlyAuthError(err));
    toast.success('Password changed. You’re logged in.');
    window.location.assign('/');
  };

  const field = (id: string, label: string, value: string, set: (v: string) => void) => (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className="h-10">
        <InputGroupInput id={id} type={show ? 'text' : 'password'} autoComplete="new-password" value={value} onChange={(e) => set(e.target.value)} required />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((v) => !v)}>
            {show ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <KeyRound className="size-6" />
          </div>
          <CardTitle className="text-lg">Set a new password</CardTitle>
          <CardDescription>Choose a password you haven’t used here before.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate>
            <FieldGroup className="gap-4">
              {field('new-password', 'New password', password, setPassword)}
              {field('confirm-password', 'Type it again', confirm, setConfirm)}
              <FieldDescription>At least {MIN_PASSWORD} characters.</FieldDescription>
              {error && <FieldError className="rounded-md bg-destructive/10 px-3 py-2">{error}</FieldError>}
              <Button type="submit" className="h-10 w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} Save new password
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
