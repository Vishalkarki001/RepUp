/**
 * Security: after logging in, people only ever go to a RepUp page
 * (no "?next=" trick can send them to another site).
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { safeNext } from '../src/lib/supabase/env';

const ORIGIN = 'https://getrepup.vercel.app';
/** Where a browser would really go for this redirect. */
const lands = (next: string | null) => new URL(safeNext(next), ORIGIN).origin;

describe('safeNext', () => {
  test('RepUp pages pass through unchanged', () => {
    for (const p of ['/', '/admin', '/reset-password', '/?open=food&meal=lunch', '/calories/banana#top']) assert.equal(safeNext(p), p);
  });

  test('other sites are refused (→ home)', () => {
    const tricks = [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      '/\t/evil.example', // browsers drop tabs and new lines from addresses
      '/\n/evil.example',
      '/\r/evil.example',
      '/ /evil.example',
      '/..//evil.example',
      '/a/../..//evil.example',
      '/./\\evil.example',
      'javascript:alert(1)',
      'evil.example',
      '',
      null,
    ];
    for (const t of tricks) {
      assert.equal(lands(t), ORIGIN, JSON.stringify(t));
      assert.ok(!safeNext(t).startsWith('//'), JSON.stringify(t));
    }
  });

  test('an encoded tab stays a harmless path on RepUp', () => {
    assert.equal(lands('/%09/evil.example'), ORIGIN);
  });
});
