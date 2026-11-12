import { cn } from 'cn';

/**
 * A drawn (not screenshot) phone showing a real RepUp screen with example
 * numbers. Pure HTML/CSS, so it is sharp at any size and costs no image bytes.
 * Colours are fixed (not the page theme) so it looks like the app on any page.
 */
type Screen = 'log' | 'week' | 'progress' | 'bodyweight';

const C = {
  dark: {
    bg: 'bg-[#121212] text-[#ededed]',
    card: 'bg-[#1a1a1a] border-[#2e2e2e]',
    muted: 'text-[#a1a1a1]',
    line: 'border-[#2e2e2e]',
    chip: 'bg-[#262626]',
    input: 'bg-[#232323] border-[#363636]',
    good: 'bg-[#10b981]/15 text-[#34d399]',
  },
  light: {
    bg: 'bg-[#fcfcfc] text-[#171717]',
    card: 'bg-white border-[#e5e5e5]',
    muted: 'text-[#737373]',
    line: 'border-[#ededed]',
    chip: 'bg-[#f2f2f2]',
    input: 'bg-white border-[#dedede]',
    good: 'bg-[#10b981]/12 text-[#047857]',
  },
};

export function PhoneMock({
  screen = 'log',
  theme = 'dark',
  className,
}: {
  screen?: Screen;
  theme?: 'dark' | 'light';
  className?: string;
}) {
  const c = C[theme];
  const label =
    screen === 'log'
      ? 'RepUp workout screen: Bench Press, last time 60 kg × 10 on every set, so today’s target is 62.5 kg'
      : screen === 'week'
        ? 'RepUp weekly plan: today’s workout and its exercises'
        : screen === 'bodyweight'
          ? 'RepUp body weight screen: a chart of body weight slowly going down over 8 weeks'
          : 'RepUp progress screen: a chart of Bench Press weight going up';
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn(
        'relative mx-auto w-[280px] shrink-0 rounded-[2.6rem] border-[9px] border-[#0a0a0a] bg-[#0a0a0a] shadow-2xl shadow-black/40 select-none',
        className,
      )}
    >
      <div className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0a0a0a]" />
      <div
        className={cn('flex h-[560px] flex-col gap-3 overflow-hidden rounded-[2rem] px-3.5 pt-9 pb-4 text-left font-sans', c.bg)}
        aria-hidden
      >
        {screen === 'log' && <LogScreen c={c} />}
        {screen === 'week' && <WeekScreen c={c} />}
        {screen === 'progress' && <ProgressScreen c={c} />}
        {screen === 'bodyweight' && <BodyWeightScreen c={c} />}
      </div>
    </figure>
  );
}

type Tone = (typeof C)['dark'];

function Top({ c, eyebrow, title }: { c: Tone; eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className={cn('text-[10px] font-medium', c.muted)}>{eyebrow}</p>
        <p className="text-lg font-semibold tracking-tight">{title}</p>
      </div>
      <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-[#10b981]">
        <span className="size-1.5 rounded-full bg-[#10b981]" /> Saved
      </span>
    </div>
  );
}

function LogScreen({ c }: { c: Tone }) {
  const rows = [
    { n: 1, prev: '60×10', kg: '62.5', reps: '8', done: true },
    { n: 2, prev: '60×10', kg: '62.5', reps: '8', done: true },
    { n: 3, prev: '60×10', kg: '62.5', reps: '8', done: false },
  ];
  return (
    <>
      <Top c={c} eyebrow="Upper · Thursday" title="Workout" />
      <div className={cn('flex flex-col gap-2.5 rounded-2xl border p-3', c.card)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold">Bench Press</p>
            <p className={cn('text-[10px]', c.muted)}>Barbell · 3 × 8–10</p>
          </div>
          <span className={cn('rounded-md px-2 py-1 text-[10px] font-medium', c.chip)}>Plates</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className={cn('text-[10px]', c.muted)}>Last time · Mon 9 Nov</p>
          <div className="flex gap-1">
            {['60×10', '60×10', '60×10'].map((s, i) => (
              <span key={i} className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium tabular-nums', c.line)}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className={cn('flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium', c.good)}>
          <span>⬆️</span>
          <span className="flex-1">You hit 10 reps on every set. Go up to 62.5 kg today!</span>
          <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px]', c.line)}>Fill</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className={cn('grid grid-cols-[22px_1fr_46px_38px_26px] gap-1.5 px-0.5 text-[9px] font-medium uppercase', c.muted)}>
            <span className="text-center">Set</span>
            <span>Previous</span>
            <span className="text-center">kg</span>
            <span className="text-center">Reps</span>
            <span />
          </div>
          {rows.map((r) => (
            <div
              key={r.n}
              className={cn(
                'grid grid-cols-[22px_1fr_46px_38px_26px] items-center gap-1.5 rounded-lg px-0.5 py-0.5 text-[12px] tabular-nums',
                r.done && 'bg-[#10b981]/10',
              )}
            >
              <span className="text-center font-semibold">{r.n}</span>
              <span className={cn('text-[11px]', c.muted)}>{r.prev}</span>
              <span className={cn('rounded-md border py-1 text-center font-semibold', c.input)}>{r.kg}</span>
              <span className={cn('rounded-md border py-1 text-center font-semibold', c.input)}>{r.reps}</span>
              <span
                className={cn(
                  'flex size-[26px] items-center justify-center rounded-md text-[13px] font-bold',
                  r.done ? 'bg-[#10b981] text-white' : cn('border', c.input),
                )}
              >
                {r.done ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={cn('flex items-center justify-between rounded-2xl border px-3 py-2.5', c.card)}>
        <div>
          <p className="text-[12px] font-semibold">Barbell Row</p>
          <p className={cn('text-[10px]', c.muted)}>Last time 50×10, 50×10, 50×9</p>
        </div>
        <span className={cn('text-[11px] font-semibold tabular-nums', c.muted)}>3 × 10</span>
      </div>
      <div className="mt-auto rounded-xl bg-[#7c3aed] py-2.5 text-center text-[13px] font-semibold text-white">Finish</div>
    </>
  );
}

function WeekScreen({ c }: { c: Tone }) {
  const days = [
    ['Mon', '9', 'done'],
    ['Tue', '10', 'done'],
    ['Wed', '11', ''],
    ['Thu', '12', 'today'],
    ['Fri', '13', 'plan'],
    ['Sat', '14', ''],
    ['Sun', '15', ''],
  ];
  const list = [
    ['Bench Press', '4 × 8'],
    ['Barbell Row', '4 × 8'],
    ['Shoulder Press', '3 × 10'],
    ['Lat Pulldown', '3 × 10'],
    ['Dumbbell Curl', '2 × 12'],
  ];
  return (
    <>
      <Top c={c} eyebrow="Thursday, 12 November" title="Workout" />
      <div className="grid grid-cols-7 gap-1">
        {days.map(([d, n, s]) => (
          <div
            key={d}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg border py-1.5',
              s === 'today' ? 'border-[#7c3aed] bg-[#7c3aed] text-white' : c.card,
            )}
          >
            <span className={cn('text-[8px]', s === 'today' ? 'text-white/80' : c.muted)}>{d}</span>
            <span className="text-[12px] font-semibold tabular-nums">{n}</span>
            <span
              className={cn(
                'size-1 rounded-full',
                s === 'done' ? 'bg-[#10b981]' : s === 'plan' ? 'bg-[#7c3aed]' : s === 'today' ? 'bg-white' : 'bg-transparent',
              )}
            />
          </div>
        ))}
      </div>
      <div className={cn('flex flex-col rounded-2xl border', c.card)}>
        <div className="flex flex-col gap-1 p-3">
          <p className="text-[10px] font-medium text-[#8b5cf6]">Today</p>
          <p className="text-base font-semibold">Upper</p>
          <p className={cn('text-[10px]', c.muted)}>6 exercises · 18 sets</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {['Chest', 'Back', 'Shoulders', 'Arms'].map((m) => (
              <span key={m} className={cn('rounded-full px-2 py-0.5 text-[9px]', c.chip)}>
                {m}
              </span>
            ))}
          </div>
        </div>
        {list.map(([n, s], i) => (
          <div key={n} className={cn('flex items-center gap-2 border-t px-3 py-2 text-[12px]', c.line)}>
            <span className="flex size-5 items-center justify-center rounded-md bg-[#7c3aed]/15 text-[10px] font-semibold text-[#8b5cf6]">
              {i + 1}
            </span>
            <span className="flex-1 font-medium">{n}</span>
            <span className="font-semibold tabular-nums">{s}</span>
          </div>
        ))}
        <div className="p-3 pt-1">
          <div className="rounded-xl bg-[#7c3aed] py-2.5 text-center text-[13px] font-semibold text-white">▶ Start workout</div>
        </div>
      </div>
    </>
  );
}

function ProgressScreen({ c }: { c: Tone }) {
  const pts = [50, 52.5, 52.5, 55, 55, 57.5, 60, 60, 62.5];
  const W = 230;
  const H = 120;
  const x = (i: number) => 8 + (i * (W - 16)) / (pts.length - 1);
  const y = (v: number) => H - 10 - ((v - 48) / (64 - 48)) * (H - 20);
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <>
      <Top c={c} eyebrow="Last 8 weeks" title="Progress" />
      <div className={cn('flex flex-col gap-2 rounded-2xl border p-3', c.card)}>
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-semibold">Bench Press</p>
          <p className="text-[10px] font-semibold text-[#10b981]">+12.5 kg</p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <linearGradient id="pm-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7c3aed" stopOpacity="0.35" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2={W} y1={10 + i * 33} y2={10 + i * 33} stroke="currentColor" strokeOpacity="0.08" />
          ))}
          <path d={`${d} L${x(pts.length - 1)},${H} L${x(0)},${H} Z`} fill="url(#pm-fill)" />
          <path d={d} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r="2.6" fill="#8b5cf6" />
          ))}
        </svg>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[
            ['Best', '62.5 kg'],
            ['Sessions', '9'],
            ['Top set', '62.5×8'],
          ].map(([k, v]) => (
            <div key={k} className={cn('rounded-lg py-1.5', c.chip)}>
              <p className={cn('text-[9px]', c.muted)}>{k}</p>
              <p className="text-[11px] font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={cn('flex flex-col gap-2 rounded-2xl border p-3', c.card)}>
        <p className="text-[12px] font-semibold">Sets this week</p>
        {[
          ['Chest', 10],
          ['Back', 12],
          ['Legs', 8],
          ['Shoulders', 6],
        ].map(([m, n]) => (
          <div key={m as string} className="flex items-center gap-2 text-[10px]">
            <span className={cn('w-14', c.muted)}>{m}</span>
            <span className={cn('h-2 flex-1 overflow-hidden rounded-full', c.chip)}>
              <span className="block h-full rounded-full bg-[#7c3aed]" style={{ width: `${((n as number) / 12) * 100}%` }} />
            </span>
            <span className="w-5 text-right font-semibold tabular-nums">{n}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function BodyWeightScreen({ c }: { c: Tone }) {
  const pts = [82.4, 82.1, 81.6, 81.7, 81.0, 80.6, 80.7, 80.1, 79.6];
  const W = 230;
  const H = 120;
  const x = (i: number) => 8 + (i * (W - 16)) / (pts.length - 1);
  const y = (v: number) => H - 10 - ((v - 79) / (83 - 79)) * (H - 20);
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const log = [
    ['Thu 12 Nov', '79.6 kg'],
    ['Mon 9 Nov', '80.1 kg'],
    ['Thu 5 Nov', '80.7 kg'],
  ];
  return (
    <>
      <Top c={c} eyebrow="Last 8 weeks" title="Progress" />
      <div className={cn('flex flex-col gap-2 rounded-2xl border p-3', c.card)}>
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-semibold">Body weight</p>
          <p className="text-[10px] font-semibold text-[#10b981]">−2.8 kg</p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2={W} y1={10 + i * 33} y2={10 + i * 33} stroke="currentColor" strokeOpacity="0.08" />
          ))}
          <path d={d} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r="2.6" fill="#10b981" />
          ))}
        </svg>
      </div>
      <div className={cn('flex flex-col gap-2 rounded-2xl border p-3', c.card)}>
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold">Log body weight</p>
          <span className="rounded-md bg-[#7c3aed] px-2 py-1 text-[10px] font-semibold text-white">Save</span>
        </div>
        <div className={cn('rounded-md border px-2 py-1.5 text-[12px] font-semibold tabular-nums', c.input)}>79.6 kg</div>
        {log.map(([d2, v]) => (
          <div key={d2} className={cn('flex justify-between border-t pt-1.5 text-[11px]', c.line)}>
            <span className={c.muted}>{d2}</span>
            <span className="font-semibold tabular-nums">{v}</span>
          </div>
        ))}
      </div>
    </>
  );
}
