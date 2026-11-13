import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';
import { A, CtaBand, DataTable, FaqSection, LandingShell, Split } from '@/components/site/kit';

/**
 * Offline / no-ads workout tracker page.
 * Look: "minimal with signal bars". Airy white, centred type, an empty
 * signal-bars drawing next to a "Saved on your phone" chip, a cloud → phone →
 * cloud timeline, big word badges. Teal (#0891b2) is this page's accent next
 * to brand violet.
 * Main keywords: offline workout tracker app, workout app without internet,
 * gym app with no ads, free workout tracker no subscription, install workout app on home screen.
 */

const PATH = '/offline-workout-tracker';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Offline Workout Tracker App: Free, No Ads, No Subscription',
  description:
    'RepUp is an offline workout tracker app: log sets, reps and kg at the gym without internet, and it saves to your account later. Free, no ads, no subscription.',
  keywords: [
    'offline workout tracker app',
    'workout app without internet',
    'gym app with no ads',
    'free workout tracker no subscription',
    'install workout app on home screen',
    'gym tracker PWA',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Does RepUp work without internet?',
    a: 'Yes. After you have opened it once with internet and logged in, RepUp keeps working with no signal. You can log sets, reps and kg as usual, and they are saved to your account when you are back online.',
  },
  {
    q: 'Do I need internet the first time?',
    a: 'Yes. You need a connection to open RepUp for the first time and to log in with email or Google. After that, a weak or missing signal at the gym is fine.',
  },
  {
    q: 'Is RepUp really free? Are there ads?',
    a: 'RepUp is free to use, with no ads and no subscription to buy. You only need an email address or a Google account so your workouts are saved.',
  },
  {
    q: 'Is it a real app? Where do I download it?',
    a: 'RepUp is a web app (PWA) that installs from your browser, not from an app store. On Android, open it in Chrome and choose Install app from the ⋮ menu. On iPhone, open it in Safari, tap Share, then Add to Home Screen.',
  },
  {
    q: 'Who can see my workouts?',
    a: 'Your workouts belong to your account, and only you can see them when you log in. There is no social feed and nothing is shared publicly.',
  },
  {
    q: 'Does RepUp have a rest timer?',
    a: 'No. Workout mode leaves out rest timers, workout clocks, calorie counting and social feeds on purpose: it records your sets and shows you what to beat next time. (Running mode, for runs and walks, does have a run timer and an estimate of calories.)',
  },
];

const ANDROID = [
  { name: 'Open in Chrome', text: 'Open getrepup.vercel.app in Chrome on your Android phone.' },
  { name: 'Open the menu', text: 'Tap the ⋮ menu in the top-right corner.' },
  { name: 'Install', text: 'Tap “Install app” (on some phones it says “Add to Home screen”), then confirm.' },
];

const IPHONE = [
  { name: 'Open in Safari', text: 'Open getrepup.vercel.app in Safari on your iPhone.' },
  { name: 'Tap Share', text: 'Tap the Share button (a square with an arrow pointing up).' },
  { name: 'Add to Home Screen', text: 'Scroll down, tap “Add to Home Screen”, then tap “Add”.' },
];

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18Z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M10.5 18.5h3" />
  </svg>
);

const FLOW: { icon: ReactNode; when: string; title: string; body: string }[] = [
  {
    icon: <CloudIcon />,
    when: 'Before the gym',
    title: 'Open it once online',
    body: 'Open RepUp with internet and log in with email or Google. That is the only time you need a connection.',
  },
  {
    icon: <PhoneIcon />,
    when: 'At the gym',
    title: 'Log with no signal',
    body: 'Your plan for the day and last time’s numbers are there. Type kg and reps, tick the set, move on. Sets are kept on your phone.',
  },
  {
    icon: <CloudIcon />,
    when: 'Back online',
    title: 'It saves itself',
    body: 'When your phone reconnects, your sets are saved to your account on their own. You do not press anything.',
  },
];

const BADGES = [
  ['Free', 'Free to use. Sign up with an email address or a Google account.'],
  ['No ads', 'Nothing between you and your next set.'],
  ['No subscription', 'There is no subscription to buy. Log as many workouts as you like.'],
  ['Private', 'Everything you log belongs to your account. Only you see it. No public profile, no followers.'],
];

function Kicker({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-sm font-semibold tracking-wide text-[#0e7490] uppercase">{children}</p>;
}

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

/** Four empty signal bars with a "No signal" label. */
function SignalBars() {
  return (
    <div className="flex flex-col items-center gap-3" role="img" aria-label="Phone signal bars, all empty: no signal">
      <div className="relative flex h-24 items-end gap-2">
        {[30, 52, 74, 96].map((h) => (
          <span key={h} className="w-5 rounded-t-md border-2 border-dashed border-[#a3a3a3] bg-[#f5f5f5]" style={{ height: h }} />
        ))}
        <span aria-hidden className="absolute top-1/2 left-1/2 h-0.5 w-32 -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] rounded bg-[#737373]" />
      </div>
      <span className="text-xs font-semibold tracking-[0.2em] text-[#737373] uppercase">No signal</span>
    </div>
  );
}

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      className="bg-white"
      jsonLd={[
        appLd('Offline workout tracker app: log sets, reps and kg without internet, saves to your account later. Free, no ads.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Offline workout tracker app'),
        howToLd('How to install RepUp on an Android home screen', ANDROID),
        howToLd('How to install RepUp on an iPhone home screen', IPHONE),
      ]}
    >
      {/* Hero: minimal with signal bars */}
      <section className="bg-white">
        <SiteNav
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        />
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-16 pb-20 text-center sm:px-6 md:pt-28 md:pb-28">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#0e7490] uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-[#0891b2]" />
            No signal · No ads · No subscription
          </p>
          <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-[#0a0a0a] sm:text-5xl md:text-6xl">
            The offline workout tracker app that keeps going when the <span className="text-[#0891b2]">signal</span> doesn’t.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#525252]">
            RepUp logs your sets, reps and kg in a basement gym with zero bars. When you are back online, it saves everything to
            your account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Start tracking free
            </Link>
            <a href="#install" className="rounded-xl border border-[#e5e5e5] px-6 py-3.5 text-base font-semibold text-[#0a0a0a] hover:bg-[#f5f5f5]">
              How to install
            </a>
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            <SignalBars />
            <span aria-hidden className="hidden text-3xl text-[#d4d4d4] sm:block">
              →
            </span>
            <p className="flex items-center gap-2 rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-5 py-3 text-base font-semibold text-[#059669]">
              <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-[#10b981] text-sm text-white">
                ✓
              </span>
              Saved on your phone
            </p>
          </div>

          <div className="mt-16">
            <PhoneMock screen="log" />
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="border-y border-[#e5e5e5] bg-[#fafafa]">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20">
          <h2 className="text-sm font-semibold tracking-wide text-[#0e7490] uppercase">Is there a workout app without internet?</h2>
          <p className="mt-4 text-xl leading-relaxed text-[#262626] sm:text-2xl">
            Yes. RepUp is a free workout tracker that keeps working without internet once it has been opened. You log sets, reps
            and kg as normal; they are kept on your phone and saved to your account when you are back online. It installs on
            Android and iPhone, with no ads and no subscription.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 md:py-28">
        <Kicker>The problem</Kicker>
        <h2 className={h2}>Why is there no signal in my gym?</h2>
        <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
          <p>
            Many gyms sit in basements or behind thick concrete walls. Metal racks and machines do not help. And the Wi-Fi, if
            there is any, is shared by everyone on the floor.
          </p>
          <p>
            Most fitness apps expect a connection. So the screen spins between sets, the app forgets what you typed, and you end
            up guessing your weights again.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-[#ecfeff]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>How it works</Kicker>
            <h2 className={h2}>What happens when you log offline</h2>
            <p className="mt-3 text-lg leading-relaxed text-[#404040]">
              Because you always see last time, every session can be a small step up. That is the idea behind a{' '}
              <A href="/progressive-overload-tracker">progressive overload tracker</A>, and it works the same offline.
            </p>
          </div>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            <span
              aria-hidden
              className="absolute top-8 right-[16.67%] left-[16.67%] hidden h-0 border-t-2 border-dashed border-[#0891b2] md:block"
            />
            {FLOW.map((f, i) => (
              <li key={f.when} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                {i < FLOW.length - 1 && (
                  <span aria-hidden className="absolute top-16 -bottom-10 left-8 w-0 border-l-2 border-dashed border-[#0891b2] md:hidden" />
                )}
                <span
                  className={`relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-[#0891b2] ${
                    i === 1 ? 'bg-[#0891b2] text-white' : 'bg-white text-[#0e7490]'
                  }`}
                >
                  {f.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-[0.15em] text-[#0e7490] uppercase">{f.when}</p>
                  <h3 className="mt-1 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-[#525252]">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-20 sm:px-6 md:py-28">
        <div className="max-w-2xl">
          <Kicker>Install</Kicker>
          <h2 className={h2}>How to install a workout app on your home screen</h2>
          <p className="mt-3 text-lg leading-relaxed text-[#525252]">
            No app store needed. RepUp installs straight from the browser and opens full-screen, like any other app.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            { title: 'Android', sub: 'Chrome', steps: ANDROID },
            { title: 'iPhone', sub: 'Safari', steps: IPHONE },
          ].map((b) => (
            <div key={b.title} className="rounded-3xl border border-[#e5e5e5] p-6 sm:p-8">
              <h3 className="text-2xl font-semibold">
                {b.title} <span className="text-base font-medium text-[#737373]">· {b.sub}</span>
              </h3>
              <ol className="mt-6 flex flex-col gap-5">
                {b.steps.map((s, i) => (
                  <li key={s.name} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ecfeff] text-sm font-semibold text-[#0e7490]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="mt-0.5 leading-relaxed text-[#525252]">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section className="border-y border-[#e5e5e5] bg-[#fafafa]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="text-center">
            <Kicker>The deal</Kicker>
            <h2 className={h2}>Free workout tracker: no ads, no subscription</h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BADGES.map(([t, d]) => (
              <li key={t} className="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center ring-1 ring-[#e5e5e5]">
                <span className="rounded-full bg-[#ecfeff] px-5 py-2 text-2xl font-semibold tracking-tight text-[#0e7490]">{t}</span>
                <p className="text-[15px] leading-relaxed text-[#525252]">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Left out */}
      <section className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 md:py-28">
        <Kicker>Less, on purpose</Kicker>
        <h2 className={h2}>What RepUp leaves out</h2>
        <p className="mt-3 mb-10 text-lg leading-relaxed text-[#525252]">
          Every extra screen is one more thing to load and one more thing between you and the next set. So RepUp keeps only what
          makes you stronger: your plan, your sets, last time, progress charts, a body-weight log and a plate calculator.
        </p>
        <DataTable
          head={['Left out', 'Why']}
          minWidth={300}
          rows={[
            ['Rest timer', 'Your phone already has one.'],
            ['Workout clock', 'In the gym, how long you trained matters less than what you lifted. (Runs have a timer in Running mode.)'],
            ['Social feed', 'No likes, no followers, no one watching.'],
            ['Food & calorie counting', 'It logs body weight, not food. Runs show only a rough calorie estimate.'],
            ['AI coach', 'Last time’s numbers and a clear target do the job.'],
          ]}
        />
      </section>

      <Split kicker="Devices" title="Same data on phone and laptop" mock={<PhoneMock screen="week" theme="light" />}>
        <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
          <p>
            Log at the gym on your phone. Later, open RepUp on your laptop and log in: the same plan, history and progress charts
            are there. Edit a past workout on one, and it shows on the other.
          </p>
          <p>
            New to logging? Read why a simple <A href="/workout-log">workout log book</A> works. Prefer Hinglish? See the{' '}
            <A href="/gym-workout-tracker-hindi">gym diary app guide in Hindi</A>.
          </p>
        </div>
      </Split>

      <FaqSection faqs={FAQS} />

      <CtaBand title="Lift. Log. Beat last time." body="Free, quiet, and ready when the signal is not." />
    </LandingShell>
  );
}
