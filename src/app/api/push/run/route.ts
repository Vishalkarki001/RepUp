import { timingSafeEqual } from 'node:crypto';
import { after } from 'next/server';
import { runReminders } from '@/lib/push/server';

/** Many people at once on Sunday evening: allow up to 5 minutes (the job itself stops starting new people after 4). */
export const maxDuration = 300;

/**
 * POST /api/push/run: send the reminders that are due. Called every 5 minutes
 * by the database's cron job (see supabase/migrations/*_reminders.sql) with
 * "Authorization: Bearer <CRON_SECRET>". Safe to call more often: each
 * reminder goes out at most once a day.
 */
function allowed(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const got = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!secret || !got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!allowed(request)) return Response.json({ error: 'not allowed' }, { status: 401 });
  // Answer the cron job straight away (it only waits 20 seconds) and do the sending after.
  after(async () => {
    try {
      const r = await runReminders();
      if (r.users) console.log('reminders:', JSON.stringify(r));
    } catch (e) {
      console.error('reminders run failed:', (e as Error).message);
    }
  });
  return Response.json({ started: true }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
}
