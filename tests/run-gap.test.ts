/** Screen turned off mid-run: GPS and the step sensor stop; the gap is joined and its steps are estimated. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addFix, begin, estimateSteps, finishRun, newTrack } from '../src/lib/run/core';

const LAT = 12.9716, LNG = 77.5946;
const north = (m: number) => LAT + m / 111_320;

test('a 2-minute screen-off gap: straight-line distance is kept and counted as a gap', () => {
  let s = begin(newTrack('run', 0), 0);
  // 30 s of running, a fix every 5 s, ~3 m/s
  for (let i = 0; i <= 6; i++) s = addFix(s, { lat: north(i * 15), lng: LNG, acc: 5, t: i * 5000 }, i * 5000);
  const before = s.distanceM;
  assert.equal(s.gapM, 0);
  // screen off for 120 s, then the next fix is 400 m further on
  s = addFix(s, { lat: north(90 + 400), lng: LNG, acc: 5, t: 150_000 }, 150_000);
  assert.ok(Math.abs(s.distanceM - before - 400) < 2, `distance ${s.distanceM - before}`);
  assert.ok(Math.abs((s.gapM ?? 0) - 400) < 2, `gapM ${s.gapM}`);
  assert.ok(s.gapS >= 119, `gapS ${s.gapS}`);
  assert.equal(estimateSteps(s.gapM ?? 0, 'run'), 400);
});

test('steps are saved as an estimate only when some were filled in', () => {
  let s = begin(newTrack('run', 0), 0);
  s = addFix(s, { lat: LAT, lng: LNG, acc: 5, t: 0 }, 0);
  s = addFix(s, { lat: north(20), lng: LNG, acc: 5, t: 5000 }, 5000);
  const clean = finishRun({ ...s, steps: 25 }, 10_000, { id: 'a', weightKg: 70, sensorSteps: 25 });
  assert.equal(clean.stepsSource, 'sensor');
  s = addFix(s, { lat: north(320), lng: LNG, acc: 5, t: 120_000 }, 120_000);
  // weak GPS with the screen on: the sensor kept counting, so steps stay exact
  assert.equal(finishRun({ ...s, steps: 325 }, 121_000, { id: 'w', weightKg: 70, sensorSteps: 325 }).stepsSource, 'sensor');
  // screen off: some steps were filled in by estimate
  const gappy = finishRun({ ...s, steps: 325, stepsGuessed: 300 }, 121_000, { id: 'b', weightKg: 70, sensorSteps: 325 });
  assert.equal(gappy.steps, 325);
  assert.equal(gappy.stepsSource, 'estimate');
});

/* ---------- "did you keep moving?" ---------- */
import { applyGap, gapFill, movingMs, type Gap } from '../src/lib/run/core';

/** 5 minutes at 5:00 /km (3.33 m/s) and 170 steps a minute, then 4 minutes with the screen off. */
function runThenGap(restored = false) {
  let s = begin(newTrack('run', 0), 0);
  for (let i = 0; i <= 60; i++) s = addFix(s, { lat: north(i * 16.67), lng: LNG, acc: 5, t: i * 5000 }, i * 5000);
  s = { ...s, steps: 850 };
  const gap: Gap = { from: 300_000, to: 540_000, fromFix: s.lastFix, speed: 1000 / 300, cadence: 170, restored };
  return { s, gap };
}

test('kept running: pace × time and rhythm × time fill the gap', () => {
  const { s, gap } = runThenGap();
  const back = { lat: north(1000 + 300), lng: LNG, acc: 5, t: 540_000 }; // a loop: only 300 m away in a straight line
  const f = gapFill(gap, 'moving', 'run', back);
  assert.equal(Math.round(f.distanceM), 800); // 240 s × 3.33 m/s, more than the straight line
  assert.equal(f.steps, 680); // 170 a minute × 4 minutes
  const { track, addSteps } = applyGap(s, gap, 'moving', back, 540_000);
  assert.equal(addSteps, 680);
  assert.ok(Math.abs(track.distanceM - s.distanceM - 800) < 1);
  assert.equal(movingMs(track, 540_000), movingMs(s, 540_000)); // the time stays in
  assert.equal(track.kmMarks.length, 1); // 1 km reached inside the gap…
  assert.ok(track.kmMarks[0] > 300 && track.kmMarks[0] < 540, String(track.kmMarks[0])); // …at a time inside it
});

test('stopped: straight line only, and the gap is taken out of the time', () => {
  const { s, gap } = runThenGap();
  const back = { lat: north(1000 + 20), lng: LNG, acc: 5, t: 540_000 };
  const { track, addSteps } = applyGap(s, gap, 'stopped', back, 540_000);
  assert.ok(Math.abs(track.distanceM - s.distanceM - 20) < 1);
  assert.equal(addSteps, 20);
  assert.equal(Math.round(movingMs(track, 540_000) / 1000), 300); // 9 minutes on the clock → 5 minutes moving
});

test('never faster than a person can run, even with a bad pace reading', () => {
  const { gap } = runThenGap();
  assert.ok(gapFill({ ...gap, speed: 50 }, 'moving', 'run', null).distanceM <= 9 * 240);
});

test('app was closed (run came back paused): "kept running" adds the time back', () => {
  const { s, gap } = runThenGap(true);
  const paused = { ...s, status: 'paused' as const, activeMs: 300_000, resumedAt: null };
  const { track } = applyGap(paused, gap, 'moving', null, 540_000);
  assert.equal(track.activeMs, 540_000);
  const { track: rested } = applyGap(paused, gap, 'stopped', null, 540_000);
  assert.equal(rested.activeMs, 300_000);
});

test('gap right after starting (15 steps in): typical rhythm fills it, ~1,000 steps for 9 minutes of walking', () => {
  const gap: Gap = { from: 10_000, to: 10_000 + 9 * 60_000, fromFix: null, speed: null, cadence: null };
  const f = gapFill(gap, 'moving', 'walk', null);
  assert.equal(f.steps, 990);
  assert.ok(Math.abs(f.distanceM - 1.35 * 540) < 1);
});
