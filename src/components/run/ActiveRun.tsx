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
  MAX_ACCURACY_M,
  movingMs,
  paceSecPerKm,
  weatherLabel,
} from '@/lib/run/core';
import { discardRun, finishRun, pauseRun, resumeRun, startNow, useRun, weightKgForCalories } from '@/lib/run/tracker';
import type { RunEntry } from '@/lib/types';
import { cn, useNow, useWakeLock } from '@/lib/utils';
import { confirmDialog } from '../Confirm';
import { kindLabel } from './RunParts';

/** The live run screen: big timer and numbers, pause / lock / finish. */
export function ActiveRun({ onFinished }: { onFinished: (run: RunEntry) => void }) {
  const { track, problem, motion } = useRun();
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
        <Big value={`${motion ? '' : '~'}${steps.toLocaleString('en-IN')}`} label={motion ? 'steps' : 'steps (estimate)'} />
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
      <p className="text-center text-xs text-muted-foreground">Keep the screen on and RepUp open. Phone in your hand or an armband.</p>

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
        <Button size="lg" variant="outline" className="h-14 px-5" onClick={() => setLocked(true)} aria-label="Lock the screen against touches">
          <Lock />
        </Button>
      </div>
      <Button size="lg" variant="destructive" className="h-12 text-base" onClick={finish}>
        <Square className="fill-current" /> Finish
      </Button>
      <Button variant="ghost" size="sm" className="self-center text-muted-foreground" onClick={discard}>
        Discard
      </Button>

      {locked && <LockOverlay time={formatDuration(seconds)} km={formatKm(track.distanceM)} onUnlock={() => setLocked(false)} />}
    </div>
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

/** Covers the screen so pocket / sweaty touches do nothing. Hold the button to unlock. */
function LockOverlay({ time, km, onUnlock }: { time: string; km: string; onUnlock: () => void }) {
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
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-background/95 px-6 backdrop-blur" role="dialog" aria-label="Screen locked">
      <p className="text-6xl font-semibold tabular">{time}</p>
      <p className="text-2xl font-semibold text-muted-foreground tabular">{km} km</p>
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        className="relative mt-6 flex size-24 select-none items-center justify-center overflow-hidden rounded-full border-2 border-primary text-primary [-webkit-touch-callout:none]"
        aria-label="Hold to unlock"
      >
        <span
          className="absolute inset-x-0 bottom-0 bg-primary/25 transition-[height] ease-linear"
          style={{ height: holding ? '100%' : '0%', transitionDuration: holding ? '1000ms' : '150ms' }}
        />
        <Unlock className="relative size-8" />
      </button>
      <p className="text-sm text-muted-foreground">Hold to unlock</p>
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
