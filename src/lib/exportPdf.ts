'use client';

import { NUTRIENTS, sumMicro } from './food/core';
import { formatDuration, formatKm, formatPace, paceSecPerKm, weatherLabel } from './run/core';
import { MEAL_LABELS, MEALS, type FoodGoal, type FoodLog, type RunEntry, type Workout } from './types';
import { formatDate, formatVolume, formatW, workoutVolume } from './utils';

/**
 * "Download PDF" for a finished workout, a run or walk, and a day of food.
 * Made on the device, so it also works offline. jsPDF is loaded only when
 * someone taps the button.
 */

type Doc = import('jspdf').jsPDF;

const PAGE_W = 595.28; // A4 in points
const PAGE_H = 841.89;
const M = 56; // side margin
const BOTTOM = PAGE_H - 64; // keep clear of the footer

const INK: [number, number, number] = [23, 23, 23];
const MUTED: [number, number, number] = [115, 115, 115];
const LINE: [number, number, number] = [229, 229, 229];
const BRAND: [number, number, number] = [124, 58, 237];

/** The built-in PDF font covers Latin text; anything else would print as junk, so swap it for "?". */
function pdfText(s: string): string {
  return s.replace(/[^ -~ -ÿ–—‘’“”•…]/g, '?').trim();
}

function fileName(w: Workout): string {
  const name = (w.name || 'Workout').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'Workout';
  const d = new Date(w.startedAt);
  const date = `${d.getDate()}-${d.toLocaleString('en-US', { month: 'short' })}-${d.getFullYear()}`;
  return `${name}-${date}.pdf`;
}

/** Builds the PDF (no download yet). Separate so it can be tested. */
export async function buildWorkoutPdf(w: Workout, exerciseName: (id: string) => string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const center = PAGE_W / 2;

  const workingSets = w.exercises.reduce((a, e) => a + e.sets.filter((x) => !x.warmup).length, 0);
  const when =
    formatDate(w.startedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    new Date(w.startedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  // Header: name, date & time, totals.
  let y = M + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...INK);
  const title = doc.splitTextToSize(pdfText(w.name || 'Workout'), PAGE_W - 2 * M) as string[];
  doc.text(title, center, y, { align: 'center' });
  y += title.length * 28;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  doc.text(pdfText(when), center, y, { align: 'center' });
  y += 18;
  const ex = w.exercises.length;
  doc.text(
    pdfText(`${ex} ${ex === 1 ? 'exercise' : 'exercises'} · ${workingSets} ${workingSets === 1 ? 'set' : 'sets'} · ${formatVolume(workoutVolume(w))} lifted`),
    center,
    y,
    { align: 'center' },
  );
  y += 22;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(M, y, PAGE_W - M, y);
  y += 30;

  const newPageIfNeeded = (need: number) => {
    if (y + need > BOTTOM) {
      doc.addPage();
      y = M;
    }
  };

  // Exercises.
  for (const e of w.exercises) {
    const rows = e.sets.length;
    // Keep an exercise's name together with at least its first two sets.
    newPageIfNeeded(22 + Math.min(rows, 2) * 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(pdfText(exerciseName(e.exerciseId)), M, y);
    y += 22;

    let n = 0;
    for (const s of e.sets) {
      newPageIfNeeded(20);
      const label = s.warmup ? 'Warm-up' : `Set ${++n}`;
      const weight = s.weight ?? 0;
      const value = weight > 0 ? `${formatW(weight)} × ${s.reps ?? 0}` : `${s.reps ?? 0} reps`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...MUTED);
      doc.text(label, M + 16, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(pdfText(value), M + 110, y);
      y += 20;
    }
    y += 14;
  }

  // Workout notes, if any.
  if (w.note?.trim()) {
    const lines = doc.splitTextToSize(pdfText(w.note), PAGE_W - 2 * M) as string[];
    newPageIfNeeded(30 + lines.length * 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text('Notes', M, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(lines, M, y);
  }

  footer(doc);
  doc.setProperties({ title: pdfText(`${w.name || 'Workout'} · ${when}`), creator: 'RepUp' });
  return { doc, name: fileName(w) };
}

export async function downloadWorkoutPdf(w: Workout, exerciseName: (id: string) => string): Promise<void> {
  const { doc, name } = await buildWorkoutPdf(w, exerciseName);
  await sharePdf(doc, name);
}

/** Footer on every page: RepUp, the site, page numbers. */
function footer(doc: Doc) {
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.line(M, PAGE_H - 44, PAGE_W - M, PAGE_H - 44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text('RepUp', M, PAGE_H - 28);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('getrepup.vercel.app', M + 34, PAGE_H - 28);
    if (pages > 1) doc.text(`${p} / ${pages}`, PAGE_W - M, PAGE_H - 28, { align: 'right' });
  }
}

const shortDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getDate()}-${d.toLocaleString('en-US', { month: 'short' })}-${d.getFullYear()}`;
};

/** Title, a grey line under it, a divider. Returns the next y. */
function header(doc: Doc, title: string, lines: string[]): number {
  const center = PAGE_W / 2;
  let y = M + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...INK);
  const t = doc.splitTextToSize(pdfText(title), PAGE_W - 2 * M) as string[];
  doc.text(t, center, y, { align: 'center' });
  y += t.length * 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  for (const l of lines) {
    doc.text(pdfText(l), center, y, { align: 'center' });
    y += 18;
  }
  y += 4;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(M, y, PAGE_W - M, y);
  return y + 30;
}

/** Label on the left, value (bold) at `x`. */
function row(doc: Doc, y: number, label: string, value: string, x = M + 150) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  doc.text(pdfText(label), M, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.text(pdfText(value), x, y);
}

/* ---------- run / walk ---------- */

export async function buildRunPdf(run: RunEntry) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const kind = run.kind === 'walk' ? 'Walk' : 'Run';
  const when =
    formatDate(run.startedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    new Date(run.startedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  let y = header(doc, `${formatKm(run.distanceM)} km ${kind.toLowerCase()}`, [when, run.source === 'manual' ? 'Added by hand' : 'Tracked with GPS']);

  const weather = weatherLabel(run.weatherCode);
  const rows: [string, string][] = [
    ['Distance', `${formatKm(run.distanceM)} km`],
    ['Moving time', formatDuration(run.durationS)],
    ['Average pace', `${formatPace(paceSecPerKm(run.distanceM, run.durationS))} /km`],
    ['Calories', `~${run.calories} kcal (estimate)`],
  ];
  if (run.steps !== null) rows.push(['Steps', `${run.stepsSource === 'sensor' ? '' : '~'}${run.steps.toLocaleString('en-IN')}`]);
  if (weather && run.tempC !== null && run.tempC !== undefined) rows.push(['Weather', `${Math.round(run.tempC)}°C, ${weather.text}`]);
  for (const [k, v] of rows) {
    row(doc, y, k, v);
    y += 22;
  }

  // Route: the GPS line drawn to scale in a box (no map tiles in a PDF).
  const route = run.route ?? [];
  if (route.length > 1) {
    y += 10;
    const boxH = 220;
    const boxW = PAGE_W - 2 * M;
    const lats = route.map((p) => p[0]);
    const lngs = route.map((p) => p[1]);
    const cos = Math.cos((((Math.min(...lats) + Math.max(...lats)) / 2) * Math.PI) / 180);
    const w = (Math.max(...lngs) - Math.min(...lngs)) * cos || 1e-6;
    const h = Math.max(...lats) - Math.min(...lats) || 1e-6;
    const scale = Math.min((boxW - 24) / w, (boxH - 24) / h);
    const ox = M + (boxW - w * scale) / 2;
    const oy = y + (boxH - h * scale) / 2;
    const pt = (p: [number, number]) => [ox + (p[1] - Math.min(...lngs)) * cos * scale, oy + (Math.max(...lats) - p[0]) * scale] as const;
    doc.setDrawColor(...LINE);
    doc.roundedRect(M, y, boxW, boxH, 8, 8);
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(2.5);
    for (let i = 1; i < route.length; i++) {
      const [x1, y1] = pt(route[i - 1]);
      const [x2, y2] = pt(route[i]);
      doc.line(x1, y1, x2, y2);
    }
    doc.setLineWidth(1);
    const [sx, sy] = pt(route[0]);
    const [ex, ey] = pt(route[route.length - 1]);
    doc.setFillColor(22, 163, 74);
    doc.circle(sx, sy, 4, 'F');
    doc.setFillColor(...INK);
    doc.circle(ex, ey, 4, 'F');
    y += boxH + 30;
  }

  const splits = run.splits ?? [];
  if (splits.length) {
    if (y + 40 > BOTTOM) {
      doc.addPage();
      y = M;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text('Splits', M, y);
    y += 22;
    const fastest = Math.min(...splits);
    splits.forEach((s, i) => {
      if (y + 20 > BOTTOM) {
        doc.addPage();
        y = M;
      }
      row(doc, y, `Km ${i + 1}`, `${formatPace(s)} /km${s === fastest && splits.length > 1 ? '  (fastest)' : ''}`, M + 110);
      y += 20;
    });
    y += 10;
  }

  if (run.note?.trim()) {
    const lines = doc.splitTextToSize(pdfText(run.note), PAGE_W - 2 * M) as string[];
    if (y + 30 + lines.length * 16 > BOTTOM) {
      doc.addPage();
      y = M;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text('Notes', M, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(lines, M, y);
  }

  footer(doc);
  doc.setProperties({ title: pdfText(`${kind} · ${when}`), creator: 'RepUp' });
  return { doc, name: `${kind}-${formatKm(run.distanceM)}km-${shortDate(run.startedAt)}.pdf` };
}

export async function downloadRunPdf(run: RunEntry): Promise<void> {
  const { doc, name } = await buildRunPdf(run);
  await sharePdf(doc, name);
}

/* ---------- a day of food ---------- */

export async function buildFoodPdf(date: string, logs: FoodLog[], goal: FoodGoal | null, waterGlasses = 0) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const [yy, mm, dd] = date.split('-').map(Number);
  const ts = new Date(yy, mm - 1, dd).getTime();
  const total = logs.reduce((a, l) => ({ kcal: a.kcal + l.kcal, p: a.p + l.protein, c: a.c + l.carbs, f: a.f + l.fat }), { kcal: 0, p: 0, c: 0, f: 0 });
  const r = Math.round;
  const lines = [
    formatDate(ts, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    goal && goal.protein > 0
      ? `${r(total.kcal).toLocaleString('en-IN')} of ${goal.kcal.toLocaleString('en-IN')} kcal · Protein ${r(total.p)}/${goal.protein} g · Carbs ${r(total.c)}/${goal.carbs} g · Fat ${r(total.f)}/${goal.fat} g`
      : `${r(total.kcal).toLocaleString('en-IN')}${goal ? ` of ${goal.kcal.toLocaleString('en-IN')}` : ''} kcal · Protein ${r(total.p)} g · Carbs ${r(total.c)} g · Fat ${r(total.f)} g`,
  ];
  if (waterGlasses) lines.push(`Water: ${waterGlasses} ${waterGlasses === 1 ? 'glass' : 'glasses'} (${(waterGlasses * 0.25).toFixed(2).replace(/0$/, '')} L)`);
  let y = header(doc, 'Food diary', lines);

  const KCAL_X = PAGE_W - M;
  const MACRO_X = PAGE_W - M - 70;
  for (const meal of MEALS) {
    const list = logs.filter((l) => l.meal === meal);
    if (!list.length) continue;
    if (y + 22 + Math.min(list.length, 2) * 34 > BOTTOM) {
      doc.addPage();
      y = M;
    }
    const kcal = list.reduce((a, l) => a + l.kcal, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(MEAL_LABELS[meal], M, y);
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(`${r(kcal).toLocaleString('en-IN')} kcal`, KCAL_X, y, { align: 'right' });
    y += 22;
    for (const l of list) {
      if (y + 34 > BOTTOM) {
        doc.addPage();
        y = M;
      }
      const amount = l.source === 'quick' ? 'Quick add' : `${+l.amount.toFixed(2)} ${l.unit}${l.unit === 'g' || l.unit === 'ml' ? '' : ` (${r(l.grams)} g)`}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      const name = doc.splitTextToSize(pdfText(l.name), MACRO_X - M - 140)[0] as string;
      doc.text(name, M + 12, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`${r(l.kcal)}`, KCAL_X, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(pdfText(amount), M + 12, y + 14);
      doc.text(`P ${r(l.protein)} · C ${r(l.carbs)} · F ${r(l.fat)}`, KCAL_X, y + 14, { align: 'right' });
      y += 34;
    }
    y += 12;
  }
  if (!logs.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...MUTED);
    doc.text('Nothing logged on this day.', PAGE_W / 2, y, { align: 'center' });
  }

  // Other nutrients (two columns), for the foods that have them.
  const { total: micro } = sumMicro(logs);
  const rows = NUTRIENTS.filter((n) => micro[n.key] !== undefined);
  if (rows.length) {
    const lines = Math.ceil(rows.length / 2);
    if (y + 30 + lines * 18 > BOTTOM) {
      doc.addPage();
      y = M;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text('Other nutrients', M, y);
    y += 20;
    const colW = (PAGE_W - 2 * M) / 2;
    rows.forEach((n, i) => {
      const x = M + (i % 2) * colW;
      const yy = y + Math.floor(i / 2) * 18;
      const v = micro[n.key]!;
      const value = `${v >= 10 || n.unit === 'µg' ? r(v).toLocaleString('en-IN') : Math.round(v * 10) / 10} ${n.unit}${n.dv ? `  (${r((v / n.dv) * 100)}% DV)` : ''}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...MUTED);
      doc.text(n.label, x, yy);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(pdfText(value), x + colW - 12, yy, { align: 'right' });
    });
    y += lines * 18 + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('From the foods that have this data. % DV: US FDA Daily Value, 2,000 kcal diet.', M, y);
  }

  footer(doc);
  doc.setProperties({ title: `Food diary · ${date}`, creator: 'RepUp' });
  return { doc, name: `Food-${shortDate(ts)}.pdf` };
}

export async function downloadFoodPdf(date: string, logs: FoodLog[], goal: FoodGoal | null, waterGlasses = 0): Promise<void> {
  const { doc, name } = await buildFoodPdf(date, logs, goal, waterGlasses);
  await sharePdf(doc, name);
}

async function sharePdf(doc: Doc, name: string): Promise<void> {
  // Phones: the share sheet lets people save it or send it on WhatsApp. Elsewhere: a normal download.
  const file = new File([doc.output('blob')], name, { type: 'application/pdf' });
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // closed the share sheet
    }
  }
  doc.save(name);
}
