import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/treadmill-workout-log". Look: "treadmill console". Near-black hero with
 * the headline on top and a dark console panel: glowing LED-style read-outs
 * (speed, incline, time, distance) and console buttons. Accent: fuchsia
 * #d946ef (small text on light uses #a21caf). Sample workouts are console
 * cards with a speed profile; the "Add a run by hand" form is drawn.
 * Main keywords: treadmill workout log, treadmill tracker app, treadmill
 * workout for beginners, treadmill interval workout, log treadmill runs.
 */

const PATH = '/treadmill-workout-log';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Treadmill Workout Log: Track Treadmill Runs Free | RepUp',
  description:
    'A free treadmill workout log: add treadmill runs by hand in seconds, plus three treadmill workouts for beginners, intervals and incline walks with speeds.',
  keywords: [
    'treadmill workout log',
    'treadmill tracker app',
    'treadmill workout for beginners',
    'treadmill interval workout',
    'log treadmill runs',
    'incline walking workout',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Can RepUp track a treadmill run with GPS?',
    a: 'No. GPS measures how far you move across the ground, and on a treadmill you stay in one place. That is why RepUp lets you add a treadmill run by hand: type the distance and time from the console and RepUp works out your pace.',
  },
  {
    q: 'How do I log a treadmill run in RepUp?',
    a: 'In Running mode, open the Run tab and tap “Add a run by hand”. Choose Run or Walk, pick the date, type the distance in km and the time, add a note like “incline 2%, intervals” and save. It takes under a minute.',
  },
  {
    q: 'Does RepUp connect to my treadmill or gym machine?',
    a: 'No. RepUp does not connect to treadmills, smartwatches or other apps. Read the distance and time off the console when you finish and type them in. A photo of the console screen helps if you log later.',
  },
  {
    q: 'What is a good treadmill workout for beginners?',
    a: 'A 30-minute walk-run: 5 minutes of walking, then 1 minute of easy jogging and 2 minutes of walking, repeated six times, and a cool-down walk. Use a 1% incline and speeds that let you talk.',
  },
  {
    q: 'Is running on a treadmill easier than running outside?',
    a: 'Usually a little, because there is no wind and the belt helps your stride. Many runners set a 1% incline to make it feel closer to outdoor running. Your treadmill pace and outdoor pace may not match exactly.',
  },
  {
    q: 'Are calories for treadmill runs accurate?',
    a: 'They are estimates. RepUp works them out from distance and your body weight and shows them with a ~ sign. It does not count incline, so a steep incline walk will burn more than the estimate shows.',
  },
];

const STEPS = [
  { name: 'Finish and read the console', text: 'When the workout ends, note the distance (km) and time on the treadmill screen, or take a quick photo of it.' },
  { name: 'Tap “Add a run by hand”', text: 'In RepUp, switch to Running mode from the account menu and tap “Add a run by hand” on the Run tab.' },
  { name: 'Type distance and time', text: 'Choose Run or Walk and the date, then type the km and the hours, minutes and seconds. RepUp shows your pace.' },
  { name: 'Add a note and save', text: 'Write the speed, incline or intervals in the note, for example “6 × 2 min at 10 km/h, incline 1%”, and save.' },
];

type Workout = {
  name: string;
  tag: string;
  time: string;
  rows: [part: string, speed: string, incline: string][];
  /** [minutes, value] for the profile bars; `by` says what the bar height shows */
  profile: [number, number][];
  by: 'speed' | 'incline';
};

const WORKOUTS: Workout[] = [
  {
    name: 'Beginner walk-run',
    tag: 'Treadmill workout for beginners',
    time: '30 min',
    rows: [
      ['Warm-up walk, 5 min', '5.0 km/h', '1%'],
      ['6 × 1 min easy jog', '7.5 km/h', '1%'],
      ['…with 2 min walk between', '5.5 km/h', '1%'],
      ['Cool-down walk, 7 min', '5.0 km/h', '0–1%'],
    ],
    profile: [[5, 5], ...Array.from({ length: 6 }, () => [[1, 7.5], [2, 5.5]] as [number, number][]).flat(), [7, 5]],
    by: 'speed',
  },
  {
    name: 'Speed intervals',
    tag: 'Treadmill interval workout',
    time: '≈ 40 min',
    rows: [
      ['Easy jog, 10 min', '7.5–8.5 km/h', '1%'],
      ['6 × 2 min fast', '10–11 km/h', '1%'],
      ['…with 2 min easy between', '7.0 km/h', '1%'],
      ['Easy jog or walk, 5 min', '6–7 km/h', '1%'],
    ],
    profile: [[10, 8], ...Array.from({ length: 6 }, () => [[2, 10.5], [2, 7]] as [number, number][]).flat(), [5, 6.5]],
    by: 'speed',
  },
  {
    name: 'Incline walk',
    tag: 'Low impact',
    time: '30 min',
    rows: [
      ['Warm-up flat walk, 5 min', '5.0 km/h', '0%'],
      ['Climb, 20 min', '5.0–5.5 km/h', '4% → 8%'],
      ['Raise 1% every 4–5 min', '', ''],
      ['Cool-down flat walk, 5 min', '5.0 km/h', '0%'],
    ],
    profile: [[5, 0], [5, 4], [5, 5], [5, 6], [5, 8], [5, 0]],
    by: 'incline',
  },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const GLOW = { textShadow: '0 0 14px rgba(217,70,239,0.75), 0 0 2px rgba(240,171,252,0.9)' };

function Kicker({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${dark ? 'text-[#e879f9]' : 'text-[#a21caf]'}`}>{children}</p>;
}

/** One LED window on the console. */
function Led({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-[#050307] px-3 py-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] ring-1 ring-white/5 sm:px-4 sm:py-4">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#e879f9] uppercase sm:text-xs">{label}</p>
      <div className="relative mt-1 flex items-baseline gap-1">
        <span className="relative -skew-x-6 text-[2.1rem] leading-none font-bold tracking-tight tabular-nums sm:text-5xl">
          <span aria-hidden className="absolute inset-0 text-[#d946ef]/[0.12]">
            {value.replace(/\d/g, '8')}
          </span>
          <span className="relative text-[#f5d0fe]" style={GLOW}>
            {value}
          </span>
        </span>
        <span className="text-xs font-semibold text-[#e879f9]">{unit}</span>
      </div>
    </div>
  );
}

function Btn({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-xs font-bold sm:h-11 sm:min-w-11 sm:px-3 sm:text-sm shadow-[0_3px_0_rgba(0,0,0,0.6)] ring-1 ring-white/10 ${className}`}
    >
      {children}
    </span>
  );
}

/** Hero visual: the treadmill console. */
function Console() {
  return (
    <div
      role="img"
      aria-label="Treadmill console showing speed 8.0 km/h, incline 1.0 percent, time 24:35 and distance 3.28 km"
      className="mx-auto w-full max-w-4xl rounded-[1.75rem] text-left bg-gradient-to-b from-[#26202c] to-[#141016] p-3 shadow-2xl shadow-[#d946ef]/20 ring-1 ring-white/10 sm:p-6"
    >
      <div aria-hidden className="mb-3 flex items-center justify-between px-1 text-[10px] font-semibold tracking-[0.2em] text-white/60 uppercase sm:text-xs">
        <span>Program · Manual</span>
        <span className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <span key={i} className="size-2 rounded-full bg-[#d946ef]" style={{ boxShadow: '0 0 8px #d946ef' }} />
          ))}
        </span>
      </div>
      <div aria-hidden className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <Led label="Speed" value="8.0" unit="km/h" />
        <Led label="Incline" value="1.0" unit="%" />
        <Led label="Time" value="24:35" unit="" />
        <Led label="Distance" value="3.28" unit="km" />
      </div>
      <div aria-hidden className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
        <span className="flex gap-1.5">
          <Btn className="bg-[#2d2633] text-white">▲</Btn>
          <Btn className="bg-[#2d2633] text-white">▼</Btn>
        </span>
        <span className="hidden gap-1.5 sm:flex">
          {['4', '6', '8', '10'].map((k) => (
            <Btn key={k} className="bg-[#1d1821] text-white/85">
              {k}
            </Btn>
          ))}
        </span>
        <Btn className="bg-[#16a34a] px-4 text-white sm:px-5">START</Btn>
        <Btn className="bg-[#dc2626] px-4 text-white sm:px-5">STOP</Btn>
        <span className="flex gap-1.5">
          <Btn className="bg-[#2d2633] text-white">▲</Btn>
          <Btn className="bg-[#2d2633] text-white">▼</Btn>
        </span>
      </div>
    </div>
  );
}

/** Profile bars for a sample workout: width = minutes, height = speed or incline. */
function Profile({ parts, by }: { parts: [number, number][]; by: 'speed' | 'incline' }) {
  const total = parts.reduce((s, [m]) => s + m, 0);
  const max = by === 'speed' ? 11 : 9;
  const hot = by === 'speed' ? 9.5 : 6;
  const mid = by === 'speed' ? 7 : 4;
  return (
    <figure>
      <div aria-hidden className="flex h-16 items-end gap-px overflow-hidden rounded-lg bg-[#050307] p-2">
        {parts.map(([m, v], i) => (
          <span
            key={i}
            className="rounded-t-sm"
            style={{
              width: `${(m / total) * 100}%`,
              height: `${Math.max(8, (v / max) * 100)}%`,
              background: v >= hot ? '#d946ef' : v >= mid ? '#a21caf' : '#581c87',
            }}
          />
        ))}
      </div>
      <figcaption className="mt-1.5 text-[11px] text-white/55">Bar height = {by}, width = time</figcaption>
    </figure>
  );
}

/** The drawn "Add a run by hand" form, filled in for a treadmill run. */
function ManualForm() {
  const field = 'rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[15px] font-semibold text-[#0a0a0a] tabular-nums';
  const label = 'mb-1 text-xs font-medium text-[#525252]';
  return (
    <div
      role="img"
      aria-label="RepUp's Add a run by hand form: Run selected, date today, distance 5 km, time 0 hours 36 minutes 40 seconds, pace 7 minutes 20 seconds per km, note Treadmill, incline 1 percent"
      className="mx-auto w-full max-w-sm rounded-3xl border border-[#e5e5e5] bg-[#fcfcfc] p-5 shadow-xl shadow-[#d946ef]/10"
    >
      <div aria-hidden>
        <p className="text-lg font-semibold">Add a run by hand</p>
        <p className="text-sm text-[#737373]">For the treadmill, or a run you did without the app.</p>
        <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-[#e5e5e5] text-center text-sm font-medium">
          <span className="bg-[#f5f3ff] py-2 text-[#6d28d9]">🏃 Run</span>
          <span className="py-2 text-[#737373]">🚶 Walk</span>
        </div>
        <p className={`${label} mt-4`}>Date</p>
        <p className={field}>Today</p>
        <p className={`${label} mt-3`}>Distance (km)</p>
        <p className={field}>5</p>
        <p className={`${label} mt-3`}>Time</p>
        <div className="grid grid-cols-3 gap-2">
          <p className={field}>0 h</p>
          <p className={field}>36 m</p>
          <p className={field}>40 s</p>
        </div>
        <p className="mt-1.5 text-xs text-[#737373]">Pace 7&apos;20&quot; /km</p>
        <p className={`${label} mt-3`}>Note (optional)</p>
        <p className={`${field} font-normal`}>Treadmill, incline 1%</p>
        <p className="mt-4 rounded-lg bg-[#7c3aed] py-2.5 text-center text-sm font-semibold text-white">Save run</p>
      </div>
    </div>
  );
}

export default function TreadmillWorkoutLogPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free running and gym tracker: add treadmill runs by hand, see pace, weekly km and progress next to your gym workouts.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Treadmill workout log'),
        howToLd('How to log a treadmill run in RepUp', STEPS),
      ]}
    >
      {/* Hero: treadmill console */}
      <section className="relative overflow-hidden bg-[#0d0a10] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 45% at 50% 75%, rgba(217,70,239,0.22), transparent 70%), radial-gradient(35% 35% at 90% 0%, rgba(124,58,237,0.3), transparent 70%)',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#e879f9]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-white text-[#0d0a10] hover:bg-white/90"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-8 pb-20 text-center sm:px-6 md:pt-14 md:pb-24">
          <p className="rounded-full border border-[#d946ef]/40 bg-[#d946ef]/10 px-3 py-1 text-xs font-semibold text-[#f0abfc]">
            Treadmill tracker app · free
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Treadmill workout log: <span className="text-[#e879f9]">every belt kilometre counts</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            GPS can’t measure a treadmill, so RepUp lets you add the run by hand in under a minute. Plus three treadmill workouts
            with real speeds and inclines.
          </p>
          <div className="mt-12 w-full">
            <Console />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
            >
              Start your treadmill log
            </Link>
            <a href="#workouts" className="rounded-xl border border-white/20 px-7 py-3.5 font-semibold text-white hover:bg-white/5">
              3 treadmill workouts
            </a>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-[#a21caf] uppercase">The short answer</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">
          To keep a treadmill workout log, read the distance and time on the console when you finish, then add the run by hand
          in RepUp. It works out your pace and adds the run to your week. Write the speed and incline in the note, so next time
          you can go a little further or faster.
        </p>
      </section>

      {/* How to log */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.15fr] md:py-20 [&>*]:min-w-0">
          <ManualForm />
          <div>
            <Kicker>Log treadmill runs</Kicker>
            <h2 className={h2}>How to log a treadmill run in RepUp</h2>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0d0a10] text-sm font-bold text-[#f0abfc] tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-[#525252]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 rounded-2xl border border-[#f5d0fe] bg-[#fdf4ff] p-4 text-[15px] leading-relaxed text-[#404040]">
              <b className="font-semibold text-[#0a0a0a]">Why by hand?</b> GPS tracks movement across the ground, and on a belt you
              stay in one spot. So a treadmill run has no route map or per-km splits. Steps and calories are estimated from the
              distance (shown with ~). It still counts toward your weekly km.
            </p>
          </div>
        </div>
      </section>

      {/* Workouts */}
      <section id="workouts" className="scroll-mt-8 bg-[#0d0a10] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Kicker dark>Workouts</Kicker>
          <h2 className={h2}>3 treadmill workouts to try this week</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/70">
            The speeds are examples. Pick ones that match you: easy parts should let you talk, fast parts should feel hard but
            controlled. Always clip on the safety key.
          </p>
          <ul className="mt-10 grid gap-4 lg:grid-cols-3">
            {WORKOUTS.map((w) => (
              <li key={w.name} className="flex flex-col gap-4 rounded-3xl bg-gradient-to-b from-[#221c27] to-[#16121a] p-5 ring-1 ring-white/10 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-[#e879f9] uppercase">{w.tag}</p>
                    <h3 className="mt-1 text-2xl font-semibold">{w.name}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#d946ef] px-3 py-1 text-sm font-bold text-[#0d0a10] tabular-nums">{w.time}</span>
                </div>
                <Profile parts={w.profile} by={w.by} />
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[11px] tracking-wide text-white/60 uppercase">
                      <th scope="col" className="pb-2 font-semibold">Part</th>
                      <th scope="col" className="pb-2 font-semibold">Speed</th>
                      <th scope="col" className="pb-2 text-right font-semibold">Incline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {w.rows.map(([part, speed, inc]) => (
                      <tr key={part}>
                        <th scope="row" className="py-2 pr-2 font-medium text-white/90">{part}</th>
                        <td className="py-2 pr-2 whitespace-nowrap text-[#f0abfc] tabular-nums">{speed}</td>
                        <td className="py-2 text-right whitespace-nowrap text-white/75 tabular-nums">{inc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl leading-relaxed text-white/70">
            New to running? The walk-run grows into a full{' '}
            <Link href="/couch-to-5k-plan" className="font-medium text-[#f0abfc] underline underline-offset-4">
              couch to 5K plan
            </Link>
            . Want a faster 5K? The interval session is the core of our{' '}
            <Link href="/improve-5k-time" className="font-medium text-[#f0abfc] underline underline-offset-4">
              guide to improving your 5K time
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Treadmill vs outdoor */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <Kicker>Treadmill vs outdoor</Kicker>
        <h2 className={h2}>Treadmill or road: what changes?</h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {[
            ['It feels a little easier', 'No wind, and the belt helps your stride. Many runners set a 1% incline to make it feel closer to outdoor running.'],
            ['The numbers may not match', 'Treadmill distance depends on the machine. Your treadmill pace and your road pace can differ a bit, so compare treadmill runs with treadmill runs.'],
            ['Great for bad-weather days', <>Summer afternoons, monsoon rain and poor air are easy to dodge indoors. See <A href="/running-in-hot-weather">running in hot weather</A> for outdoor days.</>],
            ['Mix in outdoor runs', 'If you have a road race coming, do some runs outside too, so your legs get used to turns, slopes and real ground.'],
          ].map(([t, d]) => (
            <div key={String(t)} className="border-l-4 border-[#d946ef] pl-5">
              <h3 className="text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-[#525252]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gym + treadmill */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-20 [&>*]:min-w-0">
          <div>
            <Kicker>One log for the gym</Kicker>
            <h2 className={h2}>Treadmill after weights? Log both in one app</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-[#404040]">
              Most treadmills live in gyms. RepUp is a gym workout tracker too: log every set in kg and reps, see last time, then
              switch to Running mode and add your treadmill finisher. Same account, same history, on phone and laptop. Read how it
              fits together in the <A href="/gym-and-running-tracker">gym and running tracker</A> guide.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-[#404040]">
              Running outdoors as well? RepUp tracks those with GPS. Keep the screen on and RepUp open while you run.
            </p>
            <Link
              href={SIGNUP_HREF}
              className="mt-8 inline-block rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white hover:bg-[#6d28d9]"
            >
              Log your next treadmill run
            </Link>
          </div>
          <PhoneMock screen="run-week" theme="light" className="-rotate-2" />
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Treadmill log questions" />

      <CtaBand title="Off the belt. Into the log." body="Free, no ads. Add treadmill runs by hand and watch your weekly km grow." cta="Start free" />
    </LandingShell>
  );
}
