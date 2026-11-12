'use client';

import type { ReactNode } from 'react';
import { CalendarDays, ChartLine, Check, CircleQuestionMark, CloudCheck, Download, Flag, Pencil, Play, Share } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { promptInstall, useInstall } from '@/lib/install';
import { Modal } from './Modal';

const STEPS: { icon: ReactNode; title: string; body: ReactNode }[] = [
  {
    icon: <CalendarDays />,
    title: 'Plan your week',
    body: (
      <>
        On <b>Workout</b>, tap a day, then <b>Edit</b>. Add the exercises you do that day and how many sets × reps. You do this
        once; every week the same day shows the same plan.
      </>
    ),
  },
  {
    icon: <Play />,
    title: 'Start your workout',
    body: (
      <>
        At the gym, tap <b>Start workout</b>. No plan today? Use <b>Start a blank workout</b> and add exercises as you go.
      </>
    ),
  },
  {
    icon: <Check />,
    title: 'Type kg and reps, then tick ✓',
    body: (
      <>
        Under each exercise you see <b>Last time</b>: what you lifted the last time. The tip below it tells you what to aim for
        today. Tap <b>Fill</b> to copy it in, change anything, then tick ✓ after each set.
      </>
    ),
  },
  {
    icon: <Flag />,
    title: 'Finish',
    body: (
      <>
        Tap <b>Finish</b> when you are done. The workout is saved, and next time this exercise comes up you will see today&apos;s
        numbers as &ldquo;Last time&rdquo;. That is how you keep getting stronger.
      </>
    ),
  },
  {
    icon: <ChartLine />,
    title: 'See your progress',
    body: (
      <>
        <b>Progress</b> shows a chart for each exercise and your body weight. <b>History</b> lists every workout by date.
      </>
    ),
  },
  {
    icon: <Pencil />,
    title: 'Fix a mistake',
    body: (
      <>
        Wrong number? Open the workout in <b>History</b> and edit it. Wrong exercise name? Tap it in <b>Exercises</b>, then{' '}
        <b>Rename or delete</b>.
      </>
    ),
  },
  {
    icon: <CloudCheck />,
    title: 'Saving is automatic',
    body: (
      <>
        <b>Saved</b> at the top means it is in your account, so it shows on your phone and laptop. No internet at the gym? Keep
        going; it saves when you are back online.
      </>
    ),
  },
];

function InstallStep() {
  const { installed, canPrompt, ios } = useInstall();
  if (installed) return null;

  return (
    <li className="flex gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground [&_svg]:size-4">
        <Download />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm font-semibold">Put RepUp on your home screen</p>
        {canPrompt ? (
          <>
            <p className="text-sm text-muted-foreground">Opens like a normal app, full screen, even without internet.</p>
            <Button
              className="h-10 w-full sm:w-auto"
              onClick={async () => {
                if (await promptInstall()) toast.success('RepUp is on your home screen');
              }}
            >
              <Download /> Install app
            </Button>
          </>
        ) : ios ? (
          <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>
              1. Open this page in <b className="text-foreground">Safari</b>.
            </li>
            <li>
              2. Tap <b className="text-foreground">Share</b> <Share className="inline size-4 align-text-bottom" aria-label="Share icon" />{' '}
              at the bottom.
            </li>
            <li>
              3. Scroll down and tap <b className="text-foreground">Add to Home Screen</b>, then <b className="text-foreground">Add</b>.
            </li>
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            In Chrome, tap the menu <b className="text-foreground">⋮</b> at the top right, then{' '}
            <b className="text-foreground">Install app</b> (or <b className="text-foreground">Add to Home screen</b>). Opened RepUp
            from WhatsApp or Instagram? Open it in Chrome first.
          </p>
        )}
      </div>
    </li>
  );
}

/** "How to use RepUp": short numbered steps, plus the install button. */
export function HelpGuide({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="How to use RepUp"
      description="Record sets × kg × reps, then beat last time. That's it."
      onClose={onClose}
      footer={
        <Button className="h-10 w-full" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <ol className="flex flex-col gap-3">
        <InstallStep />
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold [&_svg]:size-4 [&_svg]:text-muted-foreground">
                {s.icon}
                {s.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground [&_b]:font-medium [&_b]:text-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
        <CircleQuestionMark className="size-3.5" /> You can open this guide any time from the <b className="font-medium">?</b> button.
      </p>
    </Modal>
  );
}
