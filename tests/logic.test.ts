/**
 * Logic tests for RepUp (no browser needed): progression targets, store
 * actions, migration of old backups, plate maths and helpers.
 * Run with `npm test` (Node 23.6+ runs .ts files natively).
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { platesPerSide } from '../src/lib/plates';
import { compareSet, suggestTarget } from '../src/lib/progression';
import { actions, toWorkoutExercise } from '../src/lib/store';
import { LEGAL_PAGES, MARKETING_PATHS } from '../src/lib/site';
import type { SetEntry } from '../src/lib/types';
import { est1RM, formatVolume, formatW, setUnit, startOfWeek } from '../src/lib/utils';

const S = (weight: number | null, reps: number | null, extra: Partial<SetEntry> = {}): SetEntry => ({
  id: Math.random().toString(36),
  weight,
  reps,
  done: true,
  ...extra,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const state = (): any => JSON.parse(actions.exportJSON());

describe('progression targets', () => {
  test('no history → no target', () => assert.equal(suggestTarget(null, { repMin: 8, repMax: 8 }, 'Barbell'), null));
  test('all sets hit goal → +2.5 kg barbell', () => {
    const r = suggestTarget([S(60, 8), S(60, 8), S(60, 9)], { repMin: 8, repMax: 8 }, 'Barbell')!;
    assert.equal(r.kind, 'increase');
    assert.deepEqual(r.forSet(0), { weight: 62.5, reps: 8 });
  });
  test('dumbbell step is 2 kg', () => assert.equal(suggestTarget([S(20, 12)], { repMin: 12, repMax: 12 }, 'Dumbbell')!.forSet(0).weight, 22));
  test('one set short → same weight, goal reps', () => {
    const r = suggestTarget([S(60, 8), S(60, 7)], { repMin: 8, repMax: 8 }, 'Barbell')!;
    assert.equal(r.kind, 'reps');
    assert.deepEqual(r.forSet(1), { weight: 60, reps: 8 });
  });
  test('warm-up sets ignored', () => {
    assert.equal(suggestTarget([S(20, 5, { warmup: true }), S(60, 8), S(60, 8)], { repMin: 8, repMax: 8 }, 'Barbell')!.kind, 'increase');
  });
  test('bodyweight → +1 rep', () => {
    const r = suggestTarget([S(0, 10), S(0, 8)], { repMin: 10, repMax: 10 }, 'Bodyweight')!;
    assert.equal(r.kind, 'bodyweight');
    assert.deepEqual(r.forSet(1), { weight: 0, reps: 9 });
  });
  test('weighted dips (+10 kg, all 10s) → increase', () => {
    const r = suggestTarget([S(10, 10), S(10, 10)], { repMin: 10, repMax: 10 }, 'Bodyweight')!;
    assert.equal(r.kind, 'increase');
    assert.equal(r.forSet(0).weight, 12.5);
  });
  test('old rep range 8–12 still works', () => {
    assert.deepEqual(suggestTarget([S(50, 9), S(50, 9)], { repMin: 8, repMax: 12 }, 'Machine')!.forSet(0), { weight: 50, reps: 10 });
  });
  test('back-off sets keep their own weight', () => {
    const r = suggestTarget([S(100, 3), S(80, 10), S(80, 9)], { repMin: 10, repMax: 10 }, 'Barbell')!;
    assert.deepEqual(r.forSet(0), { weight: 100, reps: 10 });
    assert.deepEqual(r.forSet(1), { weight: 80, reps: 10 });
  });
  test('back-offs all hit goal → each set goes up', () => {
    const r = suggestTarget([S(100, 10), S(80, 10)], { repMin: 10, repMax: 10 }, 'Barbell')!;
    assert.deepEqual([r.forSet(0).weight, r.forSet(1).weight], [102.5, 82.5]);
  });
  test('lb unit → 5 lb jump', () => {
    setUnit('lb');
    const w = suggestTarget([S(135, 8)], { repMin: 8, repMax: 8 }, 'Barbell')!.forSet(0).weight;
    setUnit('kg');
    assert.equal(w, 140);
  });
  test('compareSet up / down / same', () => {
    assert.equal(compareSet(S(60, 9), S(60, 8)), 'up');
    assert.equal(compareSet(S(57.5, 12), S(60, 8)), 'down');
    assert.equal(compareSet(S(60, 8), S(60, 8)), 'same');
  });
});

describe('helpers', () => {
  test('startOfWeek is Monday 00:00 (incl. Sunday)', () => {
    const d = new Date(startOfWeek(new Date(2026, 10, 15, 22, 0).getTime()));
    assert.equal(d.getDay(), 1);
    assert.equal(d.getDate(), 9);
    assert.equal(d.getHours(), 0);
    assert.equal(new Date(startOfWeek(new Date(2026, 10, 16, 0, 5).getTime())).getDate(), 16);
  });
  test('formatVolume / formatW in kg and lb', () => {
    assert.equal(formatVolume(12500), '12.5t');
    setUnit('lb');
    assert.equal(formatVolume(900), '900 lb');
    assert.equal(formatW(135), '135 lb');
    setUnit('kg');
  });
  test('est1RM', () => {
    assert.equal(est1RM(100, 1), 100);
    assert.ok(Math.abs(est1RM(100, 10) - 133.33) < 0.01);
    assert.equal(est1RM(0, 10), 0);
  });
});

describe('plate calculator', () => {
  const KG = [25, 20, 15, 10, 5, 2.5, 1.25];
  test('72.5 kg = 25 + 1.25 a side', () => assert.deepEqual(platesPerSide(72.5, 20, KG).plates, [25, 1.25]));
  test('100 kg = 25 + 15 a side', () => assert.deepEqual(platesPerSide(100, 20, KG).plates, [25, 15]));
  test('101 kg → closest loadable 100', () => assert.equal(platesPerSide(101, 20, KG).loaded, 100));
  test('225 lb = 45 + 45 a side', () => assert.deepEqual(platesPerSide(225, 45, [45, 35, 25, 10, 5, 2.5]).plates, [45, 45]));
});

describe('store', () => {
  const v2 = {
    version: 2,
    exercises: [
      { id: 'squat', name: 'Squat', muscle: 'Legs', equipment: 'Barbell' },
      { id: 'bench-press', name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell' },
    ],
    routines: [
      { id: 'r1', name: 'Push — Chest', days: [1, 4], items: [{ exerciseId: 'bench-press', sets: 4, repMin: 6, repMax: 10 }] },
      { id: 'r2', name: 'Legs', days: [3], items: [{ exerciseId: 'squat', sets: 3, repMin: 8, repMax: 12 }] },
    ],
    workouts: [
      { id: 'w1', name: 'Legs', routineId: 'r2', startedAt: Date.now() - 86400000, finishedAt: Date.now(), exercises: [{ id: 'e', exerciseId: 'squat', sets: [S(80, 8)] }] },
    ],
    active: null,
    restEndsAt: null,
    restTotal: 0,
    bodyWeights: [],
    settings: { restSeconds: 120, repMin: 8, repMax: 12 },
  };

  test('old (v2) backup migrates to day plans', () => {
    assert.equal(actions.importJSON(JSON.stringify(v2)), true);
    const s = state();
    assert.equal(s.version, 3);
    assert.deepEqual(s.plans.map((p: { day: number }) => p.day), [1, 3, 4]);
    assert.equal(s.plans[0].name, 'Push');
    assert.deepEqual(s.plans[0].items[0], { exerciseId: 'bench-press', sets: 4, reps: 10 });
    assert.equal(s.settings.restSeconds, 120);
    assert.equal(s.settings.unit, 'kg');
    assert.equal(s.onboarded, true);
    assert.equal(s.workouts[0].exercises[0].repMax, 12);
  });
  test('garbage backup rejected, data untouched', () => {
    assert.equal(actions.importJSON('{"hello":1}'), false);
    assert.equal(actions.importJSON('not json'), false);
    assert.equal(state().workouts.length, 1);
  });
  test('start a plan; planned kg pre-fills only the first time', () => {
    actions.startPlan(1);
    assert.equal(state().active.exercises[0].sets.length, 4);
    actions.cancelWorkout();
    actions.savePlan({
      day: 1,
      name: 'Push',
      items: [
        { exerciseId: 'bench-press', sets: 2, reps: 10, weight: 40 },
        { exerciseId: 'squat', sets: 1, reps: 5, weight: 100 },
      ],
    });
    actions.startPlan(1);
    const a = state().active;
    assert.equal(a.exercises[0].sets[0].weight, 40);
    assert.equal(a.exercises[1].sets[0].weight, null);
  });
  test('finish unchanged plan → no plan update; PR detected', () => {
    actions.updateActive((w) => ({
      ...w,
      exercises: w.exercises.map((e) => ({
        ...e,
        sets: e.sets.map((x) => ({ ...x, weight: e.exerciseId === 'squat' ? 90 : 40, reps: e.exerciseId === 'squat' ? 5 : 10, done: true })),
      })),
    }));
    const sum = actions.finishWorkout()!;
    assert.equal(sum.planUpdate, undefined);
    assert.equal(sum.prs.length, 1);
  });
  test('nothing ticked → finish returns null', () => {
    actions.startPlan(1);
    assert.equal(actions.finishWorkout(), null);
    assert.ok(state().active);
    actions.cancelWorkout();
  });
  test('plan update: ignores unticked extra set and never-done new exercise', () => {
    actions.savePlan({ day: 2, name: 'Pull', items: [{ exerciseId: 'squat', sets: 3, reps: 5 }] });
    actions.startPlan(2);
    actions.addToActive(['bench-press']);
    actions.updateActive((w) => ({
      ...w,
      exercises: w.exercises.map((e) =>
        e.exerciseId === 'squat'
          ? { ...e, sets: [...e.sets.map((x) => ({ ...x, weight: 100, reps: 5, done: true })), { id: 'extra', weight: null, reps: null, done: false }] }
          : e,
      ),
    }));
    assert.equal(actions.finishWorkout()!.planUpdate, undefined);
  });
  test('plan update: skipped set keeps plan; ticked extra set grows it', () => {
    actions.startPlan(2);
    actions.updateActive((w) => ({ ...w, exercises: w.exercises.map((e) => ({ ...e, sets: e.sets.map((x, i) => ({ ...x, weight: 100, reps: 5, done: i < 2 })) })) }));
    assert.equal(actions.finishWorkout()!.planUpdate, undefined);
    actions.startPlan(2);
    actions.updateActive((w) => ({
      ...w,
      exercises: w.exercises.map((e) => ({ ...e, sets: [...e.sets, { id: 'x4', weight: 0, reps: 0, done: false }].map((x) => ({ ...x, weight: 100, reps: 5, done: true })) })),
    }));
    assert.equal(actions.finishWorkout()!.planUpdate!.items[0].sets, 4);
  });
  test('edit workout: change reps, drop empty sets; zero sets deletes it', () => {
    const w = state().workouts[0];
    w.exercises[0].sets[0].reps = 99;
    w.exercises[0].sets[1].reps = null;
    actions.updateWorkout(w);
    const u = state().workouts[0];
    assert.equal(u.exercises[0].sets[0].reps, 99);
    assert.equal(u.exercises[0].sets.length, w.exercises[0].sets.length - 1);
    const n = state().workouts.length;
    actions.updateWorkout({ ...u, exercises: [] });
    assert.equal(state().workouts.length, n - 1);
  });
  test('delete + restore workout (Undo)', () => {
    const w = state().workouts[0];
    actions.deleteWorkout(w.id);
    assert.ok(!state().workouts.some((x: { id: string }) => x.id === w.id));
    actions.restoreWorkout(w);
    assert.ok(state().workouts.some((x: { id: string }) => x.id === w.id));
  });
  test('blank workout starts unnamed; finishing without a name uses the time of day', () => {
    actions.startEmptyWorkout();
    assert.equal(state().active.name, '');
    actions.addToActive(['bench-press']);
    actions.updateActive((w) => ({ ...w, exercises: w.exercises.map((e) => ({ ...e, sets: [S(40, 10)] })) }));
    const done = actions.finishWorkout()!;
    assert.match(done.workout.name, /^(Morning|Afternoon|Evening) Workout$/);
    assert.equal(state().workouts[0].name, done.workout.name);
  });
  test('blank workout keeps the name you type (extra spaces trimmed)', () => {
    actions.startEmptyWorkout();
    actions.addToActive(['bench-press']);
    actions.updateActive((w) => ({ ...w, name: '  Chest day ', exercises: w.exercises.map((e) => ({ ...e, sets: [S(40, 10)] })) }));
    assert.equal(actions.finishWorkout()!.workout.name, 'Chest day');
    assert.equal(state().workouts[0].name, 'Chest day');
  });
  test('edit: blank name keeps the old one; a forgotten exercise can be added, empty sets dropped', () => {
    const w = state().workouts[0];
    const added = toWorkoutExercise({ exerciseId: 'squat', sets: 3, reps: 10 });
    added.sets = added.sets.map((x, i) => ({ ...x, done: true, weight: 60, reps: i === 0 ? 8 : null }));
    actions.updateWorkout({ ...w, name: '   ', exercises: [...w.exercises, added] });
    const u = state().workouts.find((x: { id: string }) => x.id === w.id);
    assert.equal(u.name, w.name);
    const squat = u.exercises.find((e: { exerciseId: string }) => e.exerciseId === 'squat');
    assert.equal(squat.sets.length, 1);
    assert.equal(squat.sets[0].reps, 8);
  });
  test('rest day removes the plan; deleting an exercise removes it from plans', () => {
    actions.savePlan({ day: 3, name: '', items: [] });
    assert.ok(!state().plans.some((p: { day: number }) => p.day === 3));
    actions.deleteExercise('squat');
    assert.ok(!state().plans.some((p: { items: { exerciseId: string }[] }) => p.items.some((i) => i.exerciseId === 'squat')));
  });
  test('broken backup pieces are dropped, not crashing', () => {
    const bad = {
      exercises: [{ id: 'squat', name: 'Squat', muscle: 'Legs', equipment: 'Barbell' }, null, { foo: 1 }],
      workouts: [{ id: 'w', startedAt: 1, exercises: [{ exerciseId: 'squat', sets: [S(50, 5), null] }, { nope: 1 }] }, { id: 'bad' }],
      plans: [{ day: 1 }, { day: 9, items: [] }, { day: 2, name: 'Legs', items: [{ exerciseId: 'squat', sets: 3, reps: 5 }, 7] }],
      bodyWeights: [{ id: 'b', date: '2026-11-01', kg: 70 }, { kg: 'x' }],
    };
    assert.equal(actions.importJSON(JSON.stringify(bad)), true);
    const s = state();
    assert.equal(s.exercises.length, 1);
    assert.equal(s.workouts.length, 1);
    assert.equal(s.workouts[0].exercises[0].sets.length, 1);
    assert.deepEqual(s.plans.map((p: { day: number }) => p.day), [2]);
    assert.equal(s.bodyWeights.length, 1);
  });
  test('expired rest timer is not restored', () => {
    const st = state();
    st.restEndsAt = Date.now() - 1000;
    actions.importJSON(JSON.stringify(st));
    assert.equal(state().restEndsAt, null);
  });
  test('reset → fresh state that needs onboarding', () => {
    actions.resetAll();
    const s = state();
    assert.equal(s.onboarded, false);
    assert.equal(s.workouts.length, 0);
    actions.finishOnboarding([]);
    assert.equal(state().plans.length, 0);
  });
});

describe('website routes', () => {
  test('landing and legal pages are public; "/" is handled by the page itself', () => {
    assert.ok(!MARKETING_PATHS.includes('/'));
    for (const p of LEGAL_PAGES) assert.ok(MARKETING_PATHS.includes(p.path));
    assert.ok(MARKETING_PATHS.includes('/workout-log'));
    assert.ok(!MARKETING_PATHS.some((p) => p.startsWith('/login') || p.startsWith('/auth')));
  });
});

describe('running', async () => {
  const core = await import('../src/lib/run/core');
  const { haversine, newTrack, begin, addFix, pause, resume, movingMs, finishRun, estimateCalories, estimateSteps, formatPace, formatDuration, paceSecPerKm, StepDetector, thin } = core;
  // ~0.0001° latitude ≈ 11.1 m
  const LAT = 12.9716, LNG = 77.5946, STEP = 0.0001;
  const fix = (i: number, t: number, acc = 5) => ({ lat: LAT + i * STEP, lng: LNG, acc, t });

  test('haversine: 0.0001° of latitude ≈ 11 m', () => {
    const d = haversine(LAT, LNG, LAT + STEP, LNG);
    assert.ok(d > 10.9 && d < 11.3, String(d));
  });
  test('distance adds up along a straight line; jitter and bad accuracy ignored', () => {
    let s = begin(newTrack('run', 0), 0);
    for (let i = 0; i <= 10; i++) s = addFix(s, fix(i, i * 4000), i * 4000); // 11 m every 4 s ≈ 2.8 m/s
    assert.ok(Math.abs(s.distanceM - 111) < 3, String(s.distanceM));
    const before = s.distanceM;
    s = addFix(s, { lat: LAT + 10 * STEP + 0.00001, lng: LNG, acc: 5, t: 44_000 }, 44_000); // 1 m wobble
    s = addFix(s, fix(20, 48_000, 80), 48_000); // 80 m accuracy: ignored
    assert.equal(s.distanceM, before);
  });
  test('GPS jump (impossible speed) is not counted', () => {
    let s = begin(newTrack('run', 0), 0);
    s = addFix(s, fix(0, 0), 0);
    s = addFix(s, fix(100, 2000), 2000); // 1.1 km in 2 s
    assert.equal(s.distanceM, 0);
  });
  test('no distance across a pause; paused time not counted', () => {
    let s = begin(newTrack('walk', 0), 0);
    s = addFix(s, fix(0, 0), 0);
    s = addFix(s, fix(1, 10_000), 10_000);
    s = pause(s, 10_000);
    s = resume(s, 70_000); // 60 s paused, moved 100 m meanwhile
    s = addFix(s, fix(10, 70_000), 70_000);
    s = addFix(s, fix(11, 80_000), 80_000);
    assert.ok(Math.abs(s.distanceM - 22.2) < 1, String(s.distanceM));
    assert.equal(Math.round(movingMs(s, 80_000) / 1000), 20);
  });
  test('km splits and the saved run', () => {
    let s = begin(newTrack('run', 0), 0);
    for (let i = 0; i <= 200; i++) s = addFix(s, fix(i, i * 4000), i * 4000); // ≈ 2.22 km at ~2.8 m/s
    assert.equal(s.kmMarks.length, 2);
    const run = finishRun(s, 800_000, { id: 'r1', weightKg: 70, sensorSteps: null });
    assert.equal(run.splits!.length, 2);
    assert.ok(run.splits![0] > 300 && run.splits![0] < 400, String(run.splits));
    assert.equal(run.stepsSource, 'estimate');
    assert.equal(run.calories, estimateCalories(run.distanceM, 'run', 70));
    assert.ok(run.route!.length > 10);
  });
  test('calories, steps, pace and time formatting', () => {
    assert.equal(estimateCalories(5000, 'run', 70), 350);
    assert.equal(estimateCalories(5000, 'walk', 70), 175);
    assert.equal(estimateSteps(1000, 'walk'), 1333);
    assert.equal(formatPace(paceSecPerKm(5000, 1800)), `6'00"`);
    assert.equal(formatPace(null), '–');
    assert.equal(formatDuration(3725), '1:02:05');
    assert.equal(formatDuration(65), '1:05');
    assert.equal(thin(Array.from({ length: 5000 }, (_, i) => i), 100).length, 100);
  });
  test('step detector counts rhythmic bounces, not a still phone', () => {
    const d = new StepDetector();
    for (let t = 0; t < 2000; t += 20) d.push(9.81, t);
    assert.equal(d.steps, 0);
    for (let t = 2000; t < 12_000; t += 20) d.push(9.81 + 6 * Math.sin(((t - 2000) / 1000) * 2 * Math.PI * 2), t); // 2 steps/s for 10 s
    assert.ok(d.steps >= 17 && d.steps <= 22, String(d.steps));
  });
  test('store: runs saved, updated, deleted and kept in backups', () => {
    actions.updateSettings({ mode: 'running' });
    actions.addRun({ id: 'run1', kind: 'run', startedAt: 1, finishedAt: 2, durationS: 60, distanceM: 200, steps: 200, calories: 14, source: 'manual' });
    actions.updateRun('run1', { note: 'easy' });
    assert.equal(state().runs[0].note, 'easy');
    assert.equal(state().settings.mode, 'running');
    assert.ok(actions.importJSON(JSON.stringify({ ...state(), runs: [...state().runs, { id: 'bad' }] })));
    assert.equal(state().runs.length, 1);
    actions.deleteRun('run1');
    assert.equal(state().runs.length, 0);
    actions.updateSettings({ mode: 'workout' });
  });
});

describe('GPS smoothing', async () => {
  const { GpsSmoother, SMOOTH_SPEED, newTrack, begin, addFix } = await import('../src/lib/run/core');
  // Seeded random numbers so the test is the same every time.
  let seed = 42;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32) * 2 - 1;
  const M = 1 / 111_111; // degrees per metre (latitude)
  test('standing still with noisy GPS: smoothing removes most fake distance', () => {
    const sm = new GpsSmoother(SMOOTH_SPEED.run);
    let raw = begin(newTrack('run', 0), 0), smooth = raw;
    for (let i = 0; i < 120; i++) {
      const f = { lat: 12.97 + rnd() * 6 * M, lng: 77.59 + rnd() * 6 * M, acc: 8, t: i * 1000 };
      raw = addFix(raw, f, f.t);
      smooth = addFix(smooth, { ...sm.push(f), acc: f.acc }, f.t);
    }
    assert.ok(smooth.distanceM < raw.distanceM / 2, `raw ${raw.distanceM.toFixed(0)} m vs smoothed ${smooth.distanceM.toFixed(0)} m`);
  });
  test('running 1 km with noisy GPS: smoothed distance stays close to the truth', () => {
    const sm = new GpsSmoother(SMOOTH_SPEED.run);
    let smooth = begin(newTrack('run', 0), 0);
    for (let i = 0; i <= 333; i++) {
      // 3 m/s north for 333 s ≈ 1 km, ±5 m noise
      const f = { lat: 12.97 + (i * 3 + rnd() * 5) * M, lng: 77.59 + rnd() * 5 * M, acc: 6, t: i * 1000 };
      smooth = addFix(smooth, { ...sm.push(f), acc: f.acc }, f.t);
    }
    assert.ok(smooth.distanceM > 930 && smooth.distanceM < 1080, String(smooth.distanceM));
  });
});
