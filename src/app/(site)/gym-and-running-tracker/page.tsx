import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /gym-and-running-tracker. Archetype "two halves": a split hero, dark violet
 * (Workout mode) on the left, dark green (Running mode) on the right, with a
 * round "one app" badge on the seam. Accents: violet #7c3aed (gym) and
 * emerald #10b981 (running), used side by side through the page.
 * Main keywords: gym and running tracker app, workout and run tracker,
 * fitness app for gym and running, all in one fitness tracker.
 */

const PATH = '/gym-and-running-tracker';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Gym and Running Tracker App: Lifts and Runs in One | RepUp',
  description:
    'RepUp is a free gym and running tracker app. Log sets, reps and kg in Workout mode, track runs with GPS in Running mode. One account, same data, no ads.',
  keywords: [
    'gym and running tracker app',
    'workout and run tracker',
    'fitness app for gym and running',
    'all in one fitness tracker',
    'gym tracker with running',
    'free fitness tracker app India',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Is there one app for both gym workouts and running?',
    a: 'Yes. RepUp has a Workout mode for the gym (sets, reps and kg) and a Running mode for runs and walks (GPS distance, time, pace and km splits). You use one account and switch modes from the account menu.',
  },
  {
    q: 'How do I switch between Workout mode and Running mode?',
    a: 'Open the account menu and tap Running mode or Workout mode. Your gym plan, workout history and runs all stay in the same account, so nothing is lost when you switch.',
  },
  {
    q: 'Is RepUp free?',
    a: 'Yes. Both modes are free to use and there are no ads. You log in with email or Google so your data is saved to your account.',
  },
  {
    q: 'Can I track a run with the phone in my pocket?',
    a: 'Not reliably. RepUp is a web app, so run tracking needs the screen on and RepUp open, with the phone in your hand or an armband. If the screen turns off or you open another app, GPS pauses and the gap is joined with a straight line. A lock button stops sweaty touches from doing anything.',
  },
  {
    q: 'Does RepUp show heart rate or connect to a smartwatch?',
    a: 'No. There is no heart rate, no Apple Watch or Wear OS app and no sync with other apps. RepUp tracks runs with your phone GPS and gym sets that you type in.',
  },
  {
    q: 'Can I log a treadmill run?',
    a: 'Yes. In Running mode you can add a run or walk by hand, with distance and time. That works for treadmill runs or runs you did without the phone.',
  },
];

const STEPS = [
  { name: 'Create a free account', text: 'Sign up with email or Google. The same account works on your phone and laptop.' },
  { name: 'Plan your gym week', text: 'In Workout mode, add exercises to each day (Mon–Sun) with sets × reps, then log kg and reps as you lift.' },
  { name: 'Switch to Running mode', text: 'Open the account menu and tap Running mode. Choose Run or Walk and press Start run.' },
  { name: 'Switch back any time', text: 'Tap Workout mode in the same menu. Workouts and runs stay in one account.' },
];

const GYM = [
  'Weekly plan by day with sets × reps',
  'Log every set in kg (or lb) and reps',
  'Last time’s numbers and today’s target',
  'Progress charts and weekly sets per muscle',
  'Body-weight log and plate calculator',
  'Works offline at the gym',
];

const RUN = [
  'GPS distance, moving time, average pace',
  'Splits for every km, route map after',
  'Voice and vibration at every km (can be turned off)',
  'Pause, resume and a lock button',
  'Weekly km, longest run, best pace',
  'Add a treadmill run by hand',
];

const WHO = [
  {
    tag: 'Gym first',
    t: 'You lift and want to add a few runs',
    d: (
      <>
        Keep your split as it is and add two easy runs. Our <A href="/running-and-lifting-schedule">running and lifting schedule</A>{' '}
        shows where they fit.
      </>
    ),
  },
  {
    tag: 'Run first',
    t: 'You run and want to get stronger',
    d: (
      <>
        Two short gym sessions a week are enough to start. Leg and core work matters most.
      </>
    ),
  },
  {
    tag: 'Both',
    t: 'You train for both, like a hybrid athlete',
    d: (
      <>
        Lift heavy two or three times, run mostly easy. Follow the <A href="/hybrid-training-plan">hybrid training plan</A>.
      </>
    ),
  },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

export default function GymAndRunningTrackerPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd(
          'Free gym and running tracker: log sets, reps and kg in Workout mode, track runs and walks with GPS in Running mode, one account on phone and laptop.',
        ),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Gym and running tracker app'),
        howToLd('How to track gym workouts and runs in one app', STEPS),
      ]}
    >
      {/* Hero: two halves */}
      <section className="relative overflow-hidden bg-[#0b0a1f] text-white md:bg-[linear-gradient(90deg,#1e0f45_50%,#032b1f_50%)]">
        <SiteNav
          upClass="text-[#a78bfa]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-white text-[#0b0a1f] hover:bg-white/90"
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 pt-8 pb-12 text-center sm:px-6 md:pt-12">
          <p className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/85">
            <span className="text-[#c4b5fd]">Workout mode</span> + <span className="text-[#6ee7b7]">Running mode</span> · free
          </p>
          <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            The gym and running tracker app that keeps <span className="text-[#c4b5fd]">lifts</span> and{' '}
            <span className="text-[#6ee7b7]">runs</span> together
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/75">
            Log sets, reps and kg at the gym. Track runs and walks with GPS on the road. One free account, two modes, the same
            data on your phone and laptop.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
            >
              Start tracking free
            </Link>
            <a href="#modes" className="rounded-xl border border-white/25 px-6 py-3.5 text-base font-semibold hover:bg-white/5">
              See both modes
            </a>
          </div>
        </div>

        <div className="relative grid md:grid-cols-2">
          <div className="flex flex-col items-center gap-6 bg-[#1e0f45] px-4 pt-10 pb-14 md:bg-transparent md:pb-20">
            <p className="text-sm font-semibold tracking-wide text-[#c4b5fd] uppercase">Workout mode · gym</p>
            <PhoneMock screen="log" className="-rotate-2" />
          </div>
          <div className="relative flex flex-col items-center gap-6 bg-[#032b1f] px-4 pt-20 pb-14 md:bg-transparent md:pt-10 md:pb-20">
            <p className="text-sm font-semibold tracking-wide text-[#6ee7b7] uppercase">Running mode · road</p>
            <PhoneMock screen="run-live" className="rotate-2" />
            <div className="absolute top-0 left-1/2 z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center text-[#0b0a1f] shadow-2xl shadow-black/50 ring-4 ring-[#0b0a1f] md:size-28">
              <span className="text-xs font-medium text-[#525252]">RepUp</span>
              <span className="text-lg leading-tight font-bold md:text-xl">one app</span>
              <span aria-hidden className="mt-1 flex gap-1">
                <span className="size-2 rounded-full bg-[#7c3aed]" />
                <span className="size-2 rounded-full bg-[#10b981]" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8">
          <div aria-hidden className="mb-4 flex h-1.5 w-20 overflow-hidden rounded-full">
            <span className="flex-1 bg-[#7c3aed]" />
            <span className="flex-1 bg-[#10b981]" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide text-[#6d28d9] uppercase">Short answer: one app for gym and running?</h2>
          <p className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">
            Yes. RepUp is a free gym and running tracker in one app. In Workout mode you plan your week and log every set as kg ×
            reps. In Running mode you track runs and walks with GPS: distance, time, pace and km splits. One account, switch modes
            from the account menu.
          </p>
        </div>
      </section>

      {/* Mode switching */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#6d28d9] uppercase">How it works</p>
          <h2 className={h2}>How switching between gym and running works</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            You do not need two apps, two logins or two places to look. The switch lives in the account menu, and it takes one tap.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const run = i === 2;
              return (
                <li
                  key={s.name}
                  className={`flex flex-col gap-3 rounded-2xl border-2 p-6 ${run ? 'border-[#10b981] bg-[#ecfdf5]' : 'border-[#ede9fe] bg-[#faf8ff]'}`}
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-sm font-bold text-white ${run ? 'bg-[#047857]' : 'bg-[#7c3aed]'}`}
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="leading-relaxed text-[#525252]">{s.text}</p>
                </li>
              );
            })}
          </ol>
          {/* The account menu, drawn */}
          <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-[#0b0a1f] p-6 text-white sm:flex-row sm:items-center sm:gap-8">
            <p className="text-sm font-semibold tracking-wide text-white/60 uppercase">Account menu</p>
            <div className="flex w-full max-w-sm overflow-hidden rounded-xl border border-white/15 text-sm font-semibold">
              <span className="flex-1 bg-[#7c3aed] px-4 py-3 text-center">🏋️ Workout mode</span>
              <span className="flex-1 bg-[#065f46] px-4 py-3 text-center">🏃 Running mode</span>
            </div>
            <p className="text-sm text-white/70">Tap one. Your data stays the same.</p>
          </div>
        </div>
      </section>

      {/* What each mode tracks */}
      <section id="modes" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-16 sm:px-6 md:py-20">
        <h2 className={h2}>What a workout and run tracker should track</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Gym and running progress look different, so each mode shows what matters for it. Here is everything each side does.
        </p>
        <div className="mt-10 grid overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white md:grid-cols-2">
          <div>
            <div className="bg-[#7c3aed] px-6 py-5 text-white">
              <p className="text-sm font-medium text-white/80">For the gym</p>
              <h3 className="text-2xl font-bold">Workout mode</h3>
            </div>
            <ul className="divide-y divide-[#f0f0f0]">
              {GYM.map((g) => (
                <li key={g} className="flex gap-3 px-6 py-4 text-[16px] text-[#262626]">
                  <span aria-hidden className="font-bold text-[#6d28d9]">
                    ✓
                  </span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-[#e5e5e5] md:border-t-0 md:border-l">
            <div className="bg-[#10b981] px-6 py-5 text-[#022c22]">
              <p className="text-sm font-medium text-[#022c22]/80">For the road or treadmill</p>
              <h3 className="text-2xl font-bold">Running mode</h3>
            </div>
            <ul className="divide-y divide-[#f0f0f0]">
              {RUN.map((g) => (
                <li key={g} className="flex gap-3 px-6 py-4 text-[16px] text-[#262626]">
                  <span aria-hidden className="font-bold text-[#047857]">
                    ✓
                  </span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 grid max-w-3xl gap-4 text-[17px] leading-relaxed text-[#404040]">
          <p>
            In Workout mode, the main idea is simple: see what you lifted last time, then beat it by a rep or a little weight. That
            is <A href="/progressive-overload-tracker">progressive overload</A>, and RepUp suggests today’s target for you.
          </p>
          <p>
            In Running mode, you get a clear record of every run: how far, how long, how fast, and a split for each km. Steps and
            calories are shown with a ~ because they are estimates. Want just the running side? Read about the{' '}
            <A href="/running-tracker-app">RepUp running tracker app</A>.
          </p>
        </div>
      </section>

      {/* One account */}
      <section className="bg-[#0b0a1f] text-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
          <PhoneMock screen="run-week" />
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#6ee7b7] uppercase">One account</p>
            <h2 className={h2}>An all in one fitness tracker, with the same data everywhere</h2>
            <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-white/75">
              <p>
                Log a leg day on your phone, check your weekly km on the laptop at night. Both modes save to the same account, so
                your workouts and your runs always sit together.
              </p>
              <p>
                At the gym, Workout mode keeps working even when the network drops, and saves to your account when you are back
                online. On a run, Running mode shows the week at a glance: tap a day to see its runs, or look at history by month.
              </p>
              <p>
                Install RepUp on your Android or iPhone home screen like an app. It has light and dark mode, it is free, and there
                are no ads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it suits */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className={h2}>A fitness app for gym and running, whichever comes first</h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {WHO.map((w, i) => (
            <li key={w.t} className="flex flex-col gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-6">
              <span
                className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  i === 0 ? 'bg-[#ede9fe] text-[#6d28d9]' : i === 1 ? 'bg-[#d1fae5] text-[#047857]' : 'bg-[#0b0a1f] text-white'
                }`}
              >
                {w.tag}
              </span>
              <h3 className="text-lg font-semibold">{w.t}</h3>
              <p className="text-[15px] leading-relaxed text-[#525252]">{w.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Honest limits */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
        <aside className="rounded-2xl border border-[#e5e5e5] border-l-4 border-l-[#10b981] bg-white p-6 text-[15px] leading-relaxed text-[#404040]">
          <h2 className="mb-2 text-lg font-semibold text-[#0a0a0a]">Good to know before your first run</h2>
          <p>
            RepUp is a web app, so run tracking needs the screen on and RepUp open: phone in hand or in an armband. If the screen
            turns off or you switch apps, GPS pauses and the gap is joined with a straight line. There is no heart rate, no live
            notification, no smartwatch app and no sync with other apps. Training plans on this website are guides; you set up
            your own week in the app.
          </p>
        </aside>
      </section>

      <FaqSection faqs={FAQS} title="Gym and running tracker questions" />

      <CtaBand
        title="Lift on Monday. Run on Tuesday. One app."
        body="Free, no ads. Sign up with email or Google and switch modes from the account menu."
        cta="Start tracking free"
      />
    </LandingShell>
  );
}
