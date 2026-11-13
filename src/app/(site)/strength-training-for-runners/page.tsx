import Link from 'next/link';
import type { ReactNode } from 'react';
import { CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /strength-training-for-runners. Archetype "exercise deck": a dark navy page
 * whose hero shows a fanned hand of five exercise cards with sets × reps.
 * Accent: mint #34d399 on navy #0f172a (dark page, light FAQ band at the end).
 * Main keywords: strength training for runners, strength workout for runners,
 * leg exercises for runners, gym routine for runners.
 */

const PATH = '/strength-training-for-runners';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Strength Training for Runners: 2 Simple Gym Sessions | RepUp',
  description:
    'Strength training for runners made simple: two short gym sessions with sets and reps, the best leg exercises for runners, and where they fit in your week.',
  keywords: [
    'strength training for runners',
    'strength workout for runners',
    'leg exercises for runners',
    'gym routine for runners',
    'runners strength training plan',
    'weight training for runners',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'How often should runners do strength training?',
    a: 'Two sessions a week is a good target for most runners. One a week still helps if that is all you have time for. Close to a race, keep one short, lighter session or skip the last few days.',
  },
  {
    q: 'What are the best leg exercises for runners?',
    a: 'Squats, Romanian deadlifts, split squats, step-ups, hip thrusts and calf raises cover most of what runners need. Add a plank or side plank for the core. You do not need fancy machines.',
  },
  {
    q: 'Will lifting weights make me slower or bulky?',
    a: 'Unlikely. Two sessions a week with moderate reps, alongside regular running, is not a recipe for big muscle gain. Stronger legs and hips may help you hold good form late in a run and make hills feel easier.',
  },
  {
    q: 'Does strength training prevent running injuries?',
    a: 'It may help. Many coaches and physios suggest it because stronger muscles and tendons can handle running load better. It is not a guarantee, so build mileage slowly too, and see a doctor or physiotherapist for pain that does not go away.',
  },
  {
    q: 'Should I lift before or after a run?',
    a: 'If both are on the same day, run first when the run is the key session, then lift. On easy days the order matters less. Avoid heavy leg work the day before intervals or a long run.',
  },
  {
    q: 'How do I log a gym routine for runners in RepUp?',
    a: 'In Workout mode, add Session A and Session B to two days of your weekly plan with sets × reps, then log kg and reps for each set. Your runs go in Running mode in the same free account.',
  },
];

const DECK = [
  { name: 'Squat', sr: '3 × 6–8', m: 'Quads · glutes' },
  { name: 'Romanian deadlift', sr: '3 × 8', m: 'Hamstrings · glutes' },
  { name: 'Split squat', sr: '3 × 8 each', m: 'One leg at a time' },
  { name: 'Calf raise', sr: '3 × 12–15', m: 'Calves · Achilles' },
  { name: 'Plank', sr: '3 × 30–45 s', m: 'Core' },
];

const SESSIONS: { key: string; title: string; focus: string; rows: [string, string][] }[] = [
  {
    key: 'A',
    title: 'Session A',
    focus: 'Both legs + core',
    rows: [
      ['Goblet or back squat', '3 × 6–8'],
      ['Romanian deadlift', '3 × 8'],
      ['Standing calf raise', '3 × 12–15'],
      ['Glute bridge', '3 × 10–12'],
      ['Plank', '3 × 30–45 s'],
    ],
  },
  {
    key: 'B',
    title: 'Session B',
    focus: 'One leg at a time + upper',
    rows: [
      ['Bulgarian split squat', '3 × 8 each leg'],
      ['Step-up', '2 × 10 each leg'],
      ['Single-leg calf raise', '3 × 10–12 each'],
      ['One-arm dumbbell row', '3 × 10 each'],
      ['Push-up', '3 × 8–12'],
      ['Side plank', '2 × 20–30 s each'],
    ],
  },
];

const WEEK: [string, string, 'gym' | 'hard' | 'easy' | 'rest'][] = [
  ['Mon', 'Easy run + gym A', 'gym'],
  ['Tue', 'Rest or walk', 'rest'],
  ['Wed', 'Intervals', 'hard'],
  ['Thu', 'Easy run + gym B', 'gym'],
  ['Fri', 'Rest', 'rest'],
  ['Sat', 'Long run', 'hard'],
  ['Sun', 'Easy run or rest', 'easy'],
];

const STEPS = [
  { name: 'Add Session A and B', text: 'In Workout mode, open your weekly plan and add each exercise with sets × reps, for example Session A on Monday, B on Thursday.' },
  { name: 'Add missing exercises', text: 'Can’t find an exercise like Bulgarian split squat? Create your own custom exercise.' },
  { name: 'Log every set', text: 'At the gym, log kg (or lb) and reps for each set and tick it. It works offline too.' },
  { name: 'Beat last time', text: 'Next session, RepUp shows what you lifted last time and suggests today’s target.' },
];

const WEEK_STYLE = {
  gym: 'bg-[#34d399] text-[#022c22]',
  hard: 'bg-[#1e293b] text-white border border-[#34d399]/50',
  easy: 'bg-[#1e293b] text-white/85 border border-white/10',
  rest: 'border border-dashed border-white/20 text-white/60',
} as const;

function L({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-[#6ee7b7] underline decoration-[#6ee7b7]/50 underline-offset-4 hover:decoration-[#6ee7b7]">
      {children}
    </Link>
  );
}

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const kick = 'mb-3 text-sm font-semibold tracking-wide text-[#34d399] uppercase';

export default function StrengthTrainingForRunnersPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#0f172a] text-white"
      jsonLd={[
        appLd('Free workout tracker for runners: log strength sessions as sets, reps and kg, and track runs with GPS in the same account.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Strength training for runners'),
        howToLd('How to log strength training for runners in RepUp', STEPS),
      ]}
    >
      {/* Hero: exercise deck */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 60% at 75% 55%, rgba(52,211,153,0.18), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#34d399]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-[#34d399] text-[#022c22] hover:bg-[#6ee7b7]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-8 pb-16 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pt-14 md:pb-24 [&>*]:min-w-0">
          <div className="flex flex-col gap-6">
            <p className="w-fit rounded-full border border-[#34d399]/40 bg-[#34d399]/10 px-3 py-1 text-xs font-medium text-[#6ee7b7]">
              Gym routine for runners · 2 sessions a week
            </p>
            <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-[3.3rem]">
              Strength training for runners: <span className="text-[#34d399]">5 moves, 2 sessions</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/75">
              Five leg and core exercises, two short gym sessions, and where to put them in your running week. Log your sets in
              RepUp’s Workout mode and your runs in Running mode.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/30 hover:bg-[#6d28d9]"
              >
                Log my strength sessions
              </Link>
              <a href="#sessions" className="rounded-xl border border-[#34d399]/50 px-6 py-3.5 text-base font-semibold hover:bg-[#34d399]/10">
                See sessions A + B
              </a>
            </div>
          </div>

          <div
            className="relative mx-auto h-[420px] w-full max-w-[288px] sm:max-w-[320px] md:h-[460px] md:max-w-[380px]"
            role="img"
            aria-label="A deck of five exercise cards: squat 3 × 6–8, Romanian deadlift 3 × 8, split squat 3 × 8 each leg, calf raise 3 × 12–15, plank 3 × 30–45 s"
          >
            {DECK.map((c, i) => {
              const top = i === DECK.length - 1;
              const deg = [-3, 2, -2, 2.5, -1][i];
              const x = [-8, 8, -6, 8, 0][i];
              return (
                <div
                  key={c.name}
                  aria-hidden
                  className={`absolute inset-x-3 flex h-[168px] flex-col rounded-2xl border p-4 shadow-2xl shadow-black/60 md:h-[190px] md:p-5 ${
                    top ? 'border-[#34d399] bg-[#34d399] text-[#022c22]' : i % 2 ? 'border-white/10 bg-[#e2e8f0] text-[#0f172a]' : 'border-white/10 bg-[#f8fafc] text-[#0f172a]'
                  }`}
                  style={{ top: `${i * 62}px`, transform: `translateX(${x}px) rotate(${deg}deg)`, zIndex: i + 1 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex min-w-0 items-baseline gap-2">
                      <span className={`text-xs font-bold tabular-nums ${top ? 'text-[#022c22]/70' : 'text-[#047857]'}`}>0{i + 1}</span>
                      <span className="truncate text-[15px] font-bold sm:text-[17px] md:text-lg">{c.name}</span>
                    </p>
                    <span
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold tabular-nums ${top ? 'bg-[#022c22] text-[#34d399]' : 'bg-[#0f172a] text-white'}`}
                    >
                      {c.sr}
                    </span>
                  </div>
                  {top && <p className="mt-2 text-sm text-[#022c22]/80">{c.m}</p>}
                  {top && (
                    <div className="mt-auto flex items-end justify-between">
                      <span className="text-xs font-semibold text-[#022c22]/75">Log it in Workout mode</span>
                      <span className="flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="flex size-6 items-center justify-center rounded-md bg-[#022c22] text-[11px] font-bold text-[#34d399]">
                            ✓
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="border-y border-white/10 bg-[#111c33]">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          <h2 className={kick}>Short answer: what strength training should runners do?</h2>
          <p className="text-xl leading-relaxed text-white sm:text-2xl">
            Most runners do well with two strength sessions a week of about 30–45 minutes: squats, Romanian deadlifts, split
            squats, calf raises and a plank. Do them on easy-run days or after a hard run, not the day before intervals or a long
            run. Add weight slowly.
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kick}>Why bother</p>
        <h2 className={h2}>What a strength workout for runners may do for you</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Hold form late in a run', 'Stronger hips and legs may help you keep good form when you get tired.'],
            ['Make hills feel easier', 'More leg strength can make climbs and strong finishes feel less hard.'],
            ['Support your joints', 'Many coaches suggest it because it may help muscles and tendons handle running load.'],
            ['Stay balanced', 'Single-leg work trains each leg on its own, just like running does.'],
          ].map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-white/10 bg-[#1e293b] p-6">
              <span aria-hidden className="mb-4 block h-1 w-10 rounded-full bg-[#34d399]" />
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">{d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-white/75">
          It will not turn you into a bodybuilder. Two sessions a week next to regular running mostly makes you stronger, not much
          bigger. If you have a current injury, check with a doctor or physiotherapist first.
        </p>
      </section>

      {/* Sessions */}
      <section id="sessions" className="scroll-mt-8 border-y border-white/10 bg-[#111c33]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kick}>The routine</p>
          <h2 className={h2}>Gym routine for runners: Session A and Session B</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/75">
            Warm up with 5 minutes of easy cardio and a light set of the first exercise. Pick a weight where the last two reps are
            hard but your form stays clean. Rest about 1–2 minutes between sets. New to the gym? Start with body weight or very
            light dumbbells for two weeks.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {SESSIONS.map((s) => (
              <article key={s.key} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]">
                <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-[#34d399] text-3xl font-black text-[#022c22]">
                    {s.key}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="text-sm text-[#6ee7b7]">{s.focus}</p>
                  </div>
                </div>
                <ul className="divide-y divide-white/10">
                  {s.rows.map(([name, sr]) => (
                    <li key={name} className="flex items-center justify-between gap-3 px-6 py-3.5 text-[15px]">
                      <span className="font-medium">{name}</span>
                      <span className="shrink-0 text-right font-semibold text-white/80 tabular-nums">{sr}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-white/75">
            When every set feels solid, add a small step: one more rep, or 2.5 kg on a barbell. That slow, steady climb is{' '}
            <L href="/progressive-overload-tracker">progressive overload</L>, and it works for runners too.
          </p>
        </div>
      </section>

      {/* When */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kick}>Your week</p>
        <h2 className={h2}>When to do leg exercises in a running week</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/75">
          A simple rule: keep hard days hard and easy days easy. Lift on easy-run days or after a hard run, and leave a day before
          intervals and the long run.
        </p>
        <ol className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {WEEK.map(([d, t, k]) => (
            <li key={d} className={`flex flex-col gap-1 rounded-2xl p-4 lg:min-h-32 ${WEEK_STYLE[k]}`}>
              <span className="text-xs font-semibold uppercase opacity-75">{d}</span>
              <span className="leading-snug font-semibold">{t}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid max-w-3xl gap-4 text-[17px] leading-relaxed text-white/75">
          <p>
            Got legs that feel heavy the next day? That is normal in the first weeks. Read{' '}
            <L href="/run-after-leg-day">running after leg day</L> for what to do on sore legs.
          </p>
          <p>
            In the last week or so before a race, keep just one short, lighter session. Following a plan like the{' '}
            <L href="/half-marathon-training-plan">half marathon training plan</L> or trying to run a faster 5K? Slot A and B into your easy days the same way.
          </p>
        </div>
      </section>

      {/* Log in Workout mode */}
      <section className="border-t border-white/10 bg-[#111c33]">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.15fr] md:py-20 [&>*]:min-w-0">
          <div className="flex justify-center">
            <PhoneMock screen="log" className="-rotate-2" />
          </div>
          <div>
            <p className={kick}>In RepUp</p>
            <h2 className={h2}>How to log it in Workout mode</h2>
            <p className="mt-3 text-lg leading-relaxed text-white/75">
              RepUp is a free gym and running tracker. Your strength sessions go in Workout mode; switch to Running mode from the
              account menu for your runs. One account, phone and laptop.
            </p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.name} className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
                  <span className="text-sm font-bold text-[#34d399] tabular-nums">0{i + 1}</span>
                  <h3 className="mt-1 font-semibold">{s.name}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/70">{s.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 leading-relaxed text-white/75">
              See how both modes work together on the <L href="/gym-and-running-tracker">gym and running tracker</L> page.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-[#f8fafc] pt-4 text-[#0a0a0a]">
        <FaqSection faqs={FAQS} title="Strength training for runners: questions" />
        <CtaBand
          title="Stronger legs, better runs. Log both free."
          body="Free, no ads. Strength sessions in Workout mode, runs in Running mode, one account."
          cta="Start tracking free"
        />
      </div>
    </LandingShell>
  );
}
