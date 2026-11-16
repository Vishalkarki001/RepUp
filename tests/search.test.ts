/** Forgiving search for exercises (and foods): typos, partial words, no spaces, gym shorthand. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { DEFAULT_EXERCISES } from '../src/lib/data/defaults';
import { editDistance, search, searchText } from '../src/lib/search';

const names = (q: string, n = 3) => search(DEFAULT_EXERCISES, q, (e) => searchText(e.name), n).map((e) => e.name);
const first = (q: string) => names(q, 1)[0];

describe('exercise search', () => {
  test('exact and start of a word', () => {
    assert.equal(first('bench press'), 'Bench Press');
    assert.equal(first('squ'), 'Squat');
    assert.ok(names('curl', 10).includes('Hammer Curl'));
  });
  test('inside a word', () => assert.ok(names('down', 5).includes('Lat Pulldown')));
  test('typos', () => {
    assert.equal(first('benhc press'), 'Bench Press');
    assert.equal(first('dedlift'), 'Deadlift');
    assert.ok(names('latteral raise', 3).includes('Lateral Raise'));
    assert.ok(names('romanain deadlift', 2).includes('Romanian Deadlift'));
  });
  test('spaces typed differently', () => {
    assert.equal(first('pushup'), 'Push Up');
    assert.equal(first('pullup'), 'Pull Up');
    assert.ok(names('legpress', 2).includes('Leg Press'));
  });
  test('gym shorthand', () => {
    assert.equal(first('ohp'), 'Overhead Press');
    assert.equal(first('rdl'), 'Romanian Deadlift');
    assert.ok(names('db press', 3).some((n) => n.startsWith('Dumbbell')));
    assert.ok(names('kb swing', 1).includes('Kettlebell Swing'));
  });
  test('letters in order', () => assert.ok(names('inclnbnchprs', 3).includes('Incline Bench Press')));
  test('a single letter works (start of words)', () => assert.ok(names('h', 50).includes('Hammer Curl')));
  test('nothing for gibberish', () => assert.deepEqual(names('zzqxv'), []));
  test('a typo needs the right first letter ("land" is not "and")', () => assert.deepEqual(names('land'), []));
});

test('edit distance counts a swap as one', () => {
  assert.equal(editDistance('benhc', 'bench'), 1);
  assert.equal(editDistance('squat', 'squat'), 0);
  assert.equal(editDistance('abc', 'xyz', 1), 2);
});

describe('shared exercises in the store', () => {
  test('adding one keeps its shared id, as your own (editable) exercise', async () => {
    const { actions, getState } = await import('../src/lib/store');
    actions.resetAll();
    const e = actions.addSharedExercise({ id: 'shared-abc', name: ' Landmine Press ', muscle: 'Shoulders', equipment: 'Barbell' });
    assert.deepEqual(e, { id: 'shared-abc', name: 'Landmine Press', muscle: 'Shoulders', equipment: 'Barbell', custom: true });
    assert.ok(getState().exercises.some((x) => x.id === 'shared-abc'));
  });
  test('no duplicates: same id or same name returns the one you have', async () => {
    const { actions, getState } = await import('../src/lib/store');
    const before = getState().exercises.length;
    assert.equal(actions.addSharedExercise({ id: 'shared-abc', name: 'Landmine Press', muscle: 'Shoulders', equipment: 'Barbell' }).id, 'shared-abc');
    assert.equal(actions.addSharedExercise({ id: 'shared-xyz', name: 'landmine press', muscle: 'Shoulders', equipment: 'Barbell' }).id, 'shared-abc');
    assert.equal(actions.addSharedExercise({ id: 'shared-b', name: 'bench press', muscle: 'Chest', equipment: 'Barbell' }).id, 'bench-press');
    assert.equal(getState().exercises.length, before);
  });
  test('it syncs like any exercise you made', async () => {
    const { getState } = await import('../src/lib/store');
    const { __syncInternals: S } = await import('../src/lib/sync');
    const row = S.rowsFromState(getState(), 'u').exercises.get('shared-abc');
    assert.equal(row?.name, 'Landmine Press');
    assert.equal(row?.custom, true);
  });
});
