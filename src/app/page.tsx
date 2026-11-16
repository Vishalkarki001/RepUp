import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { HomeLanding } from '@/components/site/pages/HomeLanding';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { ClientApp } from './ClientApp';

export const metadata: Metadata = {
  title: { absolute: 'RepUp: Free Gym Workout Tracker & Workout Log App' },
  description:
    'RepUp is a free gym workout tracker, running tracker and calorie counter. Log sets, reps and kg and beat last time, track runs with GPS, count calories in Indian food.',
  alternates: { canonical: '/' },
};

/**
 * "/" is two things: the app for signed-in users, and the public home page for
 * everyone else. src/proxy.ts decides who is signed in and passes it on.
 */
export default async function Page() {
  const signedIn = (await headers()).get('x-repup-auth') === '1';
  if (signedIn || !isSupabaseConfigured) return <ClientApp />;
  return <HomeLanding />;
}
