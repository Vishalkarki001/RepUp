/**
 * Feedback: what the server accepts, and the notification admins get.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { cleanFeedback, deviceLabel, feedbackNotification, MAX_MESSAGE } from '../src/lib/feedback';

describe('cleanFeedback', () => {
  test('keeps kind, trims the message, keeps only known phone details', () => {
    const r = cleanFeedback({ kind: 'idea', message: '  Add dark mode for food  ', meta: { mode: 'food', screen: '390×844', installed: true, token: 'secret', browser: 'x'.repeat(500) } });
    assert.ok(!('error' in r));
    assert.equal(r.kind, 'idea');
    assert.equal(r.message, 'Add dark mode for food');
    assert.equal(r.meta.mode, 'food');
    assert.equal(r.meta.installed, true);
    assert.equal(r.meta.browser?.length, 300);
    assert.equal('token' in r.meta, false);
  });

  test('unknown kind becomes "other"', () => {
    const r = cleanFeedback({ kind: 'spam', message: 'hi' });
    assert.ok(!('error' in r) && r.kind === 'other');
  });

  test('empty or too long is refused with a plain sentence', () => {
    assert.deepEqual(cleanFeedback({ kind: 'bug', message: '   ' }), { error: 'Write a few words first.' });
    assert.ok('error' in cleanFeedback({ kind: 'bug', message: 'a'.repeat(MAX_MESSAGE + 1) }));
    assert.ok('error' in cleanFeedback(null));
  });
});

describe('feedbackNotification', () => {
  test('says what it is and who sent it, opens the admin feedback list', () => {
    const n = feedbackNotification('bug', 'Barcode scan\nnot working', 'Priya Nair');
    assert.equal(n.title, 'Problem reported · Priya Nair');
    assert.equal(n.body, 'Barcode scan not working');
    assert.equal(n.url, '/admin#feedback');
  });

  test('long messages are cut', () => {
    const n = feedbackNotification('idea', 'x'.repeat(300), null);
    assert.equal(n.title, 'New idea');
    assert.equal(n.body.length, 118);
    assert.ok(n.body.endsWith('…'));
  });
});

test('deviceLabel: phone and browser from a user agent', () => {
  assert.equal(deviceLabel('Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36'), 'Android · Samsung Internet');
  assert.equal(deviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'), 'iPhone · Safari');
  assert.equal(deviceLabel('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36'), 'Android · Chrome');
  assert.equal(deviceLabel(undefined), '');
});
