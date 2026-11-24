'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from 'cn';
import { MAX_REPS, oneRepMax, repTable, roundToPlates, zones } from '@/lib/strength';
import { SIGNUP_HREF } from './SiteChrome';

/**
 * The 1RM calculator on /one-rep-max-calculator: type a set you did (weight × reps),
 * see your estimated max and what to lift for any number of reps. Works in the
 * browser, nothing is sent anywhere.
 */
const input =
  'h-12 w-full rounded-xl border border-[#d4d4d4] bg-white px-3 text-center text-lg font-semibold tabular-nums text-[#0a0a0a] outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25';

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));

export function OneRepMaxTool() {
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const w = Number(weight);
  const r = Number(reps);
  const max = weight && reps ? oneRepMax(w, r) : null;
  const tooMany = r > MAX_REPS;
  const shown = max ? roundToPlates(max, unit) : null;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-8">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Unit">
        {(['kg', 'lb'] as const).map((x) => (
          <button
            key={x}
            type="button"
            role="radio"
            aria-checked={unit === x}
            onClick={() => setUnit(x)}
            className={cn('h-12 rounded-xl border text-base font-semibold', unit === x ? 'border-[#7c3aed] bg-[#f5f3ff] text-[#5b21b6]' : 'border-[#d4d4d4] text-[#404040]')}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex min-w-0 flex-col gap-1.5 text-sm text-[#525252]">
          Weight lifted ({unit})
          <input className={input} inputMode="decimal" value={weight} placeholder={unit === 'kg' ? '60' : '135'} onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm text-[#525252]">
          Reps done
          <input className={input} inputMode="numeric" value={reps} placeholder="8" onChange={(e) => setReps(e.target.value.replace(/\D/g, '').slice(0, 2))} />
        </label>
      </div>
      <p className="-mt-3 text-xs text-[#737373]">Use a hard set with good form, 2 to 10 reps works best. Example: bench press 60 kg × 8.</p>

      {tooMany ? (
        <p className="rounded-2xl bg-[#fff7ed] p-5 text-center text-[#9a3412]">
          More than {MAX_REPS} reps gives a poor guess. Use a heavier set of {MAX_REPS} reps or fewer.
        </p>
      ) : max && shown ? (
        <div className="flex flex-col gap-4" aria-live="polite">
          <div className="rounded-2xl bg-[#0b0a1f] p-5 text-white">
            <p className="text-sm text-white/70">Your estimated one-rep max</p>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">
              {fmt(shown)} <span className="text-lg font-medium text-white/70">{unit}</span>
            </p>
            <p className="mt-1 text-sm text-white/70">
              From {fmt(w)} {unit} × {r}. A guess, not a test: no need to try a true max.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {zones(max, unit).map((z) => (
              <div key={z.name} className="flex flex-col gap-1 rounded-2xl border border-[#e5e5e5] p-4">
                <p className="font-semibold">
                  {z.name} <span className="block text-xs font-normal text-[#737373]">{z.reps}</span>
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  {fmt(z.from)}–{fmt(z.to)} <span className="text-sm font-normal text-[#737373]">{unit}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e5e5e5]">
            <table className="w-full text-left text-sm tabular-nums">
              <caption className="sr-only">Weight for each number of reps</caption>
              <thead className="bg-[#fafafa] text-[#525252]">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Reps</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Weight</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">% of max</th>
                </tr>
              </thead>
              <tbody>
                {repTable(max, unit).map((row) => (
                  <tr key={row.reps} className={cn('border-t border-[#f0f0f0]', row.reps === r && 'bg-[#f5f3ff] font-semibold text-[#5b21b6]')}>
                    <td className="px-4 py-2">{row.reps}</td>
                    <td className="px-4 py-2">
                      {fmt(row.weight)} {unit}
                    </td>
                    <td className="px-4 py-2 text-right">{row.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link href={SIGNUP_HREF} className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-center text-base font-semibold text-white hover:bg-[#6d28d9]">
            Track it free in RepUp: see your max go up every week
          </Link>
        </div>
      ) : (
        <p className="rounded-2xl bg-[#f5f5f5] p-5 text-center text-[#525252]">Type the weight and reps of a set you did to see your max.</p>
      )}
    </div>
  );
}
