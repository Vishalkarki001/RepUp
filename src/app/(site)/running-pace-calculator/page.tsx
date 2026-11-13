import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';
import { PaceCalculator } from './PaceCalculator';
import { RACES, fmtPace, fmtTime, kmh } from './pace';

/**
 * /running-pace-calculator. Archetype "tool-first": the working calculator is
 * the hero, on a pale cyan grid. Then a pace chart, the formula and tips.
 * Accent: cyan #06b6d4 (#0e7490 / #155e75 for small text).
 * Main keywords: running pace calculator, pace per km calculator, 5k pace
 * chart, marathon pace calculator, min per km to km/h.
 */

const PATH = '/running-pace-calculator';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Running Pace Calculator: Pace per Km, Time & km/h | RepUp',
  description:
    'Free running pace calculator: find your pace per km, finish time or distance, convert min per km to km/h, and see a 5K to marathon pace chart. Works on phones.',
  keywords: [
    'running pace calculator',
    'pace per km calculator',
    '5k pace chart',
    'marathon pace calculator',
    'min per km to km/h',
    'running speed calculator',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'How do I calculate my running pace per km?',
    a: 'Divide your time by your distance. 30 minutes for 5 km is 30 ÷ 5 = 6 minutes per km. For times with seconds, turn everything into seconds first: 27:30 for 5 km is 1,650 ÷ 5 = 330 seconds, which is 5:30 per km.',
  },
  {
    q: 'How do I convert min per km to km/h?',
    a: 'Divide 60 by your pace in minutes. A 6:00 /km pace is 60 ÷ 6 = 10 km/h. For 5:30 /km, use 5.5 minutes: 60 ÷ 5.5 = 10.9 km/h. To go back, divide 60 by the speed: 12 km/h is a 5:00 /km pace.',
  },
  {
    q: 'What pace do I need for common goals?',
    a: 'A 30-minute 5K is 6:00 /km and a 25-minute 5K is 5:00 /km. A 60-minute 10K is 6:00 /km. A 2-hour half marathon is about 5:41 /km, and a 4-hour marathon is also about 5:41 /km.',
  },
  {
    q: 'What is a good running pace for a beginner?',
    a: 'There is no single good pace. For easy runs, choose a pace where you can still talk in short sentences. For most new runners that is slower than they expect, and walking breaks are fine.',
  },
  {
    q: 'Does RepUp track my pace with the screen off?',
    a: 'No. RepUp is a web app, so GPS pauses when the screen is off or you switch apps. Keep the screen on and RepUp open while you run. Then it shows your average pace, the time for every km and your best pace over time.',
  },
  {
    q: 'Is this pace calculator free?',
    a: 'Yes. The calculator works on this page with no sign-up. If you also want to track real runs with GPS, RepUp is free with no ads.',
  },
];

const HOW = [
  { name: 'Choose what to find', text: 'Tap Pace, Time or Distance at the top of the calculator.' },
  { name: 'Enter the two you know', text: 'Type the distance in km (or tap 5K, 10K, half or full), the time as hours, minutes and seconds, or the pace per km.' },
  { name: 'Read your answer', text: 'The missing value appears at once, with your speed in km/h and finish times for 5K, 10K, half marathon and marathon.' },
];

/** 4:00 to 8:00 per km, every 15 seconds. */
const CHART = Array.from({ length: 17 }, (_, i) => 240 + i * 15);

const FORMULAS = [
  ['Pace', 'time ÷ distance', '30:00 ÷ 5 km = 6:00 /km'],
  ['Finish time', 'pace × distance', '6:00 × 10 km = 1:00:00'],
  ['Distance', 'time ÷ pace', '45:00 ÷ 6:00 = 7.5 km'],
  ['Speed (km/h)', '60 ÷ pace in minutes', '60 ÷ 6 = 10 km/h'],
  ['Pace from km/h', '60 ÷ speed', '60 ÷ 12 = 5 min /km'],
];

const label = 'text-sm font-semibold tracking-wide text-[#0e7490] uppercase';
const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#042f2e] sm:text-4xl';

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      className="bg-white"
      jsonLd={[
        appLd('Free running tracker with GPS pace per km, km splits and a pace chart. Pairs with this free running pace calculator.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Running pace calculator'),
        howToLd('How to use the running pace calculator', HOW),
      ]}
    >
      {/* Hero: the tool */}
      <section className="relative overflow-hidden border-b border-[#cffafe] bg-[#f0fdff]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,182,212,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#334155] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 pt-8 pb-16 sm:px-6 md:pt-12 md:pb-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#0e7490] uppercase">Free tool · no sign-up</p>
            <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-[#042f2e] sm:text-5xl">
              Running pace calculator <span className="text-[#0891b2]">per km</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#334155]">
              Enter any two of distance, time and pace. Get the third, your speed in km/h and your finish times from 5K to
              marathon.
            </p>
          </div>
          <div className="mt-10">
            <PaceCalculator />
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[15px] text-[#334155]">
            Want your real pace from real runs?
            <Link href={SIGNUP_HREF} className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6d28d9]">
              Track runs free in RepUp
            </Link>
          </p>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className={label}>How do you calculate running pace?</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#1e293b] sm:text-2xl">
          Running pace is your time divided by your distance, written as minutes and seconds per km. If you run 5 km in 30
          minutes, your pace is 6:00 per km. To turn pace into speed, divide 60 by the pace in minutes: 6:00 per km equals 10
          km/h. Multiply pace by distance to get a finish time.
        </p>
      </section>

      {/* Pace chart */}
      <section className="border-y border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className={`mb-3 ${label}`}>Pace chart</p>
          <h2 className={h2}>5K pace chart, up to the marathon</h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#475569]">
            Find a pace on the left and read across for your speed and finish times. Every row is worked out with the same
            maths as the calculator, rounded to the nearest second.
          </p>
          <figure className="mt-10 flex flex-col gap-2">
            <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-white">
              <table className="w-full text-left text-[15px]" style={{ minWidth: 600 }}>
                <thead className="bg-[#083344] text-white">
                  <tr>
                    <th scope="col" className="p-3.5 font-semibold sm:p-4">Pace /km</th>
                    <th scope="col" className="p-3.5 font-semibold sm:p-4">km/h</th>
                    {RACES.map((r) => (
                      <th key={r.label} scope="col" className="p-3.5 font-semibold sm:p-4">
                        {r.label === 'Half marathon' ? 'Half' : r.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {CHART.map((p) => {
                    const whole = p % 60 === 0;
                    return (
                      <tr key={p} className={whole ? 'bg-[#ecfeff]' : undefined}>
                        <th scope="row" className={`p-3.5 tabular-nums sm:p-4 ${whole ? 'font-bold text-[#155e75]' : 'font-medium text-[#0a0a0a]'}`}>
                          {fmtPace(p)}
                        </th>
                        <td className="p-3.5 text-[#475569] tabular-nums sm:p-4">{kmh(p)}</td>
                        {RACES.map((r) => (
                          <td key={r.label} className="p-3.5 text-[#334155] tabular-nums sm:p-4">
                            {fmtTime(p * r.km)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <figcaption className="text-xs text-[#64748b]">
              Half marathon 21.0975 km, marathon 42.195 km. Scroll sideways on a small phone.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Formula */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <p className={`mb-3 ${label}`}>The maths</p>
        <h2 className={h2}>How pace is calculated</h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#475569]">
          Three numbers are linked: distance, time and pace. Know any two and you can find the third. The easy way is to turn
          times into seconds, do the sum, then turn the answer back into minutes and seconds.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FORMULAS.map(([t, f, ex]) => (
            <li key={t} className="flex flex-col gap-2 rounded-2xl border border-[#e2e8f0] border-t-4 border-t-[#06b6d4] bg-white p-5">
              <h3 className="font-semibold text-[#042f2e]">{t}</h3>
              <p className="font-mono text-[15px] font-semibold text-[#155e75]">= {f}</p>
              <p className="text-sm text-[#64748b]">{ex}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 max-w-2xl rounded-2xl bg-[#ecfeff] p-5 text-[15px] leading-relaxed text-[#164e63] ring-1 ring-[#a5f3fc]">
          <p className="font-semibold text-[#083344]">Worked example</p>
          <p className="mt-1">
            You ran 7.2 km in 46:48. That is 46 × 60 + 48 = 2,808 seconds. 2,808 ÷ 7.2 = 390 seconds per km. 390 seconds is 6
            minutes 30 seconds, so your pace is 6:30 /km. Speed: 60 ÷ 6.5 = 9.2 km/h.
          </p>
        </div>
        <div className="mt-10 grid max-w-4xl gap-6 text-[17px] leading-relaxed text-[#475569] md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-[#042f2e]">Per km or per mile?</h3>
            <p className="mt-2">
              Some plans and race websites give pace per mile. One mile is about 1.609 km, so multiply your pace per km by 1.609
              to get pace per mile. A 6:00 /km pace is about 9:39 per mile.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#042f2e]">Moving time or total time?</h3>
            <p className="mt-2">
              If you stop at a traffic signal, your pace depends on which clock you use. Moving time leaves out the stops, so it
              shows how fast you really ran. For a race result, use the total time from start to finish.
            </p>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="bg-[#083344] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#67e8f9] uppercase">How to use it</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Pace per km calculator in three taps</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {HOW.map((s, i) => (
              <li key={s.name} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                <span className="font-mono text-3xl font-semibold text-[#22d3ee]">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.name}</h3>
                <p className="mt-1.5 leading-relaxed text-white/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tips + app */}
      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.25fr_1fr] md:py-24 [&>*]:min-w-0">
          <div>
            <p className={`mb-3 ${label}`}>Tips</p>
            <h2 className={h2}>Using pace well</h2>
            <ul className="mt-6 flex flex-col gap-5 text-[17px] leading-relaxed text-[#334155]">
              <li>
                <b className="text-[#042f2e]">Easy runs are slower than race pace.</b> Most of your running should feel easy enough
                to talk. Save goal pace for one session a week.
              </li>
              <li>
                <b className="text-[#042f2e]">Aim for even splits.</b> Starting too fast is the most common race mistake. Run the
                first km at goal pace or a little slower. Our guide to <A href="/improve-5k-time">running a faster 5K</A> has more.
              </li>
              <li>
                <b className="text-[#042f2e]">Heat and hills slow you down.</b> A hot, humid morning can make the same effort a lot
                slower. Judge by effort on those days, not by the number.
              </li>
              <li>
                <b className="text-[#042f2e]">Treadmills show km/h.</b> Use the chart above to turn your treadmill speed into pace,
                then log it in your <A href="/treadmill-workout-log">treadmill log</A>.
              </li>
              <li>
                <b className="text-[#042f2e]">Small steps win.</b> Like <A href="/progressive-overload-tracker">progressive overload</A>{' '}
                in the gym, a few seconds per km at a time adds up. Planning a long race? See the{' '}
                <A href="/half-marathon-training-plan">half marathon plan</A>.
              </li>
            </ul>
            <div className="mt-8 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
              <p className="text-[15px] leading-relaxed text-[#334155]">
                <b className="text-[#042f2e]">Know your real pace.</b> RepUp tracks your runs with GPS and shows average pace, the
                time for every km, your best pace and a pace chart. Free, no ads. Keep the screen on and RepUp open while you run.
              </p>
              <Link
                href={SIGNUP_HREF}
                className="mt-4 inline-block rounded-xl bg-[#7c3aed] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#6d28d9]"
              >
                Start tracking free
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <PhoneMock screen="run-summary" theme="light" />
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Pace questions" />

      <CtaBand
        title="From calculator to real runs."
        body="Track every run with GPS and see your pace per km, splits and best pace over time. Free, no ads."
      />
    </LandingShell>
  );
}
