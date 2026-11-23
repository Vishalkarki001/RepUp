import type { Metadata } from 'next';
import { BLOCKED_MESSAGE } from '@/components/auth/errors';
import { LoginScreen } from '@/components/auth/LoginScreen';

/** ?error=<code> → a fixed sentence (any other text in the address is ignored, so nobody can put their own words on this page). */
const ERRORS: Record<string, string> = {
  blocked: BLOCKED_MESSAGE,
  link: 'This link is invalid or has expired. Please try again.',
};

export const metadata: Metadata = {
  title: 'Log in or sign up',
  description: 'Log in to RepUp, the free gym workout tracker. Sign up with email or Google.',
  alternates: { canonical: '/login' },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const { next, error, mode } = await searchParams;
  return (
    <LoginScreen
      next={next}
      initialError={error && Object.hasOwn(ERRORS, error) ? ERRORS[error] : undefined}
      initialMode={mode === 'signup' ? 'signup' : 'login'}
    />
  );
}
