/**
 * Feedback from users ("Send feedback" in Settings): the kinds, checking what
 * arrives, and the notification admins get. Plain functions shared by the app,
 * the server route (/api/feedback) and the tests.
 */
import type { PushMessage } from './reminders';

export type FeedbackKind = 'bug' | 'idea' | 'other';

export const FEEDBACK_KINDS: { id: FeedbackKind; label: string; placeholder: string }[] = [
  { id: 'bug', label: 'Problem', placeholder: 'What happened? What did you tap just before?' },
  { id: 'idea', label: 'Idea', placeholder: 'What would make RepUp better for you?' },
  { id: 'other', label: 'Other', placeholder: 'Tell us anything' },
];

export const MAX_MESSAGE = 2000;

/** A little about the phone, so a problem can be understood. No personal data. */
export interface FeedbackMeta {
  mode?: string;
  page?: string;
  screen?: string;
  browser?: string;
  installed?: boolean;
  online?: boolean;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined);

/** What the app sent → clean values, or an error to show. */
export function cleanFeedback(body: unknown): { kind: FeedbackKind; message: string; meta: FeedbackMeta } | { error: string } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  if (!message) return { error: 'Write a few words first.' };
  if (message.length > MAX_MESSAGE) return { error: `Please keep it under ${MAX_MESSAGE} characters.` };
  const kind = FEEDBACK_KINDS.some((k) => k.id === b.kind) ? (b.kind as FeedbackKind) : 'other';
  const m = (b.meta && typeof b.meta === 'object' ? b.meta : {}) as Record<string, unknown>;
  const meta: FeedbackMeta = {
    mode: str(m.mode, 20),
    page: str(m.page, 100),
    screen: str(m.screen, 20),
    browser: str(m.browser, 300),
    installed: typeof m.installed === 'boolean' ? m.installed : undefined,
    online: typeof m.online === 'boolean' ? m.online : undefined,
  };
  return { kind, message, meta };
}

/** The notification admins get for new feedback. */
export function feedbackNotification(kind: FeedbackKind, message: string, from: string | null): PushMessage {
  const what = kind === 'bug' ? 'Problem reported' : kind === 'idea' ? 'New idea' : 'New feedback';
  const text = message.replace(/\s+/g, ' ');
  return {
    title: `${what}${from ? ` · ${from}` : ''}`,
    body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
    tag: 'feedback',
    url: '/admin#feedback',
  };
}

/** "Android · Chrome" from a browser's user agent (enough to reproduce a problem). */
export function deviceLabel(ua: string | undefined): string {
  if (!ua) return '';
  const os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '';
  const browser = /SamsungBrowser/.test(ua)
    ? 'Samsung Internet'
    : /Edg\//.test(ua)
      ? 'Edge'
      : /Firefox|FxiOS/.test(ua)
        ? 'Firefox'
        : /CriOS|Chrome/.test(ua)
          ? 'Chrome'
          : /Safari/.test(ua)
            ? 'Safari'
            : '';
  return [os, browser].filter(Boolean).join(' · ');
}
