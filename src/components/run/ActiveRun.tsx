'use client';

import { useEffect, useRef, useState } from 'react';
import { LocateFixed, Lock, MapPinOff, Pause, Play, Square, Unlock, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  estimateCalories,
  estimateSteps,
  formatDuration,
  formatKm,
  formatPace,
  gapFill,
  TYPICAL_CADENCE,
  MAX_ACCURACY_M,
  movingMs,
  paceSecPerKm,
  weatherLabel,
  type Gap,
  type GapAnswer,
  type TrackState,
} from '@/lib/run/core';
import { answerGap, discardRun, finishRun, pauseRun, resumeRun, startNow, useRun, weightKgForCalories } from '@/lib/run/tracker';
import type { RunEntry } from '@/lib/types';
import { cn, useNow, useWakeLock } from '@/lib/utils';
import { confirmDialog } from '../Confirm';
import { Modal } from '../Modal';
import { kindLabel } from './RunParts';

/** The live run screen: big timer and numbers, pause / lock / finish. */
export function ActiveRun({ onFinished }: { onFinished: (run: RunEntry) => void }) {
  const { track, problem, motion, gap } = useRun();
  const now = useNow(1000);
  const [locked, setLocked] = useState(false);
  useWakeLock(!!track); // keep the screen on: browsers stop GPS when it turns off
  const [voice, setVoice] = useVoicePref();
  useKmAnnouncements(track?.kmMarks ?? [], voice);

  if (!track) return null;

  if (track.status === 'locating') {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 text-center">
        <span className="relative flex size-20 items-center justify-center rounded-full bg-accent text-accent-foreground" role="status" aria-label="Finding GPS">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <LocateFixed className="relative size-8" />
        </span>
        <div>
          <p className="text-lg font-semibold">Finding GPS…</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Stand still under open sky for a few seconds. The run starts by itself when your location is found.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={discardRun}>
            Cancel
          </Button>
          <Button onClick={startNow}>Start now</Button>
        </div>
      </div>
    );
  }

  const seconds = movingMs(track, now) / 1000;
  const paused = track.status === 'paused';
  const pace = paceSecPerKm(track.distanceM, seconds);
  const steps = motion ? track.steps : estimateSteps(track.distanceM, track.kind);
  // Steps are partly worked out from distance when the sensor wasn't counting (no sensor, or the screen was off).
  const stepsExact = motion && !(track.stepsGuessed ?? 0);
  const stepsText = `${stepsExact ? '' : '~'}${steps.toLocaleString('en-IN')}`;
  const kcal = estimateCalories(track.distanceM, track.kind, weightKgForCalories());
  const weather = weatherLabel(track.weatherCode);
  const weakGps = !paused && track.accuracy !== null && track.accuracy > MAX_ACCURACY_M;

  const finish = async () => {
    const tiny = track.distanceM < 20;
    const ok = await confirmDialog({
      title: `Finish this ${kindLabel(track.kind).toLowerCase()}?`,
      message: tiny
        ? 'Hardly any distance was recorded (GPS may not have found you). Save it anyway?'
        : `${formatKm(track.distanceM)} km in ${formatDuration(seconds)} will be saved.`,
      confirmLabel: 'Finish & save',
    });
    if (!ok) return;
    const run = finishRun();
    if (run) onFinished(run);
  };

  const discard = async () => {
    const ok = await confirmDialog({
      title: `Discard this ${kindLabel(track.kind).toLowerCase()}?`,
      message: 'Nothing will be saved.',
      confirmLabel: 'Discard',
      danger: true,
    });
    if (ok) discardRun();
  };

  return (
    <div className="flex flex-col gap-5 pt-4">
      <header className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">{kindLabel(track.kind)}</h1>
        {paused ? (
          <Badge variant="secondary">Paused</Badge>
        ) : (
          <Badge className="gap-1.5 bg-success-soft text-success">
            <span className="size-1.5 animate-soft-pulse rounded-full bg-success" /> Tracking
          </Badge>
        )}
        <span className="ml-auto flex items-center gap-1">
          {weather && track.tempC !== null && (
            <span className="text-sm text-muted-foreground tabular">
              {weather.emoji} {Math.round(track.tempC)}°C
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setVoice(!voice)}
            aria-label={voice ? 'Turn off the voice at every km' : 'Say the pace at every km'}
            title={voice ? 'Voice on at every km' : 'Voice off'}
          >
            {voice ? <Volume2 /> : <VolumeX />}
          </Button>
        </span>
      </header>

      <div className="flex flex-col items-center gap-1 py-2">
        <span className={cn('text-6xl font-semibold tracking-tight tabular sm:text-7xl', paused && 'text-muted-foreground')}>
          {formatDuration(seconds)}
        </span>
        <span className="text-xs text-muted-foreground">moving time</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Big value={formatKm(track.distanceM)} unit="km" label="distance" />
        <Big value={formatPace(pace)} unit="/km" label="avg pace" />
        <Big value={stepsText} label={stepsExact ? 'steps' : 'steps (estimate)'} />
        <Big value={`~${kcal}`} unit="kcal" label="calories (estimate)" />
      </div>

      {problem === 'denied' && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <MapPinOff className="mt-0.5 size-4 shrink-0" /> Location was turned off, so distance isn’t being counted. Turn location on
          for RepUp in your browser settings.
        </p>
      )}
      {weakGps && (
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">Weak GPS signal. Distance will catch up under open sky.</p>
      )}
      {track.gapS >= 20 && (
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
          GPS stopped for {formatDuration(track.gapS)} in total (screen off or weak signal): that part is estimated (~). Use{' '}
          <Lock className="inline size-3.5 align-text-bottom" /> Lock instead of the power button to keep everything exact.
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Keep RepUp open with the screen on (in your hand or an armband). In a pocket? Tap <Lock className="inline size-3 align-text-bottom" />{' '}
        lock, not the power button.
      </p>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        {paused ? (
          <Button size="lg" className="h-14 text-base" onClick={() => void resumeRun()}>
            <Play className="fill-current" /> Resume
          </Button>
        ) : (
          <Button size="lg" variant="secondary" className="h-14 text-base" onClick={pauseRun}>
            <Pause className="fill-current" /> Pause
          </Button>
        )}
        <Button size="lg" variant="outline" className="h-14 px-4 text-base" onClick={() => setLocked(true)} aria-label="Lock the screen against touches">
          <Lock /> Lock
        </Button>
      </div>
      <Button size="lg" variant="destructive" className="h-12 text-base" onClick={finish}>
        <Square className="fill-current" /> Finish
      </Button>
      <Button variant="ghost" size="sm" className="self-center text-muted-foreground" onClick={discard}>
        Discard
      </Button>

      {gap && <GapDialog gap={gap} track={track} />}

      {locked && (
        <LockOverlay
          time={formatDuration(seconds)}
          km={formatKm(track.distanceM)}
          pace={formatPace(pace)}
          steps={stepsText}
          paused={paused}
          onUnlock={() => setLocked(false)}
        />
      )}
    </div>
  );
}

/**
 * Back after the screen was off (or the phone closed RepUp): the browser had
 * stopped GPS and steps. Ask what happened, and fill the gap from the pace and
 * step rhythm just before. Each button shows what it will add.
 */
function GapDialog({ gap, track }: { gap: Gap; track: TrackState }) {
  const [busy, setBusy] = useState(false);
  const seconds = Math.round((gap.to - gap.from) / 1000);
  const what = track.kind === 'walk' ? 'walking' : 'running';
  const preview = (a: GapAnswer) => gapFill(gap, a, track.kind, track.lastFix);
  const moving = preview('moving');
  const stopped = preview('stopped');
  const answer = async (a: GapAnswer) => {
    setBusy(true);
    await answerGap(a);
    setBusy(false);
  };
  return (
    <Modal
      title={gap.restored ? `RepUp was closed for ${formatDuration(seconds)}` : `The screen was off for ${formatDuration(seconds)}`}
      description="Phones stop GPS and step counting while the screen is off. Tell us what happened and we’ll fill it in."
      onClose={() => void answer('line')}
      footer={
        <div className="flex flex-col gap-2">
          <Button className="h-auto min-h-12 flex-col gap-0 py-2 text-base" disabled={busy} onClick={() => void answer('moving')}>
            Yes, I kept {what}
            <span className="text-xs font-normal opacity-80 tabular">
              adds ~{formatKm(moving.distanceM)} km · ~{moving.steps.toLocaleString('en-IN')} steps · the time counts
            </span>
          </Button>
          <Button variant="outline" className="h-auto min-h-12 flex-col gap-0 py-2 text-base" disabled={busy} onClick={() => void answer('stopped')}>
            No, I stopped
            <span className="text-xs font-normal text-muted-foreground tabular">
              {stopped.distanceM >= 10 ? `adds ${formatKm(stopped.distanceM)} km (straight line) · ` : ''}the time won’t count
            </span>
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        {gap.speed
          ? `Before that you were doing ${formatPace(gap.speed > 0 ? 1000 / gap.speed : null)} /km${gap.cadence ? ` at ${Math.round(gap.cadence)} steps a minute` : ''}. If you kept going, we use that for the missing part (marked ~).`
          : `It was too early to know your own pace, so if you kept going we use a steady ${track.kind === 'walk' ? 'walk' : 'easy run'} (about ${TYPICAL_CADENCE[track.kind]} steps a minute) for the missing part (marked ~).`}
      </p>
      <p className="rounded-lg bg-accent/60 px-3 py-2 text-sm text-accent-foreground">
        Next time: tap <Lock className="inline size-3.5 align-text-bottom" /> <b>Lock</b> instead of the power button. The screen goes black and
        everything keeps counting for real.
      </p>
    </Modal>
  );
}

function Big({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div className="min-w-0 rounded-xl border bg-card px-3 py-3">
      <p className="text-2xl font-semibold tracking-tight [overflow-wrap:anywhere] tabular sm:text-3xl">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * Covers the screen so pocket / sweaty touches do nothing; tracking carries on
 * (the screen stays on, which is what keeps GPS and the step sensor running).
 * Black, so it costs little battery on OLED phones. Hold the button to unlock.
 */
function LockOverlay({
  time,
  km,
  pace,
  steps,
  paused,
  onUnlock,
}: {
  time: string;
  km: string;
  pace: string;
  steps: string;
  paused: boolean;
  onUnlock: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    setHolding(true);
    timer.current = setTimeout(onUnlock, 1000);
  };
  const stop = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
  };
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-black px-6 text-white" role="dialog" aria-label="Screen locked">
      <p className={cn('text-6xl font-semibold tabular', paused && 'text-white/50')}>{time}</p>
      {paused && <p className="-mt-4 text-sm font-medium text-amber-300">Paused</p>}
      <div className="grid w-full max-w-sm grid-cols-3 gap-2 text-center">
        {(
          [
            [km, 'km'],
            [pace, 'pace /km'],
            [steps, 'steps'],
          ] as const
        ).map(([v, l]) => (
          <div key={l} className="rounded-xl bg-white/10 px-2 py-3">
            <p className="text-2xl font-semibold tabular [overflow-wrap:anywhere]">{v}</p>
            <p className="text-xs text-white/60">{l}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        className="relative mt-4 flex size-24 select-none items-center justify-center overflow-hidden rounded-full border-2 border-white/80 text-white [-webkit-touch-callout:none]"
        aria-label="Hold to unlock"
      >
        <span
          className="absolute inset-x-0 bottom-0 bg-white/30 transition-[height] ease-linear"
          style={{ height: holding ? '100%' : '0%', transitionDuration: holding ? '1000ms' : '150ms' }}
        />
        <Unlock className="relative size-8" />
      </button>
      <p className="text-sm text-white/70">Hold to unlock</p>
      <p className="max-w-xs text-center text-xs leading-relaxed text-white/50">
        Still tracking. Don’t press the power button: phones stop GPS and step counting when the screen turns off.
      </p>
    </div>
  );
}

const VOICE_KEY = 'repup:run-voice';

function useVoicePref(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(VOICE_KEY) !== 'off';
    } catch {
      return true;
    }
  });
  const set = (v: boolean) => {
    setOn(v);
    try {
      localStorage.setItem(VOICE_KEY, v ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  };
  return [on, set];
}

/** At every full km: a short vibration and (if on) "2 kilometres. Last kilometre 6 minutes 5 seconds." */
function useKmAnnouncements(kmMarks: number[], voice: boolean) {
  const done = useRef(kmMarks.length); // don't repeat km reached before this screen opened
  useEffect(() => {
    const n = kmMarks.length;
    if (n <= done.current) {
      done.current = n;
      return;
    }
    done.current = n;
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      /* not supported */
    }
    if (!voice || typeof speechSynthesis === 'undefined') return;
    const split = Math.round(kmMarks[n - 1] - (n > 1 ? kmMarks[n - 2] : 0));
    const m = Math.floor(split / 60);
    const sec = split % 60;
    const text = `${n} kilometre${n === 1 ? '' : 's'}. Last kilometre ${m} minute${m === 1 ? '' : 's'}${sec ? ` ${sec} seconds` : ''}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }, [kmMarks, voice]);
}
