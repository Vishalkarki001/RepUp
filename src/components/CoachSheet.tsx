'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, BotMessageSquare, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { COACH_DAILY, MAX_QUESTION } from '@/lib/coach';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { confirmDialog } from './Confirm';
import { Modal } from './Modal';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

/** Ideas to start with, by the mode the person uses most. */
const STARTERS: Record<string, string[]> = {
  workout: ['Why is my bench press stuck?', 'How much protein should I eat?', 'What should I improve this week?'],
  running: ['How do I run 5 km without stopping?', 'How can I run faster?', 'What should I eat before a run?'],
  food: ['How do I get enough protein as a vegetarian?', 'Is my calorie target right?', 'Healthy Indian snacks for fat loss?'],
};

/** **bold** and "- " bullets, the only formatting the coach uses. */
function Rich({ text }: { text: string }) {
  const bold = (line: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>));
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={`u${out.length}`} className="my-1 list-disc space-y-1 pl-5">{list.map((l, i) => <li key={i}>{bold(l)}</li>)}</ul>);
    list = [];
  };
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*[-•*]\s+(.*)$/);
    if (m) list.push(m[1]);
    else {
      flush();
      if (line.trim()) out.push(<p key={`p${out.length}`}>{bold(line)}</p>);
    }
  }
  flush();
  return <div className="flex flex-col gap-1.5">{out}</div>;
}

/**
 * "Ask Coach": a chat with RepUp's AI coach about training, running and food.
 * It sees a short summary of the person's own last 4 weeks, answers only
 * fitness questions, and allows 20 questions a day. Only they see their chat.
 */
export function CoachSheet({ onClose }: { onClose: () => void }) {
  const { settings } = useAppState();
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [ready, setReady] = useState(true);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/coach', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { messages: Msg[]; left: number; ready: boolean }) => {
        setMsgs(d.messages.map((m) => ({ role: m.role, content: m.content })));
        setLeft(d.left);
        setReady(d.ready);
      })
      .catch(() => {
        setMsgs([]);
        toast.error(navigator.onLine ? 'Couldn’t load your chat. Please try again.' : 'You’re offline. Coach needs the internet.');
      });
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [msgs]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    if (!navigator.onLine) return void toast.error('You’re offline. Coach needs the internet.');
    setBusy(true);
    setText('');
    setMsgs((m) => [...(m ?? []), { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    try {
      const res = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q }) });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'Couldn’t reach Coach. Please try again.');
      }
      const leftHeader = res.headers.get('X-Coach-Left');
      if (leftHeader !== null) setLeft(Number(leftHeader));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        const now = answer;
        setMsgs((m) => (m ? [...m.slice(0, -1), { role: 'assistant', content: now }] : m));
      }
    } catch (e) {
      setMsgs((m) => (m ? m.slice(0, -2) : m)); // take the question back out
      setText(q);
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!(await confirmDialog({ title: 'Clear your chat?', message: 'All messages with Coach are deleted. This can’t be undone.', confirmLabel: 'Clear', danger: true }))) return;
    const res = await fetch('/api/coach', { method: 'DELETE' });
    if (!res.ok) return void toast.error('Couldn’t clear the chat. Please try again.');
    setMsgs([]);
  };

  const starters = STARTERS[settings.mode] ?? STARTERS.workout;
  const out = left !== null && left <= 0;

  return (
    <Modal
      title="Ask Coach"
      description="Training, running and food help, based on your own data"
      onClose={onClose}
      className="sm:h-[80dvh] max-sm:h-[92dvh]"
      footer={
        <form
          className="flex flex-col gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(text);
          }}
        >
          <div className="flex items-end gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_QUESTION))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void ask(text);
                }
              }}
              placeholder={out ? 'No questions left today' : 'Ask about training, running or food'}
              aria-label="Your question"
              rows={1}
              disabled={out || !ready}
              className="max-h-32 min-h-11 resize-none text-base"
            />
            <Button type="submit" size="icon" className="size-11 shrink-0 rounded-full" disabled={!text.trim() || busy || out || !ready} aria-label="Send">
              {busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}
            </Button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            {left !== null && `${left} of ${COACH_DAILY} questions left today · `}General fitness advice, not medical advice
          </p>
        </form>
      }
    >
      {msgs === null ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : msgs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <BotMessageSquare className="size-7" />
          </span>
          <div>
            <p className="text-base font-semibold">Hi, I’m your RepUp Coach</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {ready ? 'I can see your workouts, runs and food, so my answers fit you. Ask in English, Hindi or Hinglish.' : 'Coach isn’t switched on yet. Please check back soon.'}
            </p>
          </div>
          {ready && (
            <div className="flex w-full flex-col gap-2">
              {starters.map((s) => (
                <Button key={s} variant="outline" className="h-auto justify-start py-2.5 text-left whitespace-normal" disabled={busy || out} onClick={() => void ask(s)}>
                  {s}
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="-my-1 h-7 text-xs text-muted-foreground" onClick={() => void clear()} disabled={busy}>
              <Trash2 /> Clear chat
            </Button>
          </div>
          {msgs.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere]',
                  m.role === 'user' ? 'rounded-br-md bg-primary text-primary-foreground whitespace-pre-wrap' : 'rounded-bl-md bg-muted',
                )}
              >
                {m.role === 'user' ? (
                  m.content
                ) : m.content ? (
                  <Rich text={m.content} />
                ) : (
                  <span className="flex items-center gap-1.5 text-muted-foreground" aria-label="Coach is typing">
                    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-current" />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={end} />
        </div>
      )}
    </Modal>
  );
}
