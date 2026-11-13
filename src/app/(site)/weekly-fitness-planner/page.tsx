import Link from 'next/link';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/weekly-fitness-planner". Layout: "planner page". Paper background
 * (#fdfcfb) with faint ruled lines; the hero shows a spiral-bound planner page
 * (ring holes on the left, peach washi tape) with Mon–Sun rows, tick boxes and
 * entries mixing gym and runs. Then numbered steps in a margin-rule style, three
 * template weeks as planner cards, a phone split and sticky-note tips.
 * Accents: lavender #8b5cf6 (small text #6d28d9) and peach #fdba74 (text on
 * peach #7c2d12).
 * Main keywords: weekly fitness planner, weekly workout schedule, workout
 * planner template, fitness plan for the week.
 */

const PATH = '/weekly-fitness-planner';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Weekly Fitness Planner: 3 Free Workout Templates | RepUp',
  description:
    'A simple weekly fitness planner: how to plan gym days, runs and rest, three free workout planner templates, and a free app to tick off every session.',
  keywords: [
    'weekly fitness planner',
    'weekly workout schedule',
    'workout planner template',
    'fitness plan for the week',
    'weekly workout planner app',
    'gym and running weekly plan',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'What should a weekly workout schedule look like?',
    a: 'Give each day one main job: strength, cardio or rest. Most people do well with 2–4 strength days, 2–3 cardio days or walks, and at least one full rest day. Keep hard days apart so you recover in between.',
  },
  {
    q: 'How many rest days do I need in a week?',
    a: 'At least one full rest day a week. Beginners often do best with two or three days without hard training. Easy walks on rest days are fine and usually help you feel better.',
  },
  {
    q: 'Can I lift and run in the same week?',
    a: 'Yes. Put your hard leg session and your hardest run on different days, and keep runs easy the day after leg day. Many people lift 2–3 days and run 2–3 days in the same week.',
  },
  {
    q: 'What if I miss a day?',
    a: 'Just move on. Do the next session in your plan, or shift the week by a day. Do not try to squeeze two hard sessions into one day to catch up.',
  },
  {
    q: 'Is there a workout planner template in RepUp?',
    a: 'RepUp gives you a Mon–Sun weekly plan where you add your own gym days with sets × reps. It does not include ready-made training plans; the templates on this page are guides you can copy in.',
  },
  {
    q: 'Can I plan runs in RepUp too?',
    a: 'Runs and walks live in Running mode, which you switch to from the account menu. Its week view shows which days you ran, and you can tap a day to see its runs. You decide which days to run; RepUp records them.',
  },
];

/** Hero planner rows: day, entry, kind, ticked. */
const PLANNER: [day: string, entry: string, kind: 'gym' | 'run' | 'rest', done: boolean][] = [
  ['Mon', 'Push · bench 3×8, OHP 3×10', 'gym', true],
  ['Tue', 'Easy run 4 km 🏃', 'run', true],
  ['Wed', 'Pull · rows, pulldown, curls', 'gym', true],
  ['Thu', 'Walk 40 min', 'run', false],
  ['Fri', 'Legs · squat 3×8, RDL 3×10', 'gym', false],
  ['Sat', 'Long easy run 6 km', 'run', false],
  ['Sun', 'Rest 😴 + stretch', 'rest', false],
];

const STEPS = [
  { name: 'Count your real free days', text: 'Look at your week honestly. Three sessions you always do beat six you sometimes do.' },
  { name: 'Place strength days first', text: 'Put gym days with at least one day between hard sessions for the same muscles, e.g. Mon, Wed, Fri.' },
  { name: 'Add runs or walks around them', text: 'Fill other days with cardio. Keep the day after leg day easy: a walk or a short, slow run.' },
  { name: 'Keep one full rest day', text: 'At least one day off a week. Sleep and rest are when your body gets stronger.' },
  { name: 'Write it down and tick it off', text: 'Add gym days to RepUp’s Mon–Sun plan. Track runs in Running mode. Log every set and every run.' },
];

const TEMPLATES: { name: string; tag: string; who: string; days: [string, string][] }[] = [
  {
    name: 'Starter week',
    tag: '3 gym · 2 walks',
    who: 'New to training, or coming back after a break.',
    days: [
      ['Mon', 'Full body A'],
      ['Tue', 'Brisk walk 30 min'],
      ['Wed', 'Full body B'],
      ['Thu', 'Rest'],
      ['Fri', 'Full body A'],
      ['Sat', 'Walk 45 min or easy run-walk'],
      ['Sun', 'Rest'],
    ],
  },
  {
    name: 'Gym-first week',
    tag: '4 gym · 2 cardio',
    who: 'You mostly want strength and muscle, plus some fitness.',
    days: [
      ['Mon', 'Upper body'],
      ['Tue', 'Lower body'],
      ['Wed', 'Easy run 30 min'],
      ['Thu', 'Upper body'],
      ['Fri', 'Lower body'],
      ['Sat', 'Long walk or easy run'],
      ['Sun', 'Rest'],
    ],
  },
  {
    name: 'Runner’s week',
    tag: '3 runs · 2 gym',
    who: 'Running comes first; strength keeps you strong and steady.',
    days: [
      ['Mon', 'Strength: full body'],
      ['Tue', 'Easy run 5 km'],
      ['Wed', 'Rest or walk'],
      ['Thu', 'Steady run 4–6 km'],
      ['Fri', 'Strength: legs + core (light)'],
      ['Sat', 'Long easy run'],
      ['Sun', 'Rest'],
    ],
  },
];

const TIPS = [
  { t: 'Hard, easy, hard', d: 'Follow a hard day with an easy one. Your body adapts on the easy days.', c: 'bg-[#fff3e6]', r: '-rotate-1' },
  { t: 'Have a 20-minute plan B', d: 'Busy day? Do the first two exercises, or a 20-minute walk. Something beats nothing.', c: 'bg-[#f3efff]', r: 'rotate-1' },
  { t: 'Same days, same time', d: 'Fixed days turn workouts into a habit, like brushing your teeth.', c: 'bg-[#fff3e6]', r: 'rotate-1' },
  { t: 'Review on Sunday', d: 'Two minutes: what got done, what didn’t, and what to change next week.', c: 'bg-[#f3efff]', r: '-rotate-1' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#1c1917] sm:text-4xl';
const kicker = 'mb-3 text-sm font-semibold tracking-wide text-[#6d28d9] uppercase';
/** Faint notebook lines for paper areas. */
const ruled = { backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 39px, rgba(139,92,246,0.10) 39px 40px)' };

function PlannerPage() {
  return (
    <div role="img" aria-label="A weekly fitness planner page: gym days and runs for Monday to Sunday, the first three ticked off" className="relative mx-auto w-full max-w-[460px]">
      {/* washi tape */}
      <span aria-hidden className="absolute -top-3 left-1/2 z-20 h-7 w-32 -translate-x-1/2 -rotate-3 rounded-sm bg-[#fdba74]/80 shadow-sm" />
      <div aria-hidden className="relative rotate-1 rounded-2xl rounded-l-md border border-[#e7e1da] bg-white py-6 pr-4 pl-12 shadow-[0_20px_50px_-20px_rgba(76,29,149,0.35)] sm:pr-6 sm:pl-16">
        {/* ring holes + rings */}
        <div className="absolute inset-y-4 left-0 flex w-10 flex-col justify-around sm:w-12">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="relative ml-3 block h-3.5 w-3.5 rounded-full bg-[#fdfcfb] shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] sm:ml-4">
              <span className="absolute top-1/2 -left-5 h-1.5 w-7 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#a8a29e] via-[#e7e5e4] to-[#a8a29e]" />
            </span>
          ))}
        </div>
        {/* red margin line */}
        <span className="absolute inset-y-0 left-10 w-px bg-[#fda4af]/70 sm:left-12" />
        <div className="flex items-baseline justify-between gap-2 border-b-2 border-[#8b5cf6]/30 pb-3">
          <p className="text-lg font-semibold tracking-tight text-[#1c1917] italic sm:text-xl">My week</p>
          <p className="text-xs text-[#78716c] italic sm:text-sm">9 – 15 Nov</p>
        </div>
        <ul className="mt-1">
          {PLANNER.map(([day, entry, kind, done]) => (
            <li key={day} className="flex items-center gap-3 border-b border-dashed border-[#e7e1da] py-2.5 last:border-0 sm:gap-4">
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-[5px] border-2 text-[12px] font-bold ${
                  done ? 'border-[#8b5cf6] bg-[#8b5cf6] text-white' : 'border-[#d6d3d1] bg-white'
                }`}
              >
                {done ? '✓' : ''}
              </span>
              <span className="w-9 shrink-0 text-xs font-semibold tracking-wide text-[#57534e] uppercase">{day}</span>
              <span
                className={`min-w-0 rounded px-1.5 text-[14px] leading-snug italic sm:text-[15px] ${
                  kind === 'run' ? 'bg-[#fdba74]/40 text-[#7c2d12]' : kind === 'gym' ? 'text-[#4c1d95]' : 'text-[#78716c]'
                } ${done ? 'line-through decoration-[#8b5cf6]/50' : ''}`}
              >
                {entry}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-sm text-[#6d28d9] italic">3 of 7 done — nice! ✨</p>
      </div>
    </div>
  );
}

export default function WeeklyFitnessPlannerPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fdfcfb]"
      jsonLd={[
        appLd('Free gym workout and running tracker with a Mon–Sun weekly plan: plan your gym days, track your runs and tick off every session.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Weekly fitness planner'),
        howToLd('How to plan your fitness week', STEPS),
      ]}
    >
      {/* Hero: planner page */}
      <section className="relative overflow-hidden border-b border-[#ede9e3] bg-[#fdfcfb]" style={ruled}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(40% 50% at 85% 40%, rgba(139,92,246,0.14), transparent 70%), radial-gradient(35% 40% at 70% 95%, rgba(253,186,116,0.30), transparent 70%)',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#44403c] hover:text-[#1c1917]"
          ctaClass="bg-[#1c1917] text-white hover:bg-[#292524]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-8 pb-20 sm:px-6 md:grid-cols-[1fr_1fr] md:pt-14 md:pb-24 [&>*]:min-w-0">
          <div className="flex flex-col gap-6">
            <p className="w-fit rounded-md bg-[#fdba74] px-3 py-1 text-sm font-semibold text-[#7c2d12] -rotate-1">Plan it · do it · tick it</p>
            <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#1c1917] sm:text-5xl md:text-[3.4rem]">
              Weekly fitness planner for <span className="text-[#7c3aed]">gym days</span> and{' '}
              <span className="relative whitespace-nowrap">
                <span aria-hidden className="absolute inset-x-0 bottom-1 h-3 rounded bg-[#fdba74]/70" />
                <span className="relative">runs</span>
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#44403c]">
              A simple way to plan your fitness week: when to lift, when to run, when to rest. Plus three free template weeks you can
              copy today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
              >
                Plan my week free
              </Link>
              <a href="#templates" className="rounded-xl border border-[#d6d3d1] bg-white px-6 py-3.5 text-base font-semibold text-[#1c1917] hover:bg-[#fafaf9]">
                See 3 templates
              </a>
            </div>
          </div>
          <PlannerPage />
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="relative rounded-2xl border border-[#ede9e3] bg-white p-6 shadow-sm sm:p-10">
          <span aria-hidden className="absolute -top-3 left-8 h-6 w-20 -rotate-2 rounded-sm bg-[#8b5cf6]/25" />
          <h2 className={kicker}>The short answer</h2>
          <p className="text-xl leading-relaxed text-[#292524] sm:text-2xl">
            A good weekly fitness planner gives every day one job: strength, cardio or rest. Pick your training days first, keep hard
            sessions apart, put easy walks or runs in between and keep at least one full rest day. In RepUp, gym days go in the Mon–Sun
            plan and runs are tracked in Running mode.
          </p>
        </div>
      </section>

      {/* How to plan */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.5fr]">
          <div>
            <p className={kicker}>Five steps</p>
            <h2 className={h2}>How to plan your fitness week</h2>
            <p className="mt-4 text-lg leading-relaxed text-[#57534e]">
              Takes ten minutes on a Sunday. Do it once, then keep the same shape every week and only change what isn’t working.
            </p>
          </div>
          <ol className="flex flex-col rounded-2xl border border-[#ede9e3] bg-white">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-4 border-b border-[#ede9e3] p-5 last:border-0 sm:gap-6 sm:p-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#8b5cf6] text-lg font-semibold text-[#6d28d9] italic">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#1c1917]">{s.name}</h3>
                  <p className="mt-1 leading-relaxed text-[#57534e]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="scroll-mt-8 border-y border-[#ede9e3] bg-[#f8f5ff]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kicker}>Workout planner templates</p>
          <h2 className={h2}>Three weekly workout schedules to copy</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#57534e]">
            Pick the one closest to your goal. Swap days to fit your life, but keep the order of hard and easy days. Peach rows are
            runs or walks.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <article key={t.name} className="relative rounded-2xl border border-[#e9e3f8] bg-white p-6 shadow-sm">
                <span aria-hidden className="absolute -top-2.5 right-6 h-5 w-16 rotate-3 rounded-sm bg-[#fdba74]/80" />
                <p className="w-fit rounded-full bg-[#ede9fe] px-2.5 py-0.5 text-xs font-semibold text-[#5b21b6]">{t.tag}</p>
                <h3 className="mt-3 text-xl font-semibold text-[#1c1917]">{t.name}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-[#57534e]">{t.who}</p>
                <ul className="mt-5 flex flex-col">
                  {t.days.map(([d, what]) => {
                    const cardio = /run|walk/i.test(what);
                    const rest = /^rest$/i.test(what);
                    return (
                      <li key={d} className="flex items-center gap-3 border-t border-dashed border-[#e7e1da] py-2.5 text-[15px]">
                        <span aria-hidden className={`size-4 shrink-0 rounded border-2 ${rest ? 'border-[#d6d3d1]' : 'border-[#8b5cf6]'}`} />
                        <span className="w-9 shrink-0 text-xs font-semibold text-[#57534e] uppercase">{d}</span>
                        <span
                          className={`rounded px-1.5 ${cardio ? 'bg-[#fdba74]/35 text-[#7c2d12]' : rest ? 'text-[#78716c]' : 'font-medium text-[#1c1917]'}`}
                        >
                          {what}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-[17px] leading-relaxed text-[#44403c]">
            Need the exercises for those gym days? Use the <A href="/beginner-gym-workout-plan">beginner gym plan</A> for full body
            days or the <A href="/push-pull-legs-workout-planner">push pull legs planner</A> for more days. Want a bigger mix of both?
            See the <A href="/hybrid-training-plan">hybrid training plan</A>.
          </p>
        </div>
      </section>

      {/* In RepUp */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
        <div className="relative flex justify-center">
          <span aria-hidden className="absolute top-6 -left-2 h-40 w-40 rounded-full bg-[#fdba74]/30 blur-2xl" />
          <PhoneMock screen="week" theme="light" className="relative -rotate-2" />
        </div>
        <div>
          <p className={kicker}>Your planner in your pocket</p>
          <h2 className={h2}>Turn the plan into a week you tick off</h2>
          <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#44403c]">
            <p>
              <b className="font-semibold text-[#1c1917]">Gym days:</b> in Workout mode, add each workout to its day in the Mon–Sun
              plan, with sets × reps for every exercise. On the day, RepUp opens today’s workout, shows what you lifted last time and
              suggests a target.
            </p>
            <p>
              <b className="font-semibold text-[#1c1917]">Runs and walks:</b> switch to Running mode from the account menu. Track a run
              or walk with GPS (keep the screen on and RepUp open), or add a treadmill session by hand. The week view marks the days you
              ran; tap a day to see its runs.
            </p>
            <p className="text-[15px] text-[#57534e]">
              RepUp has no built-in training plans: you choose the days, it records what you did. Running after squats? Read{' '}
              <A href="/run-after-leg-day">running after leg day</A> first.
            </p>
          </div>
          <Link href={SIGNUP_HREF} className="mt-8 inline-block rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white hover:bg-[#6d28d9]">
            Start my weekly plan
          </Link>
        </div>
      </section>

      {/* Tips as sticky notes */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <p className={kicker}>Make it stick</p>
        <h2 className={h2}>Tips for a fitness plan you will actually follow</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((t) => (
            <li key={t.t} className={`rounded-md p-6 shadow-[0_10px_25px_-12px_rgba(28,25,23,0.35)] ${t.c} ${t.r}`}>
              <h3 className="text-lg font-semibold text-[#1c1917] italic">{t.t}</h3>
              <p className="mt-2 leading-relaxed text-[#44403c]">{t.d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-[#78716c]">
          General guidance for healthy adults. If you have an injury, a health condition or are pregnant, check with a doctor before
          starting a new plan.
        </p>
      </section>

      <FaqSection faqs={FAQS} title="Weekly planner questions" />

      <CtaBand
        title="Plan the week. Tick every session."
        body="Gym days in your Mon–Sun plan, runs in Running mode. Free, no ads."
        cta="Plan my week free"
      />
    </LandingShell>
  );
}
