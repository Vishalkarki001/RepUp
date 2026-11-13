import Link from 'next/link';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/cardio-tracker-app". Layout: "pulse line". Dark indigo hero with a
 * full-width, CSS-animated wave line (a light trace runs along it; static when
 * the user prefers reduced motion). Purely decorative: the copy never implies
 * heart-rate tracking, and says plainly that RepUp has none. Then cyan stat
 * tiles beside a run summary phone, a "cardio + weights" split, an honest
 * limits list and a step timeline. Accent: electric cyan #22d3ee on #0b0a1f
 * (on light backgrounds small text uses #0e7490).
 * Main keywords: cardio tracker app, cardio log app, track cardio and weights,
 * cardio workout log, running and walking log.
 */

const PATH = '/cardio-tracker-app';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Cardio Tracker App: Free Run & Walk Log + Weights | RepUp',
  description:
    'A free cardio tracker app: log runs and walks with GPS distance, pace and km splits, add treadmill sessions by hand, and track weights in the same account.',
  keywords: [
    'cardio tracker app',
    'cardio log app',
    'track cardio and weights',
    'cardio workout log',
    'running and walking log',
    'free cardio tracker',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Does RepUp track heart rate?',
    a: 'No. RepUp does not measure or show heart rate, and it does not connect to heart-rate straps or watches. It tracks distance, moving time, pace and km splits with your phone’s GPS.',
  },
  {
    q: 'What kinds of cardio can I log?',
    a: 'Runs and walks. Outdoors, RepUp tracks them with GPS. On a treadmill, or if you went without your phone, add the run or walk by hand with its distance and time.',
  },
  {
    q: 'Can I track cardio and weights in one app?',
    a: 'Yes. One free account has Workout mode for sets, reps and kg, and Running mode for runs and walks. Switch between them from the account menu.',
  },
  {
    q: 'Does tracking work with the screen off?',
    a: 'No. RepUp is a web app, so keep the screen on and RepUp open while you track, in your hand or an armband. If the screen turns off or you switch apps, GPS pauses and the gap is joined with a straight line.',
  },
  {
    q: 'Does it count steps and calories?',
    a: 'Yes, as estimates. Steps use the phone’s motion sensor when available, otherwise they are estimated from distance. Calories are estimated from distance and body weight. Both are shown with ~.',
  },
  {
    q: 'Does RepUp work with a smartwatch or import from other apps?',
    a: 'No. There is no Apple Watch or Wear OS app, no live notification while you run, and no import from other apps or watches. You track with your phone or add sessions by hand.',
  },
];

const RECORDS = [
  ['GPS distance', 'In km, with smoothing so standing still does not add fake distance.'],
  ['Moving time', 'The time you were moving. Pause and resume any time.'],
  ['Average pace', 'Minutes per km for the whole run or walk.'],
  ['Every km split', 'See which kilometre was fast and which was slow.'],
  ['Voice + vibration', 'A short update at each km. You can turn it off.'],
  ['Weather', 'The temperature when you start.'],
  ['Route map', 'Your route on OpenStreetMap after you finish.'],
  ['~Steps, ~calories', 'Estimates, clearly shown with ~.'],
];

const LIMITS = [
  ['No heart rate', 'RepUp does not read heart rate or connect to chest straps.'],
  ['Screen on, RepUp open', 'Screen off or another app pauses GPS; the gap is joined with a straight line.'],
  ['No smartwatch app', 'No Apple Watch or Wear OS app, and no live notification while running.'],
  ['No imports', 'It does not sync with other apps or watches. Add older sessions by hand.'],
  ['No built-in plans', 'Running plans on this website are guides; the app records what you do.'],
];

const STEPS = [
  { name: 'Sign up free', text: 'Create a free RepUp account with email or Google. It works on your phone and laptop.' },
  { name: 'Switch to Running mode', text: 'Open the account menu and choose Running mode. Your gym workouts stay in Workout mode.' },
  { name: 'Pick Run or Walk and start', text: 'Tap Start, keep the screen on and RepUp open. Use the lock button so sweaty touches do nothing.' },
  { name: 'Add treadmill sessions by hand', text: 'Did cardio on a treadmill, or without your phone? Add the distance and time by hand.' },
  { name: 'Check your week', text: 'The week view shows your runs by day. Progress shows weekly km, longest run, best pace and a pace chart.' },
];

/** ECG-style decorative line across a 1200 × 160 box. */
const WAVE = (() => {
  let d = 'M0,92';
  for (let i = 0; i < 6; i++) {
    const x = i * 200;
    d += ` L${x + 70},92 L${x + 84},92 L${x + 96},66 L${x + 110},128 L${x + 124},24 L${x + 138},112 L${x + 150},92 L${x + 200},92`;
  }
  return d;
})();

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

function PulseLine() {
  return (
    <div aria-hidden className="relative h-28 w-full sm:h-36 md:h-40">
      <style>{`
        @keyframes repup-trace { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        .repup-trace { stroke-dasharray: 160 840; animation: repup-trace 3.6s linear infinite; filter: drop-shadow(0 0 6px #22d3ee); }
        @media (prefers-reduced-motion: reduce) { .repup-trace { animation: none; stroke-dasharray: none; opacity: 0.55; filter: none; } }
      `}</style>
      <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="repup-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="0.15" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="0.85" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={WAVE} fill="none" stroke="url(#repup-fade)" strokeOpacity="0.28" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <path
          d={WAVE}
          pathLength={1000}
          className="repup-trace"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function CardioTrackerAppPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#f8fafc]"
      jsonLd={[
        appLd('Free cardio tracker app: log runs and walks with GPS distance, pace and km splits, and track weights in the same account.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Cardio tracker app'),
        howToLd('How to track cardio in RepUp', STEPS),
      ]}
    >
      {/* Hero: pulse line (no overflow-hidden, so the phone can overlap the next section) */}
      <section className="relative bg-[#0b0a1f] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 40% at 50% 0%, rgba(34,211,238,0.18), transparent 70%), radial-gradient(40% 40% at 50% 100%, rgba(124,58,237,0.30), transparent 70%)',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#22d3ee]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-[#22d3ee] text-[#0b0a1f] hover:bg-[#67e8f9]"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-10 text-center sm:px-6 md:pt-16">
          <p className="rounded-full border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-4 py-1.5 text-sm font-medium text-[#a5f3fc]">
            Runs · walks · treadmill · weights
          </p>
          <h1 className="mt-6 text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            The free <span className="text-[#22d3ee]">cardio tracker app</span> that also logs your weights
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            Track runs and walks with GPS distance, pace and a split for every km. Add treadmill sessions by hand. Keep your gym
            workouts in the same account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
            >
              Start tracking free
            </Link>
            <a href="#records" className="rounded-xl border border-[#22d3ee]/40 px-6 py-3.5 text-base font-semibold text-[#a5f3fc] hover:bg-[#22d3ee]/10">
              What it records
            </a>
          </div>
        </div>
        <div className="relative mt-12">
          <PulseLine />
          <div aria-hidden className="mx-auto flex w-full max-w-6xl justify-between px-4 text-[11px] font-medium tracking-wide text-[#67e8f9]/70 uppercase sm:px-6">
            <span>km 1</span>
            <span>km 2</span>
            <span>km 3</span>
            <span className="hidden sm:inline">km 4</span>
            <span className="hidden sm:inline">km 5</span>
          </div>
        </div>
        <div className="relative flex justify-center px-4 pt-12">
          <PhoneMock screen="run-live" className="-mb-28 shadow-[0_0_60px_rgba(34,211,238,0.25)]" />
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 pt-40 pb-16 sm:px-6">
        <div className="border-l-4 border-[#22d3ee] pl-5 sm:pl-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-[#0e7490] uppercase">The short answer</h2>
          <p className="text-xl leading-relaxed text-[#1e293b] sm:text-2xl">
            RepUp is a free cardio tracker app for runs and walks. It records GPS distance, moving time, average pace and a split for
            every km, and you can add treadmill sessions by hand. Your gym workouts live in the same account. It does not measure
            heart rate, and the screen must stay on while tracking.
          </p>
        </div>
      </section>

      {/* What counts as cardio */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <p className="mb-3 text-sm font-semibold tracking-wide text-[#0e7490] uppercase">Your cardio log</p>
        <h2 className={`${h2} text-[#0f172a]`}>What counts as cardio in RepUp?</h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['🏃', 'Outdoor runs', 'Start a run and RepUp tracks distance, time and pace with GPS, with a split for every km.'],
            ['🚶', 'Walks', 'Same tracking for walks: morning walks, evening walks, walking to work. Steps are shown too, as an estimate.'],
            ['📝', 'Treadmill and phone-free runs', 'Ran on a treadmill or left your phone at home? Add the run or walk by hand.'],
          ].map(([icon, t, d]) => (
            <li key={t} className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <span aria-hidden className="flex size-11 items-center justify-center rounded-xl bg-[#0b0a1f] text-xl ring-2 ring-[#22d3ee]/40">
                {icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">{t}</h3>
              <p className="mt-2 leading-relaxed text-[#475569]">{d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-[17px] leading-relaxed text-[#334155]">
          Cycling, swimming or the cross-trainer have no special tracking. If you want them in your log anyway, you can add a custom
          exercise in Workout mode and write the minutes in the reps box. It works as a simple cardio workout log, but it is a
          workaround, not a cycling tracker. Walking is the easiest cardio to start with; see the{' '}
          <A href="/walking-tracker-app">walking tracker</A> for more.
        </p>
      </section>

      {/* What it records */}
      <section id="records" className="scroll-mt-8 bg-[#0b0a1f] text-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-20 [&>*]:min-w-0">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#22d3ee] uppercase">Running mode</p>
            <h2 className={h2}>What RepUp records for every run or walk</h2>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {RECORDS.map(([t, d]) => (
                <li key={t} className="rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/[0.06] p-4">
                  <h3 className="font-semibold text-[#67e8f9]">{t}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/70">{d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-relaxed text-white/70">
              Over time: a week view (tap a day to see its runs), history by month, and progress with weekly km, longest run, best pace
              and a pace chart.
            </p>
          </div>
          <div className="flex justify-center">
            <PhoneMock screen="run-summary" className="rotate-2 shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          </div>
        </div>
      </section>

      {/* Cardio + weights */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className="mb-3 text-sm font-semibold tracking-wide text-[#0e7490] uppercase">One account</p>
        <h2 className={`${h2} text-[#0f172a]`}>Track cardio and weights together</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#475569]">
          Cardio and strength work best together. RepUp keeps both in one free account. Switch between Workout mode and
          Running mode from the account menu.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-[#0b0a1f] p-6 text-white sm:p-8">
            <span className="rounded-full bg-[#22d3ee] px-3 py-1 text-xs font-semibold text-[#0b0a1f]">Running mode</span>
            <ul className="mt-5 flex flex-col gap-2.5 leading-relaxed text-white/80">
              <li>→ Runs and walks with GPS</li>
              <li>→ Treadmill sessions added by hand</li>
              <li>→ Weekly km, longest run, best pace</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8">
            <span className="rounded-full bg-[#7c3aed] px-3 py-1 text-xs font-semibold text-white">Workout mode</span>
            <ul className="mt-5 flex flex-col gap-2.5 leading-relaxed text-[#334155]">
              <li>→ Weekly plan, Mon–Sun, with sets × reps</li>
              <li>→ Every set in kg and reps, with last time shown</li>
              <li>→ Progress charts and a body-weight log</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-[17px] leading-relaxed text-[#334155]">
          On the gym side, RepUp suggests a target from last time, which makes it a simple{' '}
          <A href="/progressive-overload-tracker">progressive overload tracker</A>. For a closer look at both together, read{' '}
          <A href="/gym-and-running-tracker">gym and running tracker</A>, or the <A href="/treadmill-workout-log">treadmill log</A>{' '}
          guide if most of your cardio is indoors.
        </p>
      </section>

      {/* Limits */}
      <section className="border-y border-[#e2e8f0] bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.4fr] md:py-20">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#0e7490] uppercase">Honest limits</p>
            <h2 className={`${h2} text-[#0f172a]`}>What this cardio tracker does not do</h2>
            <p className="mt-4 text-lg leading-relaxed text-[#475569]">
              RepUp is a web app on your phone. That keeps it free and light, but it has limits you should know before you start.
            </p>
          </div>
          <ul className="flex flex-col divide-y divide-[#e2e8f0] rounded-2xl border border-[#e2e8f0]">
            {LIMITS.map(([t, d]) => (
              <li key={t} className="flex gap-4 p-5">
                <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-sm font-bold text-[#64748b]">
                  ✕
                </span>
                <div>
                  <h3 className="font-semibold text-[#0f172a]">{t}</h3>
                  <p className="mt-1 leading-relaxed text-[#475569]">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[#0b0a1f] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#22d3ee] uppercase">How to</p>
          <h2 className={h2}>How to track cardio in RepUp</h2>
          <ol className="relative mt-12 grid gap-8 lg:grid-cols-5 lg:gap-5">
            <span aria-hidden className="absolute top-5 right-[10%] left-[10%] hidden h-px bg-[#22d3ee]/40 lg:block" />
            {STEPS.map((s, i) => (
              <li key={s.name} className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#22d3ee] bg-[#0b0a1f] font-semibold text-[#22d3ee] shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/70">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex justify-center">
            <Link href={SIGNUP_HREF} className="rounded-xl bg-[#7c3aed] px-7 py-3.5 font-semibold text-white hover:bg-[#6d28d9]">
              Start my cardio log
            </Link>
          </div>
        </div>
      </section>

      <div className="pt-4">
        <FaqSection faqs={FAQS} title="Cardio tracker questions" />
      </div>

      <CtaBand
        title="Every run, every walk, every set."
        body="Free, no ads. Cardio in Running mode, weights in Workout mode, one account."
        cta="Start tracking free"
      />
    </LandingShell>
  );
}
