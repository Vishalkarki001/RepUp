import Link from 'next/link';
import { Fragment } from 'react';
import { cn } from 'cn';
import { A, Callout, CtaBand, FaqSection, LandingShell, Prose, ShortAnswer, Split } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /progressive-overload-tracker. Archetype "the chart is the hero": dark band
 * with a wide step chart of kg over 10 weeks, stat tiles, then a rule stepper
 * and the week table. Accent: green #10b981.
 * Main keywords: progressive overload, progressive overload tracker app,
 * double progression, how to increase weight in gym, when to increase weight.
 */

const PATH = '/progressive-overload-tracker';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Progressive Overload Tracker: When to Add Weight | RepUp',
  description:
    'Progressive overload made simple: use double progression to know when to increase weight in the gym. RepUp is a free tracker that sets your target each set.',
  keywords: [
    'progressive overload',
    'progressive overload tracker app',
    'double progression',
    'how to increase weight in gym',
    'when to increase weight',
    'progressive overload app free',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'What is progressive overload?',
    a: 'Progressive overload means slowly asking your muscles to do more over time: one more rep, a little more weight, or one more set, with good form. Without it, your body has no reason to get stronger.',
  },
  {
    q: 'When should I increase weight in the gym?',
    a: 'A simple rule: when you can do the top of your rep range on every working set with good form, add the smallest weight step. Then build the reps back up at the new weight.',
  },
  {
    q: 'How much weight should I add?',
    a: 'The smallest jump you can. About 2.5 kg on a barbell (1.25 kg each side), 1–2 kg per dumbbell, or one pin on a machine stack. Small jumps keep you progressing for longer.',
  },
  {
    q: 'What is double progression?',
    a: 'You progress two things in order: first reps, then weight. Add reps at the same weight until all sets reach the top of your range, then add weight and start again from the bottom.',
  },
  {
    q: 'How does RepUp track progressive overload?',
    a: 'RepUp shows what you lifted last time for each set and suggests today’s target. If you have not reached your goal reps it tells you to stay at the same weight and try for them. When you hit the goal on every set it says, for example, “You hit 10 reps on every set. Go up to 62.5 kg today!”',
  },
  {
    q: 'What if I can’t add weight or reps any more?',
    a: 'Stalls are normal. Check sleep, food and protein first. Then try smaller jumps, or take a lighter deload week and build up again.',
  },
];

/** The three rules of double progression (stepper + HowTo). */
const RULES = [
  {
    name: 'Pick a rep range and a weight',
    text: 'For most exercises 8–10 reps works well. Pick a weight you can lift for 8 good reps with one or two reps left in the tank.',
  },
  {
    name: 'Add reps first',
    text: 'Keep the weight the same. Each workout, try to beat last time by one rep on one or more sets.',
  },
  {
    name: 'All sets at the top? Add weight',
    text: 'When every set reaches 10 reps, add the smallest step: about 2.5 kg on a barbell, 1–2 kg per dumbbell, one pin on a machine. You will get fewer reps at the new weight. That is normal: climb back to 10, then repeat.',
  },
];

/** Example bench press, 3 sets, goal 10 reps. Used by the chart and the table. */
const WEEKS: { kg: number; reps: string; next: string; up?: boolean; goal?: boolean }[] = [
  { kg: 60, reps: '8 · 8 · 8', next: 'Same weight, add reps' },
  { kg: 60, reps: '9 · 8 · 8', next: 'Same weight, add reps' },
  { kg: 60, reps: '9 · 9 · 9', next: 'Same weight, add reps' },
  { kg: 60, reps: '10 · 10 · 10', next: 'All sets at 10 → add 2.5 kg', goal: true },
  { kg: 62.5, reps: '8 · 8 · 8', next: 'New weight, climb again', up: true },
  { kg: 62.5, reps: '9 · 9 · 8', next: 'Same weight, add reps' },
  { kg: 62.5, reps: '10 · 10 · 9', next: 'Almost. One set short' },
  { kg: 62.5, reps: '10 · 10 · 10', next: 'All sets at 10 → add 2.5 kg', goal: true },
  { kg: 65, reps: '8 · 8 · 8', next: 'New weight, climb again', up: true },
  { kg: 65, reps: '9 · 8 · 8', next: 'Same weight, add reps' },
];

/* Chart geometry, in % of the plot box. */
const KG_MIN = 57.5;
const KG_MAX = 67.5;
const X0 = 12;
const X1 = 97;
const Y0 = 14;
const Y1 = 84;
const px = (i: number) => X0 + (i * (X1 - X0)) / (WEEKS.length - 1);
const py = (kg: number) => Y0 + ((KG_MAX - kg) / (KG_MAX - KG_MIN)) * (Y1 - Y0);

function stepPath() {
  let d = `M ${px(0)} ${py(WEEKS[0].kg)}`;
  for (let i = 1; i < WEEKS.length; i++) d += ` L ${px(i)} ${py(WEEKS[i - 1].kg)} L ${px(i)} ${py(WEEKS[i].kg)}`;
  return d;
}

function HeroChart() {
  const line = stepPath();
  const area = `${line} L ${px(WEEKS.length - 1)} ${Y1} L ${px(0)} ${Y1} Z`;
  return (
    <figure className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 px-1 pb-2">
        <span className="text-sm font-semibold text-white">Bench press · top weight per week</span>
        <span className="text-xs text-white/60">Example · goal 10 reps × 3 sets</span>
      </figcaption>
      <div
        className="relative h-[260px] w-full sm:h-[340px]"
        role="img"
        aria-label="Example chart: bench press stays at 60 kg while reps climb, steps up to 62.5 kg in week 5 and to 65 kg in week 9, each time after 10 reps on every set."
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <linearGradient id="po-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[60, 62.5, 65].map((kg) => (
            <line
              key={kg}
              x1={X0}
              x2={X1}
              y1={py(kg)}
              y2={py(kg)}
              stroke="rgba(255,255,255,0.10)"
              strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill="url(#po-fill)" />
          <path d={line} fill="none" stroke="#10b981" strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* y labels */}
        {[60, 62.5, 65].map((kg) => (
          <span
            key={kg}
            className="absolute -translate-y-full pb-0.5 text-[11px] text-white/55 tabular-nums sm:text-xs"
            style={{ left: 0, top: `${py(kg)}%` }}
          >
            {kg} kg
          </span>
        ))}
        {/* points, reps and "+2.5 kg" notes */}
        {WEEKS.map((w, i) => (
          <Fragment key={i}>
            <span
              className={cn(
                'absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-3',
                w.goal ? 'bg-[#10b981] ring-4 ring-[#10b981]/25' : 'bg-[#0b0a1f] ring-2 ring-[#10b981]',
              )}
              style={{ left: `${px(i)}%`, top: `${py(w.kg)}%` }}
            />
            <span
              className={cn(
                'absolute hidden pt-3 text-[10px] whitespace-nowrap text-white/50 tabular-nums md:block',
                w.up ? '-translate-x-full pr-2' : '-translate-x-1/2',
              )}
              style={{ left: `${px(i)}%`, top: `${py(w.kg)}%` }}
            >
              {w.reps.replace(/ /g, '')}
            </span>
            {w.up && (
              <span
                className="absolute -translate-x-1/2 -translate-y-[170%] rounded-full bg-[#10b981] px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-[#0b0a1f] sm:text-xs"
                style={{ left: `${px(i)}%`, top: `${py(w.kg)}%` }}
              >
                +2.5 kg
              </span>
            )}
            <span
              className="absolute -translate-x-1/2 text-[10px] text-white/55 sm:text-xs"
              style={{ left: `${px(i)}%`, top: `${Y1 + 6}%` }}
            >
              <span className="hidden sm:inline">W</span>
              {i + 1}
            </span>
          </Fragment>
        ))}
      </div>
    </figure>
  );
}

const TILES = [
  { n: '+5 kg', t: 'on bench in this 10-week example' },
  { n: '2', t: 'weight jumps, each earned with 10 reps on every set' },
  { n: '+1', t: 'rep at a time: the size of most weekly steps' },
];

export default function ProgressiveOverloadPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free progressive overload tracker: logs every set, shows last time and tells you when to add reps or weight.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Progressive overload tracker'),
        howToLd('How to use double progression to increase weight in the gym', RULES),
      ]}
    >
      {/* Hero: the chart */}
      <section
        className="relative overflow-hidden bg-[#0b0a1f] text-white"
        style={{
          background:
            'radial-gradient(50% 40% at 50% 0%, rgba(124,58,237,0.35), transparent 70%), radial-gradient(40% 40% at 85% 75%, rgba(16,185,129,0.18), transparent 70%), #0b0a1f',
        }}
      >
        <SiteNav
          className="relative"
          upClass="text-[#a78bfa]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-white text-[#0b0a1f] hover:bg-white/90"
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pt-10 text-center sm:px-6 md:pt-14">
          <p className="rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-3 py-1 text-xs font-medium text-[#6ee7b7]">
            Progressive overload tracker · free
          </p>
          <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            <span className="text-[#34d399]">Progressive overload</span> tracker that tells you when to add weight
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/70">
            Stop guessing in the gym. RepUp remembers every set, shows last time, and gives you today’s target: one more rep,
            or more weight when you have earned it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
            >
              Track my lifts free
            </Link>
            <a
              href="#double-progression"
              className="rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/5"
            >
              The method
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-12 pb-16 sm:px-6 md:pt-16 md:pb-20">
          <HeroChart />
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {TILES.map((t) => (
              <li key={t.n} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-4xl font-semibold tracking-tight text-[#34d399] tabular-nums">{t.n}</p>
                <p className="mt-1 text-sm text-white/65">{t.t}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ShortAnswer label="What is progressive overload?">
        <p>
          Progressive overload means doing a little more over time: one more rep, or a little more weight, with good form. The
          simplest method is double progression. Pick a rep range, add reps each workout, and when every set reaches the top,
          add the smallest weight step. RepUp tracks this and suggests each target.
        </p>
      </ShortAnswer>

      <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Why progressive overload works</h2>
        <Prose className="mt-5">
          <p>
            Your body adapts to the work you give it. Lift the same 60 kg for 8 reps every week and, after a while, it has no
            reason to change. Ask for a bit more and it slowly builds strength and muscle to keep up.
          </p>
          <p>
            “A bit more” can be more reps, more weight or more sets, always with good form. You will not beat last time every
            day; the trend over weeks is what matters. Food and sleep count too: see{' '}
            <A href="/muscle-gain-workout-log">eating enough protein for muscle gain</A>.
          </p>
        </Prose>
      </section>

      {/* Rules as a horizontal stepper */}
      <section id="double-progression" className="scroll-mt-8 border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#059669] uppercase">The method</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Double progression: how to increase weight in the gym
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            The easiest way to apply progressive overload. You progress reps first, then weight.
          </p>
          <ol className="mt-10 flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch">
            {RULES.map((r, i) => (
              <Fragment key={r.name}>
                {i > 0 && (
                  <li aria-hidden className="flex items-center justify-center text-2xl font-bold text-[#10b981]">
                    <span className="lg:hidden">↓</span>
                    <span className="hidden lg:inline">→</span>
                  </li>
                )}
                <li
                  className={cn(
                    'flex flex-1 flex-col gap-3 rounded-2xl border p-6',
                    i === 2 ? 'border-[#10b981] bg-[#10b981]/10' : 'border-[#e5e5e5] bg-[#fafafa]',
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#10b981] text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold">{r.name}</h3>
                  <p className="leading-relaxed text-[#525252]">{r.text}</p>
                </li>
              </Fragment>
            ))}
          </ol>
        </div>
      </section>

      {/* Week table */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-20">
        <p className="mb-3 text-sm font-semibold tracking-wide text-[#059669] uppercase">Example</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bench press, week by week</h2>
        <p className="mt-3 text-lg leading-relaxed text-[#525252]">
          The same 10 weeks as the chart above. 3 sets, rep range 8–10, starting at 60 kg.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e5e5e5] bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-[#f5f5f5] text-[#404040]">
              <tr>
                <th scope="col" className="p-4 font-semibold">Week</th>
                <th scope="col" className="p-4 font-semibold">kg</th>
                <th scope="col" className="p-4 font-semibold">Reps per set</th>
                <th scope="col" className="p-4 font-semibold">Next step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ededed]">
              {WEEKS.map((w, i) => (
                <tr key={i} className={w.goal ? 'bg-[#10b981]/12' : undefined}>
                  <th scope="row" className="p-4 font-medium">Week {i + 1}</th>
                  <td className={cn('p-4 tabular-nums', w.up ? 'font-semibold text-[#059669]' : 'text-[#525252]')}>{w.kg}</td>
                  <td className={cn('p-4 tabular-nums', w.goal ? 'font-semibold text-[#0a0a0a]' : 'text-[#525252]')}>{w.reps}</td>
                  <td className="p-4">
                    {w.goal ? (
                      <span className="rounded-full bg-[#10b981] px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white">
                        {w.next}
                      </span>
                    ) : (
                      <span className="text-[#525252]">{w.next}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[#737373]">Example numbers only.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#10b981]/30 bg-[#10b981]/[0.06] p-6">
            <h3 className="text-lg font-semibold text-[#047857]">When to increase weight</h3>
            <ul className="mt-3 flex flex-col gap-2 leading-relaxed text-[#404040]">
              <li>
                ✓ When <b>every</b> working set hits the top of your range with clean form.
              </li>
              <li>✓ Use the smallest step you can. Big jumps lead to stalls sooner.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6">
            <h3 className="text-lg font-semibold">When not to</h3>
            <ul className="mt-3 flex flex-col gap-2 leading-relaxed text-[#404040]">
              <li>✗ When only the first set gets there. Week 7 above is not ready yet.</li>
              <li>✗ If the last reps were half reps or your back rounded. Repeat the weight.</li>
            </ul>
          </div>
        </div>
      </section>

      <Split kicker="Inside RepUp" title="How the progressive overload tracker app works" mock={<PhoneMock screen="log" />}>
        <Prose>
          <p>You set goal reps for each exercise, say 10. RepUp reads what you did last time and writes a target above your sets:</p>
          <ul>
            <li>
              <b>Below the goal:</b> “Stay at 60 kg and try for 10 reps on every set”
            </li>
            <li>
              <b>Goal hit on every set:</b> “You hit 10 reps on every set. Go up to 62.5 kg today!”
            </li>
            <li>
              <b>Bodyweight exercises:</b> “Beat last time by 1 rep per set”
            </li>
          </ul>
          <p>
            The weight step depends on the equipment: 2.5 kg for barbells and machines, 2 kg for dumbbells and kettlebells (5
            lb if you use pounds). If your machine’s next pin is a bigger jump, just type the real weight.
          </p>
          <p>
            Every exercise also gets a progress chart, so you can see the line going up. New to the gym? Start with our{' '}
            <A href="/beginner-gym-workout-plan">beginner gym workout plan</A>.
          </p>
        </Prose>
      </Split>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Stuck on the same weight? Plateau and deload tips
        </h2>
        <Prose className="mt-5">
          <p>Every lifter stalls sometimes. If an exercise has not moved for two or three workouts in a row, work down this list:</p>
          <ol>
            <li>
              <b>Sleep and food.</b> Short sleep and too little food or protein stall progress faster than anything else.
            </li>
            <li>
              <b>Smaller steps.</b> Add 1 kg instead of 2.5 kg, or one rep on just one set.
            </li>
            <li>
              <b>Stay in the range longer.</b> It is fine to spend three or four weeks at one weight.
            </li>
            <li>
              <b>Swap the exercise.</b> After a long stall, try a close variation, like incline instead of flat bench.
            </li>
          </ol>
        </Prose>
        <div className="mt-8">
          <Callout title="Deload: the planned easy week">
            Take a lighter week: fewer sets or about 10% less weight. Then build back up. A clear{' '}
            <A href="/workout-log">workout log</A> makes stalls easy to spot. Without one, you only feel stuck.
          </Callout>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Progressive overload questions" />

      <CtaBand
        title="Beat last time. Every time."
        body="Free, no ads. Log one workout and RepUp gives you a target for the next."
        cta="Track my lifts free"
      />
    </LandingShell>
  );
}
