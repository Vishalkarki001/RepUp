import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /running-and-lifting-schedule. Archetype "timetable board": a clean white
 * page whose hero is a 7-column weekly board with AM / PM rows of session
 * chips (stacked day rows on phones). Accent: royal blue #1d4ed8 on white.
 * Main keywords: running and lifting schedule, how to combine running and
 * weight training, cardio and weights same day, weekly schedule running and gym.
 */

const PATH = '/running-and-lifting-schedule';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Running and Lifting Schedule: 3, 4 and 6-Day Weeks | RepUp',
  description:
    'How to combine running and weight training: which to do first, how many hours apart, and 3 sample weekly schedules for running and gym. Free guide by RepUp.',
  keywords: [
    'running and lifting schedule',
    'how to combine running and weight training',
    'cardio and weights same day',
    'weekly schedule running and gym',
    'run before or after weights',
    'running and gym plan',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Should I run before or after lifting weights?',
    a: 'Do the session that matters most for your goal first, while you are fresh. If strength is the goal, lift first. If a race is the goal, run first. A short easy run works fine as a warm-up or after lifting.',
  },
  {
    q: 'Can I do cardio and weights on the same day?',
    a: 'Yes. Many people do. Pair an easy run with a lifting session, or split a hard run and a hard lift into morning and evening. Try not to stack heavy legs and hard intervals back to back.',
  },
  {
    q: 'How many hours should I wait between running and lifting?',
    a: 'If both sessions are hard, a gap of several hours helps, and around six hours or more is a common rule of thumb. If one of them is easy, doing them back to back is usually fine.',
  },
  {
    q: 'Will running kill my gains?',
    a: 'For most people, no. Lots of hard running can slow down strength and muscle gains a little, which is called the interference effect. Keeping most runs easy, spacing hard sessions and eating enough keeps it small.',
  },
  {
    q: 'How many days a week should I run and lift?',
    a: 'Three days is a good start: two lifts and one run, or the other way round. Four to six days works once that feels easy. Keep at least one full rest day.',
  },
  {
    q: 'Can RepUp plan my running and lifting week?',
    a: 'RepUp does not build plans for you; the weeks on this page are guides. You add your lifting days to the weekly plan in Workout mode and track each run in Running mode. Both live in one free account.',
  },
];

type Chip = 'Lift upper' | 'Lift lower' | 'Lift full body' | 'Easy run' | 'Intervals' | 'Long run' | 'Rest';

const CHIP: Record<Chip, string> = {
  'Lift upper': 'bg-[#1d4ed8] text-white',
  'Lift lower': 'bg-[#1e3a8a] text-white',
  'Lift full body': 'bg-[#1d4ed8] text-white',
  'Easy run': 'bg-[#dbeafe] text-[#1e3a8a]',
  Intervals: 'bg-[#0f172a] text-white',
  'Long run': 'bg-[#93c5fd] text-[#0f172a]',
  Rest: 'border border-dashed border-[#cbd5e1] bg-white text-[#64748b]',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The hero board: [AM, PM] per day. */
const BOARD: [Chip | null, Chip | null][] = [
  ['Easy run', 'Lift upper'],
  [null, 'Lift lower'],
  ['Easy run', null],
  ['Intervals', 'Lift upper'],
  ['Rest', 'Rest'],
  ['Long run', null],
  ['Rest', 'Rest'],
];

const WEEKS: { title: string; who: string; days: Chip[]; note: string }[] = [
  {
    title: 'Beginner: 3 days',
    who: 'New to one or both',
    days: ['Lift full body', 'Rest', 'Easy run', 'Rest', 'Lift full body', 'Rest', 'Rest'],
    note: 'Two full-body gym days and one easy run. On Friday you can add a 15-minute easy jog after lifting. Our beginner gym plan has the exercises.',
  },
  {
    title: 'Balanced: 4 days',
    who: 'A few months in',
    days: ['Lift lower', 'Easy run', 'Rest', 'Lift upper', 'Rest', 'Long run', 'Rest'],
    note: 'Legs on Monday, so they are fresh again by the weekend long run. Swap Tuesday for intervals once every week or two.',
  },
  {
    title: 'Committed: 6 days',
    who: 'Training for both',
    days: ['Lift upper', 'Intervals', 'Lift lower', 'Easy run', 'Lift upper', 'Long run', 'Rest'],
    note: 'Hard run on Tuesday, heavy legs on Wednesday, long run on Saturday: never two leg-heavy hard days in a row.',
  },
];

const STEPS = [
  { name: 'Pick your week', text: 'Choose the 3, 4 or 6-day schedule that fits your life, not the one that looks best on paper.' },
  { name: 'Add lifting days in Workout mode', text: 'Put each lifting session on its day (Mon–Sun) with sets × reps. Leave run days empty.' },
  { name: 'Track runs in Running mode', text: 'Switch from the account menu, tap Start run, and keep the screen on and RepUp open while you run.' },
  { name: 'Review the week', text: 'Check your lifts in progress charts and your weekly km in the Running mode week view.' },
];

function ChipEl({ c, small }: { c: Chip; small?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center rounded-lg px-2 text-center leading-tight font-semibold ${
        small ? 'min-h-10 py-1.5 text-[11px]' : 'min-h-11 py-2 text-xs lg:text-[13px]'
      } ${CHIP[c]}`}
    >
      {c}
    </span>
  );
}

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const kick = 'mb-3 text-sm font-semibold tracking-wide text-[#1d4ed8] uppercase';

export default function RunningAndLiftingSchedulePage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-white"
      jsonLd={[
        appLd('Free gym and running tracker: plan your lifting days, log sets, reps and kg, and track runs with GPS in the same account.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Running and lifting schedule'),
        howToLd('How to set up a running and lifting week in RepUp', STEPS),
      ]}
    >
      {/* Hero: timetable board */}
      <section className="border-b border-[#e2e8f0] bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_70%)]">
        <SiteNav upClass="text-[#1d4ed8]" loginClass="text-[#334155] hover:text-[#0f172a]" ctaClass="bg-[#1d4ed8] text-white hover:bg-[#1e40af]" />
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-6 md:pt-12 md:pb-20">
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end [&>*]:min-w-0">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#1d4ed8] px-2.5 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                Weekly schedule · running and gym
              </p>
              <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#0f172a] sm:text-5xl md:text-[3.4rem]">
                Running and lifting schedule that <span className="text-[#1d4ed8]">actually fits</span> your week
              </h1>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-lg leading-relaxed text-[#475569]">
                Which to do first, how many hours apart, and three ready weeks. Then log the lifts and the runs in one free app.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={SIGNUP_HREF}
                  className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
                >
                  Start tracking free
                </Link>
                <a href="#weeks" className="rounded-xl border border-[#cbd5e1] bg-white px-6 py-3.5 text-base font-semibold text-[#0f172a] hover:bg-[#f8fafc]">
                  See 3 sample weeks
                </a>
              </div>
            </div>
          </div>

          {/* The board */}
          <figure className="mt-12 overflow-hidden rounded-2xl border border-[#cbd5e1] bg-white shadow-xl shadow-[#1d4ed8]/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] bg-[#0f172a] px-4 py-3 text-white sm:px-5">
              <span className="text-sm font-semibold">This week · run + lift</span>
              <span className="text-xs text-white/70">Example board</span>
            </div>
            {/* Desktop: 7 columns × AM / PM rows */}
            <div className="hidden grid-cols-[3rem_repeat(7,minmax(0,1fr))] md:grid">
              <span className="border-b border-[#e2e8f0]" />
              {DAYS.map((d) => (
                <span key={d} className="border-b border-l border-[#e2e8f0] py-3 text-center text-sm font-semibold text-[#0f172a]">
                  {d}
                </span>
              ))}
              {(['AM', 'PM'] as const).map((slot, si) => (
                <div key={slot} className="contents">
                  <span className={`flex items-center justify-center text-xs font-semibold text-[#64748b] ${si === 0 ? 'border-b border-[#e2e8f0]' : ''}`}>
                    {slot}
                  </span>
                  {BOARD.map((b, di) => (
                    <div key={di} className={`border-l border-[#e2e8f0] p-2 ${si === 0 ? 'border-b' : ''}`}>
                      {b[si] ? <ChipEl c={b[si]!} /> : <span className="block min-h-11" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Phone: one row per day */}
            <ol className="divide-y divide-[#e2e8f0] md:hidden">
              <li className="grid grid-cols-[3rem_1fr_1fr] gap-2 bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#64748b]">
                <span />
                <span className="text-center">AM</span>
                <span className="text-center">PM</span>
              </li>
              {BOARD.map((b, di) => (
                <li key={DAYS[di]} className="grid grid-cols-[3rem_1fr_1fr] items-center gap-2 px-3 py-2">
                  <span className="text-sm font-semibold text-[#0f172a]">{DAYS[di]}</span>
                  {b.map((c, si) =>
                    c ? <ChipEl key={si} c={c} small /> : <span key={si} className="text-center text-xs text-[#94a3b8]">–</span>,
                  )}
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <span aria-hidden className="hidden w-1.5 rounded-full bg-[#1d4ed8] sm:block" />
          <div>
            <h2 className={kick}>Short answer: how do I combine running and weight training?</h2>
            <p className="text-xl leading-relaxed text-[#1e293b] sm:text-2xl">
              Do the session that matters most first. Keep most runs easy, and keep heavy leg days away from hard runs. If you do
              cardio and weights on the same day, put several hours between two hard sessions. Start with three days a week and
              keep at least one full rest day.
            </p>
          </div>
        </div>
      </section>

      {/* Order */}
      <section className="border-y border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kick}>Order</p>
          <h2 className={h2}>Run first or lift first?</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#475569]">
            The first session of the day gets your best energy. So the answer depends on what you care about more right now.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { if: 'Strength or muscle is the goal', then: 'Lift first', d: 'Fresh legs and focus for the heavy sets. Add an easy run after, or later in the day.' },
              { if: 'A race is the goal', then: 'Run first', d: 'Your key runs get your best effort. Lift after, or the next day.' },
              { if: 'The run is short and easy', then: 'Any order', d: 'A 10–20 minute easy jog is a fine warm-up or cool-down for a gym session.' },
              { if: 'Both sessions are hard', then: 'Split them', d: 'Morning and evening, or different days. Do not stack intervals right after heavy squats.' },
            ].map((c) => (
              <li key={c.if} className="flex flex-col gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <p className="text-sm text-[#64748b]">If: {c.if}</p>
                <h3 className="text-2xl font-semibold text-[#1d4ed8]">{c.then}</h3>
                <p className="leading-relaxed text-[#475569]">{c.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Spacing + interference */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <p className={kick}>Spacing</p>
          <h2 className={h2}>Cardio and weights on the same day: how far apart?</h2>
          <ol className="mt-8 flex flex-col gap-3">
            {[
              ['Easy run + any lift', 'Back to back is fine', 'Either order.'],
              ['Hard run + hard lift', 'Several hours apart', 'Around 6 hours or more is a common rule of thumb.'],
              ['Heavy legs → hard run', 'About 1–2 days', 'Let the soreness settle before intervals or a long run.'],
              ['Hard run → heavy legs', 'Next day is usually OK', 'Easier if the run was not a long one.'],
            ].map(([pair, gap, note]) => (
              <li key={pair} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-xl border border-[#e2e8f0] bg-white px-5 py-4">
                <span className="font-semibold text-[#0f172a]">{pair}</span>
                <span className="row-span-2 rounded-lg bg-[#eff6ff] px-3 py-1.5 text-right text-sm font-semibold text-[#1d4ed8]">{gap}</span>
                <span className="text-sm text-[#64748b]">{note}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 leading-relaxed text-[#475569]">
            Sore after squats? Read <A href="/run-after-leg-day">should I run after leg day</A> for what to do when legs feel heavy.
          </p>
        </div>
        <div>
          <p className={kick}>Plain words</p>
          <h2 className={h2}>The interference effect, simply</h2>
          <div className="mt-8 flex flex-col gap-4 text-[17px] leading-relaxed text-[#334155]">
            <p>
              Running asks your body to get better at going long. Lifting asks it to get stronger and build muscle. When you do a
              lot of both, especially lots of hard running, your body cannot push both to the max at once. Strength and muscle
              gains can come a little slower. That is the <b className="text-[#0f172a]">interference effect</b>.
            </p>
            <p>For most people who run a few times a week, it is small. You can keep it smaller with a few simple habits:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Keep most runs easy, at a pace where you can talk.</li>
              <li>Put hard runs and heavy leg days on different days.</li>
              <li>Eat enough food and protein, and sleep well.</li>
              <li>Add running km slowly, not all at once.</li>
            </ul>
            <p>
              Trying to lose fat? Both cardio and weights help, and doing both is a great choice.
            </p>
          </div>
        </div>
      </section>

      {/* Example weeks */}
      <section id="weeks" className="scroll-mt-8 border-y border-[#1d4ed8] bg-[#1d4ed8] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#bfdbfe] uppercase">Sample weeks</p>
          <h2 className={h2}>3 weekly schedules for running and gym</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/85">
            Start with the smallest week you can keep doing. You can always move up later.
          </p>
          <div className="mt-10 flex flex-col gap-5">
            {WEEKS.map((w) => (
              <article key={w.title} className="rounded-2xl bg-white p-5 text-[#0f172a] sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl font-semibold">{w.title}</h3>
                  <span className="rounded-full bg-[#eff6ff] px-3 py-0.5 text-sm font-medium text-[#1d4ed8]">{w.who}</span>
                </div>
                <ol className="mt-4 grid gap-1.5 sm:grid-cols-2 sm:gap-2 md:grid-cols-7">
                  {w.days.map((c, i) => (
                    <li key={i} className="grid grid-cols-[2.5rem_1fr] items-center gap-2 md:flex md:flex-col md:items-stretch md:gap-1">
                      <span className="text-xs font-semibold text-[#64748b]">{DAYS[i]}</span>
                      <ChipEl c={c} small />
                    </li>
                  ))}
                </ol>
                <p className="mt-4 leading-relaxed text-[#475569]">{w.note}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-2xl leading-relaxed text-white/85">
            New to running? Build up with the{' '}
            <Link href="/couch-to-5k-plan" className="font-semibold text-white underline underline-offset-4">
              couch to 5K plan
            </Link>{' '}
            on your run days. Need the lifts? The{' '}
            <Link href="/beginner-gym-workout-plan" className="font-semibold text-white underline underline-offset-4">
              beginner gym workout plan
            </Link>{' '}
            has full-body and upper/lower days.
          </p>
        </div>
      </section>

      {/* In RepUp */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
          <div>
            <p className={kick}>In RepUp</p>
            <h2 className={h2}>Put your schedule into one app</h2>
            <p className="mt-3 text-lg leading-relaxed text-[#475569]">
              RepUp is a free gym and running tracker. Lifting days live in Workout mode, runs in Running mode, and you switch
              between them from the account menu.
            </p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.name} className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
                  <span className="text-sm font-bold text-[#1d4ed8] tabular-nums">Step {i + 1}</span>
                  <h3 className="mt-1 font-semibold text-[#0f172a]">{s.name}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#475569]">{s.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 leading-relaxed text-[#475569]">
              Want a bigger picture of your whole week? See the <A href="/weekly-fitness-planner">weekly fitness planner</A>.
            </p>
          </div>
          <div className="flex justify-center">
            <PhoneMock screen="week" theme="light" className="-rotate-2" />
            <PhoneMock screen="run-week" theme="light" className="mt-16 -ml-36 hidden rotate-3 sm:block" />
          </div>
        </div>
      </section>

      <div className="bg-[#f8fafc]">
        <FaqSection faqs={FAQS} title="Running and lifting questions" />
        <CtaBand
          title="Your week, lifts and runs, in one place."
          body="Free, no ads. Plan your lifting days and track every run in the same account."
          cta="Start tracking free"
        />
      </div>
    </LandingShell>
  );
}
