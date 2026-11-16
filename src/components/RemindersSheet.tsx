'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BellRing, Loader2, Send, Share } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAccount } from '@/lib/account';
import { disablePushHere, enablePushHere, loadReminderPrefs, pushOnHere, pushStatus, saveReminderPrefs, sendTestNotification, type PushStatus } from '@/lib/push/client';
import { anyOn, DEFAULT_PREFS, type ReminderPrefs } from '@/lib/reminders';
import { useAppState } from '@/lib/store';
import { WEEKDAYS, WEEKDAYS_LONG } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SectionTitle } from './common';
import { Modal } from './Modal';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon … Sun

/**
 * Reminders: a few gentle nudges, each only if you haven't done the thing yet
 * (workout finished, lunch logged…). Notifications reach this phone even with
 * RepUp closed; on iPhone only once RepUp is on the home screen.
 */
export function RemindersSheet({ onClose }: { onClose: () => void }) {
  const account = useAccount();
  const { plans } = useAppState();
  const [prefs, setPrefs] = useState<ReminderPrefs | null>(null);
  const [status, setStatus] = useState<PushStatus>('ok');
  const [here, setHere] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStatus(pushStatus());
    void pushOnHere().then(setHere);
    loadReminderPrefs()
      .then((p) => {
        // First time: workout days = the days that have a plan.
        const planDays = plans.filter((x) => x.items.length).map((x) => x.day);
        setPrefs(p ?? { ...DEFAULT_PREFS, workout: { ...DEFAULT_PREFS.workout, days: planDays.length ? planDays : DEFAULT_PREFS.workout.days } });
      })
      .catch(() => {
        setPrefs(DEFAULT_PREFS);
        toast.error('Couldn’t load your reminders. Check your internet.');
      });
  }, [plans]);

  const save = (next: ReminderPrefs) => {
    setPrefs(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!account) return;
      if (!(await saveReminderPrefs(account.id, next))) toast.error('Couldn’t save. Check your internet and try again.');
    }, 500);
  };

  /** Turning a reminder on: make sure this phone can get it (asks permission on the first one). */
  const turnOn = async (apply: (p: ReminderPrefs) => ReminderPrefs) => {
    if (!prefs) return;
    if (!here) {
      setBusy(true);
      const problem = await enablePushHere();
      setBusy(false);
      setStatus(pushStatus());
      if (problem) {
        if (problem === 'error') toast.error('Couldn’t turn on notifications here. Try again.');
        return; // the box above explains what to do
      }
      setHere(true);
    }
    save(apply(prefs));
  };

  const set = <K extends keyof ReminderPrefs>(k: K, patch: Partial<ReminderPrefs[K]>) => {
    if (!prefs) return;
    const next = { ...prefs, [k]: { ...prefs[k], ...patch } };
    if (patch.on === true && !prefs[k].on) void turnOn(() => next);
    else {
      save(next);
      // Last one off: stop this phone too.
      if (patch.on === false && !anyOn(next)) {
        void disablePushHere();
        setHere(false);
      }
    }
  };

  const test = async () => {
    setTesting(true);
    const sent = await sendTestNotification();
    setTesting(false);
    if (sent) toast.success('Sent. It should pop up in a few seconds.');
    else toast.error('Couldn’t send it. Turn on a reminder first, and check your internet.');
  };

  const blocked = status !== 'ok';

  return (
    <Modal
      title="Reminders"
      description="A gentle nudge at the right time, only if you haven’t done it yet."
      onClose={onClose}
      footer={
        <Button variant="outline" className="h-10 w-full" disabled={!here || testing} onClick={() => void test()}>
          {testing ? <Loader2 className="animate-spin" /> : <Send />} Send a test notification
        </Button>
      }
    >
      <Help status={status} />
      {!blocked && prefs && anyOn(prefs) && !here && (
        <div className="flex items-center gap-3 rounded-lg bg-accent/60 px-3 py-2.5 text-sm text-accent-foreground">
          <BellRing className="size-4 shrink-0" />
          <span className="flex-1">Your reminders are on, but not on this device.</span>
          <Button size="sm" disabled={busy} onClick={() => void turnOn((p) => p)}>
            Turn on here
          </Button>
        </div>
      )}

      {!prefs ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className={cn('flex flex-col gap-5', (blocked || busy) && 'pointer-events-none opacity-60')}>
          <Group title="Gym">
            <Row emoji="💪" title="Workout days" hint="Today’s plan, if you haven’t trained yet" on={prefs.workout.on} onChange={(on) => set('workout', { on })}>
              <TimeBox value={prefs.workout.time} onChange={(time) => set('workout', { time })} />
              <Days value={prefs.workout.days} onChange={(days) => set('workout', { days })} />
            </Row>
          </Group>

          <Group title="Food">
            <Row emoji="🍛" title="Log lunch" hint="If lunch isn’t logged yet" on={prefs.lunch.on} onChange={(on) => set('lunch', { on })}>
              <TimeBox value={prefs.lunch.time} onChange={(time) => set('lunch', { time })} />
            </Row>
            <Row emoji="🍽️" title="Log dinner" hint="If dinner isn’t logged yet" on={prefs.dinner.on} onChange={(on) => set('dinner', { on })}>
              <TimeBox value={prefs.dinner.time} onChange={(time) => set('dinner', { time })} />
            </Row>
            <Row emoji="💧" title="Drink water" hint="11 am, 3 pm and 7 pm, until you’ve had 8 glasses" on={prefs.water.on} onChange={(on) => set('water', { on })} />
          </Group>

          <Group title="Body">
            <Row emoji="⚖️" title="Weekly weigh-in" hint="Once a week, same time" on={prefs.weight.on} onChange={(on) => set('weight', { on })}>
              <TimeBox value={prefs.weight.time} onChange={(time) => set('weight', { time })} />
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={1}
                value={String(prefs.weight.day)}
                onValueChange={(v) => v && set('weight', { day: Number(v) })}
                aria-label="Weigh-in day"
                className="grid w-full grid-cols-7"
              >
                {DAY_ORDER.map((d) => (
                  <ToggleGroupItem key={d} value={String(d)} aria-label={WEEKDAYS_LONG[d]} className="h-8 min-w-0 px-0 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    {WEEKDAYS[d]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Row>
          </Group>

          <Group title="Running">
            <Row emoji="🏃" title="Run days" hint="If you haven’t been out yet" on={prefs.run.on} onChange={(on) => set('run', { on })}>
              <TimeBox value={prefs.run.time} onChange={(time) => set('run', { time })} />
              <Days value={prefs.run.days} onChange={(days) => set('run', { days })} />
            </Row>
          </Group>
        </div>
      )}
    </Modal>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>{title}</SectionTitle>
      <div className="flex flex-col divide-y rounded-xl border bg-card">{children}</div>
    </section>
  );
}

/** One reminder: emoji, name, a line of help, the switch; its time / days show when it's on. */
function Row({ emoji, title, hint, on, onChange, children }: { emoji: string; title: string; hint: string; on: boolean; onChange: (on: boolean) => void; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      <label className="flex cursor-pointer items-center gap-3">
        <span className="text-xl leading-none" aria-hidden>
          {emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{title}</span>
          <span className="block text-xs text-muted-foreground">{hint}</span>
        </span>
        <Switch checked={on} onCheckedChange={onChange} aria-label={title} />
      </label>
      {on && children && <div className="flex flex-col gap-2 pl-8">{children}</div>}
    </div>
  );
}

function TimeBox({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      At
      <Input type="time" value={value} onChange={(e) => /^\d{2}:\d{2}$/.test(e.target.value) && onChange(e.target.value)} className="h-9 w-32 text-sm tabular" aria-label="Time" />
    </label>
  );
}

function Days({ value, onChange }: { value: number[]; onChange: (d: number[]) => void }) {
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      spacing={1}
      value={value.map(String)}
      onValueChange={(v) => v.length && onChange(v.map(Number).sort())}
      aria-label="Days"
      className="grid w-full grid-cols-7"
    >
      {DAY_ORDER.map((d) => (
        <ToggleGroupItem key={d} value={String(d)} aria-label={WEEKDAYS_LONG[d]} className="h-8 min-w-0 px-0 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          {WEEKDAYS[d]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** What to do when this phone can't get reminders yet. */
function Help({ status }: { status: PushStatus }) {
  if (status === 'ok') return null;
  return (
    <div className="rounded-lg bg-warning-soft px-3 py-2.5 text-sm text-warning">
      {status === 'ios-install' ? (
        <>
          <p className="font-medium">On iPhone, reminders work in the installed app.</p>
          <ol className="mt-1 list-decimal pl-4 text-xs leading-relaxed">
            <li>
              In Safari tap Share <Share className="inline size-3.5 align-text-bottom" aria-label="Share icon" />, then <b>Add to Home Screen</b>.
            </li>
            <li>Open RepUp from your home screen and come back here.</li>
          </ol>
        </>
      ) : status === 'denied' ? (
        <>
          <p className="font-medium">Notifications are blocked for RepUp.</p>
          <p className="mt-1 text-xs leading-relaxed">
            Android: tap the lock icon next to the address (or long-press the RepUp icon → App info) → Notifications → Allow. iPhone: Settings →
            Notifications → RepUp. Then open this again.
          </p>
        </>
      ) : (
        <p>This browser can’t show reminders. Use Chrome on Android or a computer, or RepUp from the home screen on iPhone.</p>
      )}
    </div>
  );
}
