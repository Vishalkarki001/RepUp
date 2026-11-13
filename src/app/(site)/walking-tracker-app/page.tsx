import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /walking-tracker-app. Archetype "winding path": off-white hero with a road
 * snaking across it and milestone pins (1 km, 2.5 km, 5 km), next to the light
 * run summary screen. Accent: sunny yellow #eab308 (#713f12 for small text).
 * Main keywords: walking tracker app, daily walk km tracker, steps tracker
 * free, walking for health, track my walk.
 */

const PATH = '/walking-tracker-app';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Walking Tracker App: Free Daily Walk Km & Steps | RepUp',
  description:
    'Track your walk free with RepUp: GPS km, time, pace, steps and a route map for every daily walk. No ads. Plus simple guidance on how much to walk for health.',
  keywords: [
    'walking tracker app',
    'daily walk km tracker',
    'steps tracker free',
    'walking for health',
    'track my walk',
    'walking app India',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Is RepUp a free walking tracker app?',
    a: 'Yes. RepUp is free to use with no ads. Pick Walk, tap Start, and it records GPS km, time, pace, steps and your route. It works on Android and iPhone.',
  },
  {
    q: 'Does RepUp count my steps all day?',
    a: 'No. RepUp counts steps only during a walk or run you start. It uses your phone’s motion sensor when one is available; otherwise it estimates steps from the distance and shows them with a ~.',
  },
  {
    q: 'Does it track my walk with the screen off?',
    a: 'No. RepUp is a web app, so GPS pauses when the screen turns off or you switch apps. Keep the screen on and RepUp open, with the phone in your hand or an armband. If there is a gap, RepUp joins it with a straight line.',
  },
  {
    q: 'How many km should I walk a day?',
    a: 'There is no single right number. Many health guidelines suggest about 150 minutes of moderate activity a week, such as 30 minutes of brisk walking on five days. At a brisk 5 km/h, 30 minutes is about 2.5 km.',
  },
  {
    q: 'Can I add a walk I did without my phone?',
    a: 'Yes. Add a walk by hand with the distance and time, for example a treadmill walk at the gym. It shows in your week view and weekly km.',
  },
  {
    q: 'Is walking good for weight loss?',
    a: 'Walking burns energy and is easy to do every day, so it can help, especially with sensible eating. RepUp shows an estimate of calories (~) for each walk and also has a body-weight log.',
  },
];

const STEPS = [
  { name: 'Switch to Running mode', text: 'Open the account menu in RepUp and choose Running mode. It covers walks too.' },
  { name: 'Pick Walk and Start', text: 'Tap Walk on the toggle, then Start. RepUp notes the temperature and begins tracking km with GPS.' },
  { name: 'Keep RepUp on screen', text: 'Hold your phone or wear an armband with RepUp open. Tap the lock button so pocket touches do nothing.' },
  { name: 'Finish and see your walk', text: 'Tap Finish to see km, time, pace, steps, calories (~) and the route on a map.' },
];

const PINS: { x: number; y: number; label: string; align: 'left' | 'center' | 'right'; big?: boolean }[] = [
  { x: 3, y: 32, label: 'Start', align: 'left' },
  { x: 32, y: 12, label: '1 km', align: 'center' },
  { x: 62, y: 28, label: '2.5 km', align: 'center' },
  { x: 96, y: 8, label: '5 km', align: 'right', big: true },
];

const ROUTE = 'M3 32 C 15 32, 18 12, 32 12 S 50 30, 62 28 S 82 8, 96 8';

const RECEIPT: [string, string][] = [
  ['Distance', '3.10 km'],
  ['Moving time', '38:20'],
  ['Average pace', '12:22 /km'],
  ['Steps', '~4,100'],
  ['Calories', '~ estimate'],
  ['Weather at start', '27°C'],
];

const LADDER = [
  ['Week 1', '15 min', '5 days', '75 min'],
  ['Week 2', '20 min', '5 days', '100 min'],
  ['Week 3', '25 min', '5 days', '125 min'],
  ['Week 4', '30 min', '5 days', '150 min'],
];

const label = 'text-sm font-semibold tracking-wide text-[#713f12] uppercase';
const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#1c1917] sm:text-4xl';

function WindingPath() {
  return (
    <div
      className="relative h-[150px] w-full sm:h-[170px]"
      role="img"
      aria-label="A winding walking path from Start past milestones at 1 km and 2.5 km to 5 km"
    >
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <path d={ROUTE} fill="none" stroke="#fef08a" strokeWidth={16} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={ROUTE} fill="none" stroke="#eab308" strokeWidth={4} strokeLinecap="round" strokeDasharray="10 9" vectorEffect="non-scaling-stroke" />
      </svg>
      {PINS.map((p) => (
        <span
          key={p.label}
          aria-hidden
          className="absolute"
          style={{ left: `${p.x}%`, top: `${(p.y / 40) * 100}%` }}
        >
          <span className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#1c1917] bg-[#fde047]" />
          <span
            className={`absolute bottom-3 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap shadow-sm ${
              p.align === 'left' ? '-left-2' : p.align === 'right' ? '-right-2' : '-translate-x-1/2'
            } ${p.big ? 'bg-[#1c1917] text-[#fde047]' : 'bg-white text-[#713f12] ring-1 ring-[#fde68a]'}`}
          >
            {p.big ? '🏁 ' : ''}
            {p.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fffdf5]"
      jsonLd={[
        appLd('Free walking tracker app: GPS km, time, pace, steps and a route map for every walk. No ads. Also a gym workout log.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Walking tracker app'),
        howToLd('How to track a walk with RepUp', STEPS),
      ]}
    >
      {/* Hero: winding path */}
      <section className="relative overflow-hidden border-b border-[#fde68a] bg-[#fffbeb]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(45% 55% at 85% 35%, rgba(234,179,8,0.28), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#44403c] hover:text-[#1c1917]"
          ctaClass="bg-[#1c1917] text-white hover:bg-[#292524]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-8 pb-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-14 md:pb-24 [&>*]:min-w-0">
          <div className="flex flex-col gap-6">
            <p className="w-fit rounded-full bg-[#fde047] px-3 py-1 text-xs font-bold text-[#422006]">Walk · km · steps · free</p>
            <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance text-[#1c1917] sm:text-5xl md:text-[3.4rem]">
              The free <span className="bg-[linear-gradient(transparent_60%,#fde047_60%)] px-1">walking tracker app</span> for your
              daily walk
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#44403c]">
              Morning walk, evening walk, walk to the market: see how many km you covered, how long it took and the route you
              took. No ads, nothing to pay.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
              >
                Track my walk free
              </Link>
              <a href="#how-much" className="rounded-xl border border-[#eab308] bg-white px-6 py-3.5 text-base font-semibold text-[#1c1917] hover:bg-[#fefce8]">
                How much to walk?
              </a>
            </div>
            <div className="mt-4 md:mt-6">
              <WindingPath />
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <PhoneMock screen="run-summary" theme="light" />
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className={label}>How can I track my daily walk in km?</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#1c1917] sm:text-2xl">
          Use a free walking tracker app like RepUp. Pick Walk, tap Start and keep the screen on while you walk. It records GPS
          km, time, average pace, steps and your route, and speaks your time at every kilometre. Your week view then shows how
          many km you walked each day.
        </p>
      </section>

      {/* What it tracks */}
      <section className="border-y border-[#fde68a] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24 [&>*]:min-w-0">
          <div>
            <p className={`mb-3 ${label}`}>What it tracks</p>
            <h2 className={h2}>Everything about your walk, nothing extra</h2>
            <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#44403c]">
              <p>
                <b className="text-[#1c1917]">Km, time and pace</b> come from your phone’s GPS. RepUp smooths the signal, so
                standing at a crossing does not add fake distance. At every km you hear a short voice update and feel a
                vibration; you can turn both off.
              </p>
              <p>
                <b className="text-[#1c1917]">Steps, honestly.</b> If your phone has a motion sensor RepUp can use, it counts your
                real steps. If not, it estimates steps from the distance and shows them with a ~. RepUp only counts steps on a
                walk you start; it is not an all-day step counter.
              </p>
              <p>
                <b className="text-[#1c1917]">After the walk</b> you see your route on a map, the time for every km and a
                calorie estimate (~) based on distance and your body weight.
              </p>
            </div>
          </div>
          <figure className="mx-auto w-full max-w-sm">
            <div className="rounded-t-2xl border border-b-0 border-[#e7e5e4] bg-[#fffdf5] p-6 font-mono shadow-sm">
              <p className="text-center text-sm font-bold tracking-[0.2em] text-[#1c1917] uppercase">Evening walk</p>
              <p className="mt-1 text-center text-xs text-[#713f12]">Example</p>
              <dl className="mt-5 flex flex-col gap-2.5 border-t border-dashed border-[#d6d3d1] pt-4 text-sm">
                {RECEIPT.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-[#57534e]">{k}</dt>
                    <dd className="font-bold text-[#1c1917] tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 border-t border-dashed border-[#d6d3d1] pt-4 text-center text-xs text-[#57534e]">~ means estimated</p>
            </div>
            <div
              aria-hidden
              className="h-3 w-full"
              style={{
                background:
                  'linear-gradient(-45deg, transparent 6px, #fffdf5 6px) 0 0 / 12px 12px repeat-x, linear-gradient(45deg, transparent 6px, #fffdf5 6px) 0 0 / 12px 12px repeat-x',
              }}
            />
          </figure>
        </div>
      </section>

      {/* Walk vs run toggle */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-24">
        <p className={`mb-3 ${label}`}>Walk or run?</p>
        <h2 className={h2}>One toggle, two kinds of km</h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#44403c]">
          Before you start, RepUp asks: Run or Walk? Both record the same things. Tap below to see when to pick each.
        </p>
        <div className="group mt-8">
          <div role="radiogroup" aria-label="Walk or run" className="inline-grid grid-cols-2 gap-1 rounded-2xl bg-[#f5f5f4] p-1.5">
            {[
              ['wvr-walk', '🚶 Walk', true],
              ['wvr-run', '🏃 Run', false],
            ].map(([id, text, on]) => (
              <label key={id as string} className="cursor-pointer">
                <input type="radio" name="wvr" id={id as string} defaultChecked={on as boolean} className="peer sr-only" />
                <span className="block rounded-xl px-6 py-2.5 text-center font-semibold text-[#57534e] peer-checked:bg-[#fde047] peer-checked:text-[#1c1917] peer-checked:shadow peer-focus-visible:ring-2 peer-focus-visible:ring-[#713f12]">
                  {text}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-[#fde68a] bg-white p-6 sm:p-8">
            <div className="hidden group-has-[#wvr-walk:checked]:block">
              <h3 className="text-xl font-semibold text-[#1c1917]">Pick Walk for…</h3>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[17px] leading-relaxed text-[#44403c]">
                <li>your morning or evening walk in the park or around the colony</li>
                <li>a brisk walk where you can talk but not sing</li>
                <li>a slow walk after dinner, or a walk with family</li>
              </ul>
            </div>
            <div className="hidden group-has-[#wvr-run:checked]:block">
              <h3 className="text-xl font-semibold text-[#1c1917]">Pick Run for…</h3>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[17px] leading-relaxed text-[#44403c]">
                <li>a jog, even a slow one, or run/walk intervals</li>
                <li>
                  a beginner plan like the <A href="/couch-to-5k-plan">couch to 5K plan</A>
                </li>
                <li>any run you want to compare by pace over time</li>
              </ul>
            </div>
            <p className="mt-5 border-t border-[#f5f5f4] pt-4 text-[15px] leading-relaxed text-[#57534e]">
              Either way you get GPS km, moving time, pace, km splits, steps and a route map. Ready to jog? See the{' '}
              <A href="/running-tracker-app">running tracker app</A> page.
            </p>
          </div>
        </div>
      </section>

      {/* How much */}
      <section id="how-much" className="scroll-mt-8 bg-[#1c1917] text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 [&>*]:min-w-0">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#fde047] uppercase">Walking for health</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">How much should I walk?</h2>
            <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-white/75">
              <p>
                Health guidelines such as the World Health Organization’s suggest adults aim for at least 150 minutes of
                moderate activity a week. Brisk walking counts: you breathe faster and can talk, but you could not sing.
              </p>
              <p>
                That is 30 minutes on five days. Not there yet? Start where you are and add 5 minutes a week. Any walking is
                better than none, and shorter walks add up: two 15-minute walks still make 30 minutes.
              </p>
              <p>
                What about 10,000 steps? It is a popular round target, not a medical rule. Watch your own trend instead: more km
                this week than last month is a win.
              </p>
              <p className="text-[15px] text-white/60">
                Check with a doctor before you start if you have a heart condition, chest pain, joint problems, diabetes or high
                blood pressure, or if you are pregnant.
              </p>
            </div>
          </div>
          <div className="self-center">
            <p className="mb-3 text-sm font-semibold text-white/80">A gentle 4-week build-up (a guide)</p>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-[15px]" style={{ minWidth: 280 }}>
                <thead className="bg-[#fde047] text-[#1c1917]">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">Week</th>
                    <th scope="col" className="p-3 font-semibold">Walk</th>
                    <th scope="col" className="p-3 font-semibold">Days</th>
                    <th scope="col" className="p-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {LADDER.map((r) => (
                    <tr key={r[0]}>
                      <th scope="row" className="p-3 font-medium">{r[0]}</th>
                      <td className="p-3 text-white/75 tabular-nums">{r[1]}</td>
                      <td className="p-3 text-white/75">{r[2]}</td>
                      <td className="p-3 font-semibold text-[#fde047] tabular-nums">{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Want to add a few simple exercises at home too? Try the{' '}
              <Link href="/home-workout-and-walking-plan" className="font-medium text-[#fde047] underline underline-offset-4">
                home workout and walking plan
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* How to track */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <p className={`mb-3 ${label}`}>How to use it</p>
        <h2 className={h2}>Track my walk in four steps</h2>
        <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute top-5 right-[12%] left-[12%] hidden border-t-4 border-dotted border-[#eab308] md:block" />
          {STEPS.map((s, i) => (
            <li key={s.name} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[#1c1917] bg-[#fde047] font-bold text-[#1c1917]">
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-[#1c1917]">{s.name}</h3>
                <p className="mt-1 leading-relaxed text-[#57534e]">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 rounded-2xl border-2 border-[#eab308] bg-[#fefce8] p-5 text-[15px] leading-relaxed text-[#422006] sm:p-6">
          <p className="font-semibold text-[#1c1917]">Keep the screen on</p>
          <p className="mt-1">
            RepUp is a web app, so your phone pauses GPS when the screen turns off or you open another app. Keep RepUp open on
            screen for the whole walk. Walked without your phone, or on a treadmill? Add the walk by hand.
          </p>
        </div>
        <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-[#44403c]">
          Walking to lose weight? Pair your walks with the <A href="/weight-loss-workout-tracker">weight loss workout tracker</A>{' '}
          and its body-weight log, all in the same free RepUp account.
        </p>
        <Link
          href={SIGNUP_HREF}
          className="mt-6 inline-block rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white hover:bg-[#6d28d9]"
        >
          Start tracking walks free
        </Link>
      </section>

      <FaqSection faqs={FAQS} title="Walking tracker questions" />

      <CtaBand
        title="Every walk counts. Now you can count it."
        body="GPS km, time, steps and your route, free with no ads."
        cta="Track my walk free"
      />
    </LandingShell>
  );
}
