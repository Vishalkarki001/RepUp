import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/running-in-hot-weather". Look: "time-of-day strip". Warm cream hero with
 * the headline on top and a 24-hour timeline coloured cool → hot → cool,
 * marking the best windows to run (early morning, late evening) with sun
 * icons. Accent: heat gradient #fb923c → #ef4444; small text uses #9a3412.
 * Main keywords: running in hot weather, summer running tips India, running in
 * humidity, how to run in heat, heat exhaustion signs.
 */

const PATH = '/running-in-hot-weather';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Running in Hot Weather: Summer Running Tips for India',
  description:
    'Running in hot weather, made safer: the best time of day to run, hydration and electrolytes, running in humidity, and heat exhaustion signs to never ignore.',
  keywords: [
    'running in hot weather',
    'summer running tips India',
    'running in humidity',
    'how to run in heat',
    'heat exhaustion signs',
    'best time to run in summer',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'What is the best time to run in summer in India?',
    a: 'Early morning, around sunrise, is usually the coolest and safest time. Late evening after the sun has set is the next best. Avoid running between late morning and late afternoon, when the sun is strongest.',
  },
  {
    q: 'Why is running in humidity so hard?',
    a: 'Your body cools itself when sweat dries on your skin. In humid air, sweat dries slowly, so you heat up faster and your heart works harder. A pace that feels easy in winter can feel hard in monsoon weather. Slow down and run by effort.',
  },
  {
    q: 'What are the signs of heat exhaustion while running?',
    a: 'Dizziness, headache, nausea, cramps, unusual tiredness, heavy sweating and pale, clammy skin. Stop running, move to shade, cool down and sip water. Confusion, fainting or hot, dry skin can mean heat stroke: call 112 or 108 at once.',
  },
  {
    q: 'Should I drink water or an electrolyte drink when running in the heat?',
    a: 'For runs under an hour, water before and after is usually enough. For longer or very sweaty runs, add electrolytes: an ORS packet, a sports drink, or nimbu pani with a pinch of salt. Drink to thirst rather than forcing large amounts.',
  },
  {
    q: 'Does RepUp keep tracking my run with the screen off?',
    a: 'No. RepUp is a web app, so GPS tracking needs the screen on and RepUp open, with the phone in your hand or an armband. If the screen turns off or you switch apps, tracking pauses and the gap is joined with a straight line.',
  },
  {
    q: 'Does RepUp show the weather for my run?',
    a: 'Yes. RepUp records the temperature at the start of each GPS run and shows it with the run, so you can see why a hot-day run was slower. It does not give heat warnings, so always judge the conditions yourself.',
  },
];

const STEPS = [
  { name: 'Pick a cool time', text: 'Run early in the morning or late in the evening. Skip the hours around midday.' },
  { name: 'Drink before you go', text: 'Drink water through the day and have a glass before the run. Carry water on runs longer than about 45–60 minutes.' },
  { name: 'Slow down on purpose', text: 'Run by effort, not by pace. On hot or humid days, expect to be slower and keep it conversational.' },
  { name: 'Know when to stop', text: 'If you feel dizzy, sick, confused or stop making sense, stop at once, get into shade and cool down. Seek help if it does not pass.' },
];

const TIPS: [string, string][] = [
  ['Go early or late', 'Sunrise is usually the coolest part of the day. Late evening is next best. Roads stay hot after sunset, so pick shaded routes.'],
  ['Slow down, run by feel', 'Forget your usual pace. Run at an effort where you can still talk in sentences, and take walk breaks when you need them.'],
  ['Cut the distance', 'Hot days are not for long runs or hard intervals. Do a shorter easy run and save the big sessions for a cooler morning.'],
  ['Dress light', 'Loose, light-coloured clothes that dry fast, a cap, sunglasses and sunscreen. Skip cotton; it stays wet and heavy.'],
  ['Plan your water', 'Run loops past home, a shop or a tap. On longer runs carry a bottle and add electrolytes or ORS.'],
  ['Give it two weeks', 'Your body gets better at handling heat over about 1–2 weeks of short, easy runs. Build up slowly when summer starts.'],
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const rust = 'text-[#9a3412]';
const HEAT = { backgroundImage: 'linear-gradient(90deg, #fb923c, #ef4444)' };

function Kicker({ children }: { children: ReactNode }) {
  return <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${rust}`}>{children}</p>;
}

function Sun({ size = 22, color = '#f97316' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4.5" fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="12" y1="1.8" x2="12" y2="4.2" transform={`rotate(${a} 12 12)`} />
      ))}
    </svg>
  );
}

/** Hero visual: a 24-hour strip, cool at night, hottest after midday. */
function DayStrip() {
  const pct = (h: number) => `${(h / 24) * 100}%`;
  return (
    <figure className="mx-auto w-full max-w-5xl">
      <div aria-hidden className="relative h-10">
        {[
          { h: 6.2, s: 20, c: '#fb923c', t: 'sunrise' },
          { h: 13, s: 34, c: '#ef4444', t: 'midday' },
          { h: 18.6, s: 20, c: '#fb923c', t: 'sunset' },
        ].map((x) => (
          <span key={x.t} className="absolute bottom-1 -translate-x-1/2" style={{ left: pct(x.h) }}>
            <Sun size={x.s} color={x.c} />
          </span>
        ))}
      </div>
      <div
        role="img"
        aria-label="24-hour timeline. Best time to run: about 5 to 7:30 am. Avoid about 11 am to 4 pm, the hottest part of the day. Good again after about 7 pm."
        className="relative h-16 overflow-hidden rounded-2xl shadow-lg shadow-[#ef4444]/20 ring-1 ring-black/5 sm:h-24"
        style={{
          backgroundImage:
            'linear-gradient(90deg, #93c5fd 0%, #bfdbfe 21%, #fde68a 33%, #fb923c 42%, #ef4444 52%, #dc2626 62%, #ef4444 67%, #fb923c 74%, #fde68a 80%, #bfdbfe 88%, #93c5fd 100%)',
        }}
      >
        {Array.from({ length: 23 }, (_, i) => (
          <span key={i} aria-hidden className="absolute top-0 h-2 w-px bg-black/15" style={{ left: pct(i + 1) }} />
        ))}
        {[
          { from: 5, to: 7.5, t: 'Best' },
          { from: 19, to: 21.5, t: 'Good' },
        ].map((w) => (
          <span
            key={w.t}
            aria-hidden
            className="absolute inset-y-1.5 flex items-center justify-center rounded-xl border-2 border-dashed border-[#0c4a6e]/70 bg-white/35 text-[10px] font-bold tracking-wide text-[#0c4a6e] uppercase sm:text-xs"
            style={{ left: pct(w.from), width: pct(w.to - w.from) }}
          >
            <span className="hidden sm:inline">{w.t}</span>
          </span>
        ))}
        <span
          aria-hidden
          className="absolute inset-y-0 hidden items-center justify-center text-xs font-bold tracking-[0.2em] text-white uppercase sm:flex"
          style={{ left: pct(11), width: pct(5) }}
        >
          Avoid
        </span>
      </div>
      <div aria-hidden className="mt-2 flex justify-between text-[10px] font-medium text-[#78716c] tabular-nums sm:text-xs">
        <span>12 am</span>
        <span>6 am</span>
        <span>12 pm</span>
        <span>6 pm</span>
        <span>12 am</span>
      </div>
      <figcaption className="mt-6 grid gap-2 text-left text-sm sm:grid-cols-3 sm:gap-4">
        <span className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-[#fed7aa]">
          <span className="size-3 shrink-0 rounded-full bg-[#93c5fd]" />
          <span><b className="font-semibold text-[#0a0a0a]">Best:</b> <span className="text-[#57534e]">about 5–7:30 am</span></span>
        </span>
        <span className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-[#fed7aa]">
          <span className="size-3 shrink-0 rounded-full" style={HEAT} />
          <span><b className="font-semibold text-[#0a0a0a]">Avoid:</b> <span className="text-[#57534e]">about 11 am–4 pm</span></span>
        </span>
        <span className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-[#fed7aa]">
          <span className="size-3 shrink-0 rounded-full bg-[#bfdbfe]" />
          <span><b className="font-semibold text-[#0a0a0a]">Good:</b> <span className="text-[#57534e]">after about 7 pm</span></span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function RunningInHotWeatherPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fffbf5]"
      jsonLd={[
        appLd('Free running and gym tracker: GPS runs with splits for every km and the temperature at the start of each run.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Running in hot weather'),
        howToLd('How to run safely in hot weather', STEPS),
      ]}
    >
      {/* Hero: time-of-day strip */}
      <section className="relative overflow-hidden border-b border-[#fed7aa] bg-[#fff7ed]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 40% at 55% 0%, rgba(251,146,60,0.22), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#44403c] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-8 pb-16 text-center sm:px-6 md:pt-14 md:pb-24">
          <p className="rounded-full border border-[#fb923c]/40 bg-white px-3 py-1 text-xs font-semibold text-[#9a3412]">
            Summer running tips · India
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-[#1c1917] sm:text-5xl md:text-6xl">
            Running in hot weather:{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #ea580c, #dc2626)' }}>
              beat the clock, not the heat
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#57534e]">
            When you run matters as much as how. Here is the best time of day, how to drink, how to handle humidity, and the
            warning signs that mean stop now.
          </p>
          <div className="mt-12 w-full">
            <DayStrip />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Track your runs free
            </Link>
            <a href="#signs" className="rounded-xl border border-[#fdba74] bg-white px-7 py-3.5 font-semibold text-[#1c1917] hover:bg-[#fff7ed]">
              Heat warning signs
            </a>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h2 className={`text-sm font-semibold tracking-wide uppercase ${rust}`}>The short answer</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#292524] sm:text-2xl">
          To run safely in hot weather, run early in the morning or late in the evening, slow down and run by effort, and keep
          the run shorter. Drink water through the day and add electrolytes on long, sweaty runs. If you feel dizzy, sick or
          confused, stop, get into shade and cool down.
        </p>
      </section>

      {/* Why heat is hard */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <Kicker>Why it feels so hard</Kicker>
            <h2 className={h2}>What heat does to your run</h2>
            <div className="mt-5 flex flex-col gap-4 text-[17px] leading-relaxed text-[#44403c]">
              <p>
                Running makes heat. To get rid of it, your body sends more blood to the skin and you sweat. That leaves less for
                your legs, so the same pace costs more effort and your heart beats faster.
              </p>
              <p>
                This is normal, not a sign that you are unfit. Slower runs in May are expected. Fitness built in the heat often
                shows up as faster times when the weather cools down.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-[#1c1917] p-6 text-white sm:p-8">
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#fdba74] uppercase">Monsoon and coast</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Running in humidity</h2>
            <ul className="mt-5 flex flex-col gap-3 leading-relaxed text-white/80">
              {[
                'Sweat dries slowly in humid air, so you cool down less. A humid 30°C day can feel as hard as a much hotter dry one.',
                'Slow down more than you think, and take walk breaks without guilt.',
                'Wet clothes and shoes cause chafing and blisters. Use well-fitting socks and a little anti-chafe balm.',
                'In heavy rain, watch for slippery roads and open drains. Stop and shelter if there is lightning.',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full" style={HEAT} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="border-y border-[#fed7aa] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Kicker>How to run in heat</Kicker>
          <h2 className={h2}>Six summer running tips that actually help</h2>
          <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {TIPS.map(([t, d], i) => (
              <li key={t} className="border-t-4 pt-5" style={{ borderImage: 'linear-gradient(90deg, #fb923c, #ef4444) 1' }}>
                <span className="bg-clip-text text-4xl font-bold tracking-tighter text-transparent tabular-nums" style={HEAT}>
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-[#57534e]">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 max-w-3xl text-[17px] leading-relaxed text-[#44403c]">
            On the worst days, move indoors. A <A href="/treadmill-workout-log">treadmill workout</A> or a gym session from a{' '}
            <A href="/beginner-gym-workout-plan">beginner gym plan</A> keeps your week on track without the risk. Training for a
            race? Long runs in the <A href="/half-marathon-training-plan">half marathon plan</A> should start at sunrise in summer.
          </p>
        </div>
      </section>

      {/* Hydration */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <Kicker>Water and salt</Kicker>
        <h2 className={h2}>Hydration and electrolytes, kept simple</h2>
        <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#44403c]">
          <p>
            <b className="text-[#0a0a0a]">Through the day:</b> sip water regularly. Pale yellow urine is a simple sign you are
            drinking enough.
          </p>
          <p>
            <b className="text-[#0a0a0a]">Short runs (under an hour):</b> a glass of water before and drinking after is usually
            enough.
          </p>
          <p>
            <b className="text-[#0a0a0a]">Long or very sweaty runs:</b> carry water and add electrolytes. ORS, a sports drink, or
            nimbu pani with a pinch of salt all work. Drink to thirst; do not force down huge amounts.
          </p>
          <p className="rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-4 text-[15px]">
            If you have a heart or kidney condition, high blood pressure, or take regular medicine, check with a doctor about
            fluids, salt and exercise in the heat.
          </p>
        </div>
      </section>

      {/* Warning signs */}
      <section id="signs" className="scroll-mt-8 px-4 pb-16 sm:px-6 md:pb-20">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl text-white" style={{ backgroundImage: 'linear-gradient(135deg, #c2410c, #b91c1c)' }}>
          <div className="px-6 py-12 sm:px-10 md:py-16">
            <p className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">Stop and seek help</p>
            <h2 className={h2}>Heat exhaustion signs you must not ignore</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 text-[#1c1917]">
                <h3 className="text-xl font-semibold">Heat exhaustion</h3>
                <p className="mt-1 text-sm font-semibold text-[#9a3412]">Stop running now</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[16px] text-[#44403c]">
                  <li>Dizziness or feeling faint</li>
                  <li>Headache, nausea or cramps</li>
                  <li>Heavy sweating, pale and clammy skin</li>
                  <li>Unusual weakness or tiredness</li>
                </ul>
                <p className="mt-4 text-[15px] leading-relaxed text-[#44403c]">
                  Get into shade, loosen clothing, cool your skin with water and sip fluids. If you do not feel better within about
                  30 minutes, get medical help.
                </p>
              </div>
              <div className="rounded-2xl bg-[#1c1917] p-6 ring-2 ring-white/20">
                <h3 className="text-xl font-semibold">Heat stroke</h3>
                <p className="mt-1 text-sm font-semibold text-[#fdba74]">This is an emergency</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[16px] text-white/85">
                  <li>Confusion, slurred speech or strange behaviour</li>
                  <li>Fainting or collapse</li>
                  <li>Very hot skin, which may be dry</li>
                  <li>Fits (seizures)</li>
                </ul>
                <p className="mt-4 text-[15px] leading-relaxed text-white/85">
                  Call <b className="text-white">112</b> or <b className="text-white">108</b> for an ambulance. Move the person to
                  shade and cool them with water and fanning while you wait.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RepUp */}
      <section className="border-t border-[#fed7aa] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
          <PhoneMock screen="run-live" className="rotate-2" />
          <div>
            <Kicker>In RepUp</Kicker>
            <h2 className={h2}>See the temperature next to every run</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-[#44403c]">
              RepUp records the temperature at the start of each GPS run. Later, when one run looks slow, you can see it was 34°C
              and stop worrying. The splits for every km show exactly where the heat caught up with you.
            </p>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#1c1917]" style={HEAT}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-[#57534e]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[15px] leading-relaxed text-[#57534e]">
              Keep the screen on and RepUp open while you run. More about the app: <A href="/running-tracker-app">running tracker app</A>.
            </p>
            <Link
              href={SIGNUP_HREF}
              className="mt-6 inline-block rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white hover:bg-[#6d28d9]"
            >
              Start tracking free
            </Link>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Hot weather running questions" />

      <CtaBand
        title="Run cool. Log every kilometre."
        body="Free running and gym tracker. Splits, route map and the temperature for every run."
        cta="Start free"
      />
    </LandingShell>
  );
}
