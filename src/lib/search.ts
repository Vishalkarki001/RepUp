/**
 * Forgiving search used for foods and exercises (no React, no browser APIs).
 *
 * A query matches when every word of it is found in the name (or other names)
 * by one of these, best first:
 *   exact word → start of a word → inside a word (2+ letters) → a typo or two
 *   ("benhc" → bench, "panner" → paneer, "chapatti" → chapati).
 * Failing that, the whole query without spaces is tried against the name
 * without spaces ("pushup" → Push Up) and as letters in the same order
 * ("inclnpress" → Incline Press). Gym shorthand is expanded first
 * ("db" → dumbbell, "ohp" → overhead press).
 */

export const normalizeText = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** Gym and kitchen shorthand people type. */
const SHORTHAND: Record<string, string> = {
  db: 'dumbbell',
  dbs: 'dumbbell',
  bb: 'barbell',
  kb: 'kettlebell',
  bw: 'bodyweight',
  ohp: 'overhead press',
  rdl: 'romanian deadlift',
  sldl: 'stiff leg deadlift',
  ez: 'ez bar',
  tri: 'triceps',
  bi: 'biceps',
};

const words = (s: string) => normalizeText(s).split(' ').filter(Boolean);

export function queryWords(query: string): string[] {
  return words(query).flatMap((w) => (SHORTHAND[w] ? SHORTHAND[w].split(' ') : [w]));
}

/** Edit distance with swaps counted as one edit (Damerau / OSA), stopping early above `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2 = new Array(b.length + 1).fill(0);
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev);
    prev = cur;
  }
  return prev[b.length];
}

/** Typos allowed for a word of this length: none for short words, 1 from 4 letters, 2 from 8. */
const typosAllowed = (n: number) => (n >= 8 ? 2 : n >= 4 ? 1 : 0);

/** How well one query word matches a list of words (0 = not at all). */
export function wordScore(q: string, list: string[]): number {
  let best = 0;
  const allowed = typosAllowed(q.length);
  for (const w of list) {
    if (w === q) return 6;
    if (w.startsWith(q)) best = Math.max(best, 5);
    else if (q.length >= 2 && w.includes(q)) best = Math.max(best, 3.5);
    else if (allowed && w[0] === q[0] && w.length >= 3) {
      // A typo in the whole word, or in the part typed so far ("benhc" vs "bench…"). The first letter
      // has to be right: people rarely get it wrong, and it keeps "land" from matching "and".
      const d = Math.min(editDistance(q, w, allowed), w.length > q.length ? editDistance(q, w.slice(0, q.length), allowed) : allowed + 1);
      if (d <= allowed) best = Math.max(best, d === 1 ? 2.5 : 1.5);
    }
  }
  return best;
}

/** Letters of `q` appear in `s` in the same order ("inclnpress" in "inclinedumbbellpress"). */
function inOrder(q: string, s: string): boolean {
  let i = 0;
  for (let j = 0; j < s.length && i < q.length; j++) if (s[j] === q[i]) i++;
  return i === q.length;
}

export interface SearchText {
  /** Words of the name (count most) and of other names / aliases. */
  nameWords: string[];
  aliasWords: string[];
}

export function searchText(name: string, aliases = ''): SearchText {
  return { nameWords: words(name), aliasWords: words(aliases) };
}

/** Score of an item for a query (higher is better), or 0 when it doesn't match. */
export function matchScore(qs: string[], t: SearchText): number {
  if (!qs.length) return 0;
  let score = 0;
  let all = true;
  for (const q of qs) {
    const best = Math.max(wordScore(q, t.nameWords), wordScore(q, t.aliasWords) * 0.85);
    if (!best) {
      all = false;
      break;
    }
    score += best;
  }
  const joinedQ = qs.join('');
  const joinedName = t.nameWords.join('');
  if (!all) {
    // Spaces typed differently ("pushup", "bench press" as one word), or letters in order.
    if (joinedQ.length >= 3 && joinedName.includes(joinedQ)) score = 3 * qs.length;
    else if (joinedQ.length >= 4 && joinedName[0] === joinedQ[0] && inOrder(joinedQ, joinedName)) score = 1;
    else return 0;
  }
  // The name starting with what was typed, and shorter names, read as better matches.
  if (t.nameWords.join(' ').startsWith(qs.join(' '))) score += 2;
  return score - t.nameWords.length * 0.05;
}

/** Items matching the query, best first. */
export function search<T>(items: T[], query: string, text: (item: T) => SearchText, limit = 50, boost?: (item: T) => number): T[] {
  const qs = queryWords(query);
  if (!qs.length) return [];
  const scored: { item: T; score: number }[] = [];
  for (const item of items) {
    const s = matchScore(qs, text(item));
    if (s > 0) scored.push({ item, score: s + (boost?.(item) ?? 0) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.item);
}
