'use client';

import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { safeNext, SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';
import { friendlyAuthError } from './errors';

type Mode = 'login' | 'signup' | 'forgot' | 'check-email' | 'reset-sent';

const MIN_PASSWORD = 8;

/**
 * Is "Continue with Google" switched on in Supabase? Asked before redirecting,
 * because a disabled provider shows a raw JSON error page instead of the app.
 * (Public endpoint: it only lists which login methods are enabled.)
 */
async function googleEnabled(): Promise<boolean | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } });
    if (!res.ok) return null;
    const data = (await res.json()) as { external?: Record<string, boolean> };
    return Boolean(data.external?.google);
  } catch {
    return null; // offline / unknown: let the normal flow report the error
  }
}

/** Email + password login, sign up, forgot password and Google — all on one card. */
export function LoginScreen({ next, initialError }: { next?: string; initialError?: string }) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<null | 'email' | 'google' | 'resend'>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const callback = (to: string) => `${origin}/auth/callback?next=${encodeURIComponent(to)}`;
  const after = safeNext(next);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const mail = email.trim().toLowerCase();
    if (!mail) return setError('Enter your email.');

    if (mode === 'forgot') {
      setBusy('email');
      const { error: err } = await supabase().auth.resetPasswordForEmail(mail, { redirectTo: callback('/reset-password') });
      setBusy(null);
      // Supabase answers the same way whether or not the email has an account, and so do we:
      // nobody can use this form to find out who uses RepUp. (Errors here are rate limits / network.)
      if (err) return setError(friendlyAuthError(err));
      return setMode('reset-sent');
    }

    if (password.length < (mode === 'signup' ? MIN_PASSWORD : 1)) {
      return setError(mode === 'signup' ? `Password must be at least ${MIN_PASSWORD} characters.` : 'Enter your password.');
    }

    setBusy('email');
    if (mode === 'login') {
      const { error: err } = await supabase().auth.signInWithPassword({ email: mail, password });
      if (err) {
        setBusy(null);
        return setError(friendlyAuthError(err));
      }
      // Full page load so the server-side check sees the new session cookie.
      window.location.assign(after);
      return;
    }

    const { data, error: err } = await supabase().auth.signUp({
      email: mail,
      password,
      options: { emailRedirectTo: callback('/'), data: name.trim() ? { full_name: name.trim() } : undefined },
    });
    setBusy(null);
    if (err) return setError(friendlyAuthError(err));
    if (data.session) {
      window.location.assign('/');
      return;
    }
    setPassword('');
    setMode('check-email');
  };

  const google = async () => {
    setError(null);
    setBusy('google');
    if ((await googleEnabled()) === false) {
      setBusy(null);
      setError('Google login isn’t switched on yet. Please use email and password for now.');
      return;
    }
    const { error: err } = await supabase().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback(after) } });
    if (err) {
      setBusy(null);
      setError(friendlyAuthError(err));
    }
  };

  const resend = async () => {
    setBusy('resend');
    const { error: err } = await supabase().auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: callback('/') } });
    setBusy(null);
    if (err) toast.error(friendlyAuthError(err));
    else toast.success('Confirmation email sent again');
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-10">
      <div className="flex items-center gap-2.5">
        <img src="/icon-192.png?v=2" alt="" className="size-10" />
        <span className="wordmark text-2xl">
          Rep<b>Up</b>
        </span>
      </div>

      <Card className="w-full max-w-sm">
        {mode === 'check-email' || mode === 'reset-sent' ? (
          <>
            <CardHeader className="items-center text-center">
              <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
                <Mail className="size-6" />
              </div>
              <CardTitle className="text-lg">Check your email</CardTitle>
              <CardDescription>
                {mode === 'check-email' ? (
                  <>
                    We sent a confirmation link to <b className="text-foreground">{email.trim()}</b>. Open it to activate your account.
                  </>
                ) : (
                  <>
                    If an account exists for <b className="text-foreground">{email.trim()}</b>, we’ve sent a link to reset your password.
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {mode === 'check-email' && (
                <Button variant="outline" className="h-10" onClick={resend} disabled={busy === 'resend'}>
                  {busy === 'resend' && <Loader2 className="animate-spin" />} Send the email again
                </Button>
              )}
              <Button variant="ghost" className="h-10" onClick={() => switchMode('login')}>
                <ArrowLeft /> Back to log in
              </Button>
              <p className="text-center text-xs text-muted-foreground">Can’t find it? Check your spam folder.</p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">
                {mode === 'forgot' ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </CardTitle>
              <CardDescription>
                {mode === 'forgot'
                  ? 'Enter your email and we’ll send you a link to set a new password.'
                  : 'Your workouts are saved to your account and synced across devices.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode !== 'forgot' && (
                <Tabs value={mode} onValueChange={(v) => switchMode(v as Mode)} className="mb-5">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log in</TabsTrigger>
                    <TabsTrigger value="signup">Sign up</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              <form onSubmit={submit} noValidate>
                <FieldGroup className="gap-4">
                  {mode !== 'forgot' && (
                    <>
                      <Button type="button" variant="outline" className="h-10 w-full" onClick={google} disabled={busy !== null}>
                        {busy === 'google' ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
                        Continue with Google
                      </Button>
                      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">or with email</FieldSeparator>
                    </>
                  )}

                  {mode === 'signup' && (
                    <Field>
                      <FieldLabel htmlFor="name">
                        Name <span className="font-normal text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-10" maxLength={60} />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10"
                      required
                    />
                  </Field>

                  {mode !== 'forgot' && (
                    <Field>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        {mode === 'login' && (
                          <button type="button" className="text-xs font-medium text-brand hover:underline" onClick={() => switchMode('forgot')}>
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <InputGroup className="h-10">
                        <InputGroupInput
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="icon-xs"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {mode === 'signup' && <FieldDescription>At least {MIN_PASSWORD} characters.</FieldDescription>}
                    </Field>
                  )}

                  {error && <FieldError className="rounded-md bg-destructive/10 px-3 py-2">{error}</FieldError>}

                  <Button type="submit" className="h-10 w-full" disabled={busy !== null}>
                    {busy === 'email' && <Loader2 className="animate-spin" />}
                    {mode === 'forgot' ? 'Send reset link' : mode === 'signup' ? 'Create account' : 'Log in'}
                  </Button>

                  {mode === 'forgot' && (
                    <Button type="button" variant="ghost" className="h-10" onClick={() => switchMode('login')}>
                      <ArrowLeft /> Back to log in
                    </Button>
                  )}
                </FieldGroup>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        By continuing you agree to keep lifting. Your data is private to your account.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
