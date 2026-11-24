/**
 * Share cards: what goes on the picture of a workout or a run.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { cardForRun, cardForWorkout } from '../src/lib/shareCard';
import type { RunEntry, Workout } from '../src/lib/types';

const at = (iso: string) => new Date(iso).getTime();

const workout: Workout = {
  id: 'w1',
  name: 'Push',
  startedAt: at('2026-11-23T18:00:00'),
  finishedAt: at('2026-11-23T19:00:00'),
  exercises: [
    { id: 'e1', exerciseId: 'bench-press', repMin: 8, repMax: 8, sets: [1, 2, 3].map((i) => ({ id: `s${i}`, weight: 60, reps: 8, done: true })) },
    { id: 'e2', exerciseId: 'lateral-raise', repMin: 12, repMax: 12, sets: [1, 2].map((i) => ({ id: `t${i}`, weight: 8, reps: 12, done: true })) },
  ],
};
const names: Record<string, string> = { 'bench-press': 'Bench Press', 'lateral-raise': 'Lateral Raise', 'pull-up': 'Pull Up' };

describe('cardForWorkout', () => {
  test('name, day and the three numbers', () => {
    const c = cardForWorkout(workout, [], (id) => names[id]);
    assert.equal(c.title, 'Push');
    assert.match(c.kicker, /Monday, 23 November/);
    assert.deepEqual(c.stats, [
      { value: '2', label: 'exercises' },
      { value: '5', label: 'sets' },
      { value: '1,632 kg', label: 'lifted' }, // 3 × 60 × 8 + 2 × 8 × 12
    ]);
    assert.deepEqual(c.lines, [
      { name: 'Bench Press', value: '60 kg × 8', best: false },
      { name: 'Lateral Raise', value: '8 kg × 12', best: false },
    ]);
    assert.equal(c.bestsNote, undefined);
    assert.equal(c.route, undefined);
  });

  test('personal bests are marked and counted per exercise', () => {
    const c = cardForWorkout(
      workout,
      [
        { exerciseId: 'bench-press', weight: 60, reps: 8 },
        { exerciseId: 'bench-press', weight: 55, reps: 10 },
      ],
      (id) => names[id],
    );
    assert.equal(c.lines?.[0].best, true);
    assert.equal(c.lines?.[1].best, false);
    assert.equal(c.bestsNote, '1 new personal best');
  });

  test('best set: heaviest, bodyweight as reps, unfinished sets ignored; long workouts say how many more', () => {
    const many: Workout = {
      ...workout,
      exercises: [
        { id: 'a', exerciseId: 'bench-press', repMin: 8, repMax: 8, sets: [
          { id: '1', weight: 60, reps: 8, done: true }, { id: '2', weight: 65, reps: 5, done: true }, { id: '3', weight: 80, reps: 5, done: false },
        ] },
        { id: 'b', exerciseId: 'pull-up', repMin: 8, repMax: 8, sets: [{ id: '4', weight: 0, reps: 10, done: true }] },
        ...Array.from({ length: 6 }, (_, i) => ({ id: `x${i}`, exerciseId: 'lateral-raise', repMin: 12, repMax: 12, sets: [{ id: `y${i}`, weight: 8, reps: 12, done: true }] })),
      ],
    };
    const c = cardForWorkout(many, [], (id) => names[id]);
    assert.equal(c.lines?.[0].value, '65 kg × 5');
    assert.equal(c.lines?.[1].value, '10 reps');
    assert.equal(c.lines?.length, 6);
    assert.equal(c.more, '+2 more exercises');
  });

  test('an unnamed workout is just "Workout"; one exercise reads "exercise"', () => {
    const c = cardForWorkout({ ...workout, name: ' ', exercises: workout.exercises.slice(0, 1) }, [], (id) => names[id]);
    assert.equal(c.title, 'Workout');
    assert.equal(c.stats[0].label, 'exercise');
  });
});

const run: RunEntry = {
  id: 'r1',
  kind: 'run',
  startedAt: at('2026-11-23T06:30:00'),
  finishedAt: at('2026-11-23T07:00:00'),
  durationS: 1720,
  distanceM: 5200,
  steps: 6100,
  stepsSource: 'sensor',
  calories: 320,
  route: [
    [28.53, 77.39],
    [28.54, 77.4],
  ],
  source: 'gps',
};

describe('cardForRun', () => {
  test('morning run: distance big, then time, pace and steps, with the route shape', () => {
    const c = cardForRun(run);
    assert.equal(c.title, 'Morning run');
    assert.deepEqual(c.big, { value: '5.20', unit: 'km' });
    assert.deepEqual(
      c.stats.map((s) => s.label),
      ['time', 'pace /km', 'steps'],
    );
    assert.equal(c.stats[2].value, '6,100');
    assert.equal(c.route?.length, 2);
  });

  test('evening walk without steps or route shows kcal and no route', () => {
    const c = cardForRun({ ...run, kind: 'walk', startedAt: at('2026-11-23T19:15:00'), steps: null, route: [] });
    assert.equal(c.title, 'Evening walk');
    assert.deepEqual(c.stats[2], { value: '~320', label: 'kcal' });
    assert.equal(c.route, undefined);
  });
});
