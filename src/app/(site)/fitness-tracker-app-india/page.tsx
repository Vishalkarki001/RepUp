import Link from 'next/link';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/fitness-tracker-app-india". Layout: "city chips". White hero with a soft
 * green wash; the headline sits above a light run-week phone with Indian city
 * name chips floating around it (a wrapped row on mobile). Chips are pure
 * decoration, no claims about users. Then a green "made for" grid, a two-mode
 * band, a Hinglish guide strip and setup steps. Accent: India green #16a34a
 * with white (small text #14532d / #15803d).
 * Main keywords: fitness tracker app India, free fitness app India, workout app
 * India, gym app India free, running app India.
 */

const PATH = '/fitness-tracker-app-india';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Fitness Tracker App India: Free Gym & Running App | RepUp',
  description:
    'A free fitness tracker app for India: log gym workouts in kg and runs or walks in km, works in the browser on budget Android phones, offline at the gym, no ads.',
  keywords: [
    'fitness tracker app India',
    'free fitness app India',
    'workout app India',
    'gym app India free',
    'running app India',
    'gym and running tracker India',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Is RepUp free to use in India?',
    a: 'Yes. RepUp is free to use and has no ads. You only need an email address or a Google account to log in, so your workouts and runs are saved.',
  },
  {
    q: 'Does it work on a cheap Android phone?',
    a: 'RepUp is a web app, so it runs in your phone’s browser, like Chrome. There is no big app download from a store. You can add it to your home screen so it opens like a normal app.',
  },
  {
    q: 'Does RepUp use kg and km?',
    a: 'Yes. Gym weights are in kg (you can switch to lb in settings) and runs and walks are in km, with your pace shown per km.',
  },
  {
    q: 'Can I use it in a basement gym with no network?',
    a: 'Yes. Workout logging works offline at the gym. RepUp saves to your account when you are back online. Run tracking uses GPS, which needs a view of the sky, so it is meant for outdoor runs and walks.',
  },
  {
    q: 'Is RepUp available in Hindi?',
    a: 'The app screens use short, simple English words like Sets, Reps, kg and Last time. We also have a Hinglish guide that explains how to use RepUp as a gym diary.',
  },
  {
    q: 'Does RepUp track heart rate or connect to my smartwatch?',
    a: 'No. RepUp does not read heart rate and has no Apple Watch or Wear OS app. It tracks runs and walks with your phone’s GPS while the screen is on and RepUp is open.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Your account data is stored with our database provider on servers in Mumbai, India. RepUp does not show ads and does not sell your data. The privacy policy has the full details.',
  },
];

/** Decoration only: chip text, desktop position around the phone, tilt and style. */
const CITIES: { name: string; pos: string; solid?: boolean }[] = [
  { name: 'Delhi', pos: 'md:top-[4%] md:left-[6%] md:-rotate-6', solid: true },
  { name: 'Mumbai', pos: 'md:top-[2%] md:right-[8%] md:rotate-3' },
  { name: 'Bengaluru', pos: 'md:top-[20%] md:left-[0%] md:rotate-2' },
  { name: 'Hyderabad', pos: 'md:top-[19%] md:right-[0%] md:-rotate-3', solid: true },
  { name: 'Chennai', pos: 'md:top-[38%] md:left-[9%] md:-rotate-2' },
  { name: 'Kolkata', pos: 'md:top-[37%] md:right-[7%] md:rotate-6' },
  { name: 'Pune', pos: 'md:top-[56%] md:left-[2%] md:rotate-3', solid: true },
  { name: 'Jaipur', pos: 'md:top-[55%] md:right-[2%] md:-rotate-2' },
  { name: 'Lucknow', pos: 'md:top-[74%] md:left-[7%] md:-rotate-3' },
  { name: 'Kochi', pos: 'md:top-[73%] md:right-[9%] md:rotate-2', solid: true },
  { name: 'Ahmedabad', pos: 'md:top-[90%] md:left-[13%] md:rotate-2' },
  { name: 'Chandigarh', pos: 'md:top-[89%] md:right-[12%] md:-rotate-3' },
];

const MADE_FOR = [
  { icon: '⚖️', title: 'kg and km by default', body: 'Weights in kg (lb if you prefer), runs and walks in km with pace per km. No converting in your head.' },
  { icon: '📱', title: 'Light on your phone', body: 'Opens in Chrome on any Android phone, budget ones too. Add it to your home screen; no big download from a store.' },
  { icon: '📶', title: 'Offline at the gym', body: 'Basement gym with no signal? Keep logging sets. RepUp saves to your account when you are back online.' },
  { icon: '🆓', title: 'Free, no ads', body: 'Log every workout and every run for free. No ads between your sets.' },
  { icon: '🔒', title: 'Your data stays yours', body: 'No ads and no selling of data. Your account is stored on servers in Mumbai.' },
  { icon: '🔁', title: 'Gym and running, one account', body: 'Switch between Workout mode and Running mode from the account menu. Same login on phone and laptop.' },
];

const STEPS = [
  { name: 'Open RepUp in your browser', text: 'Open getrepup.vercel.app in Chrome (Android) or Safari (iPhone). Nothing to download from a store.' },
  { name: 'Sign up free', text: 'Create an account with email or Google, so your data is saved and shows on your phone and laptop.' },
  { name: 'Add it to your home screen', text: 'Use the browser menu and choose Add to Home screen or Install. RepUp then opens like a normal app.' },
  { name: 'Set up your week', text: 'In Workout mode, add your gym days with sets × reps. For runs and walks, switch to Running mode from the account menu.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#0a0a0a] sm:text-4xl';
const kicker = 'mb-3 text-sm font-semibold tracking-wide text-[#15803d] uppercase';

export default function FitnessTrackerAppIndiaPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-white"
      jsonLd={[
        appLd('Free fitness tracker app for India: log gym workouts in kg and runs or walks in km, works offline at the gym, no ads.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Fitness tracker app India'),
        howToLd('How to start using RepUp on your phone in India', STEPS),
      ]}
    >
      {/* Hero: city chips */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 45% at 50% 70%, rgba(22,163,74,0.16), transparent 70%), linear-gradient(180deg, #f0fdf4 0%, #ffffff 55%)',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#15803d] text-white hover:bg-[#14532d]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-8 pb-16 text-center sm:px-6 md:pt-14">
          <p className="flex items-center gap-2 rounded-full border border-[#16a34a]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#14532d]">
            <span aria-hidden className="size-2 rounded-full bg-[#16a34a]" /> Gym + running · kg · km · free
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#0a0a0a] sm:text-5xl md:text-6xl">
            The free <span className="text-[#15803d]">fitness tracker app</span> for India
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#404040]">
            Log your gym sets in kg and your runs and walks in km. It runs in your phone’s browser, works offline in the gym and has
            no ads.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-full bg-[#7c3aed] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Start free
            </Link>
            <a
              href="#why"
              className="rounded-full border border-[#16a34a]/40 bg-white px-7 py-3.5 text-base font-semibold text-[#14532d] hover:bg-[#f0fdf4]"
            >
              Why it fits India
            </a>
          </div>

          {/* Phone with floating city chips (decoration only) */}
          <div className="relative mt-12 w-full max-w-3xl md:h-[600px]">
            <ul aria-hidden className="mb-8 flex flex-wrap justify-center gap-2 md:mb-0">
              {CITIES.map((c) => (
                <li
                  key={c.name}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium shadow-sm md:absolute md:z-20 md:px-4 md:py-2 md:text-[15px] ${c.pos} ${
                    c.solid ? 'bg-[#15803d] text-white' : 'border border-[#bbf7d0] bg-white text-[#14532d]'
                  }`}
                >
                  {c.name}
                </li>
              ))}
            </ul>
            <div className="flex justify-center md:absolute md:inset-x-0 md:top-0">
              <div className="relative">
                <div aria-hidden className="absolute -inset-8 rounded-full bg-[#16a34a]/15 blur-3xl" />
                <PhoneMock screen="run-week" theme="light" className="relative" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="bg-[#15803d]">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 md:py-16">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-white/90 uppercase">Short answer</h2>
          <p className="text-xl leading-relaxed text-white sm:text-2xl">
            RepUp is a free fitness tracker app that suits India: it logs gym workouts in kg and runs or walks in km, opens in your
            phone’s browser (even on budget Android phones), keeps working offline in the gym and shows no ads. One account covers
            both Workout mode and Running mode.
          </p>
        </div>
      </section>

      {/* Made for */}
      <section id="why" className="scroll-mt-8 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kicker}>Why it fits</p>
        <h2 className={h2}>A workout app that fits Indian gyms, roads and phones</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Some fitness apps are built around miles, pounds and costly watches. RepUp keeps it simple: your phone, your numbers, in the
          units you already use.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MADE_FOR.map((m) => (
            <li key={m.title} className="flex flex-col gap-3 rounded-2xl border border-[#dcfce7] bg-[#f7fef9] p-6">
              <span aria-hidden className="flex size-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-[#bbf7d0]">
                {m.icon}
              </span>
              <h3 className="text-lg font-semibold">{m.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#525252]">{m.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
          Gym in a basement with no network? Read how the <A href="/offline-workout-tracker">offline workout tracker</A> keeps every
          set safe until you are back online.
        </p>
      </section>

      {/* Two modes */}
      <section className="border-y border-[#dcfce7] bg-[#f0fdf4]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kicker}>Two modes, one account</p>
          <h2 className={h2}>Gym app and running app in one</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dcfce7] sm:p-8">
              <span className="rounded-full bg-[#15803d] px-3 py-1 text-xs font-semibold text-white">Workout mode</span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">For the gym</h3>
              <ul className="mt-5 flex flex-col gap-3 text-[16px] leading-relaxed text-[#404040]">
                <li>• A weekly plan by day, Monday to Sunday, with sets × reps.</li>
                <li>• Log every set in kg and reps and tick it when done.</li>
                <li>• See what you lifted last time and a target for today.</li>
                <li>• Progress charts, weekly sets per muscle and a body-weight log.</li>
                <li>• A plate calculator and your own custom exercises.</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-[#14532d] p-6 text-white sm:p-8">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#14532d]">Running mode</span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">For runs and walks</h3>
              <ul className="mt-5 flex flex-col gap-3 text-[16px] leading-relaxed text-white/85">
                <li>• GPS distance, moving time, average pace and a split for every km.</li>
                <li>• Voice and vibration at each km, a lock button and pause.</li>
                <li>• The temperature at the start and a route map after.</li>
                <li>• Steps and calories as estimates (shown with ~).</li>
                <li>• Add a treadmill run or walk by hand.</li>
              </ul>
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-[17px] leading-relaxed text-[#404040]">
            <b className="font-semibold text-[#0a0a0a]">Be aware:</b> RepUp is a web app, so run tracking needs the screen on and RepUp
            open (in your hand or an armband). It does not read heart rate and has no smartwatch app.
          </p>
        </div>
      </section>

      {/* Running in India */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
        <div className="flex justify-center">
          <PhoneMock screen="log" theme="light" className="rotate-2" />
        </div>
        <div>
          <p className={kicker}>Everyday training</p>
          <h2 className={h2}>Simple tips for training in India</h2>
          <ul className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
            <li>
              <b className="font-semibold text-[#0a0a0a]">Beat the heat.</b> Run or walk early in the morning or after sunset in
              summer, and carry water. Our guide to <A href="/running-in-hot-weather">running in hot weather</A> has more.
            </li>
            <li>
              <b className="font-semibold text-[#0a0a0a]">Start from zero, slowly.</b> New to running? The{' '}
              <A href="/couch-to-5k-plan">couch to 5K plan</A> takes you from walking to 5 km over a few weeks.
            </li>
            <li>
              <b className="font-semibold text-[#0a0a0a]">Write down every set.</b> Crowded gym, changing machines: your log tells you
              exactly what to lift today.
            </li>
            <li>
              <b className="font-semibold text-[#0a0a0a]">Protein from home food.</b> Dal, paneer, curd, eggs, chana and soya chunks
              all help you reach your protein for the day.
            </li>
          </ul>
        </div>
      </section>

      {/* Hinglish guide strip */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 rounded-3xl border-2 border-dashed border-[#16a34a]/50 bg-[#f7fef9] p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p lang="hi" className="text-2xl font-semibold tracking-tight text-[#14532d] sm:text-3xl">
              Hindi ya Hinglish me padhna hai?
            </p>
            <p className="mt-2 max-w-xl leading-relaxed text-[#404040]">
              Our gym diary guide explains RepUp in easy Hinglish. The app itself uses short, simple English words like Sets, Reps and
              kg.
            </p>
          </div>
          <Link
            href="/gym-workout-tracker-hindi"
            className="shrink-0 rounded-full border border-[#16a34a] bg-white px-6 py-3 font-semibold text-[#14532d] hover:bg-[#dcfce7]"
          >
            Hinglish guide padhein →
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kicker}>Get started</p>
        <h2 className={h2}>How to start in 2 minutes</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.name} className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-6">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[#16a34a]" />
              <span className="flex size-10 items-center justify-center rounded-full bg-[#dcfce7] text-lg font-semibold text-[#14532d]">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 leading-relaxed text-[#525252]">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href={SIGNUP_HREF} className="rounded-full bg-[#7c3aed] px-7 py-3.5 font-semibold text-white hover:bg-[#6d28d9]">
            Create my free account
          </Link>
          <p className="text-[#525252]">
            Want gym and running side by side? See the <A href="/gym-and-running-tracker">gym and running tracker</A>.
          </p>
        </div>
        <p className="mt-6 text-sm text-[#737373]">
          Privacy details, including where data is stored: <A href="/privacy">privacy policy</A>.
        </p>
      </section>

      <FaqSection faqs={FAQS} title="Questions from India" />

      <CtaBand
        title="Your gym, your runs, your numbers. Free."
        body="kg and km, offline at the gym, no ads. Works on the phone you already have."
        cta="Start free"
      />
    </LandingShell>
  );
}
