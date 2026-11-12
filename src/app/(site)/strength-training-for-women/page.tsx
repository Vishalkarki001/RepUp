import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';
import { A, Callout, CtaBand, FaqSection, LandingShell, PlanCard, Split } from '@/components/site/kit';

/**
 * Strength training guide for women.
 * Look: "editorial cover". Blush background, oversized left-aligned headline,
 * issue labels, thin rules, two-column intro, small tilted phone. Rose
 * (#e11d48) is this page's accent next to brand violet. Myth/fact as a
 * stacked list, the pull statement as a full-width rose band.
 * Main keywords: strength training for women, weight training for women beginners,
 * gym workout plan for women, will lifting weights make women bulky, glute workout plan.
 */

const PATH = '/strength-training-for-women';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Strength Training for Women: 3-Day Beginner Gym Plan',
  description:
    'Strength training for women, made simple: why lifting won’t make you bulky, a 3-day beginner gym plan with sets and reps, and how to track progress for free.',
  keywords: [
    'strength training for women',
    'weight training for women beginners',
    'gym workout plan for women',
    'will lifting weights make women bulky',
    'glute workout plan',
    'women gym workout tracker',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Will lifting weights make women bulky?',
    a: 'Not by accident. Muscle grows slowly, over months and years, and getting very big takes years of training and eating for that goal. Most women who lift find they look firmer and feel stronger. You stay in control of how far you take it.',
  },
  {
    q: 'How many days a week should a beginner woman do strength training?',
    a: 'Two or three days a week is a good start, with a rest day between sessions. The 3-day plan on this page (lower body and glutes, upper body, full body) covers every major muscle.',
  },
  {
    q: 'How heavy should I lift as a beginner?',
    a: 'Pick a weight you can lift for the planned reps with good form, where the last one or two reps feel hard. If you can easily do more, go a little heavier next time. If your form breaks, go lighter.',
  },
  {
    q: 'What is the best glute workout plan for beginners?',
    a: 'Train glutes two or three times a week with a mix of hip thrusts or glute bridges, a squat or leg press, a hinge like the Romanian deadlift, and lunges. Add a little weight or a rep each week and write it down.',
  },
  {
    q: 'Should I train during my period?',
    a: 'Many women do, and it is fine to adjust. Some days you may want lighter weights or fewer sets. Listen to your body, and talk to a doctor if you have heavy pain or other concerns.',
  },
  {
    q: 'Is RepUp a workout app for women?',
    a: 'RepUp is a free gym workout tracker for anyone. Log every set in kg, see what you lifted last time and get a target for today. It has progress charts and a body-weight log, and no ads.',
  },
];

const MYTHS = [
  {
    myth: 'Lifting weights makes women bulky.',
    fact: 'Muscle grows slowly, on purpose.',
    body: 'Even people who train hard and eat for size gain muscle over months and years. Looking very muscular takes a plan built for that goal. What most beginners notice first is that they feel stronger and daily tasks get easier.',
  },
  {
    myth: 'Women need a completely different plan.',
    fact: 'The same basic moves work for everyone.',
    body: 'Squats, hinges, presses and rows build strength for any body. What changes is the weight you start with and how fast you add more.',
  },
  {
    myth: 'Feeling “puffy” means you are getting big.',
    fact: 'That is short-term, and it settles.',
    body: 'Worked muscles hold a little extra water for a day or two. Your shape changes gradually, and you stay in control: keep things the same, or add a little weight over time.',
  },
];

const BENEFITS = [
  ['Everyday strength', 'Carrying shopping, lifting a child, climbing stairs. Strong legs, back and arms make daily life easier.'],
  ['Bone health', 'Weight-bearing exercise is widely recommended for keeping bones strong, which matters more as we get older.'],
  ['Confidence', 'Watching your numbers go up week after week is a quiet, real kind of confidence. You know you did that.'],
];

const PROGRESS = [
  ['Work inside a rep range', 'Pick one weight for an exercise, for example hip thrust 3 × 10–12. Aim for at least 10 good reps on every set.'],
  ['Reach the top on every set', 'When you hit 12 on all sets with good form, you have earned a heavier weight.'],
  ['Add the smallest jump', '1–2 kg on dumbbells, or 2.5 kg on a barbell. Your reps will drop a little. Build them back up, then repeat.'],
];

function Label({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-[0.2em] text-[#e11d48] uppercase">{children}</p>;
}

function Head({ label, title, children }: { label: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-t border-[#0a0a0a] pt-4">
      <Label>{label}</Label>
      <h2 className="mt-3 max-w-3xl text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">{title}</h2>
      {children && <div className="mt-4 max-w-2xl text-lg leading-relaxed text-[#525252]">{children}</div>}
    </div>
  );
}

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free gym workout tracker for strength training: plan your week, log sets, reps and kg, see last time and beat it.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Strength training for women'),
      ]}
    >
      {/* Hero: editorial cover */}
      <section className="relative overflow-hidden bg-[#fff1f2]">
        <SiteNav
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        />
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-6 md:pb-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#0a0a0a] pb-2 text-xs font-semibold tracking-[0.2em] text-[#0a0a0a] uppercase">
            <span>Beginner guide · Strength</span>
            <span className="text-[#e11d48]">RepUp Guides</span>
          </div>
          <div className="grid gap-10 pt-8 md:grid-cols-[2fr_1fr] md:pt-12 [&>*]:min-w-0">
            <h1 className="text-5xl leading-[0.95] font-semibold tracking-tighter text-balance text-[#0a0a0a] sm:text-7xl lg:text-[6.5rem]">
              Strength training for women: lift with a plan, <em className="font-semibold text-[#e11d48]">not a guess.</em>
            </h1>
            <div className="hidden justify-end md:flex">
              <PhoneMock screen="progress" theme="light" className="origin-top-right translate-x-4 scale-[0.82] rotate-6" />
            </div>
          </div>
          <div className="mt-10 grid gap-8 border-t border-[#0a0a0a]/30 pt-6 md:mt-0 md:grid-cols-2 md:gap-12">
            <div>
              <p className="text-lg leading-relaxed text-[#262626]">
                A plain-English guide for beginners. What lifting really does, a 3-day gym plan with sets and reps, and how to get
                a little stronger every week.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={SIGNUP_HREF}
                  className="rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
                >
                  Track your lifts free
                </Link>
                <a href="#plan" className="px-2 py-3 font-semibold text-[#0a0a0a] underline decoration-[#e11d48] decoration-2 underline-offset-4">
                  See the 3-day plan ↓
                </a>
              </div>
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-[#e11d48] uppercase">The short answer</h2>
              <p className="mt-2 text-lg leading-relaxed text-[#262626]">
                Strength training for women means lifting weights with good form, a few sets at a time, and slowly adding weight.
                Two or three sessions a week is enough to start. It builds strength and supports bone health, and it will not make
                you bulky by accident: muscle grows slowly.
              </p>
            </div>
          </div>
          <div className="mt-10 flex justify-center md:hidden">
            <PhoneMock screen="progress" theme="light" className="rotate-3" />
          </div>
        </div>
      </section>

      {/* Myth vs fact */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Head label="Myth vs fact" title="Will lifting weights make women bulky?">
          No, not by accident. Here are the three worries we hear most, and what actually happens.
        </Head>
        <ol className="mt-10">
          {MYTHS.map((m) => (
            <li key={m.myth} className="grid gap-4 border-b border-[#e5e5e5] py-8 md:grid-cols-2 md:gap-12">
              <div>
                <p className="text-2xl font-bold text-[#e11d48]">✗ Myth</p>
                <h3 className="mt-2 text-2xl leading-snug font-semibold text-[#737373] line-through decoration-[#e11d48]/50 decoration-2">
                  {m.myth}
                </h3>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#059669]">✓ Fact</p>
                <h3 className="mt-2 text-2xl leading-snug font-semibold">{m.fact}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-[#525252]">{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Benefits */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
        <Head label="Why lift" title="What are the benefits of weight training for women?" />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {BENEFITS.map(([t, d], i) => (
            <div key={t}>
              <p className="text-6xl font-semibold tracking-tighter text-[#e11d48] tabular-nums">0{i + 1}</p>
              <h3 className="mt-3 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-[#525252]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan */}
      <section id="plan" className="scroll-mt-8 bg-[#fff1f2]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <Head label="The plan" title="A 3-day gym workout plan for women beginners">
            Train on three days with a rest day between, for example Monday, Wednesday and Friday. Rest a minute or two between
            sets. Start light enough to learn each move well. For more basics, see our{' '}
            <A href="/beginner-gym-workout-plan">beginner gym plan</A>.
          </Head>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <PlanCard
              title="Day A · Lower body & glutes"
              subtitle="Monday"
              featured
              rows={[
                ['Goblet squat', '3 × 10'],
                ['Romanian deadlift (dumbbells)', '3 × 10'],
                ['Hip thrust', '3 × 10–12'],
                ['Walking lunge', '2 × 10 each leg'],
                ['Plank', '3 × 30 sec'],
              ]}
            />
            <PlanCard
              title="Day B · Upper body"
              subtitle="Wednesday"
              rows={[
                ['Dumbbell bench press', '3 × 8–12'],
                ['Lat pulldown', '3 × 10–12'],
                ['Seated cable row', '3 × 10–12'],
                ['Dumbbell shoulder press', '3 × 10'],
                ['Face pull', '2 × 12–15'],
              ]}
            />
            <PlanCard
              title="Day C · Full body"
              subtitle="Friday"
              rows={[
                ['Leg press', '3 × 10–12'],
                ['Glute bridge', '3 × 12–15'],
                ['Incline push-up', '3 × 8–12'],
                ['One-arm dumbbell row', '3 × 10 each'],
                ['Dead bug', '3 × 8 each side'],
              ]}
            />
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="border-l-4 border-[#e11d48] pl-5">
              <h3 className="text-xl font-semibold">Want a glute workout plan?</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-[#404040]">
                This plan already trains glutes on two days. For more focus, add 2 sets of hip thrusts on Day C. Glutes follow the
                same rule as every muscle: a bit more each week.
              </p>
            </div>
            <div className="border-l-4 border-[#e11d48] pl-5">
              <h3 className="text-xl font-semibold">Reading “3 × 10”</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-[#404040]">
                Three sets of ten reps. For 10–12, keep one weight until you hit 12 on every set with good form, then go heavier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pull statement: full-width rose band */}
      <section className="bg-[#e11d48] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="max-w-5xl text-4xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-6xl md:text-7xl">
            Muscle is built slowly, on purpose. <span className="text-[#ffe4e6]">The weights you write down are the weights you beat.</span>
          </p>
        </div>
      </section>

      {/* Progression */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Head label="Getting stronger" title="How do you progress in strength training?">
          The method is called <A href="/progressive-overload-tracker">progressive overload</A>: each session, try to do a little
          more than last time. Small steps add up.
        </Head>
        <ol className="mt-10 flex flex-col">
          {PROGRESS.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-[#e5e5e5] py-6 sm:grid-cols-[5rem_1fr_1.4fr] sm:items-baseline">
              <span className="text-4xl font-semibold tracking-tighter text-[#e11d48] tabular-nums">{i + 1}</span>
              <h3 className="text-xl font-semibold">{t}</h3>
              <p className="col-start-2 text-[17px] leading-relaxed text-[#525252] sm:col-start-3">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
          The catch is memory. Nobody remembers last Monday’s hip thrust numbers, so write every set down.
        </p>
      </section>

      <Split reverse kicker="Your notebook, upgraded" title="How RepUp helps you track strength training" mock={<PhoneMock screen="log" />}>
        <ul className="flex flex-col gap-3 text-[17px] leading-relaxed text-[#404040]">
          {[
            'Put this 3-day plan into your week, with sets × reps for each exercise.',
            'Log each set in kg and reps, then tick it done.',
            'See what you lifted last time, with a target for today.',
            'Follow a progress chart for every exercise, and log your body weight.',
            'Works offline, on Android, iPhone and laptop.',
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="font-bold text-[#e11d48]">→</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[17px] leading-relaxed text-[#404040]">
          Free, no ads. Lifting to lose fat too? Read the <A href="/weight-loss-workout-tracker">weight loss workout tracker</A>{' '}
          guide.
        </p>
      </Split>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <Label>Through the month</Label>
        <h2 className="mt-3 mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">Training through your cycle</h2>
        <Callout tone="note" title="Listen to your body">
          Energy can change across the month. Some weeks your lifts feel easy; some weeks the same weight feels heavy. Both are
          normal. On low days, drop a set or go lighter, and still log it. If you have strong pain or any health concern, speak to
          a doctor.
        </Callout>
      </section>

      <FaqSection faqs={FAQS} title="Questions, answered" />

      <CtaBand title="Stronger than last week. Every week." body="Free. Set up your 3-day plan in a few minutes and log today’s workout." />
    </LandingShell>
  );
}
