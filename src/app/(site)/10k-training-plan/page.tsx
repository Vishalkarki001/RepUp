import Link from 'next/link';
import { Fragment } from 'react';
import { A, CtaBand, DataTable, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /10k-training-plan. Archetype "calendar wall": headline on top, then a
 * full-width 8-week × 7-day grid of colour-coded sessions with a legend
 * (scrolls sideways on phones). Accent: indigo #6366f1 (#4338ca small text).
 * Main keywords: 10k training plan, 10k training plan for beginners, 8 week
 * 10k plan, run 10k.
 */

const PATH = '/10k-training-plan';

export const metadata = landingMetadata({
  path: PATH,
  title: '10K Training Plan for Beginners: Free 8-Week Plan | RepUp',
  description:
    'A free 8-week 10K training plan for beginners: 3 runs a week (easy, intervals, long) plus one strength day, simple pacing advice, and how to log it in RepUp.',
  keywords: [
    '10k training plan',
    '10k training plan for beginners',
    '8 week 10k plan',
    'run 10k',
    '10k running plan India',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Can a beginner follow this 10K training plan?',
    a: 'Yes, if you can already run about 5 km, or 30 minutes without stopping. If you cannot yet, start with our couch to 5K plan and come back after it.',
  },
  {
    q: 'How many days a week do I train?',
    a: 'Four: three runs (an easy run, an interval session and a long run) and one strength session. The other three days are rest. Keep at least one rest day between hard days.',
  },
  {
    q: 'How fast should my easy runs be?',
    a: 'Slow enough to talk in full sentences. For many runners that is about 1 to 2 minutes per km slower than their best 5K pace. Easy runs build the base; they are not a test.',
  },
  {
    q: 'What if I miss a week?',
    a: 'Do not try to catch up. Repeat the last week you finished, then carry on. If you miss two weeks or more, go back two weeks. Rest if something hurts, and see a doctor if pain does not settle.',
  },
  {
    q: 'Does RepUp track my run with the screen off?',
    a: 'No. RepUp is a web app, so GPS pauses when the screen is off or you switch apps. Keep the screen on and RepUp open, with the phone in hand or in an armband. A treadmill run can be added by hand.',
  },
  {
    q: 'Is this 10K plan built into the RepUp app?',
    a: 'No. RepUp has no training plans inside the app. Follow the plan on this page, then track each run in Running mode and log your strength day in Workout mode, all in one free account.',
  },
];

type Kind = 'rest' | 'easy' | 'int' | 'long' | 'str' | 'race';

const KIND: Record<Kind, { name: string; cell: string }> = {
  easy: { name: 'Easy run', cell: 'bg-[#c7d2fe] text-[#312e81]' },
  int: { name: 'Intervals', cell: 'bg-[#6366f1] text-white' },
  long: { name: 'Long run', cell: 'bg-[#312e81] text-white' },
  str: { name: 'Strength', cell: 'border-2 border-dashed border-[#6366f1] bg-white text-[#3730a3]' },
  rest: { name: 'Rest', cell: 'bg-[#f1f5f9] text-[#475569]' },
  race: { name: '10K day', cell: 'bg-[#0b0a1f] text-[#c7d2fe]' },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** [easy km, intervals, long km, note] per week. Week 8 is the race week. */
const PLAN: { easy: string; int: string; long: string; note: string }[] = [
  { easy: '3 km', int: '6 × 1 min', long: '5 km', note: 'Settle in. Everything should feel easy.' },
  { easy: '3.5 km', int: '8 × 1 min', long: '6 km', note: 'One more km on the long run.' },
  { easy: '4 km', int: '5 × 2 min', long: '6.5 km', note: 'Longer fast parts this week.' },
  { easy: '3 km', int: '6 × 1 min', long: '5 km', note: 'Lighter week so your body catches up.' },
  { easy: '4 km', int: '4 × 3 min', long: '7.5 km', note: 'Back to building.' },
  { easy: '5 km', int: '5 × 3 min', long: '8.5 km', note: 'The hardest week so far.' },
  { easy: '5 km', int: '3 × 5 min', long: '9 km', note: 'Last big week.' },
  { easy: '4 km', int: '3 km', long: '10K', note: 'Race week: rest more, run 10K on Saturday.' },
];

function weekCells(w: number): { kind: Kind; text: string }[] {
  const p = PLAN[w];
  const race = w === PLAN.length - 1;
  return [
    { kind: 'rest', text: 'Rest' },
    { kind: 'easy', text: p.easy },
    race ? { kind: 'rest', text: 'Rest' } : { kind: 'str', text: 'Gym' },
    race ? { kind: 'easy', text: p.int } : { kind: 'int', text: p.int },
    { kind: 'rest', text: 'Rest' },
    race ? { kind: 'race', text: '🏁 10K' } : { kind: 'long', text: p.long },
    { kind: 'rest', text: 'Rest' },
  ];
}

const RECOVERY: Record<string, string> = {
  '6 × 1 min': '1½ min easy',
  '8 × 1 min': '1½ min easy',
  '5 × 2 min': '2 min easy',
  '4 × 3 min': '2 min easy',
  '5 × 3 min': '2 min easy',
  '3 × 5 min': '3 min easy',
};

const TRACK = [
  { name: 'Read the week here', text: 'Check this page for the week’s three runs and strength day. RepUp does not hold the plan; it records what you do.' },
  { name: 'Track each run', text: 'In Running mode, pick Run and tap Start run. Keep the screen on and RepUp open. Your km splits show how even your pace was.' },
  { name: 'Log the strength day', text: 'Switch to Workout mode and log sets, reps and kg for squats, lunges, calf raises and core work.' },
  { name: 'Watch the trend', text: 'Progress shows weekly km, your longest run, best pace and a pace chart. Tap a day in the week view to see its run.' },
];

const label = 'text-sm font-semibold tracking-wide text-[#4338ca] uppercase';
const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#1e1b4b] sm:text-4xl';

function CalendarWall() {
  return (
    <figure className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-3xl bg-white p-3 shadow-xl ring-1 shadow-[#312e81]/10 ring-[#c7d2fe] sm:p-5">
        <div
          role="table"
          aria-label="8-week 10K training plan, Monday to Sunday"
          className="grid min-w-[680px] grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1.5"
        >
          <div role="row" className="contents">
            <span role="columnheader" className="sticky left-0 z-10 bg-white">
              <span className="sr-only">Week</span>
            </span>
            {DAYS.map((d) => (
              <span key={d} role="columnheader" className="pb-1 text-center text-xs font-semibold tracking-wide text-[#4338ca] uppercase">
                {d}
              </span>
            ))}
          </div>
          {PLAN.map((_, w) => (
            <div key={w} role="row" className="contents">
              <span role="rowheader" className="sticky left-0 z-10 flex items-center bg-white text-sm font-semibold text-[#1e1b4b]">
                W{w + 1}
              </span>
              {weekCells(w).map((c, d) => (
                <span
                  key={d}
                  role="cell"
                  className={`flex h-14 flex-col justify-center rounded-lg px-2 text-[13px] leading-tight ${KIND[c.kind].cell}`}
                >
                  {c.kind !== 'rest' && <span className="text-[10px] font-medium uppercase opacity-80">{KIND[c.kind].name}</span>}
                  <span className="font-semibold tabular-nums">{c.text}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#334155]">
        {(['easy', 'int', 'long', 'str', 'rest'] as Kind[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span aria-hidden className={`size-3.5 rounded ${KIND[k].cell} ${k === 'rest' ? 'ring-1 ring-[#94a3b8]' : ''}`} />
            {KIND[k].name}
          </span>
        ))}
        <span className="text-[#475569] sm:ml-auto lg:hidden">Swipe sideways on a phone →</span>
      </figcaption>
    </figure>
  );
}

const SESSIONS: { k: Kind; what: string }[] = [
  { k: 'easy', what: 'A relaxed run at a pace where you can talk in full sentences. It builds your base without tiring you out.' },
  { k: 'int', what: '10 minutes easy jog, then the fast parts with easy jogging or walking between, then 5–10 minutes easy. Fast means hard but controlled, not a sprint.' },
  { k: 'long', what: 'Your longest run of the week, at easy pace. It teaches your legs to keep going. Walk breaks are fine.' },
  { k: 'str', what: 'About 30 minutes: squats, lunges, step-ups, calf raises, glute bridges and a plank. Strong legs handle more km.' },
  { k: 'rest', what: 'No running. A gentle walk or stretching is fine. Rest is when your body adapts to the training.' },
];

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#f8f9ff]"
      jsonLd={[
        appLd('Free run tracker to follow a 10K training plan: GPS km, pace, km splits, weekly km and longest run, plus a gym log for strength days.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, '10K training plan'),
        howToLd('How to track a 10K training plan in RepUp', TRACK),
      ]}
    >
      {/* Hero: calendar wall */}
      <section className="relative overflow-hidden border-b border-[#c7d2fe] bg-[#eef2ff]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.25), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#6366f1]"
          loginClass="text-[#3730a3] hover:text-[#1e1b4b]"
          ctaClass="bg-[#1e1b4b] text-white hover:bg-[#312e81]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-6 md:pt-14 md:pb-20">
          <div className="grid items-end gap-6 md:grid-cols-[1.4fr_1fr] md:gap-12">
            <div>
              <p className="w-fit rounded-full bg-[#6366f1] px-3 py-1 text-xs font-semibold text-white">8 weeks · 3 runs + 1 strength day</p>
              <h1 className="mt-5 text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#1e1b4b] sm:text-5xl md:text-[3.4rem]">
                10K training plan for beginners, <span className="text-[#4f46e5]">week by week</span>
              </h1>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-lg leading-relaxed text-[#334155]">
                Can you run 5 km? Then 10 km is eight weeks away. Here is the whole plan on one wall: follow it, and track every
                run free in RepUp.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={SIGNUP_HREF}
                  className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
                >
                  Track my 10K training
                </Link>
                <a href="#weeks" className="rounded-xl border border-[#a5b4fc] bg-white px-6 py-3.5 text-base font-semibold text-[#1e1b4b] hover:bg-[#f5f7ff]">
                  Plan details
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <CalendarWall />
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className={label}>How do I train for a 10K as a beginner?</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#1e1b4b] sm:text-2xl">
          Once you can run 5 km, train for 8 weeks with three runs a week: one easy run, one interval session and one long run
          that grows from 5 km to about 9 km. Add one strength session, rest on the other days, and take week 4 and week 8
          lighter. Run most km slowly.
        </p>
      </section>

      {/* Session types */}
      <section className="border-y border-[#e0e7ff] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className={`mb-3 ${label}`}>The building blocks</p>
          <h2 className={h2}>Five kinds of day, one 10K</h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#475569]">
            Start here only if you can already run about 5 km or 30 minutes without stopping. If not, the{' '}
            <A href="/couch-to-5k-plan">couch to 5K plan</A> gets you there first.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SESSIONS.map((s) => (
              <li key={s.k} className="flex flex-col overflow-hidden rounded-2xl border border-[#e0e7ff] bg-white">
                <span className={`px-5 py-3 font-semibold ${KIND[s.k].cell}`}>{KIND[s.k].name}</span>
                <p className="p-5 text-[15px] leading-relaxed text-[#475569]">{s.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Week table */}
      <section id="weeks" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-16 sm:px-6 md:py-24">
        <p className={`mb-3 ${label}`}>The plan</p>
        <h2 className={h2}>8 week 10K plan, in detail</h2>
        <p className="mt-4 mb-10 max-w-2xl text-[17px] leading-relaxed text-[#475569]">
          Tuesday easy run, Wednesday strength, Thursday intervals, Saturday long run. Move days around to fit your week, but
          keep a rest day between the intervals and the long run.
        </p>
        <DataTable
          minWidth={720}
          head={['Week', 'Easy run (Tue)', 'Intervals (Thu)', 'Long run (Sat)', 'Note']}
          rows={PLAN.map((p, i) => [
            `Week ${i + 1}`,
            p.easy,
            i === PLAN.length - 1 ? '3 km easy + 4 short, relaxed speed-ups' : (
              <Fragment key="i">
                {p.int} fast
                <span className="block text-xs text-[#737373]">{RECOVERY[p.int]} between</span>
              </Fragment>
            ),
            i === PLAN.length - 1 ? <b key="r" className="text-[#4338ca]">10K run</b> : p.long,
            p.note,
          ])}
          caption="A general guide for healthy adults, not a medical programme. Strength on Wednesday in weeks 1–7; rest instead in week 8."
        />
      </section>

      {/* Pacing */}
      <section className="bg-[#1e1b4b] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#a5b4fc] uppercase">Pacing</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">How fast should each run be?</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['Easy and long runs', 3, 'You can talk in full sentences. For many people that is 1 to 2 minutes per km slower than their best 5K pace. Most of your km live here.'],
              ['Intervals', 7, 'Hard but controlled: you can say a few words, not chat. Run every rep at the same speed. If the last one is much slower, start slower next time.'],
              ['10K day', 6, 'Start the first 2 km a little slower than you think. Hold steady through the middle, then speed up in the last 2 km if you feel good.'],
            ].map(([t, effort, body]) => (
              <li key={t as string} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                <h3 className="text-lg font-semibold">{t}</h3>
                <div className="mt-3 flex gap-1" role="img" aria-label={`Effort about ${effort} out of 10`}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className={`h-2 flex-1 rounded-full ${i < (effort as number) ? 'bg-[#818cf8]' : 'bg-white/15'}`} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-white/60">Effort ~{effort as number}/10</p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/75">{body as string}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-white/75">
            Want a goal time? A 60-minute 10K is 6:00 per km, and a 70-minute 10K is 7:00 per km. Try your own numbers in the{' '}
            <Link href="/running-pace-calculator" className="font-medium text-[#c7d2fe] underline underline-offset-4">
              running pace calculator
            </Link>
            . In hot months, run early and judge by effort, not pace.
          </p>
        </div>
      </section>

      {/* Track in RepUp */}
      <section className="border-b border-[#e0e7ff] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.25fr] md:py-24 [&>*]:min-w-0">
          <div className="flex justify-center">
            <PhoneMock screen="run-week" />
          </div>
          <div>
            <p className={`mb-3 ${label}`}>Track it</p>
            <h2 className={h2}>How to track your 10K plan in RepUp</h2>
            <ol className="mt-8 flex flex-col gap-5">
              {TRACK.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#6366f1] text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#1e1b4b]">{s.name}</h3>
                    <p className="mt-0.5 leading-relaxed text-[#475569]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[17px] leading-relaxed text-[#475569]">
              New to the gym side? See <A href="/strength-training-for-runners">strength training for runners</A> for the
              exercises, or the <A href="/beginner-gym-workout-plan">beginner gym plan</A> if you want more. Both log in the same
              account as your runs.
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

      {/* Safety */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <div className="rounded-3xl border-l-4 border-[#6366f1] bg-white p-6 ring-1 ring-[#e0e7ff] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1e1b4b]">Run 10K without getting hurt</h2>
          <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[17px] leading-relaxed text-[#475569]">
            <li>Sharp pain, or pain that makes you limp, means stop. Rest and repeat the week when it is gone.</li>
            <li>Do not add km to catch up after a missed week. Repeat the last week you finished.</li>
            <li>Sleep, food and water matter as much as the runs, especially in hot weather.</li>
            <li>Check with a doctor before you start if you have a heart condition, chest pain, high blood pressure or diabetes, or if you are pregnant.</li>
          </ul>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="10K plan questions" />

      <CtaBand
        title="Eight weeks. Ten kilometres."
        body="Follow the plan here, track every run and strength day in RepUp. Free, no ads."
        cta="Track my 10K training"
      />
    </LandingShell>
  );
}
