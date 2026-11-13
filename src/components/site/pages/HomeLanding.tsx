import { A, Cards, CtaBand, DataTable, FaqSection, Hero, Hl, LandingShell, ShortAnswer, Split, Steps } from '../kit';
import { PhoneMock } from '../PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, type Faq } from '../seo';

/**
 * Home page for signed-out visitors ("/"). Built from the shared kit (brand
 * theme). Main keywords: gym workout tracker, workout log app, free gym tracker app.
 */

const FAQS: Faq[] = [
  {
    q: 'Is RepUp free?',
    a: 'Yes. RepUp is free to use and has no ads. You only need an email address or a Google account to save your workouts.',
  },
  {
    q: 'What is the best way to track gym workouts?',
    a: 'Write down every set as weight × reps, and look at last time’s numbers before you start. RepUp does both automatically: it shows what you lifted last time and suggests a target for today, so each workout is a small step up.',
  },
  {
    q: 'Does RepUp work without internet?',
    a: 'Yes. Once opened, RepUp works offline, which helps in basement gyms with weak signal. Your sets are saved on the phone and sync to your account when you are back online.',
  },
  {
    q: 'Can I use RepUp on Android and iPhone?',
    a: 'Yes. RepUp runs in any browser and can be installed on the home screen of Android phones (Chrome: Install app) and iPhones (Safari: Share, Add to Home Screen). Log in on your laptop to see the same data.',
  },
  {
    q: 'Does RepUp have a rest timer or calorie counter?',
    a: 'Workout mode has no rest timer: it is kept simple on purpose and records sets, reps and kg so you can beat last time. Running mode has a run timer, GPS distance, pace and a rough calorie estimate. Food mode is a calorie counter: log what you eat (Indian food included, or scan a barcode) and see calories, protein, carbs and fat against your daily target.',
  },
  {
    q: 'Can RepUp track my runs too?',
    a: 'Yes. Switch to Running mode from the account menu: it tracks distance with GPS, moving time, pace, splits for every km and shows your route on a map. Keep the screen on and RepUp open while you run (phone in hand or an armband), because browsers pause GPS when the screen is off.',
  },
  {
    q: 'Can I make my own workout plan?',
    a: 'Yes. Pick exercises for each day of the week (for example Push, Pull, Legs or Upper/Lower) with sets × reps. Every week the same day shows the same plan, and you can change it any time.',
  },
];

const STEPS = [
  { title: 'Plan your week once', body: 'Choose exercises for each day, with sets × reps. Push/Pull/Legs, Upper/Lower or your own split.' },
  { title: 'Log each set in seconds', body: 'Type kg and reps, tick ✓. Last time’s numbers sit right next to the boxes.' },
  { title: 'Beat last time', body: 'RepUp suggests today’s target: more reps, or a little more weight when you’ve earned it.' },
];

const FEATURES = [
  { title: 'Last time, every set', body: 'See exactly what you lifted last session before you lift today.' },
  { title: 'Smart targets', body: 'Hit your rep goal on every set and it tells you how much weight to add.' },
  { title: 'Progress charts', body: 'A chart for every exercise, weekly sets per muscle and your body weight.' },
  { title: 'Works offline', body: 'No signal in the gym? Keep logging. It saves when you’re back online.' },
  { title: 'Phone + laptop', body: 'Log in with email or Google. Same workouts everywhere.' },
  { title: 'Plate calculator', body: 'Which plates go on each side of the bar, worked out for you.' },
];

export function HomeLanding() {
  return (
    <LandingShell
      path="/"
      jsonLd={[
        appLd('Free gym workout tracker: plan your week, log sets, reps and kg, see last time and beat it.'),
        faqLd(FAQS),
        breadcrumbLd('/', 'RepUp'),
        howToLd('How to track your gym workouts with RepUp', STEPS.map((s) => ({ name: s.title, text: s.body }))),
      ]}
    >
      <Hero
        kicker="Free gym workout tracker · no ads"
        title={
          <>
            Know what to lift today. <Hl>Beat last time.</Hl>
          </>
        }
        intro="RepUp is a simple workout log for the gym. Plan your week, log every set as kg × reps, and see last time’s numbers right next to today’s, so you get stronger every week."
        secondary={{ href: '#how', label: 'How it works' }}
        bullets={['Works offline', 'Android & iPhone', 'kg or lb', 'Email or Google login']}
        mock={
          <>
            <PhoneMock screen="week" className="absolute top-10 -left-2 hidden scale-90 -rotate-6 opacity-70 lg:block" />
            <PhoneMock screen="log" className="relative rotate-2" />
          </>
        }
      />

      <ShortAnswer label="What is RepUp?">
        RepUp is a free gym workout tracker that works in your browser and installs on Android and iPhone. You log each set as
        weight × reps; RepUp remembers it, shows it next time and suggests a slightly harder target. That is{' '}
        <A href="/progressive-overload-tracker">progressive overload</A>, the simplest proven way to build strength and muscle.
      </ShortAnswer>

      <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 pb-20 sm:px-6">
        <h2 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">How to track your workouts with RepUp</h2>
        <Steps steps={STEPS} />
      </section>

      <Split title="Everything a gym log needs. Nothing it doesn’t." mock={<PhoneMock screen="progress" theme="light" />}>
        <p className="-mt-2 mb-8 text-[#525252]">No rest timers, no feeds, no clutter in the gym. Just the numbers that make you stronger.</p>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#525252]">{f.body}</p>
            </li>
          ))}
        </ul>
      </Split>

      <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">RepUp vs a notebook vs phone notes</h2>
        <DataTable
          head={['', 'RepUp', 'Paper notebook', 'Notes app']}
          highlight={1}
          rows={[
            ['Shows last time automatically', '✓', '✗ flip pages', '✗ scroll & search'],
            ['Suggests today’s target', '✓', '✗', '✗'],
            ['Progress charts', '✓', '✗', '✗'],
            ['Works offline', '✓', '✓', '✓'],
            ['Backed up, on every device', '✓', '✗', 'Sometimes'],
            ['Cost', 'Free', '₹50–200', 'Free'],
          ]}
        />
      </section>

      <Split
        kicker="New · Running mode"
        title="Runs and walks too, in the same app."
        mock={<PhoneMock screen="run-live" />}
        reverse
      >
        <p className="-mt-2 mb-6 text-[#525252]">
          Switch to Running mode from the account menu. Same account, same history, nothing extra to install.
        </p>
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {[
            ['GPS distance & pace', 'Moving time, average pace and a split for every km.'],
            ['Voice at every km', '“2 kilometres, last kilometre 6 minutes 5 seconds.” Turn it off any time.'],
            ['Route map', 'See where you ran once you finish.'],
            ['Walks & treadmill', 'Pick Walk, or add a treadmill run by hand.'],
          ].map(([t, d]) => (
            <li key={t}>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#525252]">{d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[#525252]">
          Keep the screen on and RepUp open while you run. <A href="/running-tracker-app">How run tracking works →</A>
        </p>
      </Split>

      <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-4 sm:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">Guides to get you started</h2>
        <Cards
          cols={3}
          items={[
            { tag: 'Beginners', title: 'First 12 weeks in the gym', body: <A href="/beginner-gym-workout-plan">A simple 3-day full body plan →</A> },
            { tag: 'Split', title: 'Push pull legs', body: <A href="/push-pull-legs-workout-planner">3-day and 6-day PPL plans →</A> },
            { tag: 'Diet + training', title: 'Lose fat, keep muscle', body: <A href="/weight-loss-workout-tracker">Weight loss workout plan →</A> },
            { tag: 'Running', title: 'Your first 5K', body: <A href="/couch-to-5k-plan">Couch to 5K in 8 weeks →</A> },
            { tag: 'Running', title: 'Know your pace', body: <A href="/running-pace-calculator">Running pace calculator →</A> },
            { tag: 'Gym + running', title: 'Do both, the smart way', body: <A href="/running-and-lifting-schedule">Running + lifting schedule →</A> },
          ]}
        />
      </section>

      <FaqSection faqs={FAQS} />
      <CtaBand title="Your next workout, one rep better." body="Free. Takes a minute to set up. Your first workout is the one you log today." />
    </LandingShell>
  );
}
