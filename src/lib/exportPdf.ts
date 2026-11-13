'use client';

import type { Workout } from './types';
import { formatDate, formatVolume, formatW, workoutVolume } from './utils';

/**
 * "Download PDF" for one finished workout: name and date on top, then every
 * exercise with its sets (weight × reps). Made on the device, so it also works
 * offline. jsPDF is loaded only when someone taps the button.
 */

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

  // Footer on every page.
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

  doc.setProperties({ title: pdfText(`${w.name || 'Workout'} · ${when}`), creator: 'RepUp' });
  return { doc, name: fileName(w) };
}

export async function downloadWorkoutPdf(w: Workout, exerciseName: (id: string) => string): Promise<void> {
  const { doc, name } = await buildWorkoutPdf(w, exerciseName);

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
