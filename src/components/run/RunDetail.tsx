'use client';

import { useState } from 'react';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { downloadRunPdf } from '@/lib/exportPdf';
import { formatDuration, formatKm, formatPace, paceSecPerKm, weatherLabel } from '@/lib/run/core';
import { actions } from '@/lib/store';
import type { RunEntry } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import { SectionTitle, Stat, StatGrid } from '../common';
import { confirmDialog } from '../Confirm';
import { Modal } from '../Modal';
import { RouteMap } from './RouteMap';
import { kindLabel } from './RunParts';

/** A saved run: numbers, map, km splits, note. Also used as the "run saved" summary. */
export function RunDetail({ run, onClose, justSaved = false }: { run: RunEntry; onClose: () => void; justSaved?: boolean }) {
  const [note, setNote] = useState(run.note ?? '');
  const [exporting, setExporting] = useState(false);
  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadRunPdf({ ...run, note: note.trim() || undefined });
    } catch {
      toast.error('Couldn’t make the PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  const pace = paceSecPerKm(run.distanceM, run.durationS);
  const weather = weatherLabel(run.weatherCode);
  const splits = run.splits ?? [];
  const fastest = splits.length > 1 ? Math.min(...splits) : null;
  const when = `${formatDate(run.startedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${new Date(run.startedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;

  const saveNote = () => {
    const clean = note.trim();
    if (clean !== (run.note ?? '')) actions.updateRun(run.id, { note: clean || undefined });
  };

  const remove = async () => {
    const ok = await confirmDialog({
      title: `Delete this ${kindLabel(run.kind).toLowerCase()}?`,
      message: `${formatKm(run.distanceM)} km on ${formatDate(run.startedAt)}.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    actions.deleteRun(run.id);
    onClose();
    toast(`${kindLabel(run.kind)} deleted`, { duration: 6000, action: { label: 'Undo', onClick: () => actions.addRun(run) } });
  };

  return (
    <Modal
      title={justSaved ? `🎉 ${kindLabel(run.kind)} saved` : `${formatKm(run.distanceM)} km ${kindLabel(run.kind).toLowerCase()}`}
      description={when}
      onClose={() => {
        saveNote();
        onClose();
      }}
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" className="h-10 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={remove}>
            <Trash2 /> Delete
          </Button>
          <Button variant="outline" className="h-10" disabled={exporting} onClick={exportPdf} aria-label="Download PDF">
            {exporting ? <Loader2 className="animate-spin" /> : <Download />} PDF
          </Button>
          <Button
            className="h-10 flex-1"
            onClick={() => {
              saveNote();
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      }
    >
      <StatGrid cols={4}>
        <Stat value={`${formatKm(run.distanceM)} km`} label="distance" />
        <Stat value={formatDuration(run.durationS)} label="moving time" />
        <Stat value={formatPace(pace)} label="avg pace /km" />
        <Stat value={`~${run.calories}`} label="kcal (estimate)" />
      </StatGrid>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {run.steps !== null && (
          <span>
            👣 {run.stepsSource === 'sensor' ? '' : '~'}
            {run.steps.toLocaleString('en-IN')} steps
          </span>
        )}
        {weather && run.tempC !== null && run.tempC !== undefined && (
          <span>
            {weather.emoji} {Math.round(run.tempC)}°C · {weather.text}
          </span>
        )}
        {run.source === 'manual' && <span>✍️ Added by hand</span>}
      </div>

      {run.route && run.route.length > 1 && <RouteMap route={run.route} />}

      {(run.gapS ?? 0) >= 30 && (
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
          GPS stopped for {formatDuration(run.gapS ?? 0)} (screen off or app closed). That part is counted as a straight line, so the
          real distance may be a little longer.
        </p>
      )}

      {splits.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>Splits</SectionTitle>
          <ol className="flex flex-col divide-y rounded-lg border">
            {splits.map((s, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm tabular">
                <span className="w-12 text-muted-foreground">Km {i + 1}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className={cn('block h-full rounded-full bg-primary', s === fastest && 'bg-success')}
                    style={{ width: `${Math.max(12, Math.min(100, ((fastest ?? s) / s) * 100))}%` }}
                  />
                </span>
                <span className={cn('w-14 text-right font-semibold', s === fastest && 'text-success')}>{formatPace(s)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="run-note" className="text-sm font-medium">
          Note
        </label>
        <Textarea
          id="run-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          placeholder="How did it feel? Route, shoes…"
        />
      </div>
    </Modal>
  );
}
