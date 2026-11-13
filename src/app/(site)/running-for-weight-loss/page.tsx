import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/running-for-weight-loss". Look: "the equation". Light pink worksheet
 * (graph-paper) hero where a huge typographic "km × kg ≈ kcal" is the visual,
 * with a worked example row under it. Accent: pink #ec4899 (small text
 * uses #be185d for contrast). Calorie table, diet-first panel, a 4-week
 * ladder, RepUp in a dark split.
 * Main keywords: running for weight loss, calories burned running, how much to
 * run to lose weight, running vs walking calories.
 */

const PATH = '/running-for-weight-loss';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Running for Weight Loss: Calories Burned Running | RepUp',
  description:
    'Running for weight loss, explained simply: about 1 kcal per kg per km, why food matters most, a gentle 4-week start and how to track your runs for free.',
  keywords: [
    'running for weight loss',
    'calories burned running',
    'how much to run to lose weight',
    'running vs walking calories',
    'running calories calculator',
    'running to lose belly fat',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'How many calories does running 5 km burn?',
    a: 'A common rule of thumb is about 1 kcal per kg of body weight per km. So a 70 kg person burns roughly 350 kcal running 5 km, and a 60 kg person roughly 300 kcal. It is an estimate; your real number can be higher or lower.',
  },
  {
    q: 'How much should I run to lose weight?',
    a: 'Start with three runs or walk-runs a week of 20–30 minutes and build slowly. Health guidelines suggest 150–300 minutes of moderate activity a week for adults. For weight loss, what you eat matters more than how far you run.',
  },
  {
    q: 'Is running or walking better for weight loss?',
    a: 'Running burns about twice the calories per km, so it saves time. Walking is gentler and easier to do every day. The best one is the one you will still be doing in three months. Many people mix both.',
  },
  {
    q: 'Can running alone reduce belly fat?',
    a: 'You cannot choose where you lose fat. Running helps you use more energy, and with a small calorie deficit you lose fat from the whole body, including the belly, over time.',
  },
  {
    q: 'Does RepUp track my run with the screen off?',
    a: 'No. RepUp is a web app, so GPS tracking needs the screen on and RepUp open, with the phone in your hand or an armband. If the screen turns off or you switch apps, tracking pauses and the gap is joined with a straight line.',
  },
  {
    q: 'How does RepUp count calories for a run?',
    a: 'It estimates them from your distance and body weight (about 1 kcal per kg per km running, half that walking) and shows them with a ~ sign. It does not use heart rate, so treat the number as a rough guide.',
  },
];

const WEEKS = [
  { name: 'Week 1: Walk-run', text: '3 sessions of 20 minutes: 5 min brisk walk, then 1 min easy jog + 2 min walk, repeated. Finish with a walk.' },
  { name: 'Week 2: A little more running', text: '3 sessions of 25 minutes: 2 min jog + 2 min walk, repeated. Keep the jog slow enough to talk.' },
  { name: 'Week 3: Longer jogs', text: '3 sessions of 25–30 minutes: 3 min jog + 1½ min walk, repeated. Add one 30-minute walk on a rest day.' },
  { name: 'Week 4: Steady habit', text: '3 or 4 sessions of 30 minutes: 5 min jog + 1 min walk, repeated. Repeat this week until it feels comfortable.' },
];

const WEIGHTS = [50, 60, 70, 80, 90];

const pink = 'text-[#be185d]';
const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

function Kicker({ children }: { children: ReactNode }) {
  return <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${pink}`}>{children}</p>;
}

/** One column of the hero equation: big term, what it means, example value. */
function Term({ big, label, example, op }: { big: string; label?: string; example: string; op?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-[clamp(2.4rem,12vw,8.5rem)] leading-none font-bold tracking-tighter ${op ? 'text-[#f9a8d4]' : 'text-[#0a0a0a]'}`}
      >
        {big}
      </span>
      <span className={`mt-2 h-4 text-[10px] font-semibold tracking-wide uppercase sm:text-xs ${pink}`}>{label}</span>
      <span
        className={`mt-3 text-base font-semibold whitespace-nowrap tabular-nums sm:text-2xl ${
          op ? 'text-[#be185d]' : 'rounded-lg bg-white px-1.5 py-1 text-[#0a0a0a] shadow-sm ring-1 ring-[#fbcfe8] sm:px-3'
        }`}
      >
        {example}
      </span>
    </div>
  );
}

export default function RunningForWeightLossPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fffafc]"
      jsonLd={[
        appLd('Free running and gym tracker: GPS runs with estimated calories, weekly km, body-weight log and strength workouts.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Running for weight loss'),
        howToLd('A gentle 4-week start to running for weight loss', WEEKS),
      ]}
    >
      {/* Hero: the equation on graph paper */}
      <section
        className="relative overflow-hidden border-b border-[#fbcfe8] bg-[#fdf2f8]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(236,72,153,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.09) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-8 pb-20 text-center sm:px-6 md:pt-14 md:pb-24">
          <p className="rounded-full border border-[#ec4899]/30 bg-white px-3 py-1 text-xs font-semibold text-[#be185d]">
            The honest maths of running and fat loss
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#0a0a0a] sm:text-5xl">
            Running for weight loss: <span className="text-[#db2777]">how many calories does it burn?</span>
          </h1>

          <div className="mt-12 grid grid-cols-[repeat(5,auto)] items-start justify-center gap-x-[2.5vw] sm:gap-x-6" role="img" aria-label="Kilometres times body weight in kg is roughly the calories burned. Example: 5 km times 70 kg is about 350 kcal.">
            <Term big="km" label="distance" example="5 km" />
            <Term big="×" op example="×" />
            <Term big="kg" label="your weight" example="70 kg" />
            <Term big="≈" op example="≈" />
            <Term big="kcal" label="energy used" example="350 kcal" />
          </div>
          <p className="mt-6 text-sm text-[#525252]">Running rule of thumb. Walking: about half.</p>

          <p className="mt-10 max-w-xl text-lg leading-relaxed text-[#404040]">
            One simple rule, a calorie table, the honest truth about food, and a gentle 4-week start. Then a free tracker to log
            every run and your body weight.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Track your runs free
            </Link>
            <a href="#start" className="rounded-xl border border-[#f9a8d4] bg-white px-7 py-3.5 font-semibold text-[#0a0a0a] hover:bg-[#fdf2f8]">
              The 4-week start
            </a>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h2 className={`text-sm font-semibold tracking-wide uppercase ${pink}`}>The short answer</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">
          Running helps weight loss, but food matters more. As a rough rule, running burns about 1 kcal per kg of body weight per
          km, so a 70 kg person uses about 350 kcal on a 5 km run. Walking burns about half. Run three times a week, add strength
          training and eat in a small calorie deficit.
        </p>
      </section>

      {/* Calorie table */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 md:pb-20">
        <Kicker>Calories burned running</Kicker>
        <h2 className={h2}>Running vs walking calories, by body weight</h2>
        <p className="mt-3 text-lg leading-relaxed text-[#525252]">
          For running, distance and body weight matter much more than speed. Running 5 km slowly or quickly burns a similar amount;
          running fast just gets it done sooner. Walking the same distance uses roughly half.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#fbcfe8] bg-white">
          <table className="w-full min-w-[300px] text-left text-sm sm:text-base">
            <thead className="bg-[#fdf2f8] text-[#404040]">
              <tr>
                <th scope="col" className="p-3 font-semibold sm:p-4">Weight</th>
                <th scope="col" className="p-3 font-semibold sm:p-4">Run 3 km</th>
                <th scope="col" className="p-3 font-semibold sm:p-4">Run 5 km</th>
                <th scope="col" className="p-3 font-semibold sm:p-4">Walk 5 km</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fce7f3]">
              {WEIGHTS.map((kg) => (
                <tr key={kg}>
                  <th scope="row" className="p-3 font-medium tabular-nums sm:p-4">{kg} kg</th>
                  <td className="p-3 text-[#404040] tabular-nums sm:p-4">~{kg * 3}</td>
                  <td className={`p-3 font-semibold tabular-nums sm:p-4 ${pink}`}>~{kg * 5}</td>
                  <td className="p-3 text-[#404040] tabular-nums sm:p-4">~{kg * 2.5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[#737373]">
          kcal, rough estimates from the rule of thumb. Real numbers vary with fitness, terrain, heat and how you move.
        </p>
        <p className="mt-6 text-[17px] leading-relaxed text-[#404040]">
          Walking still counts. It is gentle on the joints and easy to do daily, so many people walk more often than they could
          run. If that is you, a <A href="/walking-tracker-app">walking tracker</A> works the same way.
        </p>
      </section>

      {/* Diet matters most */}
      <section className="bg-[#ec4899] text-[#0a0a0a]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-20 [&>*]:min-w-0">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#500724] uppercase">Be honest with the maths</p>
            <h2 className={`${h2} text-[#0a0a0a]`}>Why diet matters most for weight loss</h2>
            <p className="mt-4 text-lg leading-relaxed text-[#0a0a0a]">
              A 5 km run uses about 350 kcal for a 70 kg runner. A large restaurant meal, or a few biscuits with every chai through
              the day, can easily add up to more than that. Running makes losing weight easier; it cannot outrun a big daily
              surplus.
            </p>
          </div>
          <ul className="flex flex-col gap-3 self-center">
            {[
              'Aim for a small, steady calorie deficit, mostly from food.',
              'Eat protein at every meal: dal, paneer, eggs, curd, chicken.',
              'Don’t “reward” a run with a big snack. That cancels it.',
              'Sleep 7–9 hours. Tired people eat more.',
              'Weigh yourself a few mornings a week and look at the trend.',
            ].map((t) => (
              <li key={t} className="rounded-xl bg-white px-4 py-3 text-[16px] font-medium text-[#0a0a0a] shadow-sm">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How much to run */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <Kicker>How much</Kicker>
        <h2 className={h2}>How much to run to lose weight?</h2>
        <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
          <p>
            Less than you think, as long as you keep going. Health guidelines suggest adults get 150–300 minutes of moderate activity
            a week, or 75–150 minutes of vigorous activity. Three runs of 30 minutes plus a couple of walks gets you there.
          </p>
          <p>
            Going from zero to running every day is the fastest way to get sore, hurt or bored. Build up over weeks, keep at least
            one rest day, and use the time you save to lift weights. If you are starting from the sofa, our{' '}
            <A href="/couch-to-5k-plan">couch to 5K plan</A> takes you from walking to 30 minutes of running.
          </p>
          <p className="rounded-2xl border border-[#fbcfe8] bg-[#fdf2f8] p-4 text-[15px]">
            <b className="text-[#0a0a0a]">Check with a doctor first</b> if you have a heart condition, high blood pressure, diabetes,
            joint pain, or a lot of weight to lose.
          </p>
        </div>
      </section>

      {/* 4-week start */}
      <section id="start" className="scroll-mt-8 border-y border-[#fbcfe8] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Kicker>Gentle start</Kicker>
          <h2 className={h2}>A 4-week running plan for weight loss</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Three sessions a week with a rest day between. Jog slowly enough to talk. If a week feels hard, repeat it.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WEEKS.map((w, i) => (
              <li key={w.name} className="relative flex flex-col rounded-2xl border border-[#fbcfe8] bg-[#fffafc] p-6">
                <span className="text-5xl font-bold tracking-tighter text-[#ec4899] tabular-nums">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{w.name.split(': ')[1]}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#525252]">{w.text}</p>
                <span aria-hidden className="mt-5 h-1.5 rounded-full bg-[#fce7f3]">
                  <span className="block h-full rounded-full bg-[#ec4899]" style={{ width: `${(i + 1) * 25}%` }} />
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-[#0b0a1f] p-6 text-white sm:p-8">
              <h3 className="text-xl font-semibold">Add strength training</h3>
              <p className="mt-2 leading-relaxed text-white/75">
                Two short strength sessions a week help you keep muscle while you lose fat, so more of the weight you lose is fat.
                Not sure how to split your time? Read{' '}
                <Link href="/cardio-vs-weights-for-fat-loss" className="font-medium text-[#f9a8d4] underline underline-offset-4">
                  cardio vs weights for fat loss
                </Link>
                .
              </p>
            </div>
            <div className="rounded-2xl border border-[#fbcfe8] bg-[#fdf2f8] p-6 sm:p-8">
              <h3 className="text-xl font-semibold">Track the gym too</h3>
              <p className="mt-2 leading-relaxed text-[#404040]">
                RepUp logs your sets, reps and kg in the same account as your runs. See the{' '}
                <A href="/weight-loss-workout-tracker">weight loss workout tracker</A> for a simple gym plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RepUp */}
      <section className="bg-[#0b0a1f] text-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
          <PhoneMock screen="run-live" className="-rotate-2" />
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#f9a8d4] uppercase">In RepUp</p>
            <h2 className={h2}>Your runs, your weight, one honest log</h2>
            <ul className="mt-8 flex flex-col gap-3 text-[17px] leading-relaxed text-white/80">
              {[
                'GPS distance, moving time, average pace and splits for every km.',
                'Calories shown as an estimate (~) from your distance and body weight.',
                'A body-weight log with a chart, so you watch the trend, not one day.',
                'Weekly km, longest run and best pace in Progress.',
                'Add a walk or treadmill run by hand. Free, no ads.',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="font-bold text-[#f472b6]">=</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-[15px] leading-relaxed text-white/80">
              <b className="font-semibold text-white">Estimates, not lab numbers.</b> RepUp has no heart rate, so calories come from
              the rule on this page. Keep the screen on and RepUp open while you run.
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

      <FaqSection faqs={FAQS} title="Running and weight loss questions" />

      <CtaBand
        title="Move a little more. Eat a little smarter. Log it."
        body="Free running and gym tracker with a body-weight log. Android, iPhone and laptop."
        cta="Start free"
      />
    </LandingShell>
  );
}
