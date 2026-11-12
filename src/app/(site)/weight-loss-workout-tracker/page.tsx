import Link from 'next/link';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, Callout, CtaBand, FaqSection, LandingShell, PlanCard } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/weight-loss-workout-tracker". Layout: "reversed split with a trend".
 * Mint hero with the body-weight phone on the left (desktop) and a floating
 * weekly-average stat; principles as a vertical timeline; the Indian sample
 * day as four "plate" cards. Accent: emerald #059669 (small text #047857).
 * Main keywords: weight loss workout plan, fat loss gym workout, how to lose
 * weight in gym, weight loss diet plan Indian, track body weight.
 */

const PATH = '/weight-loss-workout-tracker';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Weight Loss Workout Plan & Body Weight Tracker | RepUp',
  description:
    'A weight loss workout plan that keeps your muscle: lift 3–4 days, eat a little less, walk daily and track your weekly average body weight. Free tracker.',
  keywords: [
    'weight loss workout plan',
    'fat loss gym workout',
    'how to lose weight in gym',
    'weight loss diet plan Indian',
    'track body weight',
    'body weight tracker app',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'What is the best gym workout for weight loss?',
    a: 'Strength training 3–4 days a week, plus daily walking. Lifting keeps your muscle while you eat less, so the weight you lose is mostly fat. Walking adds to the calories you burn without making you too tired to lift.',
  },
  {
    q: 'How fast should I lose weight?',
    a: 'About 0.5–1% of your body weight per week is a good pace for most people. For someone who weighs 80 kg, that is roughly 0.4–0.8 kg a week. Faster usually means losing more muscle and feeling worse.',
  },
  {
    q: 'Why does my weight go up some days even when I diet?',
    a: 'Day-to-day weight moves up and down with water, salt, food in your stomach and sleep. A jump after a salty dinner is mostly water, not fat. That is why the weekly average matters more than any single morning.',
  },
  {
    q: 'How often should I weigh myself?',
    a: 'A few mornings a week (or daily, if it does not stress you), after the toilet and before eating, on the same scale. Then compare this week’s average with last week’s.',
  },
  {
    q: 'Can I lose weight on an Indian vegetarian diet?',
    a: 'Yes. Keep a small calorie deficit and get enough protein from foods like paneer, dal, curd, soya chunks, chana, milk and tofu. Fill half the plate with sabzi and salad, and keep roti or rice portions in check.',
  },
  {
    q: 'Does RepUp count calories?',
    a: 'No. RepUp tracks your training (sets, reps and kg) and your body weight with a chart. It does not count calories or log food. Use any method you like for food, and use RepUp to make sure your strength and weight trend are on track.',
  },
];

const PRINCIPLES = [
  {
    tag: 'Training',
    title: 'Lift to keep muscle',
    body: 'When you eat less, your body can lose muscle as well as fat. Lifting tells it the muscle is still needed, so the weight you lose is mostly fat. Cardio helps you burn more, but it does not protect muscle the way lifting does.',
  },
  { tag: 'Food', title: 'Eat a little less', body: 'A small deficit of roughly 300–500 kcal a day below what you burn. Crash diets cost muscle and energy.' },
  { tag: 'Food', title: 'Keep protein high', body: 'Around 1.6–2.2 g per kg of body weight a day helps you keep muscle and stay full.' },
  { tag: 'Daily', title: 'Walk every day', body: 'Walking is easy to recover from. Many people aim for 7,000–10,000 steps a day.' },
  {
    tag: 'Tracking',
    title: 'Watch the weekly average',
    body: 'Aim to lose about 0.5–1% of body weight per week. Judge it by the weekly average, not one morning.',
  },
];

/** Plate split in degrees: veg, protein, roti/rice (rest). */
const MEALS: { meal: string; food: string; protein: string; plate: [number, number] }[] = [
  { meal: 'Breakfast', food: '2–3 eggs (or paneer bhurji) with 1–2 roti or a bowl of poha; tea or coffee with little sugar', protein: '~15–25 g', plate: [120, 130] },
  { meal: 'Lunch', food: '1 katori dal, 1–2 roti or a small bowl of rice, a big serving of sabzi, salad and a bowl of curd', protein: '~15–20 g', plate: [180, 90] },
  { meal: 'Snack', food: 'A fruit with a handful of roasted chana, or buttermilk', protein: '~5–7 g', plate: [200, 100] },
  { meal: 'Dinner', food: 'Chicken curry, fish or paneer/tofu with sabzi, salad and 1–2 roti', protein: '~20–40 g', plate: [180, 110] },
];

const UPPER: [string, string][] = [
  ['Bench press or dumbbell press', '3 × 6–10'],
  ['Lat pulldown', '3 × 8–12'],
  ['Seated cable row', '3 × 8–12'],
  ['Shoulder press', '2 × 8–12'],
  ['Curl + triceps pushdown', '2 × 10–15'],
];

const LOWER: [string, string][] = [
  ['Squat or leg press', '3 × 6–10'],
  ['Romanian deadlift', '3 × 8–10'],
  ['Walking lunge', '2 × 10/leg'],
  ['Leg curl', '2 × 10–15'],
  ['Calf raise', '2 × 12–15'],
];

const STEPS = [
  { name: 'Set up your week', text: 'Add Upper on Monday and Thursday and Lower on Tuesday and Saturday in your RepUp weekly plan, with sets × reps.' },
  { name: 'Log every set', text: 'Type kg and reps for each set. RepUp shows last time, so you can aim to keep your strength or beat it.' },
  { name: 'Log your body weight', text: 'A few mornings a week, add your weight to the body-weight log, under the same conditions each time.' },
  { name: 'Check the trend weekly', text: 'Look at the body-weight chart once a week. Adjust food or steps only if the trend has not moved for 2–3 weeks.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const kicker = 'mb-3 text-sm font-semibold tracking-wide text-[#047857] uppercase';

function Plate({ veg, protein }: { veg: number; protein: number }) {
  return (
    <div
      aria-hidden
      className="size-24 rounded-full border-[6px] border-white shadow-[0_0_0_1px_#d1fae5,0_6px_16px_rgba(5,150,105,0.15)]"
      style={{
        background: `conic-gradient(#34d399 0deg ${veg}deg, #059669 ${veg}deg ${veg + protein}deg, #d1fae5 ${veg + protein}deg 360deg)`,
      }}
    />
  );
}

export default function WeightLossWorkoutTrackerPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free gym workout tracker with a body-weight log: follow a weight loss workout plan, log sets and kg, and watch your weekly average.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Weight loss workout tracker'),
        howToLd('How to track a weight loss workout plan in RepUp', STEPS),
      ]}
    >
      {/* Hero: reversed split with a trend */}
      <section className="relative overflow-hidden bg-[#ecfdf5]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(45% 60% at 20% 60%, rgba(5,150,105,0.16), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#0b0a1f] text-white hover:bg-[#1e1b4b]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-8 pb-20 sm:px-6 md:grid-cols-[1fr_1.15fr] md:pt-14 md:pb-24 [&>*]:min-w-0">
          <div className="relative order-2 mx-auto w-fit md:order-1">
            <PhoneMock screen="bodyweight" theme="light" className="-rotate-2" />
            <div className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 rounded-2xl border border-[#a7f3d0] bg-white px-5 py-3 shadow-xl shadow-[#059669]/15 md:bottom-28 md:-right-28 md:left-auto md:translate-x-0">
              <p className="text-xs font-medium text-[#525252]">Weekly average</p>
              <p className="text-3xl font-semibold tracking-tight text-[#059669] tabular-nums">−0.5 kg</p>
              <p className="text-xs text-[#525252]">per week · example</p>
            </div>
          </div>
          <div className="order-1 flex flex-col gap-6 md:order-2">
            <p className="w-fit rounded-full bg-[#059669] px-3 py-1 text-xs font-semibold text-white">Lose fat · keep muscle</p>
            <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#0a0a0a] sm:text-5xl md:text-[3.4rem]">
              A weight loss workout plan that <span className="text-[#047857]">keeps your muscle</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#404040]">
              Lift a few times a week, eat a little less, walk every day, and watch the trend, not the daily number. Here is how, plus
              a simple Indian sample day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
              >
                Track workouts &amp; weight free
              </Link>
              <a href="#plan" className="rounded-xl border border-[#a7f3d0] bg-white px-6 py-3.5 text-base font-semibold text-[#0a0a0a] hover:bg-[#f0fdf4]">
                See the weekly plan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="border-l-4 border-[#059669] pl-5 sm:pl-8">
          <h2 className={kicker}>How to lose weight in the gym</h2>
          <p className="text-xl leading-relaxed text-[#262626] sm:text-2xl">
            To lose weight in the gym, lift weights 3–4 times a week to keep your muscle, eat about 300–500 kcal less than you burn,
            get plenty of protein and walk daily. Aim to lose about 0.5–1% of your body weight per week, and judge progress by your
            weekly average weight, not one morning.
          </p>
        </div>
      </section>

      {/* Principles timeline */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.4fr] md:py-20">
          <div className="md:sticky md:top-8 md:self-start">
            <p className={kicker}>The basics</p>
            <h2 className={h2}>How to lose fat without losing muscle</h2>
            <p className="mt-4 text-lg leading-relaxed text-[#525252]">
              Five simple rules, in order. New to lifting? Start with the <A href="/beginner-gym-workout-plan">beginner gym workout plan</A>.
            </p>
          </div>
          <ol className="relative flex flex-col gap-8 border-l-2 border-[#a7f3d0] pl-8">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="relative">
                <span
                  aria-hidden
                  className="absolute top-0.5 -left-[47px] flex size-7 items-center justify-center rounded-full border-4 border-white bg-[#059669] text-xs font-bold text-white"
                >
                  {i + 1}
                </span>
                <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-semibold text-[#047857]">{p.tag}</span>
                <h3 className="mt-2 text-xl font-semibold">{p.title}</h3>
                <p className="mt-1 leading-relaxed text-[#525252]">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Indian sample day as plates */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kicker}>Food</p>
        <h2 className={h2}>Weight loss diet plan (Indian): a simple sample day</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          No special foods needed. Build each meal around protein, fill half the plate with vegetables, and keep roti, rice and oil
          moderate. Portions depend on your size and goal.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#525252]" aria-label="Plate legend">
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-full bg-[#34d399]" /> Veg, salad &amp; fruit
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-full bg-[#059669]" /> Protein
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-full bg-[#d1fae5]" /> Roti / rice / poha
          </li>
        </ul>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEALS.map((m) => (
            <li key={m.meal} className="flex flex-col items-center gap-4 rounded-3xl border border-[#d1fae5] bg-white p-6 text-center">
              <Plate veg={m.plate[0]} protein={m.plate[1]} />
              <h3 className="text-xl font-semibold">{m.meal}</h3>
              <p className="flex-1 text-[15px] leading-relaxed text-[#525252]">{m.food}</p>
              <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-sm font-semibold text-[#047857]">Protein {m.protein}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[#737373]">
          An example, not a prescription. Plates and protein values are rough. If you have diabetes, a thyroid condition or other
          health issues, ask a doctor or dietitian. More high-protein Indian foods: <A href="/muscle-gain-workout-log">muscle gain &amp; protein</A>.
        </p>
      </section>

      {/* Weekly plan */}
      <section id="plan" className="scroll-mt-8 bg-[#ecfdf5]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kicker}>Training</p>
          <h2 className={h2}>A fat loss gym workout for the week</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#404040]">
            Four days: Upper on Monday and Thursday, Lower on Tuesday and Saturday. Walk on the other days. Keep the weights
            reasonably heavy. Your goal is to hold on to your strength while the scale drops.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <PlanCard title="Upper" subtitle="Monday & Thursday" rows={UPPER} featured />
            <PlanCard title="Lower" subtitle="Tuesday & Saturday" rows={LOWER} />
          </div>
          <p className="mt-6 text-[#404040]">
            If your lifts stay the same or go up while your weight goes down, you are keeping muscle. A{' '}
            <A href="/progressive-overload-tracker">progressive overload tracker</A> makes that easy to see.
          </p>
        </div>
      </section>

      {/* Weigh-ins */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-20 [&>*]:min-w-0">
        <div>
          <p className={kicker}>Body weight</p>
          <h2 className={h2}>How to track body weight the right way</h2>
          <ul className="mt-8 flex flex-col gap-3">
            {[
              'Weigh in a few mornings a week, after the toilet and before food.',
              'Use the same scale, in the same place, every time.',
              'Expect daily swings of up to 1–2 kg from water, salt and food.',
              'Compare this week’s average with last week’s.',
              'No change for 2–3 weeks? Eat a little less or walk a little more.',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[17px] leading-relaxed text-[#404040]">
                <span aria-hidden className="mt-2 size-2.5 shrink-0 rounded-full bg-[#059669]" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[17px] leading-relaxed text-[#404040]">
            RepUp’s body-weight log keeps every weigh-in and draws the chart, so the slow downward trend is easy to see.
          </p>
        </div>
        <PhoneMock screen="bodyweight" className="rotate-2" />
      </section>

      {/* RepUp steps */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kicker}>In RepUp</p>
          <h2 className={h2}>How to use RepUp for weight loss</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.name} className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-6">
                <span className="text-4xl font-semibold text-[#059669] tabular-nums">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.name}</h3>
                <p className="mt-2 leading-relaxed text-[#525252]">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 max-w-2xl">
            <Callout title="RepUp does not count calories" tone="note">
              RepUp tracks your training and your body weight. It does not count calories or log food, so use whatever works for you
              there.
            </Callout>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} />

      <CtaBand title="Lose the fat. Keep the strength." body="Log your lifts and your weight in one free app. No ads." />
    </LandingShell>
  );
}
