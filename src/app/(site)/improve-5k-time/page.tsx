import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/improve-5k-time". Look: "stopwatch laps". Black hero, headline on top,
 * then a big circular stopwatch dial with the lap split for every km listed
 * beside it (stacked on mobile). Accent: signal yellow #facc15 on black
 * #0a0a0a, always with black text on yellow; small accent text on white uses
 * #854d0e. The weekly week is a 7-day strip; the pace table is a split board.
 * Main keywords: how to run 5k faster, improve 5k time, interval training for
 * running, 5k training tips, sub 30 5k.
 */

const PATH = '/improve-5k-time';

export const metadata = landingMetadata({
  path: PATH,
  title: 'How to Run 5K Faster: Improve Your 5K Time | RepUp',
  description:
    'How to run 5K faster: easy runs, one interval session, one tempo run, strength and rest. A sample training week, sub-30 5K paces and how to track your splits.',
  keywords: [
    'how to run 5k faster',
    'improve 5k time',
    'interval training for running',
    '5k training tips',
    'sub 30 5k',
    '5k pace chart',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'How long does it take to improve my 5K time?',
    a: 'Many runners notice a difference after 6–8 weeks of steady training with one interval session and one tempo run a week. Newer runners often improve faster. Test your 5K every 4–6 weeks to see where you are.',
  },
  {
    q: 'What pace do I need for a sub 30 5K?',
    a: 'An average of 6:00 per km gives exactly 30:00. To be safe, aim for about 5:55 per km. Run the first kilometre steady, not flat out, and pick up the pace in the last kilometre.',
  },
  {
    q: 'Should I run every day to get faster at 5K?',
    a: 'No. Three or four runs a week is plenty for most people. Your body gets fitter while it rests, so easy days and rest days are part of the training, not a break from it.',
  },
  {
    q: 'What is the best interval training for running a faster 5K?',
    a: 'Repeats a little faster than your 5K pace with easy jogging between: for example 6 × 400 m, 5 × 800 m, or 8 × 1 minute fast and 1 minute easy. Always warm up for 10 minutes first and cool down after.',
  },
  {
    q: 'Does RepUp track my run with the screen off?',
    a: 'No. RepUp is a web app, so GPS tracking needs the screen on and RepUp open, with the phone in your hand or an armband. If the screen turns off or you switch apps, tracking pauses and the gap is joined with a straight line.',
  },
  {
    q: 'Does RepUp have a 5K training plan inside the app?',
    a: 'No. RepUp has no built-in training plans. Use this page as your guide and log each run in RepUp: it records your splits for every km, your best pace and a pace chart so you can see the progress.',
  },
];

const LAPS: [string, string][] = [
  ['Km 1', '5:40'],
  ['Km 2', '5:35'],
  ['Km 3', '5:33'],
  ['Km 4', '5:34'],
  ['Km 5', '5:26'],
];

const INGREDIENTS: [string, string, string][] = [
  ['Easy runs', '2 a week', 'Slow enough to talk. They build the engine that lets you hold a faster pace for 5 km. Most of your running should be easy.'],
  ['One interval session', '1 a week', 'Short repeats faster than 5K pace with easy jogs between. This teaches your legs and lungs to run fast.'],
  ['One tempo run', '1 a week', '15–20 minutes “comfortably hard”: you could say a few words, not chat. It helps you hold pace late in the race.'],
  ['Strength', '1–2 a week', 'Squats, lunges, calf raises and core work. Stronger legs mean a better stride and fewer niggles.'],
  ['Rest', '1–2 days', 'You get fitter while you recover. Sleep well, and take an extra easy day if your legs feel heavy.'],
];

const WEEK: { day: string; what: string; detail: string; hard?: boolean }[] = [
  { day: 'Mon', what: 'Rest', detail: 'Or a gentle walk' },
  { day: 'Tue', what: 'Intervals', detail: '10 min easy, 6 × 400 m fast with 200 m jog, 10 min easy', hard: true },
  { day: 'Wed', what: 'Easy + strength', detail: '4–5 km easy, then 20–30 min of leg and core work' },
  { day: 'Thu', what: 'Rest', detail: 'Or an easy walk' },
  { day: 'Fri', what: 'Tempo', detail: '10 min easy, 15–20 min comfortably hard, 10 min easy', hard: true },
  { day: 'Sat', what: 'Strength or rest', detail: 'Short session, or take the day off' },
  { day: 'Sun', what: 'Longer easy run', detail: '6–8 km slow and relaxed' },
];

const PACES: [string, string, string][] = [
  ['35:00', '7:00', 'Strong first goal'],
  ['32:30', '6:30', ''],
  ['30:00', '6:00', 'Sub 30 5K line'],
  ['27:30', '5:30', ''],
  ['25:00', '5:00', 'Sub 25 5K line'],
];

const STEPS = [
  { name: 'Run easy most days', text: 'Do two easy runs a week at a pace where you can talk, plus one longer easy run.' },
  { name: 'Add one interval session', text: 'Once a week, after a 10-minute warm-up, run short repeats a little faster than 5K pace with easy jogs between.' },
  { name: 'Add one tempo run', text: 'Once a week, run 15–20 minutes at a comfortably hard pace between an easy warm-up and cool-down.' },
  { name: 'Lift and rest', text: 'Do 1–2 short strength sessions a week and keep 1–2 rest days so your body can adapt.' },
  { name: 'Test and compare splits', text: 'Every 4–6 weeks, run a 5K test in RepUp and compare the split for every km with your last test.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

function Kicker({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${dark ? 'text-[#facc15]' : 'text-[#854d0e]'}`}>{children}</p>;
}

/** Hero visual: a stopwatch dial reading 27:48 for 5 km. */
function Stopwatch() {
  const R = 130;
  const C = 2 * Math.PI * R;
  const done = 27.8 / 30;
  return (
    <svg viewBox="0 0 320 350" className="h-auto w-full max-w-[340px]" aria-hidden>
      {/* crown + side buttons */}
      <rect x="140" y="0" width="40" height="22" rx="6" fill="#facc15" />
      <rect x="150" y="18" width="20" height="16" fill="#404040" />
      <rect x="252" y="40" width="30" height="14" rx="5" fill="#404040" transform="rotate(45 267 47)" />
      {/* body */}
      <circle cx="160" cy="190" r="155" fill="#171717" stroke="#262626" strokeWidth="4" />
      <circle cx="160" cy="190" r={R} fill="none" stroke="#262626" strokeWidth="14" />
      <circle
        cx="160"
        cy="190"
        r={R}
        fill="none"
        stroke="#facc15"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${C * done} ${C}`}
        transform="rotate(-90 160 190)"
      />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        return (
          <line
            key={i}
            x1="160"
            y1={190 - 112}
            x2="160"
            y2={190 - (big ? 100 : 106)}
            stroke={big ? '#facc15' : '#525252'}
            strokeWidth={big ? 3 : 1.5}
            strokeLinecap="round"
            transform={`rotate(${i * 6} 160 190)`}
          />
        );
      })}
      {/* hand: a short marker near the ring, so it never covers the time */}
      <line x1="160" y1="118" x2="160" y2="70" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" transform={`rotate(${done * 360} 160 190)`} />
      <text x="160" y="160" textAnchor="middle" fill="#a3a3a3" fontSize="14" fontWeight="600" letterSpacing="3">
        5 KM
      </text>
      <text x="160" y="212" textAnchor="middle" fill="#ffffff" fontSize="56" fontWeight="700" letterSpacing="-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
        27:48
      </text>
      <rect x="112" y="230" width="96" height="26" rx="13" fill="#facc15" />
      <text x="160" y="248" textAnchor="middle" fill="#0a0a0a" fontSize="13" fontWeight="700">
        SUB 30 ✓
      </text>
    </svg>
  );
}

function Laps() {
  const fastest = 4;
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-baseline justify-between border-b border-white/15 pb-2 text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
        <span>Lap</span>
        <span>Split /km</span>
      </div>
      <ol>
        {LAPS.map(([k, t], i) => (
          <li
            key={k}
            className={`mt-1.5 flex items-center justify-between rounded-lg px-3 py-2.5 text-lg tabular-nums ${
              i === fastest ? 'bg-[#facc15] font-bold text-[#0a0a0a]' : 'text-white'
            }`}
          >
            <span className={i === fastest ? '' : 'text-white/70'}>{k}</span>
            <span className="font-semibold">{t}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex justify-between border-t border-white/15 pt-3 text-sm text-white/70">
        <span>Total</span>
        <span className="font-semibold text-white tabular-nums">27:48</span>
      </p>
      <p className="mt-2 text-xs text-white/50">Example splits. Fastest km highlighted.</p>
    </div>
  );
}

export default function Improve5kTimePage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free running and gym tracker: GPS runs with splits for every km, best pace and a pace chart, plus strength workouts.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Improve your 5K time'),
        howToLd('How to run a faster 5K', STEPS),
      ]}
    >
      {/* Hero: stopwatch laps */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(40% 50% at 30% 75%, rgba(250,204,21,0.12), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#facc15]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-[#facc15] text-[#0a0a0a] hover:bg-[#fde047]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-20 sm:px-6 md:pt-14 md:pb-24">
          <div className="max-w-3xl">
            <p className="w-fit rounded-full bg-[#facc15] px-3 py-1 text-xs font-bold text-[#0a0a0a]">5K training tips</p>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              How to run 5K faster: <span className="text-[#facc15]">shave time off every split</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Five simple ingredients, one sample week, the paces for a sub 30 5K, and a free way to watch your kilometre splits
              drop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
              >
                Track your splits free
              </Link>
              <a href="#week" className="rounded-xl border border-[#facc15]/60 px-7 py-3.5 font-semibold text-[#facc15] hover:bg-[#facc15]/10">
                See a sample week
              </a>
            </div>
          </div>
          <div
            role="img"
            aria-label="Stopwatch showing a 5 km time of 27:48, with splits per km: 5:40, 5:35, 5:33, 5:34 and 5:26"
            className="mt-14 flex flex-col items-center gap-10 sm:flex-row sm:items-center sm:justify-center sm:gap-14"
          >
            <Stopwatch />
            <Laps />
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-[#854d0e] uppercase">The short answer</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">
          To improve your 5K time, run three or four times a week: mostly easy runs, plus one interval session and one tempo run.
          Add one or two short strength sessions and at least one rest day. Keep it up for 6–8 weeks, then run a 5K test and
          compare your kilometre splits.
        </p>
      </section>

      {/* Ingredients */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <Kicker>The recipe</Kicker>
        <h2 className={h2}>5 ingredients of a faster 5K</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {INGREDIENTS.map(([t, freq, d], i) => (
            <li key={t} className={`flex flex-col rounded-2xl p-6 ${i === 1 || i === 2 ? 'bg-[#facc15] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-white'}`}>
              <span className="text-5xl font-bold tracking-tighter tabular-nums">{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className={`text-sm font-semibold ${i === 1 || i === 2 ? 'text-[#0a0a0a]/70' : 'text-[#facc15]'}`}>{freq}</p>
              <p className={`mt-3 text-[15px] leading-relaxed ${i === 1 || i === 2 ? 'text-[#0a0a0a]/80' : 'text-white/70'}`}>{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-[17px] leading-relaxed text-[#404040]">
          It is the same idea as <A href="/progressive-overload-tracker">progressive overload</A> in the gym: a little more, a
          little faster, week by week. Not running 5 km yet? Start with the <A href="/couch-to-5k-plan">couch to 5K plan</A>.
        </p>
      </section>

      {/* Sample week */}
      <section id="week" className="scroll-mt-8 bg-[#0a0a0a] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Kicker dark>Sample week</Kicker>
          <h2 className={h2}>A simple 5K training week</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/70">
            Two hard days (yellow), never back to back. Swap days to fit your life, but keep an easy or rest day after each hard
            one.
          </p>
          <ol className="mt-10 grid gap-2 md:grid-cols-7">
            {WEEK.map((d) => (
              <li
                key={d.day}
                className={`flex gap-4 rounded-2xl p-4 md:flex-col md:gap-2 ${d.hard ? 'bg-[#facc15] text-[#0a0a0a]' : 'bg-white/[0.06] ring-1 ring-white/10'}`}
              >
                <span className={`w-10 shrink-0 text-sm font-bold uppercase md:w-auto ${d.hard ? '' : 'text-[#facc15]'}`}>{d.day}</span>
                <div>
                  <h3 className="font-semibold">{d.what}</h3>
                  <p className={`mt-1 text-sm leading-relaxed ${d.hard ? 'text-[#0a0a0a]/80' : 'text-white/65'}`}>{d.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
              <h3 className="text-xl font-semibold">Interval training for running</h3>
              <p className="mt-2 leading-relaxed text-white/70">
                Run the fast parts a little quicker than your 5K pace, and jog slowly between. Good sessions: 6 × 400 m, 5 × 800 m,
                or 8 × 1 minute fast and 1 minute easy. If your last repeat is much slower than your first, you started too fast.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
              <h3 className="text-xl font-semibold">Strength, briefly</h3>
              <p className="mt-2 leading-relaxed text-white/70">
                Two short sessions of squats, lunges, calf raises and planks are enough. See{' '}
                <Link href="/strength-training-for-runners" className="font-medium text-[#facc15] underline underline-offset-4">
                  strength training for runners
                </Link>{' '}
                for a full routine. If knees, shins or feet hurt for more than a few days, rest and see a doctor or physio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pace board */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-20">
        <Kicker>Pace</Kicker>
        <h2 className={h2}>Sub 30 5K and other goals: the pace per km</h2>
        <p className="mt-3 text-lg leading-relaxed text-[#525252]">
          Divide your goal time by five. A sub 30 5K needs an average under 6:00 per km. Try other times with the{' '}
          <A href="/running-pace-calculator">running pace calculator</A>.
        </p>
        <ul className="mt-8 overflow-hidden rounded-2xl bg-[#0a0a0a] text-white">
          <li className="grid grid-cols-[1fr_1fr] gap-2 px-4 py-3 text-xs font-semibold tracking-[0.15em] text-white/60 uppercase sm:grid-cols-[1fr_1fr_1.4fr] sm:px-6">
            <span>5K time</span>
            <span>Pace /km</span>
            <span className="hidden sm:block">Note</span>
          </li>
          {PACES.map(([time, pace, note]) => {
            const sub30 = time === '30:00';
            return (
              <li
                key={time}
                className={`grid grid-cols-[1fr_1fr] items-center gap-2 border-t px-4 py-3.5 text-xl font-semibold tabular-nums sm:grid-cols-[1fr_1fr_1.4fr] sm:px-6 ${
                  sub30 ? 'border-transparent bg-[#facc15] text-[#0a0a0a]' : 'border-white/10'
                }`}
              >
                <span>{time}</span>
                <span>{pace}</span>
                <span className={`col-span-2 text-sm font-medium sm:col-span-1 ${sub30 ? 'text-[#0a0a0a]/75' : 'text-white/60'} ${note ? '' : 'hidden sm:block'}`}>
                  {note}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-[17px] leading-relaxed text-[#404040]">
          On race day, start at your goal pace or a touch slower. A first kilometre that is too fast is a very common way to
          miss a 5K goal. Save your effort for the last kilometre.
        </p>
      </section>

      {/* RepUp */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
          <PhoneMock screen="run-summary" className="-rotate-2" />
          <div>
            <Kicker>Track your progress</Kicker>
            <h2 className={h2}>Watch your splits drop in RepUp</h2>
            <ul className="mt-8 flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
              {[
                ['Splits for every km', 'After each GPS run you see the time for every kilometre, so you know if you started too fast or finished strong.'],
                ['Voice at every km', 'RepUp says your distance and last kilometre time out loud, so you can pace without looking.'],
                ['Best pace and pace chart', 'Progress shows your best pace, weekly km and a pace chart that should slowly trend faster.'],
                ['Same app as the gym', 'Log your strength sessions with sets, reps and kg in the same free account.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="mt-1.5 size-3 shrink-0 rounded-sm bg-[#facc15] ring-1 ring-[#0a0a0a]" />
                  <span>
                    <b className="font-semibold text-[#0a0a0a]">{t}.</b> {d}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-relaxed text-[#525252]">
              Keep the screen on and RepUp open while you run. RepUp has no heart rate and no built-in plans: this page is the plan,
              RepUp is the stopwatch and the diary.
            </p>
            <Link
              href={SIGNUP_HREF}
              className="mt-6 inline-block rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white hover:bg-[#6d28d9]"
            >
              Start tracking free
            </Link>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="5K questions" />

      <CtaBand title="Your next 5K starts with this one." body="Free, no ads. Splits for every km, best pace and weekly km, on phone and laptop." cta="Start free" />
    </LandingShell>
  );
}
