/** Reminders: settings, time zones, what's due when, and the notification words. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { anyOn, cleanPrefs, DEFAULT_PREFS, dueReminders, localDayStartUtc, localNow, reminderMessage } from '../src/lib/reminders';

// 14:40 in India (UTC+5:30) on Monday 16 Nov 2026 = 09:10 UTC
const AT = (h: number, m: number) => new Date(Date.UTC(2026, 10, 16, h, m) - 330 * 60000);

describe('settings', () => {
  test('anything broken falls back to the defaults', () => {
    assert.deepEqual(cleanPrefs(null), DEFAULT_PREFS);
    assert.deepEqual(cleanPrefs({ lunch: { on: 'yes', time: '25:99' }, workout: { on: true, days: [9, -1] } }).lunch, DEFAULT_PREFS.lunch);
    assert.deepEqual(cleanPrefs({ workout: { on: true, days: [9] } }).workout.days, DEFAULT_PREFS.workout.days);
  });
  test('good values are kept (days de-duplicated and sorted)', () => {
    const p = cleanPrefs({ workout: { on: true, time: '07:15', days: [5, 1, 1] }, weight: { on: true, day: 6, time: '09:00' } });
    assert.deepEqual(p.workout, { on: true, time: '07:15', days: [1, 5] });
    assert.deepEqual(p.weight, { on: true, time: '09:00', day: 6 });
    assert.equal(anyOn(p), true);
    // The Sunday report is on unless someone turns it off.
    assert.equal(anyOn(DEFAULT_PREFS), true);
    assert.equal(anyOn(cleanPrefs({ weekly: { on: false } })), false);
  });
});

describe('time zones', () => {
  test('local date, weekday and time in India', () => assert.deepEqual(localNow(AT(14, 40), 'Asia/Kolkata'), { date: '2026-11-16', weekday: 1, minutes: 880 }));
  test('the same instant elsewhere', () => assert.equal(localNow(AT(14, 40), 'Europe/London').minutes, 9 * 60 + 10));
  test('unknown zone → India', () => assert.equal(localNow(AT(14, 40), 'Mars/Base').minutes, 880));
  test('start of the local day', () => assert.equal(localDayStartUtc(AT(14, 40), 'Asia/Kolkata').toISOString(), '2026-11-15T18:30:00.000Z'));
});

describe('what is due', () => {
  const p = cleanPrefs({ lunch: { on: true, time: '14:30' }, workout: { on: true, time: '14:30', days: [1, 3] }, water: { on: true }, run: { on: true, time: '14:30', days: [2] } });
  const due = (h: number, m: number, sent: string[] = []) => dueReminders(p, localNow(AT(h, m), 'Asia/Kolkata'), new Set(sent)).map((d) => d.key);
  test('due from its time for 30 minutes', () => {
    assert.deepEqual(due(14, 29), []);
    assert.deepEqual(due(14, 30), ['workout', 'lunch']);
    assert.deepEqual(due(14, 59), ['workout', 'lunch']);
    assert.deepEqual(due(15, 0).filter((k) => k !== 'water-2'), []);
  });
  test('only on chosen days (run is Tuesdays: not today, Monday)', () => assert.ok(!due(14, 35).includes('run')));
  test('once a day: already sent → not again', () => assert.deepEqual(due(14, 35, ['lunch', 'workout']), []));
  test('water at 11, 3 and 7, each once', () => {
    assert.deepEqual(due(11, 5), ['water-1']);
    assert.deepEqual(due(15, 10), ['water-2']);
    assert.deepEqual(due(19, 0), ['water-3']);
  });
  test('switched off → never', () => assert.deepEqual(dueReminders(DEFAULT_PREFS, localNow(AT(14, 30), 'Asia/Kolkata'), new Set()), []));
});

describe('the notifications', () => {
  test('workout names the plan and its exercises', () => {
    const m = reminderMessage('workout', { planName: 'Push', exercises: ['Bench Press', 'Overhead Press', 'Chest Dip', 'Lateral Raise'] });
    assert.equal(m.title, 'Push day today 💪');
    assert.equal(m.body, 'Bench Press, Overhead Press, Chest Dip +1. Beat last time!');
    assert.equal(m.url, '/?open=workout');
  });
  test('meals show calories left (or over)', () => {
    assert.match(reminderMessage('lunch', { kcalEaten: 560, kcalTarget: 1800 }).body, /^1,240 kcal left today/);
    assert.match(reminderMessage('dinner', { kcalEaten: 2000, kcalTarget: 1800 }).body, /^200 kcal over today/);
    assert.equal(reminderMessage('lunch').url, '/?open=food&meal=lunch');
  });
  test('water and run use your numbers', () => {
    assert.equal(reminderMessage('water', { glasses: 3 }).body, '3 of 8 glasses so far today.');
    assert.equal(reminderMessage('run', { lastRunKm: 5.02, runKind: 'run' }).body, 'Last time: 5.02 km. Go again today?');
    assert.equal(reminderMessage('run', { runKind: 'walk' }).title, 'Walk day today 🚶');
  });
  test('every kind has a short title and a link into the app', () => {
    for (const k of ['workout', 'lunch', 'dinner', 'water', 'weight', 'run'] as const) {
      const m = reminderMessage(k);
      assert.ok(m.title.length <= 40 && m.body.length <= 120 && m.url.startsWith('/'), k);
    }
  });
});

describe('weekly report', () => {
  // Sunday 22 Nov 2026 in India
  const SUN = (h: number, m: number) => new Date(Date.UTC(2026, 10, 22, h, m) - 330 * 60000);
  const due = (at: Date, p = DEFAULT_PREFS, sent: string[] = []) => dueReminders(p, localNow(at, 'Asia/Kolkata'), new Set(sent)).map((d) => d.key);
  test('on by default, Sunday 7 pm only, once', () => {
    assert.equal(cleanPrefs({}).weekly.on, true);
    assert.deepEqual(due(SUN(19, 5)), ['weekly']);
    assert.deepEqual(due(SUN(18, 55)), []);
    assert.deepEqual(due(SUN(19, 5), DEFAULT_PREFS, ['weekly']), []);
    assert.deepEqual(due(AT(19, 5)), []); // a Monday
  });
  test('turned off → never', () => assert.deepEqual(due(SUN(19, 5), cleanPrefs({ weekly: { on: false } })), []));
  test('the words', () => {
    const m = reminderMessage('weekly', { weekLine: '4 gym days · 12.4 km in 3 runs' });
    assert.equal(m.title, 'Your week 💪');
    assert.equal(m.body, '4 gym days · 12.4 km in 3 runs. Tap to see it all.');
    assert.equal(m.url, '/?open=week');
  });
});
