import { pushReady, sendToUser } from '@/lib/push/server';
import { TEST_MESSAGE } from '@/lib/reminders';
import { adminDb, signedInUser } from '@/lib/supabase/admin';

/** POST /api/push/test: "Send a test notification" from the reminders screen, to the signed-in person's browsers. */
export async function POST() {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'sign in' }, { status: 401 });
  const db = adminDb();
  if (!db || !pushReady()) return Response.json({ error: 'not configured' }, { status: 503 });
  const sent = await sendToUser(db, user, TEST_MESSAGE);
  return Response.json({ sent }, { headers: { 'Cache-Control': 'no-store' } });
}
