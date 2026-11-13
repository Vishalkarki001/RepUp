import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /running-tracker-app. Archetype "HUD": dark full-bleed hero, the live run
 * screen in the middle with four stat chips around it (stacked under it on
 * phones). Accent: electric lime #84cc16 (#3f6212 for small text on light).
 * Main keywords: running tracker app free, GPS run tracker, run tracker app
 * India, km tracker app, running app no ads.
 */

const PATH = '/running-tracker-app';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Running Tracker App Free: GPS Km, Pace & Splits | RepUp',
  description:
    'RepUp is a free running tracker app with no ads: GPS km, moving time, pace, a voice update every km, splits and a route map. Works on Android and iPhone.',
  keywords: [
    'running tracker app free',
    'GPS run tracker',
    'run tracker app India',
    'km tracker app',
    'running app no ads',
    'free running app',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Is RepUp a free running tracker app?',
    a: 'Yes. RepUp is free to use and has no ads. You sign up with an email address or a Google account so your runs are saved, and the same account also holds your gym workouts.',
  },
  {
    q: 'Does RepUp track my run with the screen off?',
    a: 'No. RepUp is a web app, so the phone pauses GPS when the screen turns off or you switch to another app. Keep the screen on and RepUp open, with the phone in your hand or an armband. If there is a gap, RepUp joins it with a straight line.',
  },
  {
    q: 'How does RepUp measure distance?',
    a: 'It uses your phone’s GPS and smooths the readings, so standing still at a signal or a noisy GPS signal does not add fake distance. GPS works best with open sky; tall buildings and trees can make any phone less accurate.',
  },
  {
    q: 'Will it tell me my pace while I run?',
    a: 'Yes. The run screen shows your average pace, and at every kilometre RepUp speaks and vibrates, for example “2 kilometres, last kilometre 6 minutes 5 seconds”. You can turn the voice and vibration off.',
  },
  {
    q: 'Can I add a treadmill run?',
    a: 'Yes. Add a run or walk by hand with the distance and time from the treadmill. It counts in your week view and progress like any other run.',
  },
  {
    q: 'Does it work with a smartwatch, heart rate or Strava?',
    a: 'No. RepUp has no heart rate, no Apple Watch or Wear OS app and no Strava or Google Fit sync. It tracks runs with your phone’s GPS and keeps them in your RepUp account.',
  },
];

const STEPS = [
  { name: 'Switch to Running mode', text: 'Open the account menu and choose Running mode. Your gym workouts stay in Workout mode, on the same account.' },
  { name: 'Pick Run or Walk, then Start', text: 'Choose Run or Walk and tap Start run. RepUp notes the temperature and starts the GPS.' },
  { name: 'Keep the screen on', text: 'Hold the phone or use an armband with RepUp open. Tap the lock button so pocket or sweaty touches do nothing.' },
  { name: 'Listen at every km', text: 'Each kilometre you hear your distance and the time for that kilometre. Pause and resume any time.' },
  { name: 'Finish and look back', text: 'Tap Finish to see distance, moving time, average pace, km splits, steps, calories and your route on a map.' },
];

const CHIPS = [
  { stat: '3.42 km', title: 'GPS distance', body: 'Smoothed, so standing still at a signal does not add fake km.' },
  { stat: '7′11″ /km', title: 'Pace + voice every km', body: '“2 kilometres, last kilometre 6 minutes 5 seconds.” It vibrates too; you can turn it off.' },
  { stat: 'Km 1 · 2 · 3', title: 'Splits and route map', body: 'After the run: the time for every km and your route on a map.' },
  { stat: 'Lock', title: 'Lock button', body: 'Pocket or sweaty touches do nothing until you unlock.' },
];

const DURING = [
  ['GPS distance', 'in km, with smoothing against GPS jumps'],
  ['Moving time', 'the clock stops when you pause'],
  ['Average pace', 'minutes per km for the whole run'],
  ['Voice + vibration', 'at every km, can be turned off'],
  ['Weather', 'the temperature when you start'],
  ['Pause, resume, lock', 'big buttons, safe in a sweaty hand'],
];

const AFTER = [
  ['Splits', 'your time for every single km'],
  ['Route map', 'drawn on OpenStreetMap'],
  ['Steps', 'from the motion sensor, or estimated (~)'],
  ['Calories', 'an estimate (~) from distance and body weight'],
  ['Week view', 'tap a day to see its runs'],
  ['Progress', 'weekly km, longest run, best pace, pace chart'],
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

function Chip({ c, side }: { c: (typeof CHIPS)[number]; side: 'left' | 'right' }) {
  return (
    <li className="relative rounded-2xl border border-[#84cc16]/30 bg-white/[0.04] p-5 text-left backdrop-blur-sm">
      <span
        aria-hidden
        className={`absolute top-1/2 hidden h-px w-10 bg-[#84cc16]/60 lg:block ${side === 'left' ? '-right-10' : '-left-10'}`}
      >
        <span className={`absolute -top-[3px] size-[7px] rounded-full bg-[#84cc16] ${side === 'left' ? 'right-0' : 'left-0'}`} />
      </span>
      <p className="font-mono text-2xl font-semibold tracking-tight text-[#a3e635] tabular-nums">{c.stat}</p>
      <h3 className="mt-1 font-semibold text-white">{c.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/65">{c.body}</p>
    </li>
  );
}

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fafaf7]"
      jsonLd={[
        appLd('Free running tracker app with no ads: GPS km, moving time, pace, voice every km, splits and route map. Also a gym workout log.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Running tracker app'),
        howToLd('How to track a run with RepUp', STEPS),
      ]}
    >
      {/* Hero: HUD */}
      <section className="relative overflow-hidden bg-[#0b0a1f] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(45% 40% at 50% 62%, rgba(132,204,22,0.22), transparent 70%), radial-gradient(40% 40% at 90% 0%, rgba(124,58,237,0.35), transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#a3e635]"
          loginClass="text-white/80 hover:text-white"
          ctaClass="bg-white text-[#0b0a1f] hover:bg-white/90"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-10 pb-14 text-center sm:px-6 md:pt-16">
          <p className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.18em] text-[#a3e635] uppercase">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-[#84cc16]" />
            GPS · km splits · no ads
          </p>
          <h1 className="mt-6 text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            The free <span className="text-[#a3e635]">running tracker app</span> that talks to you every km
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Track runs and walks with your phone’s GPS: km, moving time, pace, splits and a route map. No ads, no subscription,
            and your gym workouts live in the same account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]"
            >
              Start tracking runs free
            </Link>
            <a href="#how" className="rounded-xl border border-[#84cc16]/40 px-6 py-3.5 text-base font-semibold text-[#d9f99d] hover:bg-[#84cc16]/10">
              How it works
            </a>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-4 px-4 pb-20 sm:px-6 md:pb-24 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10 [&>*]:min-w-0">
          <ul className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:gap-20">
            <Chip c={CHIPS[0]} side="left" />
            <Chip c={CHIPS[1]} side="left" />
          </ul>
          <div className="relative order-1 mb-6 flex justify-center lg:order-2 lg:mb-0">
            <span aria-hidden className="absolute top-1/2 left-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#84cc16]/20" />
            <span aria-hidden className="absolute top-1/2 left-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#84cc16]/15" />
            <PhoneMock screen="run-live" className="relative" />
          </div>
          <ul className="order-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-20">
            <Chip c={CHIPS[2]} side="right" />
            <Chip c={CHIPS[3]} side="right" />
          </ul>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <div className="border-l-4 border-[#84cc16] pl-5 sm:pl-7">
          <h2 className="text-sm font-semibold tracking-wide text-[#3f6212] uppercase">What is a good free running tracker app?</h2>
          <p className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">
            RepUp is a free running tracker app with no ads. It uses your phone’s GPS to record km, moving time and average pace,
            speaks your time at every kilometre, and saves splits and a route map. It works on Android and iPhone. Keep the screen
            on and RepUp open while you run.
          </p>
        </div>
      </section>

      {/* What it tracks */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="mb-3 font-mono text-sm font-semibold tracking-wide text-[#3f6212] uppercase">What it tracks</p>
          <h2 className={h2}>A GPS run tracker that shows what matters</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Most runners want three numbers: how far, how long and how fast. RepUp shows those big and clear while you move, then
            gives you the detail when you stop.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { title: 'While you run', rows: DURING },
              { title: 'After you finish', rows: AFTER },
            ].map((b) => (
              <div key={b.title} className="overflow-hidden rounded-3xl border border-[#e5e5e5]">
                <h3 className="flex items-center gap-2 bg-[#0b0a1f] px-6 py-4 text-lg font-semibold text-white">
                  <span aria-hidden className="size-2 rounded-full bg-[#84cc16]" />
                  {b.title}
                </h3>
                <ul className="divide-y divide-[#ededed]">
                  {b.rows.map(([t, d]) => (
                    <li key={t} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-6 py-3.5">
                      <span className="font-semibold text-[#0a0a0a]">{t}</span>
                      <span className="text-[15px] text-[#525252]">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
            Want to know what your pace means for a 5K or 10K? Try the <A href="/running-pace-calculator">running pace calculator</A>.
            Steps and calories carry a ~ because they are estimates, not lab numbers.
          </p>
        </div>
      </section>

      {/* How to use */}
      <section id="how" className="scroll-mt-8 bg-[#0b0a1f] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="mb-3 font-mono text-sm font-semibold tracking-wide text-[#a3e635] uppercase">How to use it</p>
          <h2 className={h2}>Track your first run in five steps</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#84cc16] font-mono text-sm font-bold text-[#0b0a1f]">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="text-[15px] leading-relaxed text-white/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest box */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-24">
        <div className="rounded-3xl border-2 border-[#84cc16] bg-[#f7fee7] p-6 sm:p-10">
          <p className="font-mono text-sm font-semibold tracking-wide text-[#3f6212] uppercase">Honest note</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1a2e05] sm:text-3xl">Keep the screen on and RepUp open</h2>
          <div className="mt-4 flex flex-col gap-4 text-[17px] leading-relaxed text-[#365314]">
            <p>
              RepUp is a web app, not a store app. That keeps it free, light and the same on every phone, but it has one limit:
              phones pause GPS for a web app when the screen turns off or you open another app. If that happens, RepUp joins the
              gap with a straight line, so a winding street can come out a little short.
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Hold the phone, or wear it in an armband with the screen facing out.</li>
              <li>Tap the lock button. The screen stays on, but stray touches do nothing.</li>
              <li>Start with a charged battery. A screen that stays on uses more power.</li>
              <li>Start your music before the run, then come back to RepUp and leave it open.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Run vs walk */}
      <section className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24 [&>*]:min-w-0">
          <div>
            <p className="mb-3 font-mono text-sm font-semibold tracking-wide text-[#3f6212] uppercase">Run vs walk</p>
            <h2 className={h2}>One km tracker app for runs and walks</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#404040]">
              Before you start, pick Run or Walk. Both record the same things: GPS km, moving time, pace, km splits, steps and a
              route map. Your week view and progress charts show the kilometres you covered.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafaf7] p-5">
                <h3 className="text-lg font-semibold">Pick Run when…</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#525252]">
                  you jog or run most of the way, or follow a run/walk plan like the{' '}
                  <A href="/couch-to-5k-plan">couch to 5K plan</A>.
                </p>
              </div>
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafaf7] p-5">
                <h3 className="text-lg font-semibold">Pick Walk when…</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#525252]">
                  you go for a brisk morning walk, an evening walk after dinner, or a walk to cool down.
                </p>
              </div>
            </div>
            <p className="mt-8 text-[17px] leading-relaxed text-[#404040]">
              Running on a treadmill or without your phone? Add the run by hand with distance and time. Also lift? Switch to
              Workout mode and log sets, reps and kg in the same account. See how RepUp works as a{' '}
              <A href="/gym-and-running-tracker">gym and running tracker</A>, or start a simple{' '}
              <A href="/workout-log">workout log</A> for your gym days.
            </p>
          </div>
          <div className="flex justify-center">
            <PhoneMock screen="run-week" theme="light" />
          </div>
        </div>
      </section>

      {/* Made for India */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <p className="mb-3 font-mono text-sm font-semibold tracking-wide text-[#3f6212] uppercase">Run tracker app for India</p>
        <h2 className={h2}>Km, early mornings and no ads</h2>
        <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
          <p>
            RepUp speaks and shows kilometres, not miles. The temperature at the start of each run is saved with it, which helps
            when you look back and wonder why a June run felt so slow.
          </p>
          <p>
            There are no ads between you and your run, and no subscription. You do not need a smartwatch: the phone you already
            carry is enough. Open RepUp in Chrome on Android or Safari on iPhone and add it to your home screen, so it opens like
            any other app.
          </p>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Running tracker questions" />

      <CtaBand
        title="Your next run, tracked km by km."
        body="Free, no ads. GPS km, pace, splits and a route map, in the same account as your gym log."
        cta="Start tracking runs free"
      />
    </LandingShell>
  );
}
