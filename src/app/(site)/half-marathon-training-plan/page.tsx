import Link from 'next/link';
import type { ReactNode } from 'react';
import { PhoneMock } from '@/components/site/PhoneMock';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * "/half-marathon-training-plan". Look: "race bib". White hero with a big
 * tilted race-bib card (safety-pin dots, huge 21.1, HALF label) beside the
 * headline. Accent: race red #dc2626 (small text uses #b91c1c for contrast).
 * The 12 weeks are a long-run bar chart plus a week-by-week list.
 * Main keywords: half marathon training plan, 21k training plan, 12 week half
 * marathon plan, half marathon for beginners, half marathon India.
 */

const PATH = '/half-marathon-training-plan';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Half Marathon Training Plan: 12 Weeks to 21.1 km | RepUp',
  description:
    'A simple 12-week half marathon training plan for beginners: easy runs, one quality session, long runs up to 19 km, cutback weeks, taper and race-day tips.',
  keywords: [
    'half marathon training plan',
    '21k training plan',
    '12 week half marathon plan',
    'half marathon for beginners',
    'half marathon India',
    'half marathon training log',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Can a beginner train for a half marathon in 12 weeks?',
    a: 'Yes, if you can already run about 5 km without stopping and have been running 2–3 times a week for a month or two. If 5 km is still hard, start with a 10K plan or a couch to 5K plan first, then come back to this one.',
  },
  {
    q: 'How long should my longest run be before a half marathon?',
    a: 'For most beginners, a longest run of about 18–19 km, two to three weeks before the race, is enough. The race-day crowd and the taper help you cover the last few kilometres.',
  },
  {
    q: 'How many days a week do I need to run for a 21K?',
    a: 'Three or four runs a week works: two easy runs, one quality session (intervals or a tempo run) and one long run. Add one or two short strength sessions if you can, and keep at least one full rest day.',
  },
  {
    q: 'What should I eat and drink during a half marathon?',
    a: 'Practise on your long runs. Many runners sip water every 20–30 minutes and take a gel, banana or a few dates after about an hour. Eat a familiar breakfast 2–3 hours before the start. Never try new food on race day.',
  },
  {
    q: 'Does RepUp track my run with the screen off?',
    a: 'No. RepUp is a web app, so GPS tracking needs the screen on and RepUp open, with the phone in your hand or an armband. If the screen turns off or you switch apps, tracking pauses and the gap is joined with a straight line. Start long runs with a full battery.',
  },
  {
    q: 'Does RepUp have this training plan built in?',
    a: 'No. RepUp does not have training plans inside the app. Follow this page as your guide and log each run in RepUp to see your splits, weekly kilometres and longest run.',
  },
];

/** [week, easy runs, quality session, long run km, kind] */
const WEEKS: [number, string, string, number, 'build' | 'cutback' | 'taper' | 'race'][] = [
  [1, '2 × 5 km', '6 × 1 min faster, 2 min easy', 8, 'build'],
  [2, '2 × 5 km', '15 min steady tempo', 10, 'build'],
  [3, '2 × 6 km', '6 × 2 min faster, 2 min easy', 11, 'build'],
  [4, '2 × 5 km', '6 short strides only', 8, 'cutback'],
  [5, '2 × 6 km', '20 min tempo', 12, 'build'],
  [6, '2 × 6 km', '5 × 3 min faster, 2 min easy', 14, 'build'],
  [7, '2 × 7 km', '25 min tempo', 15, 'build'],
  [8, '2 × 5 km', '6 short strides only', 11, 'cutback'],
  [9, '2 × 7 km', '4 × 1 km at goal race pace', 16, 'build'],
  [10, '2 × 7 km', '25 min tempo', 18.5, 'build'],
  [11, '2 × 6 km', '3 × 1 km at goal race pace', 12, 'taper'],
  [12, '2 × 4 km', '4 short strides', 21.1, 'race'],
];

const STEPS = [
  { name: 'Switch to Running mode', text: 'Open the account menu in RepUp and choose Running mode. Your gym log stays in the same account.' },
  { name: 'Start the run and keep the screen on', text: 'Tap Start run, then keep RepUp open with the phone in your hand or an armband. Use the lock button so sweaty touches do nothing.' },
  { name: 'Listen for every kilometre', text: 'RepUp speaks and vibrates at each km with your last kilometre time, so you can hold an easy pace without staring at the screen.' },
  { name: 'Check your week', text: 'After the run, see the route and splits. In Progress, watch weekly km and your longest run climb toward 18–19 km.' },
];

const RACE_DAY: [string, string][] = [
  ['Start slower than you want', 'The first 3 km will feel easy. Run them a little slower than goal pace; you will be glad at km 16.'],
  ['Nothing new', 'Same shoes, socks, shorts and breakfast you used on your long runs. Race day is not the day to test.'],
  ['Arrive early', 'Most city races in India start early in the morning to beat the heat. Plan travel, toilet and bag drop the night before.'],
  ['Walk the water stations', 'Taking 10–15 seconds to drink properly costs almost nothing and helps you finish strong.'],
];

const red = 'text-[#b91c1c]';
const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

function Kicker({ children }: { children: ReactNode }) {
  return <p className={`mb-3 text-sm font-semibold tracking-wide uppercase ${red}`}>{children}</p>;
}

function Pin({ className }: { className: string }) {
  return (
    <span aria-hidden className={`absolute size-3.5 rounded-full bg-[#d4d4d4] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ring-2 ring-[#f5f5f5] ${className}`} />
  );
}

/** The hero visual: a race bib, slightly tilted. */
function Bib() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[340px] -rotate-3 md:max-w-[400px] md:rotate-[-5deg]">
      <div className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-2xl shadow-[#dc2626]/20">
        <Pin className="top-3 left-3" />
        <Pin className="top-3 right-3" />
        <Pin className="bottom-3 left-3" />
        <Pin className="right-3 bottom-3" />
        <div className="bg-[#dc2626] px-10 py-3 text-center text-xs font-bold tracking-[0.3em] text-white uppercase">12-week plan</div>
        <div className="px-8 pt-5 pb-10 text-center">
          <p className="text-2xl font-black tracking-[0.35em] text-[#0a0a0a] sm:text-3xl">HALF</p>
          <p className="mt-1 text-[clamp(5.5rem,30vw,9.5rem)] leading-[0.85] font-black tracking-tighter text-[#dc2626] tabular-nums">
            21.1
          </p>
          <p className="mt-2 text-sm font-semibold tracking-[0.3em] text-[#525252] uppercase">kilometres</p>
          <div className="mt-6 border-t-2 border-dashed border-[#e5e5e5] pt-4">
            <div className="mx-auto flex h-8 w-40 items-end justify-center gap-[3px]">
              {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1].map((w, i) => (
                <span key={i} className="h-full bg-[#0a0a0a]" style={{ width: w }} />
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold tracking-[0.25em] text-[#737373] uppercase">Run it · Log it</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HalfMarathonTrainingPlanPage() {
  const maxKm = 21.1;
  return (
    <LandingShell
      path={PATH}
      className="bg-white"
      jsonLd={[
        appLd('Free running and gym tracker: log every half marathon training run with GPS splits, weekly km and longest run.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Half marathon training plan'),
        howToLd('How to log your half marathon training in RepUp', STEPS),
      ]}
    >
      {/* Hero: race bib */}
      <section className="relative overflow-hidden border-b border-[#f1f1f1] bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(45% 55% at 80% 55%, rgba(220,38,38,0.12), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-8 pb-20 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-14 md:pb-24 [&>*]:min-w-0">
          <div className="flex flex-col gap-6">
            <p className="w-fit rounded-full border border-[#dc2626]/30 bg-[#fef2f2] px-3 py-1 text-xs font-semibold text-[#b91c1c]">
              21K · 12 weeks · beginners welcome
            </p>
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-[#0a0a0a] sm:text-5xl md:text-[3.4rem]">
              Half marathon training plan: <span className="text-[#dc2626]">12 weeks to 21.1 km</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#525252]">
              A calm, beginner-friendly 21k training plan. Three or four runs a week, one long run that grows slowly, two easier
              weeks to recover, and a taper so you reach the start line fresh.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={SIGNUP_HREF}
                className="rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
              >
                Log your training free
              </Link>
              <a href="#plan" className="px-2 py-3 font-semibold text-[#0a0a0a] underline decoration-[#dc2626] decoration-2 underline-offset-4">
                See the 12 weeks ↓
              </a>
            </div>
          </div>
          <Bib />
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h2 className={`text-sm font-semibold tracking-wide uppercase ${red}`}>The short answer</h2>
        <p className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">
          A 12-week half marathon training plan has three or four runs a week: two easy runs, one faster session and one long run.
          The long run grows from about 8 km to 18–19 km, with an easier week every few weeks. The last two weeks are a taper, so
          you start the 21.1 km race fresh.
        </p>
      </section>

      {/* Who it is for */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Start here if…', 'You can run 5 km without stopping and have run 2–3 times a week for a month or more.'],
            ['Not there yet?', <>Build up first with a <A href="/10k-training-plan">10K training plan</A>. A half will still be there in two months.</>],
            ['Health first', 'If you have a heart, joint or other health condition, or have not exercised in years, check with a doctor before you start.'],
          ].map(([t, d]) => (
            <div key={String(t)} className="rounded-2xl border-l-4 border-[#dc2626] bg-[#fef2f2] p-5">
              <h3 className="font-semibold text-[#0a0a0a]">{t}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-[#404040]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 12 weeks */}
      <section id="plan" className="scroll-mt-8 border-y border-[#f1f1f1] bg-[#fafafa]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Kicker>The plan</Kicker>
          <h2 className={h2}>The 12 week half marathon plan, week by week</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Every bar is that week’s long run. It climbs slowly, drops back in weeks 4 and 8 so your legs can catch up, and
            peaks at about 18–19 km in week 10.
          </p>

          {/* Long-run bar chart */}
          <figure className="mt-10 rounded-3xl border border-[#e5e5e5] bg-white p-4 sm:p-8">
            <div className="flex h-56 items-end gap-1 sm:h-64 sm:gap-3" aria-hidden>
              {WEEKS.map(([w, , , km, kind]) => (
                <div key={w} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <span className={`text-[10px] font-semibold tabular-nums sm:text-xs ${kind === 'race' ? 'text-[#0a0a0a]' : red}`}>{km}</span>
                  <div
                    className={`w-full rounded-t-md ${
                      kind === 'race'
                        ? 'bg-[#0a0a0a]'
                        : kind === 'cutback'
                          ? 'bg-[#fecaca]'
                          : kind === 'taper'
                            ? 'bg-[#fca5a5]'
                            : 'bg-[#dc2626]'
                    }`}
                    style={{ height: `${(km / maxKm) * 82}%` }}
                  />
                  <span className="text-[10px] text-[#737373] tabular-nums sm:text-xs">W{w}</span>
                </div>
              ))}
            </div>
            <figcaption className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#525252]">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#dc2626]" /> Build week</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#fecaca]" /> Cutback week</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#fca5a5]" /> Taper</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#0a0a0a]" /> Race day (21.1 km)</span>
            </figcaption>
          </figure>

          {/* Week list */}
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WEEKS.map(([w, easy, quality, km, kind]) => (
              <li key={w} className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold">Week {w}</h3>
                  {kind !== 'build' && (
                    <span className="rounded-full bg-[#fef2f2] px-2.5 py-0.5 text-xs font-semibold text-[#b91c1c] capitalize">
                      {kind === 'race' ? 'Race week' : kind}
                    </span>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-[15px]">
                  <dt className="text-[#737373]">Easy</dt>
                  <dd className="font-medium">{easy}</dd>
                  <dt className="text-[#737373]">Quality</dt>
                  <dd className="font-medium">{quality}</dd>
                  <dt className="text-[#737373]">{kind === 'race' ? 'Race' : 'Long run'}</dt>
                  <dd className="font-semibold text-[#b91c1c] tabular-nums">{km} km</dd>
                </dl>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="text-[17px] leading-relaxed text-[#404040]">
              <h3 className="text-xl font-semibold text-[#0a0a0a]">How fast is “easy”?</h3>
              <p className="mt-2">
                Easy means you can talk in full sentences. For most beginners it feels slow, and that is the point: easy runs build
                the base that carries you through 21 km. About four out of every five kilometres in this plan should feel easy.
              </p>
            </div>
            <div className="text-[17px] leading-relaxed text-[#404040]">
              <h3 className="text-xl font-semibold text-[#0a0a0a]">The quality session</h3>
              <p className="mt-2">
                Once a week, run some parts faster: short repeats or a steady “comfortably hard” tempo. Always warm up with 10
                minutes of easy running first. Not sure what your goal race pace is? Work it out with the{' '}
                <A href="/running-pace-calculator">running pace calculator</A>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fuel + strength */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <Kicker>Fuel and water</Kicker>
        <h2 className={h2}>Half marathon for beginners: eating and drinking</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <ul className="flex flex-col gap-3 text-[17px] leading-relaxed text-[#404040]">
            {[
              'Runs under an hour usually need nothing more than water before and after.',
              'On long runs past about 60–75 minutes, carry water and try a gel, a banana or a few dates.',
              'Drink to thirst, sip regularly, and add electrolytes (or ORS) if you sweat a lot.',
              'Eat a familiar, light breakfast 2–3 hours before long runs and the race.',
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-[#dc2626]" />
                {t}
              </li>
            ))}
          </ul>
          <div className="rounded-3xl bg-[#0b0a1f] p-6 text-white sm:p-8">
            <h3 className="text-xl font-semibold">Training in Indian weather</h3>
            <p className="mt-2 leading-relaxed text-white/75">
              Long runs in heat and humidity feel much harder. Start early, slow down on hot days and carry more water. Read our
              guide to <Link href="/running-in-hot-weather" className="font-medium text-[#fca5a5] underline underline-offset-4">running in hot weather</Link>{' '}
              before your long runs get long. Two short strength sessions a week also help; see{' '}
              <Link href="/strength-training-for-runners" className="font-medium text-[#fca5a5] underline underline-offset-4">
                strength training for runners
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Race day: dark band */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#fca5a5] uppercase">Race day</p>
          <h2 className={h2}>Four race-day tips for your first 21K</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2">
            {RACE_DAY.map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <span className="text-4xl leading-none font-black text-[#ef4444] tabular-nums">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{t}</h3>
                  <p className="mt-1 leading-relaxed text-white/70">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How to log in RepUp */}
      <section className="border-b border-[#f1f1f1] bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
          <PhoneMock screen="run-summary" theme="light" className="rotate-2" />
          <div>
            <Kicker>Your training log</Kicker>
            <h2 className={h2}>How to log your half marathon training in RepUp</h2>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-[#525252]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[17px] leading-relaxed text-[#404040]">
              Free, no ads, and the same account as your gym log, so leg day and long runs sit side by side. RepUp has no
              built-in plans: this page is your guide, RepUp is your diary.
            </p>
            <Link
              href={SIGNUP_HREF}
              className="mt-6 inline-block rounded-xl bg-[#7c3aed] px-6 py-3.5 font-semibold text-white hover:bg-[#6d28d9]"
            >
              Start your 12 weeks
            </Link>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Half marathon questions" />

      <CtaBand
        title="Twelve weeks. One bib. Every kilometre logged."
        body="Free running and gym tracker. Splits for every km, weekly kilometres and your longest run in one place."
        cta="Start logging free"
      />
    </LandingShell>
  );
}
