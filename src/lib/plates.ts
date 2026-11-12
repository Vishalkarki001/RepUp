/** Which plates go on each side of the bar (greedy, biggest first). */
export function platesPerSide(target: number, bar: number, plates: number[]): { plates: number[]; loaded: number } {
  let left = Math.max(0, (target - bar) / 2);
  const out: number[] = [];
  for (const p of plates) {
    while (left >= p - 1e-9) {
      out.push(p);
      left -= p;
    }
  }
  return { plates: out, loaded: bar + out.reduce((a, b) => a + b, 0) * 2 };
}
