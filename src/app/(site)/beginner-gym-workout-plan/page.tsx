import Link from 'next/link';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/beginner-gym-workout-plan". Layout: "friendly roadmap". Sky-tinted hero
 * with a centred headline, a 3-stop roadmap (weeks 1–2 → 3–8 → 9–12) and the
 * phone centred below; then rounded-3xl day cards, a tick-list checklist and
 * numbered setup steps. Accent: sky blue #0ea5e9 (text uses darker #0369a1).
 * Main keywords: gym workout plan for beginners, beginner gym routine,
 * full body workout for beginners, first day at gym.
 */

const PATH = '/beginner-gym-workout-plan';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Gym Workout Plan for Beginners: 3-Day Full Body | RepUp',
  description:
    'A simple gym workout plan for beginners: 3 full body days a week, sets and reps, how to pick a starting weight, a first-day checklist and a free log.',
  keywords: [
    'gym workout plan for beginners',
    'beginner gym routine',
    'full body workout for beginners',
    'first day at gym',
    'how many days a week should a beginner work out',
    'beginner workout tracker',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'How many days a week should a beginner work out?',
    a: 'Three days a week is a great start, with a rest day between gym days (for example Monday, Wednesday and Friday). It gives every muscle enough work and enough time to recover. Two days still works if that is all you can manage.',
  },
  {
    q: 'Is full body better than a body-part split for beginners?',
    a: 'For most beginners, yes. Full body trains each muscle three times a week, so you practise every exercise more and learn form faster. Splits make more sense at four or more days a week.',
  },
  {
    q: 'How much weight should a beginner lift?',
    a: 'Pick a weight you can lift for the target reps with good form while leaving 2–3 reps in reserve: you could do 2 or 3 more, but you stop. If you beat the top of the rep range on every set, add a little weight next time.',
  },
  {
    q: 'How long should a beginner workout take?',
    a: 'Around 45–60 minutes, including a short warm-up.',
  },
  {
    q: 'When should I change my beginner plan?',
    a: 'Keep the same plan as long as your numbers keep going up, usually 8–12 weeks or more. When progress slows for a few weeks in a row, move to an upper/lower or push/pull/legs plan.',
  },
  {
    q: 'Can I follow this beginner plan in RepUp for free?',
    a: 'Yes. RepUp is free with no ads. Add Day 1, Day 2 and Day 3 to your weekly plan, log each set as kg × reps, and RepUp shows what you lifted last time with a target for today.',
  },
];

const ROADMAP = [
  { n: 1, when: 'Week 1–2', t: 'Learn the moves', d: '2 sets each, light weights' },
  { n: 2, when: 'Week 3–8', t: 'Full sets', d: 'Add a rep or a little kg weekly' },
  { n: 3, when: 'Week 9–12', t: 'Keep climbing', d: 'Stalled? Move to a split' },
];

const DAYS: { title: string; when: string; rows: [string, string][] }[] = [
  {
    title: 'Day 1',
    when: 'Monday',
    rows: [
      ['Leg press', '3 × 10–12'],
      ['Machine chest press', '3 × 8–12'],
      ['Lat pulldown', '3 × 10–12'],
      ['Lying leg curl', '2 × 10–12'],
      ['Dumbbell lateral raise', '2 × 12–15'],
      ['Cable crunch', '2 × 12–15'],
    ],
  },
  {
    title: 'Day 2',
    when: 'Wednesday',
    rows: [
      ['Goblet squat', '3 × 10–12'],
      ['Seated cable row', '3 × 10–12'],
      ['Dumbbell shoulder press', '3 × 8–12'],
      ['Dumbbell Romanian deadlift', '3 × 10–12'],
      ['Triceps pushdown', '2 × 10–15'],
      ['Dumbbell curl', '2 × 10–15'],
    ],
  },
  {
    title: 'Day 3',
    when: 'Friday',
    rows: [
      ['Dumbbell split squat', '2 × 8–10/leg'],
      ['Incline dumbbell press', '3 × 8–12'],
      ['One-arm dumbbell row', '3 × 10–12/side'],
      ['Leg extension', '2 × 12–15'],
      ['Glute bridge / hip thrust', '3 × 10–12'],
      ['Machine crunch', '2 × 12–15'],
    ],
  },
];

const CHECKLIST = [
  ['Pack light', 'Water bottle, small towel and shoes with a flat, firm sole.'],
  ['Plan on your phone', 'So you are never guessing what to do next.'],
  ['Ask for a tour', 'Staff can show you the machines you will use in 5 minutes.'],
  ['Warm up', '5 minutes of easy cardio, then a light set of your first exercise.'],
  ['Start lighter', 'Today is for learning the movements, not for testing your max.'],
  ['Write it all down', 'Weight and reps for every set. That is your starting line.'],
];

const ETIQUETTE = [
  ['Put weights back.', 'Re-rack plates and dumbbells where they belong.'],
  ['Wipe it down.', 'Clean the bench or seat when you finish.'],
  ['Share equipment.', 'Ask “How many sets left?” and offer to take turns.'],
  ['Give space.', 'Don’t stand right in front of someone’s mirror or bench.'],
];

const STEPS = [
  { name: 'Sign up free', text: 'Create a free RepUp account with email or Google. It works on your phone and laptop.' },
  { name: 'Add the three days', text: 'In your weekly plan, add Day 1 on Monday, Day 2 on Wednesday and Day 3 on Friday, with the sets × reps above.' },
  { name: 'Log every set', text: 'At the gym, type the kg and reps for each set and tick it done. It works offline too.' },
  { name: 'Beat last time', text: 'Next week RepUp shows what you lifted last time and suggests a target: one more rep, or a little more weight.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const kicker = 'mb-3 text-sm font-semibold tracking-wide text-[#0369a1] uppercase';

export default function BeginnerGymWorkoutPlanPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free gym workout tracker with a simple beginner plan: log sets, reps and kg, see last time and beat it.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Beginner gym workout plan'),
        howToLd('How to set up a beginner gym workout plan in RepUp', STEPS),
      ]}
    >
      {/* Hero: friendly roadmap */}
      <section className="relative overflow-hidden bg-[#f0f9ff]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(14,165,233,0.18), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-10 pb-8 text-center sm:px-6 md:pt-16">
          <p className="rounded-full border border-[#0ea5e9]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#0369a1]">
            New to the gym? Start here
          </p>
          <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-[#0a0a0a] sm:text-5xl md:text-6xl">
            A simple gym workout plan <span className="text-[#0284c7]">for beginners</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Three full body days a week. Six exercises a day. Clear sets and reps. Your whole first 8–12 weeks, in plain English.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-full bg-[#7c3aed] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Track this plan free
            </Link>
            <a
              href="#plan"
              className="rounded-full border border-[#bae6fd] bg-white px-7 py-3.5 text-base font-semibold text-[#0a0a0a] hover:bg-[#e0f2fe]"
            >
              See the plan
            </a>
          </div>

          {/* Roadmap */}
          <ol className="relative mt-14 grid w-full max-w-3xl grid-cols-3 gap-2 sm:gap-6" aria-label="Your first 12 weeks">
            <span aria-hidden className="absolute top-7 right-[16%] left-[16%] h-1 rounded-full bg-[#bae6fd] sm:top-9" />
            {ROADMAP.map((s) => (
              <li key={s.n} className="relative flex flex-col items-center gap-2">
                <span className="flex size-14 items-center justify-center rounded-full border-4 border-[#f0f9ff] bg-[#0ea5e9] text-2xl font-semibold text-[#0b0a1f] shadow-md shadow-[#0ea5e9]/30 sm:size-18 sm:text-3xl">
                  {s.n}
                </span>
                <span className="text-xs font-semibold tracking-wide text-[#0369a1] uppercase sm:text-sm">{s.when}</span>
                <span className="text-sm font-semibold text-[#0a0a0a] sm:text-base">{s.t}</span>
                <span className="text-xs leading-snug text-[#525252] sm:text-sm">{s.d}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative flex justify-center px-4 pt-6">
          <PhoneMock screen="week" theme="light" className="-mb-24 origin-top scale-[0.85] sm:mb-0 sm:scale-100" />
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 pt-20 pb-10 sm:px-6">
        <div className="rounded-3xl border border-[#bae6fd] bg-white p-6 sm:p-10">
          <h2 className={kicker}>The short answer</h2>
          <p className="text-xl leading-relaxed text-[#262626] sm:text-2xl">
            The best gym workout plan for beginners is a 3-day full body routine, for example Monday, Wednesday and Friday. Do six
            exercises for 2–3 sets of 8–12 reps, with a weight you could lift 2–3 more times. Add a rep or a little weight each
            week, and log every set so you know what to beat.
          </p>
        </div>
      </section>

      {/* How many days */}
      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h2 className={h2}>How many days a week should a beginner work out?</h2>
        <p className="mt-4 text-lg leading-relaxed text-[#404040]">
          Three days is the sweet spot. You train each muscle three times a week, with a rest day in between to recover. On off days,
          go for a walk. If life is busy, two days still works. The best plan is the one you stick to.
        </p>
      </section>

      {/* The plan */}
      <section id="plan" className="scroll-mt-8 py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className={kicker}>The plan</p>
          <h2 className={h2}>The 3-day full body workout for beginners</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Every exercise uses machines or dumbbells, so it is easy to learn and safe to start. In weeks 1–2, do 2 sets of each. From
            week 3, do the full sets below. Rest about 1–2 minutes between sets.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {DAYS.map((d) => (
              <div key={d.title} className="rounded-3xl border border-[#e5e5e5] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between rounded-[1.25rem] bg-[#e0f2fe] px-5 py-4">
                  <h3 className="text-xl font-semibold">{d.title}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#0369a1]">{d.when}</span>
                </div>
                <ul className="mt-2 flex flex-col">
                  {d.rows.map(([ex, sr]) => (
                    <li key={ex} className="flex items-center justify-between gap-3 border-b border-[#f5f5f5] px-3 py-3 text-[15px] last:border-0">
                      <span className="font-medium">{ex}</span>
                      <span className="shrink-0 font-semibold text-[#404040] tabular-nums">{sr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#525252]">
            Swap any exercise for a close match if your gym doesn’t have the machine. For example, use dumbbell bench press instead of
            machine chest press.
          </p>
        </div>
      </section>

      {/* Starting weight + form */}
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-16 sm:px-6 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
          <h2 className={h2}>How do I pick my starting weight?</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#404040]">
            Use the “2–3 reps in reserve” rule. Pick a weight you can lift for the target reps with good form, and stop when you feel
            you could do 2 or 3 more. Your first set is a test:
          </p>
          <ul className="mt-5 flex flex-col gap-3 text-[17px] leading-relaxed text-[#404040]">
            {[
              ['More than 12 easy reps?', 'Go a little heavier next set.'],
              ['Fewer than 8, or form broke?', 'Go lighter.'],
              ['Top of the range on every set?', 'Add a little weight next time.'],
            ].map(([a, b]) => (
              <li key={a} className="rounded-2xl bg-[#f0f9ff] px-4 py-3">
                <b className="font-semibold text-[#0a0a0a]">{a}</b> {b}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[17px] leading-relaxed text-[#404040]">
            That small step up each week is called <A href="/progressive-overload-tracker">progressive overload</A>, and it is how
            beginners get stronger fast.
          </p>
        </div>
        <div className="rounded-3xl bg-[#0b0a1f] p-6 text-white sm:p-10 md:self-start">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Form before weight</h2>
          <ul className="mt-5 flex flex-col gap-3 leading-relaxed text-white/80">
            <li>Move slowly and with control. No swinging or bouncing.</li>
            <li>Use the full range: all the way down, all the way up.</li>
            <li>Keep your back neutral and your core tight.</li>
            <li>Not sure? Ask a trainer, or film one set on your phone.</li>
            <li>Sharp pain means stop. Normal muscle burn is fine.</li>
          </ul>
        </div>
      </section>

      {/* First day checklist + etiquette */}
      <section className="bg-[#f0f9ff] py-16 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className={kicker}>Day one</p>
            <h2 className={h2}>First day at the gym: your checklist</h2>
            <p className="mt-3 text-lg text-[#525252]">Feeling nervous is normal. Everyone had a first day.</p>
            <ul className="mt-8 flex flex-col gap-3">
              {CHECKLIST.map(([t, d]) => (
                <li key={t} className="flex items-start gap-4 rounded-3xl border border-[#e0f2fe] bg-white px-5 py-4">
                  <span aria-hidden className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0ea5e9] text-sm font-bold text-[#0b0a1f]">
                    ✓
                  </span>
                  <span className="leading-relaxed">
                    <b className="font-semibold">{t}.</b> <span className="text-[#525252]">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={kicker}>Be that nice person</p>
            <h2 className={h2}>Basic gym etiquette</h2>
            <ul className="mt-8 flex flex-col divide-y divide-[#e0f2fe] rounded-3xl border border-[#e0f2fe] bg-white">
              {ETIQUETTE.map(([t, d]) => (
                <li key={t} className="px-5 py-4 leading-relaxed">
                  <b className="font-semibold">{t}</b> <span className="text-[#525252]">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why track */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20">
        <h2 className={h2}>Why track your workouts from day one?</h2>
        <p className="mt-5 text-lg leading-relaxed text-[#404040]">
          As a beginner, your numbers can go up almost every week. But nobody remembers doing 25 kg for 10, 10 and 9 last Wednesday.
          Without a log, you guess. With one, you know what to beat. A <A href="/workout-log">workout log</A> also shows how far you
          have come, which helps on days you don’t feel like going.
        </p>
      </section>

      {/* Set up in RepUp */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
          <p className={kicker}>In RepUp</p>
          <h2 className={h2}>How to set up this plan in RepUp</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex flex-col gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-[#e0f2fe] text-xl font-semibold text-[#0369a1]">{i + 1}</span>
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="leading-relaxed text-[#525252]">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={SIGNUP_HREF} className="rounded-full bg-[#7c3aed] px-7 py-3.5 font-semibold text-white hover:bg-[#6d28d9]">
              Start my beginner plan
            </Link>
            <p className="text-[#525252]">
              After 8–12 weeks, ready for more days? Try the <A href="/push-pull-legs-workout-planner">push pull legs planner</A>.
            </p>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Beginner questions" />

      <CtaBand title="Your first workout is the one you log today." body="Free, no ads. Set up your three days in a couple of minutes." />
    </LandingShell>
  );
}
