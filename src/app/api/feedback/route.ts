import type { NextRequest } from 'next/server';
import { cleanFeedback, feedbackNotification } from '@/lib/feedback';
import { pushReady, sendToUser } from '@/lib/push/server';
import { adminDb, signedInUser } from '@/lib/supabase/admin';
import { createSupabaseServer } from '@/lib/supabase/server';

/**
 * POST /api/feedback { kind, message, meta } → saved for the admins (send_feedback(),
 * as the signed-in person, at most 10 a day), and every admin's phone gets a notification.
 */
export async function POST(request: NextRequest) {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'Sign in first.' }, { status: 401 });
  const input = cleanFeedback(await request.json().catch(() => null));
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 });

  const db = await createSupabaseServer();
  const { error } = await db.rpc('send_feedback', { p_kind: input.kind, p_message: input.message, p_meta: input.meta });
  if (error) {
    if (/too much feedback/i.test(error.message)) return Response.json({ error: 'That’s a lot for one day. Please try again tomorrow.' }, { status: 429 });
    console.error('feedback save failed:', error.message);
    return Response.json({ error: 'Couldn’t send it. Please try again.' }, { status: 502 });
  }

  // Tell the admins (best effort: the feedback is saved either way).
  const admin = adminDb();
  if (admin && pushReady()) {
    try {
      const [{ data: admins }, { data: me }] = await Promise.all([
        admin.from('profiles').select('id').eq('role', 'admin').limit(10),
        admin.from('profiles').select('full_name,email').eq('id', user).maybeSingle<{ full_name: string | null; email: string | null }>(),
      ]);
      const msg = feedbackNotification(input.kind, input.message, me?.full_name || me?.email || null);
      await Promise.all((admins ?? []).map((a) => sendToUser(admin, a.id as string, msg)));
    } catch (e) {
      console.error('feedback notification failed:', (e as Error).message);
    }
  }
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
