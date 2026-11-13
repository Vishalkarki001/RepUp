'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { estimateCalories, estimateSteps, formatPace, paceSecPerKm } from '@/lib/run/core';
import { weightKgForCalories } from '@/lib/run/tracker';
import { actions } from '@/lib/store';
import type { RunKind } from '@/lib/types';
import { todayISO, uid } from '@/lib/utils';
import { DatePicker } from '../DatePicker';
import { Modal } from '../Modal';
import { NumberField } from '../NumberField';

/** Add a run or walk by hand: treadmill, or a run done without the app. */
export function ManualRun({ onClose, initialKind = 'run' }: { onClose: () => void; initialKind?: RunKind }) {
  const [kind, setKind] = useState<RunKind>(initialKind);
  const [date, setDate] = useState(todayISO());
  const [km, setKm] = useState<number | null>(null);
  const [h, setH] = useState<number | null>(null);
  const [m, setM] = useState<number | null>(null);
  const [s, setS] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const durationS = (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0);
  const distanceM = Math.round((km ?? 0) * 1000);
  const valid = distanceM > 0 && distanceM <= 300_000 && durationS > 0 && durationS < 24 * 3600;
  const pace = paceSecPerKm(distanceM, durationS);

  const save = () => {
    if (!valid) return;
    const isToday = date === todayISO();
    const [y, mo, d] = date.split('-').map(Number);
    const startedAt = isToday ? Date.now() - durationS * 1000 : new Date(y, mo - 1, d, 7, 0, 0).getTime();
    actions.addRun({
      id: uid(),
      kind,
      startedAt,
      finishedAt: startedAt + durationS * 1000,
      durationS,
      distanceM,
      steps: estimateSteps(distanceM, kind),
      stepsSource: 'estimate',
      calories: estimateCalories(distanceM, kind, weightKgForCalories()),
      route: [],
      splits: [],
      gapS: 0,
      source: 'manual',
      note: note.trim() || undefined,
    });
    toast.success(`${kind === 'walk' ? 'Walk' : 'Run'} saved`);
    onClose();
  };

  return (
    <Modal
      title="Add a run by hand"
      description="For the treadmill, or a run you did without the app."
      onClose={onClose}
      footer={
        <Button className="h-10 w-full" disabled={!valid} onClick={save}>
          {valid ? `Save ${kind === 'walk' ? 'walk' : 'run'}` : 'Enter distance and time'}
        </Button>
      }
    >
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        className="w-full"
        value={kind}
        onValueChange={(v) => v && setKind(v as RunKind)}
        aria-label="Run or walk"
      >
        <ToggleGroupItem value="run" className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
          🏃 Run
        </ToggleGroupItem>
        <ToggleGroupItem value="walk" className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
          🚶 Walk
        </ToggleGroupItem>
      </ToggleGroup>

      <Field>
        <FieldLabel>Date</FieldLabel>
        <DatePicker value={date} onChange={setDate} />
      </Field>

      <NumberField label="Distance (km)" value={km} onValue={setKm} decimal placeholder="5" />

      <Field>
        <FieldLabel>Time</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Hours" value={h} onValue={setH} placeholder="0" />
          <NumberField label="Minutes" value={m} onValue={(v) => setM(v === null ? null : Math.min(59, v))} placeholder="30" />
          <NumberField label="Seconds" value={s} onValue={(v) => setS(v === null ? null : Math.min(59, v))} placeholder="0" />
        </div>
        {valid && <FieldDescription className="text-xs tabular">Pace {formatPace(pace)} /km</FieldDescription>}
      </Field>

      <Field>
        <FieldLabel htmlFor="manual-run-note">Note (optional)</FieldLabel>
        <Textarea id="manual-run-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Treadmill, incline 2%…" />
      </Field>
    </Modal>
  );
}
