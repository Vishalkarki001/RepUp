import Link from 'next/link';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell, PlanCard } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/muscle-gain-workout-log". Layout: "giant number poster". Full-bleed
 * dark hero where a huge "1.6–2.2 g" protein stat dominates (no phone);
 * the 4 levers as a 2×2 grid of big numbered tiles; a protein table with
 * bar indicators; phone further down in a split. Accent: orange #f97316
 * (on light backgrounds text uses #c2410c for contrast).
 * Main keywords: muscle gain diet, high protein Indian diet for muscle gain,
 * bulking workout plan, how to build muscle, protein per day.
 */

const PATH = '/muscle-gain-workout-log';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Muscle Gain Diet & Workout Log: Protein Guide | RepUp',
  description:
    'How to build muscle: progressive overload, 10–20 sets per muscle a week, 1.6–2.2 g protein per kg and a small surplus. Indian protein table + free log.',
  keywords: [
    'muscle gain diet',
    'high protein Indian diet for muscle gain',
    'bulking workout plan',
    'how to build muscle',
    'protein per day',
    'muscle gain workout log',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'How much protein do I need per day to build muscle?',
    a: 'About 1.6–2.2 g of protein per kg of body weight per day. For a 70 kg person that is roughly 110–155 g a day, split over 3–4 meals.',
  },
  {
    q: 'Can I build muscle on a vegetarian Indian diet?',
    a: 'Yes. Paneer, soya chunks, dal, chana, curd, milk and tofu can get you to your protein target. Soya chunks and paneer are the easiest big sources. Combining dal with rice or roti also improves protein quality.',
  },
  {
    q: 'Do I need whey protein to gain muscle?',
    a: 'No. Whey is just a convenient food. If you hit your daily protein from normal meals, you do not need it. If you struggle to reach your target, a scoop can help.',
  },
  {
    q: 'How many sets per muscle per week should I do?',
    a: 'Roughly 10–20 hard sets per muscle per week works for most people. Beginners can start near 10 and add sets as they adapt. Hard sets end about 0–3 reps short of failure.',
  },
  {
    q: 'How big should my calorie surplus be?',
    a: 'Small: about 250–500 kcal a day above maintenance. Aim to gain slowly, around 0.25–0.5% of body weight per week. If the scale climbs faster, you are mostly adding fat.',
  },
  {
    q: 'Does RepUp track food or protein?',
    a: 'No. RepUp tracks your training (sets, reps and kg, weekly sets per muscle, progress charts) and your body weight. Count protein any way you like; use RepUp to make sure your lifts keep going up.',
  },
];

const LEVERS = [
  { n: '01', t: 'Progressive overload', d: 'Add a rep or a little weight over time. If the numbers never go up, the muscle has no reason to grow.' },
  { n: '02', t: '10–20 hard sets', d: 'Per muscle, per week. Hard means 0–3 reps short of failure. Spread them over 2 sessions per muscle.' },
  { n: '03', t: 'Protein + small surplus', d: '1.6–2.2 g protein per kg body weight daily, and about 250–500 kcal above maintenance.' },
  { n: '04', t: 'Sleep', d: 'Most adults need 7–9 hours. Muscle is built while you recover, not while you lift.' },
];

/** [food, serving, label, grams used for the bar (midpoint)] */
const FOODS: [string, string, string, number][] = [
  ['Chicken breast (cooked)', '100 g', '~30 g', 30],
  ['Soya chunks (dry)', '50 g', '~25 g', 25],
  ['Fish (cooked)', '100 g', '~20–25 g', 22.5],
  ['Whey protein', '1 scoop', '~20–25 g (check label)', 22.5],
  ['Paneer', '100 g', '~18 g', 18],
  ['Chana / rajma (cooked)', '1 katori', '~10–12 g', 11],
  ['Greek-style / hung curd', '100 g', '~10 g', 10],
  ['Dal (cooked)', '1 katori', '~7–9 g', 8],
  ['Milk', '250 ml', '~8 g', 8],
  ['Egg (whole)', '1 egg', '~6 g', 6],
  ['Roasted chana', '30 g', '~6 g', 6],
];

const EXAMPLE_DAY = [
  ['3 eggs', '18 g'],
  ['250 ml milk', '8 g'],
  ['2 katori dal', '16 g'],
  ['150 g chicken (or 50 g soya chunks + 100 g paneer)', '45 g (43 g)'],
  ['150 g hung curd', '15 g'],
  ['30 g roasted chana', '6 g'],
  ['Roti and rice', '~15–20 g'],
];

const PLAN: { title: string; subtitle: string; rows: [string, string][] }[] = [
  {
    title: 'Upper A',
    subtitle: 'Monday',
    rows: [
      ['Bench press', '3 × 6–10'],
      ['Barbell row', '3 × 6–10'],
      ['Incline dumbbell press', '3 × 8–12'],
      ['Lat pulldown', '3 × 8–12'],
      ['Lateral raise', '3 × 12–15'],
      ['Dumbbell curl', '2 × 10–15'],
    ],
  },
  {
    title: 'Lower A',
    subtitle: 'Tuesday',
    rows: [
      ['Squat', '3 × 6–10'],
      ['Romanian deadlift', '3 × 8–10'],
      ['Leg press', '2 × 10–12'],
      ['Leg curl', '3 × 10–15'],
      ['Calf raise', '3 × 12–15'],
    ],
  },
  {
    title: 'Upper B',
    subtitle: 'Thursday',
    rows: [
      ['Overhead press', '3 × 6–10'],
      ['Pull-up or pulldown', '3 × 6–10'],
      ['Dumbbell bench press', '3 × 8–12'],
      ['Seated cable row', '3 × 8–12'],
      ['Triceps pushdown', '3 × 10–15'],
      ['Lateral raise', '2 × 12–15'],
    ],
  },
  {
    title: 'Lower B',
    subtitle: 'Friday',
    rows: [
      ['Hack squat or leg press', '3 × 8–12'],
      ['Hip thrust', '3 × 8–12'],
      ['Split squat', '2 × 8–10/leg'],
      ['Leg extension', '2 × 12–15'],
      ['Leg curl', '2 × 10–15'],
    ],
  },
];

const STEPS = [
  { name: 'Plan a 4-day split', text: 'In your RepUp weekly plan, add Upper and Lower days (or push/pull/legs) with sets × reps for each exercise.' },
  { name: 'Log every set', text: 'Type kg and reps and tick each set. RepUp shows last time and suggests a target for today.' },
  { name: 'Check weekly sets per muscle', text: 'Open Progress to see sets per muscle this week, and aim for roughly 10–20 for each.' },
  { name: 'Watch your weight and lifts', text: 'Log body weight a few mornings a week and check that both your weight and your exercise charts move up slowly.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const kicker = 'mb-3 text-sm font-semibold tracking-wide text-[#c2410c] uppercase';
const ORANGE_TEXT = { backgroundImage: 'linear-gradient(100deg, #fdba74 0%, #f97316 45%, #ea580c 100%)' };

export default function MuscleGainWorkoutLogPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free gym workout log for muscle gain: log sets, reps and kg, see last time, beat it, and track weekly sets per muscle.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Muscle gain workout log'),
        howToLd('How to track a muscle gain plan in RepUp', STEPS),
      ]}
    >
      {/* Hero: giant number poster */}
      <section className="relative overflow-hidden bg-[#0b0a1f] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 50% 62%, rgba(249,115,22,0.28), transparent 70%), radial-gradient(40% 40% at 90% 0%, rgba(124,58,237,0.35), transparent 70%)',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#a78bfa]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-white text-[#0b0a1f] hover:bg-white/90"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-10 pb-20 text-center sm:px-6 md:pt-16 md:pb-28">
          <p className="rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#fdba74] uppercase">
            Build muscle
          </p>
          <h1 className="mt-6 max-w-3xl text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
            Muscle gain diet &amp; workout log
          </h1>
          <p
            className="mt-6 bg-clip-text pb-[0.14em] text-[clamp(4.5rem,21vw,13rem)] leading-[0.9] font-bold tracking-tighter text-transparent"
            style={ORANGE_TEXT}
          >
            1.6–2.2&nbsp;g
          </p>
          <p className="mt-3 text-sm font-semibold tracking-[0.2em] text-white/70 uppercase sm:text-base">
            protein per kg of body weight, per day
          </p>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
            That is one of four things that build muscle. Train hard enough, add load over time, eat enough protein, and sleep. Here
            are the numbers, an Indian protein table, and a free log to keep you honest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
            >
              Start logging free
            </Link>
            <a href="#protein" className="rounded-xl border border-white/20 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/5">
              Protein table
            </a>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h2 className={kicker}>How to build muscle: the short answer</h2>
        <p className="text-xl leading-relaxed text-[#262626] sm:text-2xl">
          To build muscle, train each muscle with about 10–20 hard sets a week and add a rep or a little weight over time
          (progressive overload). Eat about 1.6–2.2 g of protein per kg of body weight daily, keep a small calorie surplus of
          roughly 250–500 kcal, and sleep 7–9 hours.
        </p>
      </section>

      {/* 4 levers: 2×2 tiles */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <h2 className={h2}>The 4 levers that build muscle</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {LEVERS.map((l) => (
            <li key={l.n} className="relative overflow-hidden rounded-3xl bg-[#0b0a1f] p-7 text-white sm:p-9">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-6 -right-2 bg-clip-text text-[9rem] leading-none font-bold tracking-tighter text-transparent opacity-25"
                style={ORANGE_TEXT}
              >
                {l.n}
              </span>
              <span className="text-5xl font-bold tracking-tight text-[#f97316] tabular-nums">{l.n}</span>
              <h3 className="mt-4 text-2xl font-semibold">{l.t}</h3>
              <p className="mt-2 max-w-md leading-relaxed text-white/70">{l.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-[17px] leading-relaxed text-[#404040]">
          Lever 01 is where most people stall. They go to the gym, but lift the same weights for months. A{' '}
          <A href="/progressive-overload-tracker">progressive overload tracker</A> fixes that by showing last time’s numbers before
          every set.
        </p>
      </section>

      {/* Protein per day + table */}
      <section id="protein" className="scroll-mt-8 border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kicker}>Food</p>
          <h2 className={h2}>How much protein per day for muscle gain?</h2>
          <p className="mt-4 text-lg leading-relaxed text-[#404040]">
            Multiply your body weight in kg by 1.6 to 2.2. A 70 kg lifter needs about 110–155 g a day. Split it over 3–4 meals of
            25–40 g each. Most Indian home meals are low in protein, so plan one strong protein source for every meal.
          </p>

          <h2 className={`${h2} mt-16`}>High protein Indian diet for muscle gain</h2>
          <p className="mt-3 text-lg leading-relaxed text-[#525252]">
            Approximate protein in common foods. Values vary by brand, recipe and serving size, so check labels where you can.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e5e5e5]">
            <table className="w-full min-w-[320px] text-left text-sm sm:text-[15px]">
              <thead className="bg-[#f5f5f5] text-[#404040]">
                <tr>
                  <th scope="col" className="p-3 font-semibold sm:p-4">Food</th>
                  <th scope="col" className="p-3 font-semibold sm:p-4">Protein (approx.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ededed]">
                {FOODS.map(([f, s, label, g]) => (
                  <tr key={f}>
                    <th scope="row" className="p-3 align-top font-medium sm:p-4">
                      {f}
                      <span className="block text-xs font-normal text-[#737373]">per {s}</span>
                    </th>
                    <td className="w-[55%] p-3 align-top sm:p-4">
                      <span className="block font-semibold text-[#c2410c] tabular-nums">{label}</span>
                      <span aria-hidden className="mt-1.5 block h-2 w-full rounded-full bg-[#ffedd5]">
                        <span className="block h-full rounded-full bg-[#f97316]" style={{ width: `${(g / 30) * 100}%` }} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#737373]">
            1 katori ≈ 150 g cooked. Soya chunks are about 50 g protein per 100 g dry. General information, not medical advice.
          </p>

          <div className="mt-10 rounded-3xl border border-[#fed7aa] bg-[#fff7ed] p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-semibold">Example day for a 70 kg lifter</h3>
              <span className="text-3xl font-bold tracking-tight text-[#c2410c] tabular-nums">~125 g</span>
            </div>
            <ul className="mt-4 divide-y divide-[#fed7aa]">
              {EXAMPLE_DAY.map(([food, g]) => (
                <li key={food} className="flex justify-between gap-4 py-2 text-[15px]">
                  <span className="text-[#404040]">{food}</span>
                  <span className="shrink-0 font-semibold tabular-nums">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Bulking plan */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kicker}>Training</p>
        <h2 className={h2}>A simple bulking workout plan</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Train 4 days a week: Upper, Lower, rest, Upper, Lower. Each muscle gets hit twice, for roughly 10–20 hard sets a week.
          Prefer 6 days? A <A href="/push-pull-legs-workout-planner">push pull legs plan</A> works too.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLAN.map((d, i) => (
            <PlanCard key={d.title} title={d.title} subtitle={d.subtitle} rows={d.rows} featured={i === 0} />
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-[#525252]">
          Gain weight slowly, about 0.25–0.5% of body weight per week. Cutting later? See the{' '}
          <A href="/weight-loss-workout-tracker">weight loss workout tracker</A>.
        </p>
      </section>

      {/* RepUp split */}
      <section className="bg-[#0b0a1f] text-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
          <PhoneMock screen="progress" className="-rotate-2" />
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#fdba74] uppercase">In RepUp</p>
            <h2 className={h2}>How RepUp helps you build muscle</h2>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="w-8 shrink-0 text-3xl leading-none font-bold text-[#f97316] tabular-nums">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-white/70">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-4 text-[15px] leading-relaxed text-white/80">
              <b className="font-semibold text-white">RepUp does not track food.</b> It tracks your training and your body weight.
              Count protein any way you like; use RepUp to make sure your lifts keep going up.
            </p>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} />

      <CtaBand
        title="Beat last time. Every time."
        body="Free, no ads. Your lifts, your sets per muscle and your body weight in one log."
        cta="Start my muscle log"
      />
    </LandingShell>
  );
}
