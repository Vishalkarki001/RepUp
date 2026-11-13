import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /couch-to-5k-plan. Archetype "staircase": warm light hero, headline left and
 * an 8-step staircase of the longest run each week on the right (stacked on
 * phones). Accent: coral #f97066 (#b42318 for small text).
 * Main keywords: couch to 5k plan, 5k for beginners, how to start running,
 * beginner running plan 8 weeks, run 5k.
 */

const PATH = '/couch-to-5k-plan';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Couch to 5K Plan: Free 8-Week Beginner Running Plan',
  description:
    'A simple couch to 5K plan for beginners: 8 weeks, 3 run/walk sessions a week, from 1 minute of running to 30 minutes. Safety tips and free tracking in RepUp.',
  keywords: [
    'couch to 5k plan',
    '5k for beginners',
    'how to start running',
    'beginner running plan 8 weeks',
    'run 5k',
    'couch to 5k India',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Can a complete beginner follow this couch to 5K plan?',
    a: 'Yes. It starts with just 1 minute of running at a time, with walking breaks in between. If you have a health condition or have not been active for a long time, check with a doctor before you start.',
  },
  {
    q: 'How long does it take to run 5K from zero?',
    a: 'This guide takes 8 weeks if every week goes well. Many people repeat a week or two, and that is fine. Some beginners cover 5 km in 30 minutes; others need longer. Keep running 30 minutes three times a week and the distance will come.',
  },
  {
    q: 'What if I cannot finish a session?',
    a: 'Repeat that week. Slow down first: most beginners run too fast. You should be able to speak in short sentences while you run.',
  },
  {
    q: 'Should I run every day?',
    a: 'No. Run three days a week with a rest day or an easy walk between run days. Your muscles, joints and tendons get stronger on the rest days.',
  },
  {
    q: 'Does RepUp track my run with the screen off?',
    a: 'No. RepUp is a web app, so GPS pauses when the screen is off or you switch apps. Keep the screen on and RepUp open, with the phone in your hand or an armband. You can also add a session by hand afterwards.',
  },
  {
    q: 'Is this couch to 5K plan built into the RepUp app?',
    a: 'No. RepUp has no training plans inside the app. Follow the plan on this page and log each session in RepUp, by starting a run or adding it by hand. Your week view then shows your three run days.',
  },
  {
    q: 'Can I do couch to 5K on a treadmill?',
    a: 'Yes. Follow the same run and walk minutes on the treadmill, then add the session to RepUp by hand with the distance and time shown on the machine.',
  },
];

/** Longest single run (minutes) per week: drives the staircase. */
const WEEKS: { w: number; top: string; s: [string, string, string]; same?: boolean }[] = [
  { w: 1, top: '1', s: ['Run 1 min, walk 1½ min. Do it 8 times.', '', ''], same: true },
  { w: 2, top: '1½', s: ['Run 1½ min, walk 2 min. Do it 6 times.', '', ''], same: true },
  { w: 3, top: '3', s: ['Run 1½ min, walk 1½ min, run 3 min, walk 3 min. Do it twice.', '', ''], same: true },
  { w: 4, top: '5', s: ['Run 3, walk 1½, run 5, walk 2½, run 3, walk 1½, run 5 (minutes).', '', ''], same: true },
  { w: 5, top: '20', s: ['Run 5 min, walk 3 min. Do it 3 times.', 'Run 8 min, walk 5 min, run 8 min.', 'Run 20 min without stopping.'] },
  { w: 6, top: '25', s: ['Run 5, walk 3, run 8, walk 3, run 5 (minutes).', 'Run 10 min, walk 3 min, run 10 min.', 'Run 25 min without stopping.'] },
  { w: 7, top: '28', s: ['Run 25 min.', 'Run 25 min.', 'Run 28 min.'] },
  { w: 8, top: '30', s: ['Run 28 min.', 'Run 30 min.', 'Run 30 min, or try for 5 km.'] },
];

const LOG_STEPS = [
  { name: 'Switch to Running mode', text: 'In RepUp, open the account menu and choose Running mode.' },
  { name: 'Start a run', text: 'Pick Run and tap Start run after your 5-minute warm-up walk. The walk breaks are part of the run, so do not pause for them.' },
  { name: 'Watch the clock', text: 'Keep the screen on and RepUp open. Use the timer on the run screen to know when to switch between running and walking.' },
  { name: 'Finish, or add by hand', text: 'Tap Finish at the end to save km, time and your route. On a treadmill, add the session by hand with distance and time.' },
];

const SAFETY = [
  {
    t: 'Check with a doctor first',
    b: 'if you have a heart or lung condition, high blood pressure, diabetes, joint problems, are pregnant, or have not been active for a long time.',
  },
  { t: 'Stop straight away', b: 'if you feel chest pain, dizziness or unusual shortness of breath, and get checked before you run again.' },
  { t: 'Slow is the right speed', b: 'Run at a pace where you can still speak in short sentences. If you cannot, slow down or walk.' },
  { t: 'Rest between run days', b: 'Never run two days in a row in this plan. Sharp pain in the shins, knees or feet means rest, then repeat the week.' },
  { t: 'Beat the heat', b: 'In hot months, run early in the morning or after sunset and drink water before and after.' },
  { t: 'Simple kit is enough', b: 'Comfortable running shoes and light clothes. You do not need a watch or fancy gear.' },
];

const coralDark = 'text-[#b42318]';
const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#2a0f0b] sm:text-4xl';

function Staircase() {
  return (
    <figure className="w-full">
      <div
        role="img"
        aria-label="Staircase of the 8-week plan. Longest run each week: week 1, 1 minute; week 2, 1½ minutes; week 3, 3 minutes; week 4, 5 minutes; week 5, 20 minutes; week 6, 25 minutes; week 7, 28 minutes; week 8, 30 minutes."
        className="flex h-[230px] items-end gap-1 sm:h-[320px] sm:gap-1.5"
      >
        {WEEKS.map((wk, i) => {
          const last = i === WEEKS.length - 1;
          return (
            <div key={wk.w} className="flex h-full min-w-0 flex-1 flex-col justify-end" aria-hidden>
              {last && (
                <span className="mx-auto mb-1 rounded-full bg-[#2a0f0b] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white sm:text-xs">5K</span>
              )}
              <span className="mb-1 text-center text-sm font-bold text-[#7a271a] tabular-nums sm:text-lg">{wk.top}</span>
              <div
                className="flex items-end justify-center rounded-t-lg pb-2"
                style={{
                  height: `${((i + 1) / WEEKS.length) * 72}%`,
                  background: `color-mix(in srgb, #f97066 ${35 + i * 9}%, #fff7f5)`,
                }}
              >
                <span className={`text-[10px] font-semibold sm:text-xs ${i > 3 ? 'text-[#2a0f0b]' : 'text-[#7a271a]'}`}>W{wk.w}</span>
              </div>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-3 flex flex-wrap justify-between gap-2 border-t-2 border-[#2a0f0b] pt-2 text-xs text-[#7a271a]">
        <span>Numbers = longest run that week, in minutes</span>
        <span className="font-semibold">Week 1 → Week 8</span>
      </figcaption>
    </figure>
  );
}

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fff7f5]"
      jsonLd={[
        appLd('Free run tracker to log every couch to 5K session: GPS km, time, pace and splits, or add a run by hand. No ads.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Couch to 5K plan'),
        howToLd('How to log a couch to 5K session in RepUp', LOG_STEPS),
      ]}
    >
      {/* Hero: staircase */}
      <section className="relative overflow-hidden border-b border-[#fbd5cf] bg-[#fff7f5]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 60% at 85% 40%, rgba(249,112,102,0.20), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#57291f] hover:text-[#2a0f0b]"
          ctaClass="bg-[#2a0f0b] text-white hover:bg-[#45180f]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-[1fr_1.05fr] md:pt-16 md:pb-24 [&>*]:min-w-0">
          <div className="flex flex-col gap-6">
            <p className={`w-fit rounded-full bg-[#f97066]/15 px-3 py-1 text-xs font-semibold ${coralDark}`}>
              8 weeks · 3 sessions a week · run/walk
            </p>
            <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#2a0f0b] sm:text-5xl md:text-[3.4rem]">
              Couch to 5K plan: <span className="text-[#e5483d]">one small step</span> a week
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#57291f]">
              Never run before? Start with 1 minute of running and walk in between. Eight weeks later you run for 30 minutes
              without stopping. Follow the plan here and log every session free in RepUp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
              >
                Log my runs free
              </Link>
              <a href="#plan" className="rounded-xl border border-[#f97066]/50 bg-white px-6 py-3.5 text-base font-semibold text-[#2a0f0b] hover:bg-[#fff1ee]">
                See the 8 weeks
              </a>
            </div>
          </div>
          <Staircase />
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className={`text-sm font-semibold tracking-wide uppercase ${coralDark}`}>How do I start running from zero?</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#2a0f0b] sm:text-2xl">
          Use a couch to 5K plan. Run three times a week for 8 weeks, mixing short runs with walking breaks. Start with 1 minute
          of running, walk to recover, and add a little each week until you can run 30 minutes non-stop. Go slowly, rest between
          run days, and repeat any week that feels too hard.
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-[#fbd5cf] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${coralDark}`}>How the plan works</p>
          <h2 className={h2}>Run a little, walk a little, repeat</h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
            Your heart and lungs get fitter fast, but your legs, joints and tendons need more time. Walking breaks let them catch
            up, so you build fitness without getting hurt. This is how to start running at any age or weight.
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['3 sessions', 'a week, for example Monday, Wednesday and Saturday. Rest or walk on the other days.'],
              ['5 + 5 minutes', 'Walk briskly for 5 minutes before each session and walk easy for 5 minutes after.'],
              ['Repeat freely', 'If a week felt too hard, do it again. The plan works at your speed, not the calendar’s.'],
            ].map(([t, b]) => (
              <li key={t} className="rounded-2xl bg-[#fff7f5] p-6 ring-1 ring-[#fbd5cf]">
                <p className="text-2xl font-semibold tracking-tight text-[#e5483d]">{t}</p>
                <p className="mt-2 leading-relaxed text-[#57291f]">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The plan */}
      <section id="plan" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-16 sm:px-6 md:py-24">
        <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${coralDark}`}>The plan</p>
        <h2 className={h2}>Beginner running plan: 8 weeks to 5K</h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
          Three sessions a week. In weeks 1 to 4 all three sessions are the same. From week 5 each session is a little longer
          than the one before.
        </p>
        <figure className="mt-10 flex flex-col gap-2">
          <div className="overflow-x-auto rounded-2xl border border-[#fbd5cf] bg-white">
            <table className="w-full text-left text-[15px]" style={{ minWidth: 680 }}>
              <thead className="bg-[#fff1ee] text-[#57291f]">
                <tr>
                  <th scope="col" className="p-4 font-semibold">Week</th>
                  <th scope="col" className="p-4 font-semibold">Session 1</th>
                  <th scope="col" className="p-4 font-semibold">Session 2</th>
                  <th scope="col" className="p-4 font-semibold">Session 3</th>
                  <th scope="col" className="p-4 font-semibold">Longest run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#fde4df]">
                {WEEKS.map((wk) => (
                  <tr key={wk.w}>
                    <th scope="row" className="p-4 align-top">
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#f97066] font-semibold text-[#2a0f0b]">
                        {wk.w}
                      </span>
                    </th>
                    {wk.same ? (
                      <td colSpan={3} className="p-4 align-top text-[#404040]">
                        {wk.s[0]} <span className={`font-medium ${coralDark}`}>Same for all 3 sessions.</span>
                      </td>
                    ) : (
                      wk.s.map((s, i) => (
                        <td key={i} className="p-4 align-top text-[#404040]">
                          {s}
                        </td>
                      ))
                    )}
                    <td className="p-4 align-top font-semibold whitespace-nowrap text-[#2a0f0b] tabular-nums">{wk.top} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption className="text-sm text-[#7a271a]">
            A general guide in the popular couch to 5K style, not a medical programme. Every session starts with a 5-minute brisk
            walk and ends with a 5-minute easy walk.
          </figcaption>
        </figure>
        <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
          Not sure how fast 5 km in 30 minutes is? That is 6 minutes per km. Play with your own numbers in the{' '}
          <A href="/running-pace-calculator">running pace calculator</A>. Your pace does not matter in this plan, though. Finishing
          the minutes does.
        </p>
      </section>

      {/* Safety */}
      <section className="bg-[#2a0f0b] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#fda29b] uppercase">Stay safe</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Safety notes before you run</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAFETY.map((s) => (
              <li key={s.t} className="rounded-2xl border border-white/10 border-l-4 border-l-[#f97066] bg-white/[0.04] p-5">
                <h3 className="font-semibold text-white">{s.t}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">{s.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Log in RepUp */}
      <section className="border-b border-[#fbd5cf] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-24 [&>*]:min-w-0">
          <div className="flex justify-center md:order-2">
            <PhoneMock screen="run-week" theme="light" />
          </div>
          <div>
            <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${coralDark}`}>Track it</p>
            <h2 className={h2}>How to log couch to 5K in RepUp</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#404040]">
              RepUp does not have this plan inside the app and it does not beep for intervals. It records what you do, so you
              can see three dots on your week and your longest run growing.
            </p>
            <ol className="mt-8 flex flex-col gap-5">
              {LOG_STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f97066] text-sm font-semibold text-[#2a0f0b]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#2a0f0b]">{s.name}</h3>
                    <p className="mt-0.5 leading-relaxed text-[#525252]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 rounded-2xl bg-[#fff7f5] p-4 text-[15px] leading-relaxed text-[#57291f] ring-1 ring-[#fbd5cf]">
              <b className="text-[#2a0f0b]">Keep the screen on.</b> RepUp is a web app, so GPS pauses when the screen turns off or
              you switch apps. Hold the phone or use an armband, and tap the lock button.
            </p>
          </div>
        </div>
      </section>

      {/* After 5K */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${coralDark}`}>After week 8</p>
        <h2 className={h2}>You can run 5K. What next?</h2>
        <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#404040]">
          <p>
            First, enjoy it. Keep three easy runs a week for a few weeks so the habit sticks. Then pick one goal: run the same 5K
            a bit faster with our guide to <A href="/improve-5k-time">improving your 5K time</A>, or go further with the{' '}
            <A href="/10k-training-plan">10K training plan</A>.
          </p>
          <p>
            Strong legs and hips also help you run without niggles. Two short strength sessions a week are enough; see{' '}
            <A href="/strength-training-for-runners">strength training for runners</A>. New to weights? The{' '}
            <A href="/beginner-gym-workout-plan">beginner gym workout plan</A> is a simple start, and RepUp logs your sets and reps
            in the same account as your runs.
          </p>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Couch to 5K questions" />

      <CtaBand
        title="Week 1 starts with one minute."
        body="Follow the plan, log each session in RepUp, and watch your longest run climb. Free, no ads."
        cta="Log my runs free"
      />
    </LandingShell>
  );
}
