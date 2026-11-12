import type { Metadata } from 'next';
import { LoginScreen } from '@/components/auth/LoginScreen';

export const metadata: Metadata = {
  title: 'Log in or sign up · RepUp',
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
      initialError={error ? String(error).slice(0, 200) : undefined}
      initialMode={mode === 'signup' ? 'signup' : 'login'}
    />
  );
}
