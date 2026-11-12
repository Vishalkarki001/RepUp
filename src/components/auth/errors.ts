import type { AuthError } from '@supabase/supabase-js';

/** Turn Supabase auth errors into short, friendly sentences. */
export function friendlyAuthError(err: AuthError | Error | null | undefined): string {
  if (!err) return 'Something went wrong. Please try again.';
  const code = 'code' in err ? (err.code as string | undefined) : undefined;
  const msg = err.message.toLowerCase();
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) return 'Email or password is wrong.';
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) return 'Please confirm your email first — check your inbox.';
  if (code === 'user_already_exists' || msg.includes('already registered')) return 'An account with this email already exists. Log in instead.';
  if (code === 'weak_password' || msg.includes('password should')) return 'Choose a stronger password (at least 8 characters, mix letters and numbers).';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || msg.includes('rate limit') || msg.includes('only request this after'))
    return 'Too many attempts. Please wait a few minutes and try again.';
  if (code === 'validation_failed' && msg.includes('provider')) return 'Google login isn’t switched on yet.';
  if (msg.includes('provider is not enabled') || msg.includes('unsupported provider')) return 'Google login isn’t switched on yet.';
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'No internet connection. Check your network and try again.';
  return err.message;
}
