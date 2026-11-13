'use client';

import { useId, useState, type ReactNode } from 'react';
import { RACES, fmtPace, fmtTime, kmh } from './pace';

type Mode = 'pace' | 'time' | 'distance';

const MODES: { id: Mode; label: string }[] = [
  { id: 'pace', label: 'Pace' },
  { id: 'time', label: 'Time' },
  { id: 'distance', label: 'Distance' },
];

const CHIPS = [
  { label: '5K', value: '5' },
  { label: '10K', value: '10' },
  { label: 'Half 21.1', value: '21.0975' },
  { label: 'Full 42.2', value: '42.195' },
];

/** Whole number 0..max from a text box ('' counts as 0). null = invalid. */
function int(v: string, max: number): number | null {
  const t = v.trim();
  if (t === '') return 0;
  if (!/^\d{1,3}$/.test(t)) return null;
  const n = Number(t);
  return n <= max ? n : null;
}

/** Distance in km (accepts "21,1"). null = invalid. */
function km(v: string): number | null {
  const t = v.trim().replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return n > 0 && n <= 1000 ? n : null;
}

type Result = { paceSec: number; timeSec: number; km: number } | { error: string };

function solve(mode: Mode, d: string, th: string, tm: string, ts: string, pm: string, ps: string): Result {
  const dist = km(d);
  const h = int(th, 99);
  const m = int(tm, 59);
  const s = int(ts, 59);
  const p1 = int(pm, 59);
  const p2 = int(ps, 59);

  if (mode !== 'distance' && dist === null) return { error: 'Enter a distance in km, for example 5 or 21.1.' };
  if (mode !== 'time') {
    if (h === null || m === null || s === null) return { error: 'Time: hours up to 99, minutes and seconds 0–59.' };
    if (h * 3600 + m * 60 + s === 0) return { error: 'Enter a time longer than zero.' };
  }
  if (mode !== 'pace') {
    if (p1 === null || p2 === null) return { error: 'Pace: minutes and seconds 0–59 per km.' };
    if (p1 * 60 + p2 === 0) return { error: 'Enter a pace longer than zero.' };
  }

  const time = (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0);
  const pace = (p1 ?? 0) * 60 + (p2 ?? 0);
  if (mode === 'pace') return { km: dist!, timeSec: time, paceSec: time / dist! };
  if (mode === 'time') return { km: dist!, paceSec: pace, timeSec: pace * dist! };
  const out = time / pace;
  if (out > 1000) return { error: 'That works out to more than 1,000 km. Check the time and pace.' };
  return { km: out, paceSec: pace, timeSec: time };
}

const inputCls =
  'h-14 w-full min-w-0 rounded-xl border border-[#cbd5e1] bg-white px-3 text-center text-lg font-semibold text-[#0a0a0a] tabular-nums outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-[#06b6d4]/40';

function Num({ value, onChange, label, max, placeholder }: { value: string; onChange: (v: string) => void; label: string; max: number; placeholder: string }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={max}
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
      className={inputCls}
    />
  );
}

function Answer({ children }: { children: ReactNode }) {
  return (
    <output className="flex h-14 w-full items-center justify-center rounded-xl border-2 border-dashed border-[#06b6d4] bg-[#ecfeff] px-3 text-lg font-bold text-[#155e75] tabular-nums">
      {children}
    </output>
  );
}

const Colon = () => (
  <span aria-hidden className="text-lg font-semibold text-[#64748b]">
    :
  </span>
);

export function PaceCalculator() {
  const id = useId();
  const [mode, setMode] = useState<Mode>('pace');
  const [dist, setDist] = useState('5');
  const [th, setTh] = useState('0');
  const [tm, setTm] = useState('30');
  const [ts, setTs] = useState('00');
  const [pm, setPm] = useState('6');
  const [ps, setPs] = useState('00');

  const r = solve(mode, dist, th, tm, ts, pm, ps);
  const ok = !('error' in r);

  return (
    <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl ring-1 shadow-[#0e7490]/10 ring-[#a5f3fc] md:grid-cols-[1.15fr_1fr]">
      {/* Inputs */}
      <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-7">
        <div>
          <p id={`${id}-mode`} className="text-sm font-semibold text-[#334155]">
            What do you want to find?
          </p>
          <div role="radiogroup" aria-labelledby={`${id}-mode`} className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-[#f1f5f9] p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-lg px-1 py-2.5 text-sm font-semibold transition-colors ${
                  mode === m.id ? 'bg-[#0e7490] text-white shadow' : 'text-[#334155] hover:bg-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div>
          <label htmlFor={mode === 'distance' ? undefined : `${id}-km`} className="text-sm font-semibold text-[#334155]">
            Distance <span className="font-normal text-[#64748b]">(km)</span>
          </label>
          <div className="mt-2">
            {mode === 'distance' ? (
              <Answer>{ok ? `${r.km.toFixed(2)} km` : '–'}</Answer>
            ) : (
              <input
                id={`${id}-km`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                maxLength={8}
                value={dist}
                onChange={(e) => setDist(e.target.value.replace(/[^\d.,]/g, ''))}
                className={inputCls}
              />
            )}
          </div>
          <div className={`mt-2 flex flex-wrap gap-1.5 ${mode === 'distance' ? 'invisible' : ''}`}>
            {CHIPS.map((c) => (
              <button
                key={c.label}
                type="button"
                tabIndex={mode === 'distance' ? -1 : 0}
                onClick={() => setDist(c.value)}
                aria-pressed={dist === c.value}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                  dist === c.value ? 'bg-[#cffafe] text-[#155e75] ring-[#06b6d4]' : 'bg-white text-[#334155] ring-[#cbd5e1] hover:ring-[#06b6d4]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="text-sm font-semibold text-[#334155]">
            Time <span className="font-normal text-[#64748b]">(h : min : s)</span>
          </p>
          <div className="mt-2">
            {mode === 'time' ? (
              <Answer>{ok ? fmtTime(r.timeSec) : '–'}</Answer>
            ) : (
              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5">
                <Num value={th} onChange={setTh} label="Hours" max={2} placeholder="h" />
                <Colon />
                <Num value={tm} onChange={setTm} label="Minutes" max={2} placeholder="min" />
                <Colon />
                <Num value={ts} onChange={setTs} label="Seconds" max={2} placeholder="s" />
              </div>
            )}
          </div>
        </div>

        {/* Pace */}
        <div>
          <p className="text-sm font-semibold text-[#334155]">
            Pace <span className="font-normal text-[#64748b]">(min : s per km)</span>
          </p>
          <div className="mt-2">
            {mode === 'pace' ? (
              <Answer>{ok ? `${fmtPace(r.paceSec)} /km` : '–'}</Answer>
            ) : (
              <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-1.5">
                <Num value={pm} onChange={setPm} label="Pace minutes per km" max={2} placeholder="min" />
                <Colon />
                <Num value={ps} onChange={setPs} label="Pace seconds per km" max={2} placeholder="s" />
                <span className="pl-1 text-sm font-medium text-[#64748b]">/km</span>
              </div>
            )}
          </div>
        </div>

        <p aria-live="polite" className="min-h-10 text-sm leading-snug text-[#b91c1c]">
          {ok ? '' : r.error}
        </p>
      </div>

      {/* Results */}
      <div className="flex min-w-0 flex-col gap-5 bg-[#083344] p-4 text-white sm:p-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#67e8f9] uppercase">Your pace</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-white tabular-nums">
            {ok ? fmtPace(r.paceSec) : '–'}
            <span className="ml-1.5 text-lg font-medium text-[#a5f3fc]">/km</span>
          </p>
          <p className="mt-2 min-h-12 text-[15px] leading-6 text-[#cffafe]">
            Speed <b className="font-semibold text-white tabular-nums">{ok ? kmh(r.paceSec) : '–'}</b> km/h
            {ok && (
              <span className="text-[#a5f3fc]">
                {' '}
                · {r.km.toFixed(2)} km in {fmtTime(r.timeSec)}
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#67e8f9] uppercase">Finish times at this pace</p>
          <ul className="mt-2 divide-y divide-white/10 rounded-2xl bg-white/[0.06]">
            {RACES.map((race) => (
              <li key={race.label} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-[15px] text-[#cffafe]">{race.label}</span>
                <span className="text-lg font-semibold text-white tabular-nums">{ok ? fmtTime(r.paceSec * race.km) : '–'}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-auto text-xs leading-relaxed text-[#a5f3fc]">
          Half marathon = 21.0975 km, marathon = 42.195 km. Times are rounded to the nearest second.
        </p>
      </div>
    </div>
  );
}
