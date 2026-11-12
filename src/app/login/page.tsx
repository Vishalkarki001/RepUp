import type { Metadata } from 'next';
import { LoginScreen } from '@/components/auth/LoginScreen';

export const metadata: Metadata = { title: 'Log in · RepUp' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <LoginScreen next={next} initialError={error ? String(error).slice(0, 200) : undefined} />;
}
