import Link from 'next/link';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, Callout, CtaBand, DataTable, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/cardio-vs-weights-for-fat-loss". Layout: "versus". Dark indigo hero with a
 * red glow on the left and a blue glow on the right; two columns of strengths
 * face each other with a round VS badge in the middle (stacked on mobile).
 * Then a red/blue comparison table, a colour-coded sample week and a two-phone
 * "how RepUp tracks both" band. Accents: red #ef4444 (cardio, small text
 * #b91c1c) and blue #3b82f6 (weights, small text #1d4ed8).
 * Main keywords: cardio vs weights for fat loss, is cardio or weight training
 * better for weight loss, cardio or weights first, best exercise for fat loss.
 */

const PATH = '/cardio-vs-weights-for-fat-loss';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Cardio vs Weights for Fat Loss: Which Is Better? | RepUp',
  description:
    'Cardio vs weights for fat loss, answered honestly: what each one does, which to do first, a sample week that mixes both, and a free app to track lifts and runs.',
  keywords: [
    'cardio vs weights for fat loss',
    'is cardio or weight training better for weight loss',
    'cardio or weights first',
    'best exercise for fat loss',
    'cardio and weights workout plan',
    'track cardio and weights',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Is cardio or weight training better for weight loss?',
    a: 'Neither wins alone. Cardio usually burns more calories during the session, and weights help you keep muscle while you eat less, so more of the weight you lose is fat. Food decides most of the result. For most people, doing both plus a small calorie deficit works best.',
  },
  {
    q: 'Should I do cardio or weights first?',
    a: 'Do first whatever matters most to you. If you want to get stronger, lift first while you are fresh. If you are training for a run, run first. For general fat loss, either order is fine. If you can, split them into different days or different times of the day.',
  },
  {
    q: 'What is the best exercise for fat loss?',
    a: 'The one you will keep doing every week. Brisk walking, easy running, cycling and lifting all help. A good mix for most people is 2–4 strength sessions, a few cardio sessions and plenty of daily walking.',
  },
  {
    q: 'Can I lose fat with only weights and no cardio?',
    a: 'Yes, if you eat a little less than you burn. Weights alone plus a daily walk can work well. Cardio simply makes the deficit easier and is good for your heart and lungs.',
  },
  {
    q: 'Will cardio make me lose muscle?',
    a: 'A normal amount of cardio will not, as long as you keep lifting, eat enough protein and do not cut calories too hard. Very large amounts of hard cardio on a big deficit can make it harder to keep muscle.',
  },
  {
    q: 'Can RepUp track both cardio and weights?',
    a: 'Yes, with one free account. Workout mode logs sets, reps and kg for your gym days. Running mode tracks runs and walks with GPS distance, time, pace and km splits, and you can add a treadmill session by hand. Switch modes from the account menu.',
  },
];

const CARDIO = ['Burns more calories per session', 'Good for heart and lungs', 'Easy to start: just walk', 'Adds to your daily steps'];
const WEIGHTS = ['Helps keep muscle while you diet', 'Makes you stronger every month', 'Shapes the body as fat comes off', 'Short sessions, big pay-off'];

const WEEK: { day: string; type: 'cardio' | 'weights' | 'rest'; what: string; detail: string }[] = [
  { day: 'Mon', type: 'weights', what: 'Upper body', detail: 'Press, row, pulldown · 45 min' },
  { day: 'Tue', type: 'cardio', what: 'Easy run or brisk walk', detail: '30 min, can talk in full sentences' },
  { day: 'Wed', type: 'weights', what: 'Lower body', detail: 'Squat, RDL, lunge · 45 min' },
  { day: 'Thu', type: 'cardio', what: 'Brisk walk', detail: '40 min, or 4–5 km' },
  { day: 'Fri', type: 'weights', what: 'Full body', detail: 'Lighter, 4–5 exercises · 40 min' },
  { day: 'Sat', type: 'cardio', what: 'Longer easy cardio', detail: '45–60 min run-walk or walk' },
  { day: 'Sun', type: 'rest', what: 'Rest', detail: 'Short easy walk if you like' },
];

const STEPS = [
  { name: 'Sign up free', text: 'Create a free RepUp account with email or Google. One account holds both your workouts and your runs.' },
  { name: 'Plan your weights days', text: 'In Workout mode, add your strength days to the Mon–Sun plan with sets × reps, then log kg and reps for every set.' },
  { name: 'Track your cardio', text: 'Switch to Running mode from the account menu. Start a run or walk with GPS, or add a treadmill session by hand.' },
  { name: 'Check both each week', text: 'See your lifts and body weight in the progress charts, and your weekly km, longest run and best pace in Running mode.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const kicker = 'mb-3 text-sm font-semibold tracking-wide uppercase';

function SideCard({ side }: { side: 'cardio' | 'weights' }) {
  const cardio = side === 'cardio';
  const items = cardio ? CARDIO : WEIGHTS;
  return (
    <div
      className={
        cardio
          ? 'rounded-3xl border border-[#ef4444]/40 bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/5 p-6 sm:p-8'
          : 'rounded-3xl border border-[#3b82f6]/40 bg-gradient-to-bl from-[#3b82f6]/20 to-[#3b82f6]/5 p-6 sm:p-8'
      }
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex size-11 items-center justify-center rounded-2xl text-xl ${cardio ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'}`}
        >
          {cardio ? '🏃' : '🏋️'}
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{cardio ? 'Cardio' : 'Weights'}</h2>
          <p className={`text-sm ${cardio ? 'text-[#fca5a5]' : 'text-[#93c5fd]'}`}>
            {cardio ? 'Running, walking, cycling' : 'Barbells, dumbbells, machines'}
          </p>
        </div>
      </div>
      <ul className="mt-6 flex flex-col gap-3">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-3 text-[16px] leading-snug text-white/90">
            <span
              aria-hidden
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#0b0a1f] ${cardio ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}
            >
              ✓
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CardioVsWeightsPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fafafa]"
      jsonLd={[
        appLd('Free gym workout and running tracker: log weights (sets, reps, kg) and track cardio runs and walks in one account.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Cardio vs weights for fat loss'),
        howToLd('How to track cardio and weights together in RepUp', STEPS),
      ]}
    >
      {/* Hero: versus */}
      <section className="relative overflow-hidden bg-[#0b0a1f] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(45% 55% at 0% 70%, rgba(239,68,68,0.32), transparent 70%), radial-gradient(45% 55% at 100% 70%, rgba(59,130,246,0.34), transparent 70%)',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#a78bfa]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-white text-[#0b0a1f] hover:bg-white/90"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-20 sm:px-6 md:pt-14 md:pb-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80">
              <span className="text-[#fca5a5]">Cardio</span> or <span className="text-[#93c5fd]">weights</span>? The honest answer
            </p>
            <h1 className="mt-6 text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              <span className="text-[#f87171]">Cardio</span> vs <span className="text-[#60a5fa]">weights</span> for fat loss
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
              It is not a fight with one winner. Each does a different job, and your food does the biggest one. Here is what each is
              good at, which to do first, and a week that uses both.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
              >
                Track both free
              </Link>
              <a href="#week" className="rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/5">
                See the sample week
              </a>
            </div>
          </div>

          <div className="mt-14 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6 [&>*]:min-w-0">
            <SideCard side="cardio" />
            <div className="flex justify-center">
              <span
                aria-label="versus"
                className="flex size-20 items-center justify-center rounded-full border-4 border-[#0b0a1f] bg-[linear-gradient(135deg,#ef4444_0%,#ef4444_48%,#3b82f6_52%,#3b82f6_100%)] text-2xl font-black tracking-tight text-white shadow-[0_0_0_2px_rgba(255,255,255,0.15),0_10px_40px_rgba(124,58,237,0.45)] md:size-24 md:text-3xl"
              >
                VS
              </span>
            </div>
            <SideCard side="weights" />
          </div>
          <p className="mt-6 text-center text-sm text-white/60">
            The real winner: <b className="font-semibold text-white">both + a small calorie deficit</b>.
          </p>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e5e5e5] sm:p-10">
          <div aria-hidden className="mb-5 flex h-1.5 w-24 overflow-hidden rounded-full">
            <span className="flex-1 bg-[#ef4444]" />
            <span className="flex-1 bg-[#3b82f6]" />
          </div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-[#404040] uppercase">The short answer</h2>
          <p className="text-xl leading-relaxed text-[#262626] sm:text-2xl">
            For fat loss you don’t have to choose. Eating a little less than you burn is what loses the fat. Weights help you keep
            muscle, so most of the weight you lose is fat. Cardio burns extra calories and helps your heart. Most people do best with
            2–4 strength sessions plus some cardio and daily walks.
          </p>
        </div>
      </section>

      {/* Which is better */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className={h2}>Is cardio or weight training better for weight loss?</h2>
        <div className="mt-5 flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
          <p>
            In one session, <b className="font-semibold text-[#b91c1c]">cardio</b> usually burns more calories than lifting. An
            hour of steady running or brisk walking keeps you moving the whole time, while lifting has rest between sets. So on the
            day, cardio looks like the winner.
          </p>
          <p>
            Over months, <b className="font-semibold text-[#1d4ed8]">weights</b> matter just as much. When you eat less, your body
            can lose muscle along with fat. Lifting tells your body the muscle is still needed. You end up leaner and stronger, not
            just smaller, and many people find that keeps them motivated.
          </p>
          <p>
            Most important of all: you cannot out-train a big plate. Fat loss comes from a small, steady calorie deficit, roughly
            300–500 kcal a day for most people. Exercise makes that deficit easier, but food does most of the work. Our{' '}
            <A href="/weight-loss-workout-tracker">weight loss workout plan</A> covers the food side in simple steps.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={`${kicker} text-[#404040]`}>Side by side</p>
          <h2 className={h2}>Cardio vs weights: what each one does</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            General effects for a healthy adult. Your own results depend on how hard, how long and how often you train, and on what
            you eat.
          </p>
          <div className="mt-10">
            <DataTable
              minWidth={560}
              head={[
                'What matters',
                <span key="c" className="text-[#b91c1c]">
                  🏃 Cardio
                </span>,
                <span key="w" className="text-[#1d4ed8]">
                  🏋️ Weights
                </span>,
              ]}
              rows={[
                ['Calories burned in the session', 'Higher, especially longer sessions', 'Lower, because of rests between sets'],
                ['Keeping muscle while dieting', 'Small help', 'Big help'],
                ['Getting stronger', 'Little', 'Yes, week after week'],
                ['Heart and lung fitness', 'Big help', 'Some help'],
                ['Easy for a beginner to start', 'Very: start with walking', 'Easy with a simple plan'],
                ['Recovery needed', 'Low for easy walks, more for hard runs', 'About a day or two per muscle'],
                ['How to measure progress', 'Distance, time, pace', 'kg and reps per exercise'],
              ]}
              caption="Not medical advice. If you have a heart condition, joint problems or have not exercised in years, check with a doctor first."
            />
          </div>
        </div>
      </section>

      {/* Order */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className={h2}>Cardio or weights first?</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Do first the thing that matters most to you, while you are fresh. Simple rules:
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          <li className="rounded-3xl border-t-4 border-[#3b82f6] bg-white p-6 shadow-sm ring-1 ring-[#e5e5e5]">
            <p className="text-sm font-semibold text-[#1d4ed8]">Goal: strength or shape</p>
            <h3 className="mt-2 text-xl font-semibold">Weights first</h3>
            <p className="mt-2 leading-relaxed text-[#525252]">Lift fresh, then do 10–20 minutes of easy cardio or walk home.</p>
          </li>
          <li className="rounded-3xl border-t-4 border-[#ef4444] bg-white p-6 shadow-sm ring-1 ring-[#e5e5e5]">
            <p className="text-sm font-semibold text-[#b91c1c]">Goal: a 5K or 10K</p>
            <h3 className="mt-2 text-xl font-semibold">Run first</h3>
            <p className="mt-2 leading-relaxed text-[#525252]">Do the run when your legs are fresh, then a short strength session.</p>
          </li>
          <li className="rounded-3xl border-t-4 border-[#7c3aed] bg-white p-6 shadow-sm ring-1 ring-[#e5e5e5]">
            <p className="text-sm font-semibold text-[#6d28d9]">Goal: general fat loss</p>
            <h3 className="mt-2 text-xl font-semibold">Either is fine</h3>
            <p className="mt-2 leading-relaxed text-[#525252]">Better still, put them on different days or at different times.</p>
          </li>
        </ul>
        <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
          Heavy legs after squats? Keep that run short and easy. Our guide to{' '}
          <A href="/run-after-leg-day">running after leg day</A> explains when to go and when to wait.
        </p>
      </section>

      {/* Best exercise */}
      <section className="bg-[#0b0a1f] text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <h2 className={h2}>So what is the best exercise for fat loss?</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-white/75">
              The one you will still be doing in three months. A plan you enjoy beats a perfect plan you quit. For most people that
              means some lifting, some cardio and a lot of everyday walking. Walking is easy to recover from, needs nothing but shoes,
              and adds up fast over a week.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-white/75">
              If you like running, our{' '}
              <Link href="/running-for-weight-loss" className="font-medium text-[#c4b5fd] underline decoration-[#c4b5fd]/50 underline-offset-4 hover:text-white">
                running for weight loss
              </Link>{' '}
              guide shows how to build up
              without getting hurt.
            </p>
          </div>
          <ul className="flex flex-col gap-3 self-center">
            {[
              ['Lift', '2–4 days a week, full body or upper/lower', '#3b82f6'],
              ['Cardio', '2–3 sessions, mostly easy', '#ef4444'],
              ['Walk', 'Every day you can', '#a78bfa'],
              ['Eat', 'A little less, with enough protein', '#34d399'],
            ].map(([t, d, c]) => (
              <li key={t} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: c }} />
                <span>
                  <b className="font-semibold">{t}:</b> <span className="text-white/75">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sample week */}
      <section id="week" className="scroll-mt-8 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={`${kicker} text-[#404040]`}>Sample week</p>
        <h2 className={h2}>A fat loss week with cardio and weights</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Three strength days, three cardio days, one rest day. Hard days are kept apart. A guide, not a rule: move days around to fit
          your life.
        </p>
        <ul aria-hidden className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#525252]">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#3b82f6]" /> Weights
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#ef4444]" /> Cardio
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#d4d4d4]" /> Rest
          </li>
        </ul>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {WEEK.map((d) => (
            <li
              key={d.day}
              className={`flex gap-4 rounded-2xl border bg-white p-4 lg:flex-col lg:gap-3 ${
                d.type === 'weights' ? 'border-[#3b82f6]/40' : d.type === 'cardio' ? 'border-[#ef4444]/40' : 'border-[#e5e5e5]'
              }`}
            >
              <span
                className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold lg:w-full ${
                  d.type === 'weights'
                    ? 'bg-[#3b82f6] text-white'
                    : d.type === 'cardio'
                      ? 'bg-[#ef4444] text-white'
                      : 'bg-[#f5f5f5] text-[#404040]'
                }`}
              >
                {d.day}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-semibold">{d.what}</span>
                <span className="text-sm leading-snug text-[#525252]">{d.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
          Want more ways to fit both in? See the <A href="/running-and-lifting-schedule">running and lifting schedule</A> for 3, 4 and
          5 day options.
        </p>
      </section>

      {/* How RepUp tracks both */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.1fr] md:py-20 [&>*]:min-w-0">
          <div className="flex justify-center">
            <PhoneMock screen="log" theme="light" className="z-10 mx-0 -rotate-3" />
            <PhoneMock screen="run-summary" className="mx-0 mt-16 -ml-40 hidden xl:-ml-20 rotate-3 lg:block" />
          </div>
          <div>
            <p className={`${kicker} text-[#6d28d9]`}>In RepUp</p>
            <h2 className={h2}>One free app to track cardio and weights</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#404040]">
              One account, two modes. Switch between <b className="font-semibold text-[#1d4ed8]">Workout mode</b> and{' '}
              <b className="font-semibold text-[#b91c1c]">Running mode</b> from the account menu.
            </p>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f3ff] font-semibold text-[#6d28d9]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-[#525252]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Callout title="Good to know" tone="note">
                Run tracking happens in the browser, so keep the screen on and RepUp open (phone in hand or an armband). RepUp does not
                read heart rate and has no smartwatch app. Steps and calories are estimates, shown with ~.
              </Callout>
            </div>
            <Link
              href={SIGNUP_HREF}
              className="mt-8 inline-block rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white hover:bg-[#6d28d9]"
            >
              Start tracking free
            </Link>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Cardio vs weights: questions" />

      <CtaBand
        title="Lift, run, walk. Log all of it in one place."
        body="Free, no ads. Weights in Workout mode, runs and walks in Running mode."
        cta="Track cardio and weights free"
      />
    </LandingShell>
  );
}
