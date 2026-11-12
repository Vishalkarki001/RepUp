import Link from 'next/link';
import type { CSSProperties } from 'react';
import { cn } from 'cn';
import { A, CtaBand, FaqSection, LandingShell, Prose, ShortAnswer, Split } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /workout-log. Archetype "the page IS the log": centred headline, then a wide
 * log-book page with an amber highlighter row. Accent: amber #f59e0b.
 * Main keywords: workout log app, gym log book, workout journal, lifting log,
 * gym diary, how to keep a workout log.
 */

const PATH = '/workout-log';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Workout Log App: Free Gym Log Book & Journal | RepUp',
  description:
    'Swap your paper gym notebook for RepUp, a free workout log app. Write sets, reps and kg in seconds and see last time’s numbers on their own. Works offline.',
  keywords: [
    'workout log app',
    'gym log book',
    'workout journal',
    'lifting log',
    'gym diary',
    'how to keep a workout log',
    'gym notebook app',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'What should I write in a workout log?',
    a: 'Write the date, the workout name (like Push or Upper), each exercise, and every set as weight × reps, for example 60 kg × 8. A short note helps too, like a seat setting or a sore knee. That is enough to beat last time.',
  },
  {
    q: 'Is a workout log app better than a paper gym notebook?',
    a: 'Both work if you use them every time. A notebook is cheap and needs no battery. An app like RepUp shows last time’s numbers on its own, suggests today’s target, draws progress charts and keeps a backup, so nothing is lost if the notebook is.',
  },
  {
    q: 'Is RepUp’s workout log free?',
    a: 'Yes. RepUp is free to use and has no ads. You log in with email or Google so your log is saved to your account.',
  },
  {
    q: 'Can I use the workout log without internet?',
    a: 'Yes. Once opened, RepUp works offline, which helps in basement gyms. Your sets are saved on the phone and sync to your account when you are back online.',
  },
  {
    q: 'Can I edit an old entry in my log?',
    a: 'Yes. RepUp keeps your history by date, and you can open and edit past workouts if you typed a wrong number.',
  },
  {
    q: 'How long should I keep a workout log?',
    a: 'As long as you train. The log is most useful after a few months, when you can look back and see your lifts going up. A chart for each exercise in RepUp makes this easy to see.',
  },
];

const STEPS = [
  { name: 'Plan the week', text: 'Decide which exercises you do on each day, with sets × reps. Keep the same names every week.' },
  { name: 'Look at last time first', text: 'Before each exercise, check what you lifted last session. That is the number to beat.' },
  { name: 'Write each set straight away', text: 'Log weight × reps right after the set, not at home. Memory is not reliable after a hard workout.' },
  { name: 'Beat it by a little', text: 'Aim for one more rep, or a small jump in weight when you hit your goal reps on every set.' },
  { name: 'Look back every few weeks', text: 'Check that your main lifts are going up. If one is stuck for weeks, change something.' },
];

const LOG: { date: string; day: string; ex: string; sets: string[]; win?: boolean }[] = [
  { date: 'Mon 2 Nov', day: 'Upper', ex: 'Bench press', sets: ['60×8', '60×8', '60×7'] },
  { date: '', day: '', ex: 'Barbell row', sets: ['50×10', '50×10', '50×9'] },
  { date: '', day: '', ex: 'Shoulder press (DB)', sets: ['14×10', '14×9', '14×8'] },
  { date: 'Thu 5 Nov', day: 'Lower', ex: 'Squat', sets: ['70×6', '70×6', '70×6'] },
  { date: '', day: '', ex: 'Romanian deadlift', sets: ['60×10', '60×10', '60×10'] },
  { date: 'Mon 9 Nov', day: 'Upper', ex: 'Bench press', sets: ['60×9', '60×9', '60×8'], win: true },
];

const WRITE = [
  { t: 'Date and workout name', d: 'For example “Mon 9 Nov, Push”. The name tells you which page to compare with.' },
  { t: 'Exercise name, the same every time', d: '“DB shoulder press”, not “shoulders” one week and “OHP” the next. Same name, easy comparison.' },
  { t: 'Every set as weight × reps', d: 'Write 60 × 8, not “3 sets of bench”. Use kg, and write the weight per dumbbell, not the total.' },
  { t: 'Bodyweight moves too', d: 'Pull-ups, push-ups and dips: just the reps. Add the kg if you use a belt.' },
  { t: 'A short note when it matters', d: 'Seat height, grip, a sore shoulder, a bad night’s sleep. One line, not a diary entry.' },
  { t: 'Your body weight, once a week', d: 'Same day, same time, before breakfast. A weekly trend is more useful than daily ups and downs.' },
];

const PAPER = [
  ['Last time', 'Flip back through pages between sets'],
  ['Today’s target', 'Work it out yourself'],
  ['Progress', 'No chart unless you draw one'],
  ['Mistakes', 'Cross it out'],
  ['No signal', 'Works fine'],
  ['Backup', 'Lost if the book is lost'],
  ['Cost', '₹50–200'],
];

const APP = [
  ['Last time', 'Shown next to today’s boxes, automatically'],
  ['Today’s target', 'One more rep, or more weight when earned'],
  ['Progress', 'A chart for every exercise, plus body weight'],
  ['Mistakes', 'Edit any past workout'],
  ['No signal', 'Works offline, syncs later'],
  ['Backup', 'Saved to your account, phone and laptop'],
  ['Cost', 'Free, no ads'],
];

/** Amber highlighter stroke behind text. */
const marker: CSSProperties = {
  backgroundImage: 'linear-gradient(transparent 58%, rgba(245,158,11,0.45) 58%, rgba(245,158,11,0.45) 92%, transparent 92%)',
};
/** Faint ruled lines for paper surfaces. */
const ruled: CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 39px, rgba(245,158,11,0.18) 39px, rgba(245,158,11,0.18) 40px)',
};

export default function WorkoutLogPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free workout log app: write sets, reps and kg like a gym notebook, and see last time’s numbers automatically.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Workout log app'),
        howToLd('How to keep a workout log', STEPS),
      ]}
    >
      {/* Hero: the page is the log */}
      <section
        className="relative border-b border-[#e5e5e5] bg-[#fafafa]"
        style={{ background: 'radial-gradient(60% 45% at 50% 0%, rgba(245,158,11,0.14), transparent 70%), #fafafa' }}
      >
        <SiteNav
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#0b0a1f] text-white hover:bg-[#1e1b4b]"
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pt-10 text-center sm:px-6 md:pt-16">
          <p className="rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-1 text-xs font-medium text-[#92400e]">
            Workout log app · free, no ads
          </p>
          <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            The{' '}
            <span style={marker} className="box-decoration-clone px-1">
              workout log app
            </span>{' '}
            that remembers last time for you
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#525252]">
            Like your gym log book, but it never gets lost. Write each set as kg × reps. Next session, RepUp shows what you
            lifted and what to aim for today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Start your free log
            </Link>
            <a
              href="#what-to-write"
              className="rounded-xl border border-[#d4d4d4] bg-white px-6 py-3.5 text-base font-semibold hover:bg-[#f5f5f5]"
            >
              What to write in it
            </a>
          </div>
        </div>

        {/* The log-book page */}
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-12 pb-16 sm:px-6 md:pt-16 lg:pb-28">
          <figure
            className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-[#fffdf7] shadow-xl shadow-[#f59e0b]/10"
            aria-label="Example page from a workout log book"
          >
            <div className="flex items-center justify-between gap-3 border-b-2 border-[#f59e0b]/40 px-5 py-4 sm:px-8 lg:pr-80">
              <p className="text-sm font-semibold tracking-wide text-[#92400e] uppercase">Gym log book · November</p>
              <p className="text-xs text-[#737373]">Example page</p>
            </div>
            <div className="hidden grid-cols-[130px_200px_1fr] gap-4 px-8 pt-4 pb-2 text-xs font-semibold tracking-wide text-[#737373] uppercase md:grid lg:pr-80">
              <span>Date</span>
              <span>Exercise</span>
              <span>Sets · kg × reps</span>
            </div>
            <ol style={ruled} className="pb-2 lg:pr-80">
              {LOG.map((r, i) => (
                <li
                  key={i}
                  className={cn(
                    'grid grid-cols-[1fr] gap-2 px-5 py-3 sm:px-8 md:min-h-10 md:grid-cols-[130px_200px_1fr] md:items-center md:gap-4',
                    r.date && i > 0 && 'border-t border-[#e5e5e5]',
                    r.win && 'bg-[#f59e0b]/15',
                  )}
                >
                  <span className={cn('text-sm text-[#525252]', !r.date && 'hidden md:block')}>
                    {r.date ? (
                      <>
                        <b className="font-semibold text-[#0a0a0a]">{r.date}</b> · {r.day}
                      </>
                    ) : (
                      <span aria-hidden>〃</span>
                    )}
                  </span>
                  <span className="font-medium">{r.ex}</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {r.sets.map((s, j) => (
                      <span
                        key={j}
                        className={cn(
                          'rounded-md border px-2 py-0.5 text-sm font-medium tabular-nums',
                          r.win ? 'border-[#f59e0b] bg-white text-[#0a0a0a]' : 'border-[#e5e5e5] bg-white text-[#404040]',
                        )}
                      >
                        {s}
                      </span>
                    ))}
                    {r.win && (
                      <span className="ml-1 rounded-full bg-[#f59e0b] px-2.5 py-0.5 text-xs font-bold text-[#0a0a0a]">+1 rep ↑</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </figure>
          <div className="pointer-events-none absolute top-4 right-10 hidden origin-top-right scale-[0.82] rotate-3 lg:block">
            <PhoneMock screen="log" theme="light" />
          </div>
        </div>
      </section>

      <ShortAnswer label="What is a workout log?">
        <p>
          A workout log is a record of every set you lift: the exercise, the weight and the reps. Its job is to tell you what
          to beat next time. RepUp is a free workout log app that works like a gym notebook, but shows last time’s numbers on
          its own and suggests today’s target.
        </p>
      </ShortAnswer>

      <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">What a good lifting log looks like</h2>
        <Prose className="mt-5">
          <p>
            Look at the log page above. Nothing fancy: date, exercise, and every set as kg × reps. That is a complete gym diary.
          </p>
          <p>
            Now look at the{' '}
            <span style={marker} className="font-semibold text-[#0a0a0a]">
              highlighted line
            </span>
            . On 9 November the bench press went from 60×8 to 60×9. That small win only happened because the old numbers were
            written down. This is <A href="/progressive-overload-tracker">progressive overload</A>, and a log is how you keep
            it going.
          </p>
        </Prose>
      </section>

      {/* What to write: amber band */}
      <section id="what-to-write" className="scroll-mt-8 border-y border-[#f59e0b]/30 bg-[#fffbeb]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#b45309] uppercase">Keep it short</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">What to write in a workout log</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            If logging takes more than a few seconds, you will stop doing it. These six things are enough. Skip the long
            feelings: numbers first.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WRITE.map((w, i) => (
              <li key={w.t} className="flex gap-4 rounded-2xl border border-[#f59e0b]/25 bg-white p-6">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-sm font-bold text-[#0a0a0a]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{w.t}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#525252]">{w.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How to keep */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              How to keep a workout log (and actually stick to it)
            </h2>
            <Prose className="mt-5">
              <p>
                Not sure what to put in the plan? Start with a <A href="/beginner-gym-workout-plan">beginner gym workout plan</A>{' '}
                or a <A href="/push-pull-legs-workout-planner">push pull legs split</A>, then log it the same way every week.
              </p>
            </Prose>
          </div>
          <ol className="relative flex flex-col gap-6 border-l-2 border-dashed border-[#f59e0b]/50 pl-8">
            {STEPS.map((s, i) => (
              <li key={s.name} className="relative">
                <span className="absolute top-0 -left-[49px] flex size-8 items-center justify-center rounded-full border-2 border-[#f59e0b] bg-white text-sm font-bold text-[#b45309]">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="mt-1 leading-relaxed text-[#525252]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Notebook vs app: two contrasting cards */}
      <section className="border-t border-[#e5e5e5] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Paper gym notebook or workout journal app?
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            A paper notebook is great. It is cheap, it needs no battery and nothing distracts you. If you love yours, keep it.
            The trouble starts after a few months: you flip pages between sets, pages get wet, the book gets left in the
            locker, and there is no easy way to see if you are getting stronger.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#fffdf7] p-6 sm:p-8" style={ruled}>
              <h3 className="text-xl font-semibold">Paper notebook</h3>
              <dl className="mt-5 flex flex-col gap-3">
                {PAPER.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-3 text-[15px]">
                    <dt className="font-medium text-[#737373]">{k}</dt>
                    <dd className="text-[#404040]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl bg-[#7c3aed] p-6 text-white shadow-xl shadow-[#7c3aed]/25 sm:p-8">
              <h3 className="text-xl font-semibold">RepUp workout log</h3>
              <dl className="mt-5 flex flex-col gap-3">
                {APP.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-3 text-[15px]">
                    <dt className="font-medium text-white/70">{k}</dt>
                    <dd className="font-medium">
                      <span className="mr-1.5 text-[#fcd34d]">✓</span>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <Split
        kicker="Your log, as a chart"
        title="See your lifts go up, not just pages fill up"
        mock={<PhoneMock screen="progress" theme="light" />}
      >
        <Prose>
          <p>
            Every exercise you log gets its own progress chart. You also get weekly sets per muscle and a body-weight log, all
            from the numbers you already typed.
          </p>
          <p>
            And like paper, it works with no signal in the gym. Read more about the{' '}
            <A href="/offline-workout-tracker">offline workout tracker</A>.
          </p>
        </Prose>
      </Split>

      <FaqSection faqs={FAQS} title="Workout log questions" />

      <CtaBand
        title="Start your gym log book today"
        body="Free, no ads. Log your first workout and next time RepUp will show you the number to beat."
        cta="Start your free log"
      />
    </LandingShell>
  );
}
