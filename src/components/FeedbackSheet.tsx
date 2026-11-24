'use client';

import { useState } from 'react';
import { CircleCheck, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FEEDBACK_KINDS, MAX_MESSAGE, type FeedbackKind, type FeedbackMeta } from '@/lib/feedback';
import { CONTACT_EMAIL } from '@/lib/site';
import { useAppState } from '@/lib/store';
import { Modal } from './Modal';

/**
 * "Send feedback": a problem, an idea or anything else, straight to the RepUp
 * team (admin panel + a notification). A little about the phone is attached so
 * a problem can be understood; nothing personal beyond the account.
 */
export function FeedbackSheet({ onClose }: { onClose: () => void }) {
  const { settings } = useAppState();
  const [kind, setKind] = useState<FeedbackKind>('bug');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const ok = message.trim().length > 0;

  const send = async () => {
    if (!navigator.onLine) return void toast.error('You’re offline. Connect to the internet and send it again.');
    setSending(true);
    const meta: FeedbackMeta = {
      mode: settings.mode,
      page: location.pathname + location.search,
      screen: `${innerWidth}×${innerHeight}`,
      browser: navigator.userAgent,
      installed: matchMedia('(display-mode: standalone)').matches,
      online: navigator.onLine,
    };
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, message, meta }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Couldn’t send it. Please try again.');
      setSent(true);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Modal
        title="Thanks for telling us"
        onClose={onClose}
        footer={
          <Button className="h-11 w-full text-base" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CircleCheck className="size-10 text-success" />
          <p className="text-sm text-muted-foreground">We read every message. If we need more details, we’ll email you at your account’s address.</p>
        </div>
      </Modal>
    );
  }

  const current = FEEDBACK_KINDS.find((k) => k.id === kind)!;
  return (
    <Modal
      title="Send feedback"
      description="Found a problem or have an idea? Tell us, it goes straight to the RepUp team."
      onClose={onClose}
      footer={
        <Button className="h-11 w-full text-base" disabled={!ok || sending} onClick={() => void send()}>
          {sending ? <Loader2 className="animate-spin" /> : <Send />} Send
        </Button>
      }
    >
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={1}
        value={kind}
        onValueChange={(v) => v && setKind(v as FeedbackKind)}
        aria-label="What is it about?"
        className="grid w-full grid-cols-3"
      >
        {FEEDBACK_KINDS.map((k) => (
          <ToggleGroupItem key={k.id} value={k.id} className="h-10 min-w-0 px-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            {k.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
        placeholder={current.placeholder}
        aria-label="Your message"
        rows={6}
        className="min-h-36 text-base"
        autoFocus
      />
      <p className="text-xs text-muted-foreground">
        Your phone type and the screen you were on are sent along, to help us fix problems. Or email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </Modal>
  );
}
