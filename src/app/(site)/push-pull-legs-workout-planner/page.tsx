import Link from 'next/link';
import { cn } from 'cn';
import { A, CtaBand, DataTable, FaqSection, LandingShell, PlanCard, Prose, ShortAnswer } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /push-pull-legs-workout-planner. Archetype "three big tiles": violet-to-blue
 * band with PUSH / PULL / LEGS tiles, then calendar week grids, plan cards,
 * fit cards, comparison and setup. Accent: blue #2563eb.
 * Main keywords: push pull legs split, PPL workout plan, PPL routine, weekly
 * workout planner, 3 day / 6 day gym split.
 */

const PATH = '/push-pull-legs-workout-planner';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Push Pull Legs Split: 3 & 6 Day PPL Workout Plan | RepUp',
  description:
    'A simple push pull legs split for 3 or 6 days a week, with exercises, sets and reps for each day. Plan your PPL routine in RepUp, the free workout planner.',
  keywords: [
    'push pull legs split',
    'PPL workout plan',
    'PPL routine',
    'push pull legs workout',
    'weekly workout planner',
    '3 day gym split',
    '6 day gym split',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'What is a push pull legs split?',
    a: 'It is a way to split your gym week by movement. Push day trains chest, shoulders and triceps. Pull day trains back and biceps. Legs day trains quads, hamstrings, glutes and calves.',
  },
  {
    q: 'Is PPL better 3 days or 6 days a week?',
    a: 'Both work. Three days trains each muscle once a week and fits a busy life. Six days trains each muscle twice a week, which gives more practice and more weekly sets, but needs good sleep and food to recover.',
  },
  {
    q: 'Is push pull legs good for beginners?',
    a: 'It can be, but many beginners do better with full body or upper/lower at first, because each muscle gets trained more often. If you only have three days, a full body plan is a strong start.',
  },
  {
    q: 'How many exercises should each PPL day have?',
    a: 'Four to six is plenty. Start with one or two big lifts, then add smaller exercises. Most sessions fit in about an hour.',
  },
  {
    q: 'Can I plan my PPL routine in RepUp?',
    a: 'Yes. Name each day of the week (Push, Pull, Legs), add exercises with sets × reps, and leave rest days empty. Each week the same day shows the same plan, and you can change it any time.',
  },
  {
    q: 'When should I add weight on a PPL plan?',
    a: 'When you hit your goal reps on every set with good form, add the smallest step, like 2.5 kg on a barbell. RepUp shows last time and tells you when it is time to go up.',
  },
];

const DAYS: { key: 'Push' | 'Pull' | 'Legs'; title: string; subtitle: string; when: string; rows: [string, string][] }[] = [
  {
    key: 'Push',
    title: 'Push day',
    subtitle: 'Chest · Shoulders · Triceps',
    when: 'Mon · Thu',
    rows: [
      ['Bench press', '3 × 6–8'],
      ['Overhead press', '3 × 8–10'],
      ['Incline dumbbell press', '3 × 8–12'],
      ['Lateral raise', '3 × 12–15'],
      ['Triceps pushdown', '3 × 10–12'],
    ],
  },
  {
    key: 'Pull',
    title: 'Pull day',
    subtitle: 'Back · Rear delts · Biceps',
    when: 'Tue · Fri',
    rows: [
      ['Lat pulldown or pull-ups', '3 × 8–10'],
      ['Barbell or cable row', '3 × 8–10'],
      ['Face pull', '3 × 12–15'],
      ['Dumbbell curl', '3 × 10–12'],
      ['Hammer curl', '2 × 10–12'],
    ],
  },
  {
    key: 'Legs',
    title: 'Legs day',
    subtitle: 'Quads · Hamstrings · Glutes · Calves',
    when: 'Wed · Sat',
    rows: [
      ['Squat', '3 × 6–8'],
      ['Romanian deadlift', '3 × 8–10'],
      ['Leg press', '3 × 10–12'],
      ['Leg curl', '3 × 10–12'],
      ['Standing calf raise', '3 × 10–15'],
    ],
  },
];

const WEEK3 = ['Push', 'Rest', 'Pull', 'Rest', 'Legs', 'Rest', 'Rest'];
const WEEK6 = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'];
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEPS = [
  { name: 'Open your week', text: 'In RepUp, open the weekly plan. You will see Monday to Sunday.' },
  { name: 'Name the days', text: 'Monday: Push. Tuesday: Pull. Wednesday: Legs. For 6 days, repeat on Thursday, Friday and Saturday.' },
  { name: 'Add exercises', text: 'Add each exercise with sets × reps, like Bench press 3 × 8. Make your own exercise if it is missing.' },
  { name: 'Leave rest days empty', text: 'A day with no plan is a rest day. Sunday off is a good default.' },
  { name: 'Train and log', text: 'Open today’s workout, log kg and reps, and beat last time next week.' },
];

const FIT = [
  { good: true, t: 'You can train 3 or 6 days', d: 'And you like short, focused sessions on one area at a time.' },
  { good: true, t: 'You have a few months in', d: 'You have trained for a while and want more sets per muscle.' },
  { good: false, t: 'You are brand new, 3 days only', d: 'Full body trains each muscle more often, which suits beginners.' },
  { good: false, t: 'Your week is unpredictable', d: 'Missing Legs every week is a common PPL trap. A shorter split may fit better.' },
];

/** Training-day colours: shades of the blue accent so Push/Pull/Legs read apart. */
const DAY_STYLE: Record<string, string> = {
  Push: 'bg-[#2563eb] text-white border-[#2563eb]',
  Pull: 'bg-[#1e40af] text-white border-[#1e40af]',
  Legs: 'bg-[#0b0a1f] text-white border-[#0b0a1f]',
  Rest: 'bg-white text-[#737373] border-dashed border-[#d4d4d4]',
};

function WeekCalendar({ title, note, days }: { title: string; note: string; days: string[] }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-[#525252]">{note}</p>
      </div>
      <ol className="mt-4 -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:grid md:grid-cols-7 md:overflow-visible md:pb-0">
        {days.map((d, i) => (
          <li
            key={i}
            className={cn(
              'flex w-[88px] shrink-0 snap-start flex-col justify-between gap-6 rounded-xl border-2 p-3 md:h-32 md:w-auto',
              DAY_STYLE[d],
            )}
          >
            <span className={cn('text-xs font-semibold uppercase', d === 'Rest' ? 'text-[#a3a3a3]' : 'text-white/70')}>{WD[i]}</span>
            <span className="text-base font-semibold md:text-lg">{d}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function PushPullLegsPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free weekly workout planner and gym tracker: set up a push pull legs split, log sets, reps and kg, and beat last time.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Push pull legs workout planner'),
        howToLd('How to set up a push pull legs week in RepUp', STEPS),
      ]}
    >
      {/* Hero: three big tiles */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 45%, #2563eb 100%)' }}
      >
        <SiteNav
          upClass="text-[#c4b5fd]"
          loginClass="text-white/85 hover:text-white"
          ctaClass="bg-white text-[#4c1d95] hover:bg-white/90"
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 pt-10 text-center sm:px-6 md:pt-14">
          <p className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium">
            PPL workout plan · 3 or 6 days
          </p>
          <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Push pull legs split, planned in minutes
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/85">
            A clear PPL routine with exercises, sets and reps for every day. Copy it into RepUp, the free weekly workout
            planner, and log every set as kg × reps.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#6d28d9] shadow-lg shadow-black/20 hover:bg-white/90"
            >
              Plan my PPL week
            </Link>
            <a href="#plan" className="rounded-xl border border-white/35 px-6 py-3.5 text-base font-semibold hover:bg-white/10">
              See the plan
            </a>
          </div>
        </div>
        <ul className="mx-auto grid w-full max-w-6xl gap-4 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-3 md:pt-16 md:pb-20">
          {DAYS.map((d, i) => (
            <li
              key={d.key}
              className={cn(
                'flex flex-col gap-5 rounded-3xl p-6 shadow-2xl shadow-black/20 sm:p-7 md:min-h-[380px]',
                i === 1 ? 'bg-[#0b0a1f] text-white md:-translate-y-4' : 'bg-white text-[#0a0a0a]',
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('text-sm font-semibold tabular-nums', i === 1 ? 'text-[#93c5fd]' : 'text-[#2563eb]')}>
                  0{i + 1}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    i === 1 ? 'bg-white/10 text-white' : 'bg-[#2563eb]/10 text-[#1d4ed8]',
                  )}
                >
                  {d.when}
                </span>
              </div>
              <div>
                <p className={cn('text-5xl font-bold tracking-tight uppercase', i === 1 ? 'text-white' : 'text-[#2563eb]')}>{d.key}</p>
                <p className={cn('mt-2 text-sm', i === 1 ? 'text-white/70' : 'text-[#525252]')}>{d.subtitle}</p>
              </div>
              <ul className={cn('mt-auto flex flex-col divide-y', i === 1 ? 'divide-white/10' : 'divide-[#ededed]')}>
                {d.rows.slice(0, 3).map(([ex, sr]) => (
                  <li key={ex} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
                    <span className="font-medium">{ex}</span>
                    <span className={cn('shrink-0 tabular-nums', i === 1 ? 'text-white/70' : 'text-[#525252]')}>{sr}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <ShortAnswer label="What is a push pull legs split?">
        <p>
          A push pull legs (PPL) split groups exercises by movement. Push day trains chest, shoulders and triceps. Pull day
          trains back and biceps. Legs day trains quads, hamstrings, glutes and calves. Run it 3 days a week to train each
          muscle once, or 6 days to train each muscle twice.
        </p>
      </ShortAnswer>

      {/* Calendars */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#2563eb] uppercase">Your week</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">3-day or 6-day PPL routine?</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Pick the week you can actually stick to. Missing workouts hurts more than choosing the “wrong” split.
          </p>
          <div className="mt-10 flex flex-col gap-10">
            <WeekCalendar title="3 days a week" note="Each muscle 1× per week" days={WEEK3} />
            <WeekCalendar title="6 days a week" note="Each muscle 2× per week" days={WEEK6} />
          </div>
          <p className="mt-8 max-w-2xl leading-relaxed text-[#404040]">
            Six days is a lot. Start with three or four and build up. A 4-day version also works: Push, Pull, Legs, rest, then
            carry on where you left off.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section id="plan" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-16 sm:px-6 md:py-20">
        <p className="mb-3 text-sm font-semibold tracking-wide text-[#2563eb] uppercase">The plan</p>
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">PPL workout plan: exercises, sets and reps</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Five exercises a day. Rest about 2–3 minutes on the big lifts and 1–2 minutes on the small ones. On a 6-day week,
          repeat the same days, or swap in a close variation the second time, like incline bench instead of flat.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {DAYS.map((d, i) => (
            <PlanCard key={d.key} title={d.title} subtitle={d.subtitle} rows={d.rows} featured={i === 1} />
          ))}
        </div>
        <Prose className="mt-8">
          <p>
            Use the rep range like a ladder. Add reps each week, and when you reach the top on every set, add a little weight.
            That is <A href="/progressive-overload-tracker">progressive overload with double progression</A>.
          </p>
        </Prose>
      </section>

      {/* Who it suits + comparison */}
      <section className="border-y border-[#2563eb]/15 bg-[#2563eb]/[0.04]">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 [&>*]:min-w-0">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Who is a push pull legs split for?</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {FIT.map((f) => (
                <li key={f.t} className="flex flex-col gap-2 rounded-2xl border border-[#e5e5e5] bg-white p-5">
                  <span
                    className={cn(
                      'w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      f.good ? 'bg-[#10b981]/12 text-[#047857]' : 'bg-[#f5f5f5] text-[#404040]',
                    )}
                  >
                    {f.good ? '✓ Good fit' : '! Think twice'}
                  </span>
                  <h3 className="font-semibold">{f.t}</h3>
                  <p className="text-[15px] leading-relaxed text-[#525252]">{f.d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">PPL vs upper/lower vs full body</h2>
            <div className="mt-8">
              <DataTable
                head={['Split', 'Days / week', 'Good for']}
                minWidth={420}
                rows={[
                  ['Full body', '2–3', 'Beginners, busy weeks'],
                  ['Upper / Lower', '4', 'Beginners to intermediate'],
                  [<span key="p" className="text-[#2563eb]">Push Pull Legs</span>, '3 or 6', 'Intermediate, more volume'],
                ]}
              />
            </div>
            <Prose className="mt-6">
              <p>
                Just starting out? Our <A href="/beginner-gym-workout-plan">beginner gym workout plan</A> has full body and
                upper/lower weeks you can switch to PPL later.
              </p>
            </Prose>
          </div>
        </div>
      </section>

      {/* Setup in RepUp */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.3fr_1fr] [&>*]:min-w-0">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#2563eb] uppercase">In the app</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">How to set up your PPL week in RepUp</h2>
            <p className="mt-3 text-lg leading-relaxed text-[#525252]">
              Every week the same day shows the same plan. While you lift, last time’s numbers sit next to today’s boxes.
            </p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li
                  key={s.name}
                  className={cn('rounded-2xl border border-[#e5e5e5] bg-white p-5', i === STEPS.length - 1 && 'sm:col-span-2')}
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-semibold">{s.name}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#525252]">{s.text}</p>
                </li>
              ))}
            </ol>
            <Prose className="mt-6">
              <p>
                It works offline and keeps your <A href="/workout-log">workout log</A> on your phone and laptop.
              </p>
            </Prose>
          </div>
          <PhoneMock screen="week" className="rotate-2" />
        </div>
      </section>

      <FaqSection faqs={FAQS} title="PPL questions" />

      <CtaBand
        title="Push. Pull. Legs. Repeat."
        body="Free, no ads. Set up your week once and just show up."
        cta="Plan my PPL week"
      />
    </LandingShell>
  );
}
