import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, DataTable, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/home-workout-and-walking-plan". Layout: "two scenes". Cream hero with the
 * headline above two illustrated SVG panels, "At home" (window, mat, a person
 * in a plank) and "Outside" (sun, hills, trees, a winding path), joined by an
 * arrow (→ on desktop, ↓ on mobile). Then a 7-day week strip, the 4-week
 * sets × reps table, move cards with easier/harder options and a logging split.
 * Accent: olive/sage #4d7c0f on cream #fefce8 (small text #3f6212).
 * Main keywords: home workout and walking plan, no equipment workout plan,
 * walking plan for beginners, home workout for beginners, bodyweight workout and walk.
 */

const PATH = '/home-workout-and-walking-plan';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Home Workout and Walking Plan: 4 Weeks, No Equipment | RepUp',
  description:
    'A 4-week home workout and walking plan for beginners: 3 no-equipment bodyweight sessions and 3 walks a week, with sets, reps, minutes and a free tracker.',
  keywords: [
    'home workout and walking plan',
    'no equipment workout plan',
    'walking plan for beginners',
    'home workout for beginners',
    'bodyweight workout and walk',
    'beginner home workout plan',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Is a home workout and walking enough to get fit?',
    a: 'For a beginner, yes. Three short bodyweight sessions and three brisk walks a week build strength, stamina and the habit of training. After a few weeks, make it harder with more reps, slower reps, longer walks or by moving on to a gym or running plan.',
  },
  {
    q: 'How long should a beginner walk each day?',
    a: 'Start with 20 minutes at a brisk pace, where you can talk but not sing. Add about 5 minutes each week, up to 35–40 minutes. Short walks on rest days are fine too.',
  },
  {
    q: 'I can’t do a single push-up. What should I do?',
    a: 'Start with wall push-ups or push-ups with your hands on a table or the edge of a bed. When you can do 12 good reps, move to a lower surface, then to knee push-ups, then to full push-ups.',
  },
  {
    q: 'Can I do the home workout and the walk on the same day?',
    a: 'Yes. Walk in the morning and do the home workout in the evening, or walk straight after the workout. Just keep at least one full rest day each week.',
  },
  {
    q: 'Will this plan help me lose weight?',
    a: 'It helps, but food matters most for weight loss. Pair the plan with a small calorie deficit and enough protein. The workouts help you keep muscle, and the walks add to the calories you burn.',
  },
  {
    q: 'How do I log bodyweight exercises in RepUp?',
    a: 'In Workout mode, add the exercises to your plan. Push Up and Plank are built in; add others, like glute bridge, as your own custom exercises. Type your reps and leave kg empty. RepUp shows last time and suggests one more rep per set.',
  },
];

const WEEK: { day: string; kind: 'home' | 'walk' | 'rest'; label: string }[] = [
  { day: 'Mon', kind: 'home', label: 'Home workout' },
  { day: 'Tue', kind: 'walk', label: 'Walk' },
  { day: 'Wed', kind: 'home', label: 'Home workout' },
  { day: 'Thu', kind: 'walk', label: 'Walk' },
  { day: 'Fri', kind: 'home', label: 'Home workout' },
  { day: 'Sat', kind: 'walk', label: 'Longer walk' },
  { day: 'Sun', kind: 'rest', label: 'Rest' },
];

const PLAN: string[][] = [
  ['Squat', '2 × 10', '3 × 10', '3 × 12', '3 × 15'],
  ['Push-up (wall, table or knees)', '2 × 6–8', '3 × 6–8', '3 × 8–10', '3 × 10–12'],
  ['Reverse lunge', '2 × 6/leg', '2 × 8/leg', '3 × 8/leg', '3 × 10/leg'],
  ['Glute bridge', '2 × 12', '3 × 12', '3 × 15', '3 × 15–20'],
  ['Plank', '2 × 20 s', '3 × 20 s', '3 × 30 s', '3 × 40 s'],
  ['Bird dog', '2 × 6/side', '2 × 8/side', '3 × 8/side', '3 × 10/side'],
  ['Brisk walk (3 a week)', '20 min', '25 min', '30 min', '35–40 min'],
];

const MOVES: { name: string; how: string; easier: string; harder: string }[] = [
  { name: 'Squat', how: 'Feet shoulder-width, sit back and down like into a chair, chest up, then stand.', easier: 'Squat to a chair and stand up.', harder: 'Pause 2 seconds at the bottom.' },
  { name: 'Push-up', how: 'Hands under shoulders, body in a straight line, lower your chest, push back up.', easier: 'Hands on a wall or table.', harder: 'Full push-up, slow on the way down.' },
  { name: 'Reverse lunge', how: 'Step one foot back, lower both knees, push through the front heel to stand.', easier: 'Hold a wall or chair for balance.', harder: 'Hold a filled water bottle in each hand.' },
  { name: 'Glute bridge', how: 'Lie on your back, knees bent, squeeze your glutes and lift your hips. Lower slowly.', easier: 'Smaller lift, hands on the floor.', harder: 'One leg at a time.' },
  { name: 'Plank', how: 'Forearms down, body straight from head to heels, tummy tight. Breathe normally.', easier: 'Knees on the floor.', harder: 'Add 10 seconds.' },
  { name: 'Bird dog', how: 'On hands and knees, reach one arm forward and the opposite leg back. Hold 2 seconds.', easier: 'Move only the leg.', harder: 'Hold 5 seconds at the top.' },
];

const STEPS = [
  { name: 'Sign up free', text: 'Create a free RepUp account with email or Google. It works on your phone and laptop.' },
  { name: 'Add your home workout', text: 'In Workout mode, add a home workout on Monday, Wednesday and Friday. Push Up and Plank are built in; add squat, lunge, glute bridge and bird dog as your own custom exercises.' },
  { name: 'Log reps, leave kg empty', text: 'Type the reps for each set and tick it. Next time RepUp shows last time and suggests one more rep per set.' },
  { name: 'Track your walks', text: 'Switch to Running mode from the account menu, choose Walk and tap Start. Keep the screen on and RepUp open. Or add a walk by hand.' },
  { name: 'Check your week', text: 'See your walks by day, your total km and your reps going up. Then move to the next week of the plan.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#1a2e05] sm:text-4xl';
const kicker = 'mb-3 text-sm font-semibold tracking-wide text-[#3f6212] uppercase';

function HomeScene() {
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full" aria-hidden>
      <rect width="320" height="200" fill="#fef9c3" />
      <rect y="150" width="320" height="50" fill="#e7e5c9" />
      {/* window */}
      <rect x="196" y="26" width="84" height="70" rx="6" fill="#ecfccb" stroke="#4d7c0f" strokeWidth="3" />
      <line x1="238" y1="26" x2="238" y2="96" stroke="#4d7c0f" strokeWidth="3" />
      <line x1="196" y1="61" x2="280" y2="61" stroke="#4d7c0f" strokeWidth="3" />
      {/* plant */}
      <path d="M38 112 q-14 -26 4 -40 q2 18 -4 40z M44 112 q10 -30 28 -32 q-6 20 -28 32z M40 112 q-22 -12 -26 -30 q18 4 26 30z" fill="#65a30d" />
      <path d="M28 112 h28 l-4 26 h-20z" fill="#a16207" />
      {/* mat */}
      <rect x="70" y="152" width="200" height="14" rx="7" fill="#84cc16" />
      <rect x="70" y="152" width="200" height="5" rx="2.5" fill="#a3e635" />
      {/* person in a plank */}
      <circle cx="232" cy="122" r="10" fill="#1a2e05" />
      <line x1="222" y1="128" x2="126" y2="146" stroke="#1a2e05" strokeWidth="9" strokeLinecap="round" />
      <path d="M216 131 L214 151 L232 151" fill="none" stroke="#1a2e05" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="126" y1="146" x2="104" y2="151" stroke="#1a2e05" strokeWidth="7" strokeLinecap="round" />
      {/* water bottle */}
      <rect x="286" y="124" width="14" height="28" rx="4" fill="#38bdf8" />
      <rect x="289" y="118" width="8" height="7" rx="2" fill="#0c4a6e" />
    </svg>
  );
}

function OutsideScene() {
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full" aria-hidden>
      <rect width="320" height="200" fill="#e0f2fe" />
      <circle cx="262" cy="42" r="20" fill="#fde047" />
      <path d="M0 120 Q70 80 150 112 T320 100 V200 H0z" fill="#bef264" />
      <path d="M0 140 Q90 118 180 140 T320 132 V200 H0z" fill="#84cc16" />
      {/* path */}
      <path d="M150 200 C150 170 210 168 196 146 C186 130 150 132 160 118" fill="none" stroke="#fef3c7" strokeWidth="18" strokeLinecap="round" />
      {/* trees */}
      {[
        [48, 112, 22],
        [86, 128, 16],
        [258, 122, 20],
        [292, 140, 14],
      ].map(([x, y, r]) => (
        <g key={x}>
          <rect x={x - 3} y={y} width="6" height={r + 6} fill="#713f12" />
          <circle cx={x} cy={y - r * 0.4} r={r} fill="#4d7c0f" />
        </g>
      ))}
      {/* walker */}
      <circle cx="190" cy="132" r="7" fill="#1a2e05" />
      <line x1="190" y1="139" x2="188" y2="160" stroke="#1a2e05" strokeWidth="6" strokeLinecap="round" />
      <path d="M188 160 L180 176 M188 160 L198 175" stroke="#1a2e05" strokeWidth="5" strokeLinecap="round" />
      <path d="M189 145 L180 156 M190 145 L200 153" stroke="#1a2e05" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

function Scene({ title, chips, children }: { title: string; chips: string[]; children: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-3xl border-2 border-[#4d7c0f]/25 bg-white shadow-[0_18px_40px_-20px_rgba(77,124,15,0.45)]">
      {children}
      <figcaption className="flex flex-col gap-3 p-5">
        <p className="text-xl font-semibold text-[#1a2e05]">{title}</p>
        <ul className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <li key={c} className="rounded-full bg-[#ecfccb] px-3 py-1 text-sm font-medium text-[#3f6212]">
              {c}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

export default function HomeWorkoutAndWalkingPlanPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fefce8]"
      jsonLd={[
        appLd('Free workout and walking tracker: log home bodyweight workouts (reps and sets) and track walks with GPS distance, time and pace.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Home workout and walking plan'),
        howToLd('How to follow a home workout and walking plan in RepUp', STEPS),
      ]}
    >
      {/* Hero: two scenes */}
      <section className="relative overflow-hidden bg-[#fefce8]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(55% 45% at 50% 0%, rgba(132,204,22,0.20), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#3f3f2a] hover:text-[#1a2e05]"
          ctaClass="bg-[#3f6212] text-white hover:bg-[#365314]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-8 pb-20 text-center sm:px-6 md:pt-14 md:pb-24">
          <p className="rounded-full border border-[#4d7c0f]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#3f6212]">
            No gym · no equipment · 4 weeks
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#1a2e05] sm:text-5xl md:text-6xl">
            A <span className="text-[#4d7c0f]">home workout and walking plan</span> for beginners
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#44403c]">
            Three short bodyweight workouts in your room. Three brisk walks outside. One rest day. Simple sets, reps and minutes for
            four weeks.
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
              className="rounded-full border border-[#4d7c0f]/40 bg-white px-7 py-3.5 text-base font-semibold text-[#1a2e05] hover:bg-[#f7fee7]"
            >
              See the 4-week plan
            </a>
          </div>

          <div className="mt-14 grid w-full max-w-5xl items-center gap-4 text-left md:grid-cols-[1fr_auto_1fr] md:gap-6 [&>*]:min-w-0">
            <Scene title="At home" chips={['Squats', 'Push-ups', 'Plank', '20–30 min']}>
              <HomeScene />
            </Scene>
            <div aria-hidden className="flex justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-[#4d7c0f] text-2xl font-bold text-white shadow-lg shadow-[#4d7c0f]/30">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </span>
            </div>
            <Scene title="Outside" chips={['Brisk walk', '20–40 min', 'Park or road']}>
              <OutsideScene />
            </Scene>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="border-y border-[#4d7c0f]/15 bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-16">
          <h2 className={kicker}>The short answer</h2>
          <p className="text-xl leading-relaxed text-[#292524] sm:text-2xl">
            A simple home workout and walking plan: three 20–30 minute bodyweight sessions a week (squats, push-ups, lunges, glute
            bridges, plank) and three brisk walks of 20–40 minutes on the other days, with one full rest day. Add a few reps or
            minutes each week for four weeks. No equipment needed.
          </p>
        </div>
      </section>

      {/* Why + week */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className={kicker}>Why this mix</p>
            <h2 className={h2}>Strength at home, stamina outside</h2>
          </div>
          <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-[#44403c]">
            <p>
              Bodyweight exercises build strength in your legs, chest, arms and core. Walking builds stamina, is easy on the joints and
              gets you outdoors. Together they cover both sides of fitness, with no gym fees and no equipment.
            </p>
            <p>
              Walk on the days between home workouts, so your muscles rest while you still move. Want to track your walks properly? See
              the <A href="/walking-tracker-app">walking tracker</A> guide.
            </p>
          </div>
        </div>
        <ol className="mt-12 grid grid-cols-7 gap-1.5 sm:gap-3" aria-label="Your week">
          {WEEK.map((d) => (
            <li
              key={d.day}
              className={`flex flex-col items-center gap-2 rounded-2xl px-1 py-4 text-center sm:py-5 ${
                d.kind === 'home'
                  ? 'bg-[#4d7c0f] text-white'
                  : d.kind === 'walk'
                    ? 'border-2 border-[#4d7c0f]/40 bg-white text-[#1a2e05]'
                    : 'bg-[#f5f5f4] text-[#57534e]'
              }`}
            >
              <span className="text-xs font-semibold uppercase sm:text-sm">{d.day}</span>
              <span aria-hidden className="text-xl sm:text-2xl">
                {d.kind === 'home' ? '🏠' : d.kind === 'walk' ? '🚶' : '😴'}
              </span>
              <span className="hidden text-sm leading-tight font-medium sm:block">{d.label}</span>
              <span className="sr-only sm:hidden">{d.label}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 4-week plan */}
      <section id="plan" className="scroll-mt-8 bg-[#f7fee7]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kicker}>The plan</p>
          <h2 className={h2}>Your 4-week no equipment workout plan</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#44403c]">
            Do the same six exercises on each home day, in this order. Rest 45–60 seconds between sets. Walk at a brisk pace: you can
            talk, but not sing.
          </p>
          <div className="mt-10">
            <DataTable
              minWidth={600}
              head={[
                'Exercise',
                <span key="1" className="text-[#3f6212]">Week 1</span>,
                <span key="2" className="text-[#3f6212]">Week 2</span>,
                <span key="3" className="text-[#3f6212]">Week 3</span>,
                <span key="4" className="text-[#3f6212]">Week 4</span>,
              ]}
              rows={PLAN.map(([ex, ...weeks]) => [ex, ...weeks.map((v, i) => <span key={i} className="whitespace-nowrap">{v}</span>)])}
              caption="Sets × reps. “/leg” and “/side” mean each side. s = seconds. Too easy? Move to the next week early. Too hard? Repeat the week."
            />
          </div>
          <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-[#44403c]">
            Finished week 4? Keep adding reps and walk time, or take the next step: the <A href="/couch-to-5k-plan">couch to 5K plan</A>{' '}
            turns walks into runs, and the <A href="/beginner-gym-workout-plan">beginner gym workout plan</A> is ready when you join a
            gym. Doing both? See the <A href="/hybrid-training-plan">hybrid training plan</A>.
          </p>
        </div>
      </section>

      {/* Moves */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kicker}>How to do each move</p>
        <h2 className={h2}>Home workout for beginners: the six moves</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOVES.map((m) => (
            <li key={m.name} className="flex flex-col gap-3 rounded-3xl border border-[#4d7c0f]/20 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1a2e05]">{m.name}</h3>
              <p className="leading-relaxed text-[#44403c]">{m.how}</p>
              <div className="mt-auto grid grid-cols-2 gap-2 text-sm">
                <p className="rounded-xl bg-[#fefce8] p-3 text-[#44403c]">
                  <b className="block font-semibold text-[#3f6212]">Easier</b>
                  {m.easier}
                </p>
                <p className="rounded-xl bg-[#ecfccb] p-3 text-[#44403c]">
                  <b className="block font-semibold text-[#3f6212]">Harder</b>
                  {m.harder}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[#57534e]">
          Sharp pain means stop. If you have a heart condition, high blood pressure, diabetes, joint problems, are pregnant or have not
          exercised in a long time, check with a doctor before you start.
        </p>
      </section>

      {/* Log it in RepUp */}
      <section className="border-y border-[#4d7c0f]/15 bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.3fr] md:py-20 [&>*]:min-w-0">
          <div className="flex justify-center">
            <PhoneMock screen="run-week" theme="light" className="-rotate-2" />
          </div>
          <div>
            <p className={kicker}>In RepUp</p>
            <h2 className={h2}>How to log home workouts and walks</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#44403c]">
              One free account, two modes. Home workouts go in <b className="font-semibold text-[#1a2e05]">Workout mode</b>, walks in{' '}
              <b className="font-semibold text-[#1a2e05]">Running mode</b>. Switch from the account menu.
            </p>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ecfccb] font-semibold text-[#3f6212]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#1a2e05]">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-[#57534e]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm leading-relaxed text-[#57534e]">
              Walk tracking uses GPS in the browser, so it pauses if the screen turns off or you switch apps. Steps and calories are
              estimates (shown with ~). No heart rate, no smartwatch app.
            </p>
            <Link
              href={SIGNUP_HREF}
              className="mt-8 inline-block rounded-full bg-[#7c3aed] px-7 py-3.5 font-semibold text-white hover:bg-[#6d28d9]"
            >
              Start my 4 weeks free
            </Link>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Home workout and walking: questions" />

      <CtaBand
        title="Your room and your road are enough."
        body="Log home workouts and walks in one free app. No ads, no equipment."
        cta="Track this plan free"
      />
    </LandingShell>
  );
}
