import Anthropic from '@anthropic-ai/sdk';
import { after, type NextRequest } from 'next/server';
import { cleanQuestion, COACH_DAILY, COACH_DAILY_TOTAL, COACH_MODEL, COACH_SYSTEM, coachContext, HISTORY_TURNS } from '@/lib/coach';
import { dayStartIso, loadCoachData, userTz } from '@/lib/coach-server';
import { adminDb, signedInUser, withinLimit } from '@/lib/supabase/admin';

/** Answers are short; this also lets an answer finish and be saved if they close Coach half way. */
export const maxDuration = 60;

/**
 * /api/coach: the signed-in person's chat with RepUp Coach (Claude Haiku 5.5).
 *  GET    → their recent messages and how many questions are left today
 *  POST   { message } → the answer, streamed as plain text; both are saved
 *  DELETE → clear their chat
 * "Today" is the person's own day (their time zone), not the server's.
 */

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic({ timeout: 45_000, maxRetries: 1 }));

type Db = NonNullable<ReturnType<typeof adminDb>>;

const BUSY = 'Coach is busy right now. Please try again in a minute.';

async function questionsToday(db: Db, user: string, since: string): Promise<number> {
  const { count } = await db.from('coach_messages').select('id', { count: 'exact', head: true }).eq('user_id', user).eq('role', 'user').gte('created_at', since);
  return count ?? 0;
}

export async function GET() {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'sign in' }, { status: 401 });
  const db = adminDb();
  if (!db) return Response.json({ error: 'not configured' }, { status: 503 });
  const tz = await userTz(db, user);
  const [{ data }, used] = await Promise.all([
    db.from('coach_messages').select('role,content,created_at').eq('user_id', user).order('created_at', { ascending: false }).limit(40),
    questionsToday(db, user, dayStartIso(tz)),
  ]);
  return Response.json(
    { messages: (data ?? []).reverse(), left: Math.max(0, COACH_DAILY - used), ready: !!process.env.ANTHROPIC_API_KEY },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function DELETE() {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'sign in' }, { status: 401 });
  const db = adminDb();
  if (!db) return Response.json({ error: 'not configured' }, { status: 503 });
  const { error } = await db.from('coach_messages').delete().eq('user_id', user);
  if (error) return Response.json({ error: 'Couldn’t clear the chat. Please try again.' }, { status: 502 });
  return Response.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'Sign in first.' }, { status: 401 });
  const db = adminDb();
  if (!db || !process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'Coach isn’t switched on yet.' }, { status: 503 });
  const input = cleanQuestion(await request.json().catch(() => null));
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 });

  const tz = await userTz(db, user);
  // History first (before this question is saved), then claim one of today's questions.
  // The claim saves the question and counts it in one step, so a burst of requests can't pass the limit.
  const { data: past } = await db.from('coach_messages').select('role,content').eq('user_id', user).order('created_at', { ascending: false }).limit(HISTORY_TURNS);
  const { data: claim, error: claimError } = await db.rpc('coach_ask', { p_user: user, p_question: input.question, p_since: dayStartIso(tz), p_limit: COACH_DAILY });
  if (claimError) {
    console.error('coach limit check failed:', claimError.message);
    return Response.json({ error: 'Couldn’t reach Coach. Please try again.' }, { status: 503 });
  }
  const row = (claim as { msg_id: number; asked: number }[] | null)?.[0];
  if (!row) return Response.json({ error: `You’ve asked ${COACH_DAILY} questions today. Come back tomorrow for more.` }, { status: 429 });
  const left = Math.max(0, COACH_DAILY - row.asked);
  // The question doesn't count if no answer came.
  const giveBack = () => db.from('coach_messages').delete().eq('id', row.msg_id).eq('user_id', user);

  // Everyone together: each answer costs money.
  if (!(await withinLimit('coach:all', COACH_DAILY_TOTAL, true))) {
    await giveBack();
    return Response.json({ error: 'Coach is very busy today. Please try again tomorrow.' }, { status: 429 });
  }

  // Earlier turns, oldest first, starting with a question (the API needs user first).
  const history = (past ?? []).reverse().map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content as string }));
  while (history.length && history[0].role !== 'user') history.shift();
  const mine = await loadCoachData(db, user, tz);

  const stream = anthropic().messages.stream({
    model: COACH_MODEL,
    max_tokens: 1500,
    output_config: { effort: 'low' },
    // Fixed instructions first (cached), then the chat; their data goes in last as an operator note.
    system: [{ type: 'text', text: COACH_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [
      ...history,
      { role: 'user', content: input.question },
      { role: 'system', content: `Their RepUp data (use it, don't repeat it back in full):\n${coachContext(mine.data, mine.today, mine.dateOf)}` },
    ],
  });

  // Listen from the start (events that arrive before we read them are kept), then
  // check the model took the request: too many people at once or the model down → say so now.
  const events = stream[Symbol.asyncIterator]();
  try {
    await stream.withResponse();
  } catch (e) {
    console.error('coach unavailable:', e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : (e as Error).message);
    await giveBack();
    return Response.json({ error: BUSY }, { status: 503 });
  }

  // The answer is read to the end and saved even if they close Coach half way;
  // the browser just gets a live copy while it's listening.
  const encoder = new TextEncoder();
  const sink: { out: ReadableStreamDefaultController<Uint8Array> | null } = { out: null };
  const write = (text: string) => {
    try {
      sink.out?.enqueue(encoder.encode(text));
    } catch {
      sink.out = null; // they left
    }
  };
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      sink.out = controller;
    },
    cancel() {
      sink.out = null;
    },
  });

  const answered = (async () => {
    let answer = '';
    try {
      for await (const event of { [Symbol.asyncIterator]: () => events }) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          answer += event.delta.text;
          write(event.delta.text);
        }
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal' || !answer.trim()) {
        const sorry = 'Sorry, I can’t help with that one. Ask me anything about training, running, food or recovery.';
        write((answer.trim() ? '\n\n' : '') + sorry);
        answer = (answer.trim() ? answer + '\n\n' : '') + sorry;
      }
      await db.from('coach_messages').insert({ user_id: user, role: 'assistant', content: answer.slice(0, 8000) });
    } catch (e) {
      console.error('coach failed:', e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : (e as Error).message);
      if (answer.trim()) {
        const cut = '\n\n(Answer cut short. Please ask again.)';
        write(cut);
        await db.from('coach_messages').insert({ user_id: user, role: 'assistant', content: (answer + cut).slice(0, 8000) });
      } else {
        await giveBack();
        write('Sorry, I couldn’t answer right now. Please try again in a minute.');
      }
    } finally {
      try {
        sink.out?.close();
      } catch {
        /* already closed */
      }
    }
  })();
  after(() => answered);

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Coach-Left': String(left) } });
}
