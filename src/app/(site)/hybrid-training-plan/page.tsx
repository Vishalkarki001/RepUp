import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /hybrid-training-plan. Archetype "athletic poster": a black / neon-orange
 * hero split on a diagonal (clip-path) with huge stacked LIFT / RUN / REPEAT.
 * Accent: neon orange #ff5a1f on black (#c2410c for small text on white).
 * Main keywords: hybrid training plan, hybrid athlete program, lift and run
 * program, strength and endurance training.
 */

const PATH = '/hybrid-training-plan';
const ORANGE = '#ff5a1f';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Hybrid Training Plan: Free 5-Day Lift and Run Week | RepUp',
  description:
    'A simple hybrid training plan: lift heavy twice a week, run mostly easy, recover well. Free 5-day lift and run program with sets, reps and runs to log in RepUp.',
  keywords: [
    'hybrid training plan',
    'hybrid athlete program',
    'lift and run program',
    'strength and endurance training',
    'hybrid training week',
    'gym and running plan',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'What is a hybrid training plan?',
    a: 'It is a weekly plan that builds strength and running fitness at the same time. A simple version has two or three heavy gym sessions and two or three runs, with most runs at an easy pace and at least one rest day.',
  },
  {
    q: 'Can I build muscle and run at the same time?',
    a: 'Yes, most people can. Keep most runs easy, lift heavy two or three times a week, keep hard days apart and eat enough, especially protein. Very high running volume can make muscle gain slower, so build your km slowly.',
  },
  {
    q: 'Should I lift or run first on the same day?',
    a: 'Do the session that matters most for your goal first. If both are hard, split them, for example run in the morning and lift in the evening. An easy short run after lifting is usually fine.',
  },
  {
    q: 'How many days a week is a hybrid athlete program?',
    a: 'Four to six days. The sample plan on this page uses five: two lifting days, three runs and two rest days. Beginners can start with three or four days.',
  },
  {
    q: 'Does RepUp give me a hybrid plan inside the app?',
    a: 'No. RepUp has no built-in training plans; the plan on this page is a guide. You copy the lifting days into your weekly plan in Workout mode and track your runs in Running mode.',
  },
  {
    q: 'Is hybrid training safe for beginners?',
    a: 'It can be, if you start small: lighter weights, short easy runs and more rest. If you have a heart, joint or other health problem, or have not trained in a long time, check with a doctor first.',
  },
];

type Day = { d: string; kind: 'LIFT' | 'RUN' | 'REST'; title: string; note: string; rows?: [string, string][] };

const WEEK: Day[] = [
  {
    d: 'Mon',
    kind: 'LIFT',
    title: 'Lower body, heavy',
    note: 'Legs get two days before the hard run',
    rows: [
      ['Back squat', '4 × 5'],
      ['Romanian deadlift', '3 × 8'],
      ['Walking lunge', '3 × 10 each leg'],
      ['Standing calf raise', '3 × 12'],
      ['Plank', '3 × 30–45 s'],
    ],
  },
  {
    d: 'Tue',
    kind: 'RUN',
    title: 'Easy run',
    note: 'Chatty pace, you can talk in full sentences',
    rows: [
      ['Easy run', '30–40 min'],
      ['Strides (optional)', '4 × 20 s'],
      ['Walk to cool down', '5 min'],
    ],
  },
  {
    d: 'Wed',
    kind: 'LIFT',
    title: 'Upper body, heavy',
    note: 'Legs rest while you push and pull',
    rows: [
      ['Bench press', '4 × 5'],
      ['Barbell row', '4 × 6–8'],
      ['Overhead press', '3 × 8'],
      ['Pull-ups or lat pulldown', '3 × 8–10'],
      ['Dumbbell curl', '2 × 10–12'],
    ],
  },
  {
    d: 'Thu',
    kind: 'RUN',
    title: 'Intervals',
    note: 'The one hard run of the week',
    rows: [
      ['Warm-up jog', '10 min'],
      ['Fast, then easy jog', '6 × (2 min + 2 min)'],
      ['Cool-down jog', '10 min'],
    ],
  },
  { d: 'Fri', kind: 'REST', title: 'Rest', note: 'Walk, stretch, sleep well' },
  {
    d: 'Sat',
    kind: 'RUN',
    title: 'Long easy run',
    note: 'Slower than you think, add a little each week',
    rows: [
      ['Easy run', '45–70 min'],
      ['Walk breaks', 'Fine any time'],
    ],
  },
  { d: 'Sun', kind: 'REST', title: 'Rest', note: 'Plan next week' },
];

const PRINCIPLES = [
  {
    t: 'Run easy most of the time',
    d: 'Most of your runs should feel easy enough to talk in full sentences. One hard run a week is plenty at the start.',
  },
  {
    t: 'Lift heavy two or three times',
    d: 'Big lifts like squat, deadlift, bench and row, for sets of 5–8 reps. Stop one or two reps before you would fail.',
  },
  {
    t: 'Keep hard days apart',
    d: 'Do not put intervals the day after heavy squats. Put an easy run, an upper-body day or rest in between.',
  },
  {
    t: 'Grow one thing at a time',
    d: 'Add a little weight or a few km each week, not big jumps in both. Every few weeks, have an easier week.',
  },
  {
    t: 'Recover like it is training',
    d: 'Sleep 7–9 hours, eat protein at every meal (dal, paneer, eggs, chicken, soya) and keep one or two full rest days.',
  },
];

const STEPS = [
  { name: 'Add the lifting days', text: 'In Workout mode, put Lower body on Monday and Upper body on Wednesday with sets × reps. Leave other days empty.' },
  { name: 'Log every set', text: 'On lifting days, open today’s workout and log kg and reps. RepUp shows last time and a target for today.' },
  { name: 'Switch to Running mode', text: 'On run days, open the account menu, tap Running mode and press Start run. Keep the screen on and RepUp open.' },
  { name: 'Add treadmill runs by hand', text: 'Ran on a treadmill or without your phone? Add the run by hand with distance and time.' },
  { name: 'Check your week', text: 'Look at progress charts for your lifts and weekly km, longest run and best pace for your runs.' },
];

const KIND_STYLE: Record<Day['kind'], string> = {
  LIFT: 'bg-[#ff5a1f] text-[#0a0a0a]',
  RUN: 'bg-[#0a0a0a] text-white',
  REST: 'bg-white text-[#525252] border border-dashed border-[#d4d4d4]',
};

const h2 = 'text-3xl font-bold tracking-tight text-balance sm:text-4xl';

export default function HybridTrainingPlanPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#0a0a0a] text-white"
      jsonLd={[
        appLd('Free gym and running tracker for hybrid training: log lifts as sets, reps and kg, and track runs with GPS in one account.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Hybrid training plan'),
        howToLd('How to log a hybrid training week in RepUp', STEPS),
      ]}
    >
      {/* Hero: athletic poster, diagonal split */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 hidden w-[58%] md:block"
          style={{ background: ORANGE, clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#ff5a1f] md:text-[#ff5a1f]"
          loginClass="text-white/85 hover:text-white md:text-[#0a0a0a] md:hover:text-[#0a0a0a]/70"
          ctaClass="bg-white text-[#0a0a0a] hover:bg-white/90 md:bg-[#0a0a0a] md:text-white md:hover:bg-[#262626]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl md:grid-cols-[1fr_1fr] md:items-center [&>*]:min-w-0">
          <div className="flex flex-col gap-6 px-4 pt-8 pb-14 sm:px-6 md:pt-12 md:pb-24">
            <p className="w-fit border-l-4 border-[#ff5a1f] pl-3 text-sm font-bold tracking-[0.2em] text-[#ff5a1f] uppercase">
              Lift and run program · 5 days
            </p>
            <h1 className="text-4xl leading-[1.04] font-bold tracking-tight text-balance sm:text-5xl md:text-[3.3rem]">
              Hybrid training plan: get <span className="text-[#ff5a1f]">strong</span> and <span className="text-[#ff5a1f]">fit</span>{' '}
              in the same week
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/75">
              Two heavy gym days, three runs, two rest days. A free hybrid athlete program you can start this Monday, and one app
              to log both the lifts and the runs.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
              >
                Log my hybrid week free
              </Link>
              <a href="#week" className="rounded-xl border-2 border-[#ff5a1f] px-6 py-3 text-base font-semibold text-white hover:bg-[#ff5a1f]/10">
                See the 5-day plan
              </a>
            </div>
          </div>
          <div
            className="bg-[#ff5a1f] px-4 pt-16 pb-12 [clip-path:polygon(0_14%,100%_0,100%_100%,0_100%)] sm:px-6 md:bg-transparent md:py-16 md:pl-16 md:[clip-path:none]"
            aria-label="Lift, run, repeat"
            role="img"
          >
            <div aria-hidden className="text-[clamp(4rem,21vw,7.5rem)] leading-[0.86] font-black tracking-tighter uppercase italic md:text-[clamp(4rem,8.5vw,8.5rem)]">
              <p className="text-[#0a0a0a]">Lift</p>
              <p className="text-white">Run</p>
              <p className="text-transparent [-webkit-text-stroke:2px_#0a0a0a]">Repeat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <div className="border-l-4 border-[#ff5a1f] pl-5 sm:pl-7">
          <h2 className="text-sm font-bold tracking-[0.2em] text-[#ff5a1f] uppercase">Short answer: what is a hybrid training plan?</h2>
          <p className="mt-4 text-xl leading-relaxed text-white sm:text-2xl">
            A hybrid training plan mixes strength and endurance training in one week. A simple version: lift heavy two or three
            times, run three times with most runs easy, and keep hard days apart. Rest one or two days, sleep well, eat enough
            protein, and add load slowly.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className={h2}>5 rules of strength and endurance training</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/70">
            You do not need to be a pro to train like a hybrid athlete. These simple rules keep both sides moving forward.
          </p>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {PRINCIPLES.map((p, i) => (
              <li key={p.t} className="flex flex-col gap-3 bg-[#0a0a0a] p-6">
                <span className="text-5xl leading-none font-black text-[#ff5a1f] italic tabular-nums">{i + 1}</span>
                <h3 className="text-lg font-semibold">{p.t}</h3>
                <p className="text-[15px] leading-relaxed text-white/70">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sample week */}
      <section id="week" className="scroll-mt-8 bg-[#fafafa] text-[#0a0a0a]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-bold tracking-[0.2em] text-[#c2410c] uppercase">The plan</p>
          <h2 className={h2}>Sample 5-day hybrid training week</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Pick weights that leave one or two reps in the tank. Run at a pace where you could still talk, except on Thursday. If
            you are new to running, start with the shorter times or use run-walk.
          </p>

          <ol className="mt-10 grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Week overview">
            {WEEK.map((w) => (
              <li key={w.d} className={`flex flex-col items-center gap-1 rounded-xl px-1 py-3 text-center ${KIND_STYLE[w.kind]}`}>
                <span className="text-[11px] font-medium opacity-80 sm:text-xs">{w.d}</span>
                <span className="text-[10px] font-black tracking-tight sm:text-sm">{w.kind}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {WEEK.filter((w) => w.rows).map((w) => (
              <article key={w.d} className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white">
                <div className={`flex items-start justify-between gap-3 px-5 py-4 ${w.kind === 'LIFT' ? 'bg-[#ff5a1f] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-white'}`}>
                  <div>
                    <h3 className="text-lg font-bold">
                      {w.d} · {w.title}
                    </h3>
                    <p className={`text-sm ${w.kind === 'LIFT' ? 'text-[#0a0a0a]/75' : 'text-white/70'}`}>{w.note}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-black ${w.kind === 'LIFT' ? 'bg-[#0a0a0a] text-white' : 'bg-[#ff5a1f] text-[#0a0a0a]'}`}
                  >
                    {w.kind}
                  </span>
                </div>
                <ul className="divide-y divide-[#ededed]">
                  {w.rows!.map(([name, sr]) => (
                    <li key={name} className="flex items-center justify-between gap-3 px-5 py-3 text-[15px]">
                      <span className="font-medium">{name}</span>
                      <span className="shrink-0 text-right font-semibold text-[#404040] tabular-nums">{sr}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            <article className="flex flex-col justify-center gap-2 rounded-2xl border border-dashed border-[#d4d4d4] p-6">
              <h3 className="text-lg font-bold">Fri and Sun · Rest</h3>
              <p className="leading-relaxed text-[#525252]">
                A walk or light stretching is fine. Want a third lift? Add a short full-body session on Friday and keep it light on
                the legs, because Saturday is the long run.
              </p>
            </article>
          </div>

          <div className="mt-10 grid max-w-3xl gap-4 text-[17px] leading-relaxed text-[#404040]">
            <p>
              <b className="text-[#0a0a0a]">How to progress:</b> on lifting days, add a rep or a small step of weight (like 2.5 kg)
              when you hit all your reps with good form. On runs, add a few minutes to the long run every week or two. Do not chase
              both hard in the same week.
            </p>
            <p>
              Not sure what your pace per km is? Work it out with the <A href="/running-pace-calculator">running pace calculator</A>,
              then keep easy runs well slower than that. Training for a race? Swap the run days for a{' '}
              <A href="/10k-training-plan">10K training plan</A> and keep the two lifting days.
            </p>
          </div>
        </div>
      </section>

      {/* Logging in RepUp */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-20 [&>*]:min-w-0">
          <div>
            <p className="mb-3 text-sm font-bold tracking-[0.2em] text-[#ff5a1f] uppercase">In RepUp</p>
            <h2 className={h2}>How to log both lifts and runs</h2>
            <p className="mt-3 text-lg leading-relaxed text-white/70">
              RepUp has two modes in one free account. Lifts go in Workout mode, runs in Running mode. Switch from the account menu.
            </p>
            <ol className="mt-8 flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#ff5a1f] font-black text-[#0a0a0a]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-white/70">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 leading-relaxed text-white/70">
              More on how the two modes fit together:{' '}
              <Link href="/gym-and-running-tracker" className="font-medium text-[#ff8a5c] underline underline-offset-4">
                gym and running tracker
              </Link>
              . If you are a runner first, start with{' '}
              <Link href="/strength-training-for-runners" className="font-medium text-[#ff8a5c] underline underline-offset-4">
                strength training for runners
              </Link>
              .
            </p>
          </div>
          <div className="flex justify-center gap-0">
            <PhoneMock screen="log" className="-rotate-3" />
            <PhoneMock screen="run-summary" className="-ml-40 mt-24 hidden rotate-3 sm:block" />
          </div>
        </div>
      </section>

      {/* Safety note */}
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <p className="rounded-2xl border border-white/15 bg-white/5 p-5 text-[15px] leading-relaxed text-white/75">
          <b className="text-white">Listen to your body.</b> Some tiredness is normal when you mix lifting and running. Sharp pain,
          pain that changes how you walk, or chest pain or dizziness are signs to stop and get checked by a doctor.
        </p>
      </section>

      <div className="bg-[#fafafa] pt-4 text-[#0a0a0a]">
        <FaqSection faqs={FAQS} title="Hybrid training questions" />
        <CtaBand
          title="Lift. Run. Repeat. Log it all free."
          body="One account for your gym sets and your runs. Free, no ads."
          cta="Start my hybrid week"
        />
      </div>
    </LandingShell>
  );
}
