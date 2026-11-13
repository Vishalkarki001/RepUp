import Link from 'next/link';
import { A, CtaBand, FaqSection, LandingShell } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';

/**
 * /run-after-leg-day. Archetype "Q&A card": a warm cream page whose hero is
 * one big question card ("Should I run after leg day?") with three answer
 * chips around the H1. Accent: warm brown / amber #b45309 on cream #fffbeb.
 * Main keywords: running after leg day, should I run after leg day, leg day
 * and running same day, sore legs running.
 */

const PATH = '/run-after-leg-day';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Running After Leg Day: Should You Run on Sore Legs? | RepUp',
  description:
    'Should I run after leg day? Easy runs are usually fine; wait 24–48 hours for hard ones. Simple guide to sore legs, running and a sample weekly order.',
  keywords: [
    'running after leg day',
    'should I run after leg day',
    'leg day and running same day',
    'sore legs running',
    'run the day after leg day',
    'DOMS running',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Should I run after leg day?',
    a: 'Usually yes, if the run is easy. A short, slow run the day after leg day is fine for most people and many feel looser after it. Save intervals, hill sprints and long runs until the soreness has mostly gone, often 24–48 hours later.',
  },
  {
    q: 'Is it OK to run with sore legs?',
    a: 'Normal muscle soreness after training (often called DOMS) is not a reason to stop moving. Run easy and shorter. Sharp pain, pain in one spot, swelling or pain that makes you limp is different: stop, rest, and see a doctor if it does not settle.',
  },
  {
    q: 'How long should I wait after leg day before a hard run?',
    a: 'A common guide is 24–48 hours, or until your legs feel mostly normal again. That is why many people put leg day early in the week and the hard run two or three days later.',
  },
  {
    q: 'Can I do leg day and running on the same day?',
    a: 'Yes. An easy run before or after leg day is fine. If you want a hard run and heavy legs on the same day, split them by several hours and do the more important one first. Most people find separate days easier.',
  },
  {
    q: 'Will running after leg day ruin my gains?',
    a: 'Not easy running. Light running does not undo a leg session. What can slow progress is lots of hard running with little rest, so keep most runs easy and eat and sleep well.',
  },
  {
    q: 'Can I see my leg days and runs in one place in RepUp?',
    a: 'Yes. Your leg day sits in your weekly plan in Workout mode, and your runs show in the Running mode week view. Both are in the same free account; switch modes from the account menu.',
  },
];

const ANSWERS = [
  { icon: '✓', t: 'Yes, easy', d: 'Slow, short, chatty pace' },
  { icon: '⏱', t: 'Wait 24–48 h for hard runs', d: 'Intervals, hills, long runs' },
  { icon: '◎', t: 'Listen to soreness', d: 'Stiff is OK, sharp pain is not' },
];

const CHECK = [
  {
    level: 'A bit stiff',
    tone: 'bg-[#fef3c7] text-[#78350f] border-[#fcd34d]',
    run: 'Easy run is fine',
    d: 'Stairs feel a little odd, but you walk normally. Go for an easy 20–30 minute run. Legs often loosen up after the first km.',
  },
  {
    level: 'Properly sore',
    tone: 'bg-[#fde68a] text-[#78350f] border-[#f59e0b]',
    run: 'Short and slow, or walk',
    d: 'Sitting down hurts and legs feel heavy. Do a short easy run, run-walk, or a brisk walk. Move the hard run to later in the week.',
  },
  {
    level: 'Sharp or one-spot pain',
    tone: 'bg-[#78350f] text-white border-[#78350f]',
    run: 'Don’t run today',
    d: 'Sharp pain, swelling, or pain that makes you limp is not normal soreness. Rest, and check with a doctor if it does not get better.',
  },
];

const WEEK: [string, string, string][] = [
  ['Mon', 'Leg day', 'Squats, lunges, Romanian deadlift'],
  ['Tue', 'Easy run', '20–30 min, slow. Fine on sore legs'],
  ['Wed', 'Upper body', 'Legs keep recovering'],
  ['Thu', 'Hard run', 'Intervals or tempo, ~72 h after legs'],
  ['Fri', 'Rest', 'Walk or stretch'],
  ['Sat', 'Long easy run', 'Easy pace, the week’s longest'],
  ['Sun', 'Rest', 'Or a short easy walk'],
];

const STEPS = [
  { name: 'Put leg day in your plan', text: 'In Workout mode, add your leg exercises with sets × reps to the day you train legs, for example Monday.' },
  { name: 'Log the leg session', text: 'Log kg and reps for each set. Next week RepUp shows what you lifted and a target for today.' },
  { name: 'Switch to Running mode', text: 'Open the account menu and tap Running mode. Start an easy run the next day and keep the screen on and RepUp open.' },
  { name: 'Check the week view', text: 'Tap a day in the Running mode week to see its runs, and look back at your leg day in workout history.' },
];

const h2 = 'text-3xl font-semibold tracking-tight text-balance text-[#1c1917] sm:text-4xl';
const kick = 'mb-3 text-sm font-semibold tracking-wide text-[#b45309] uppercase';

export default function RunAfterLegDayPage() {
  return (
    <LandingShell
      path={PATH}
      className="bg-[#fffbeb]"
      jsonLd={[
        appLd('Free gym and running tracker: log leg day as sets, reps and kg, track runs with GPS, and see both in the same account.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Running after leg day'),
        howToLd('How to see leg days and runs in the same week in RepUp', STEPS),
      ]}
    >
      {/* Hero: Q&A card */}
      <section className="relative overflow-hidden bg-[#fffbeb]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 50% 60%, rgba(245,158,11,0.18), transparent 70%)' }}
        />
        <SiteNav
          className="relative"
          upClass="text-[#b45309]"
          loginClass="text-[#44403c] hover:text-[#1c1917]"
          ctaClass="bg-[#1c1917] text-white hover:bg-[#292524]"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-8 pb-16 text-center sm:px-6 md:pt-12 md:pb-20">
          <p className="text-sm font-semibold tracking-wide text-[#b45309] uppercase">Sore legs, running and recovery</p>
          <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-balance text-[#1c1917] sm:text-4xl md:text-5xl">
            Running after leg day: when it helps and when to wait
          </h1>

          <div className="relative mt-10 w-full max-w-3xl rounded-[2rem] border-2 border-[#b45309] bg-white p-6 text-left shadow-[8px_8px_0_0_#b45309] sm:p-10">
            <span className="absolute -top-5 left-6 flex size-10 items-center justify-center rounded-full bg-[#b45309] text-lg font-bold text-white sm:left-10">
              Q
            </span>
            <p className="text-4xl leading-[1.05] font-bold tracking-tight text-[#1c1917] sm:text-6xl">
              Should I run after <span className="bg-[linear-gradient(transparent_60%,#fcd34d_60%)] whitespace-nowrap">leg day?</span>
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {ANSWERS.map((a) => (
                <li key={a.t} className="flex gap-3 rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                  <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#b45309] text-sm font-bold text-white">
                    {a.icon}
                  </span>
                  <span>
                    <span className="block leading-snug font-semibold text-[#1c1917]">{a.t}</span>
                    <span className="mt-0.5 block text-sm text-[#57534e]">{a.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[#57534e]">
            Easy runs on sore legs are usually fine. Hard runs can wait a day or two. Here is how to tell the difference, and a
            simple weekly order for leg day and running.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Track legs and runs free
            </Link>
            <a href="#week" className="rounded-xl border-2 border-[#b45309] bg-white px-6 py-3 text-base font-semibold text-[#1c1917] hover:bg-[#fef3c7]">
              See the weekly order
            </a>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="border-y border-[#fde68a] bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          <h2 className={kick}>Short answer</h2>
          <p className="text-xl leading-relaxed text-[#292524] sm:text-2xl">
            Yes, you can run after leg day if the run is easy: slow, fairly short, at a pace where you can talk. Normal soreness is
            fine to run on. Save intervals, hills and long runs for when your legs feel mostly normal, often 24–48 hours later.
            Sharp pain means rest.
          </p>
        </div>
      </section>

      {/* Why sore */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
          <div>
            <p className={kick}>What is going on</p>
            <h2 className={h2}>Why your legs feel worse two days later</h2>
          </div>
          <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-[#44403c]">
            <p>
              The ache after squats and lunges is usually <b className="text-[#1c1917]">delayed onset muscle soreness</b>, or DOMS.
              It often starts the next day and is commonly worst a day or two after the session. It is a normal part of training
              muscles harder than they are used to, and it fades on its own.
            </p>
            <p>
              Gentle movement does not make it worse for most people. An easy run gets blood moving, and many runners say their
              legs feel looser after the first km. The problem is hard running on tired legs: your form gets sloppy, the run feels
              awful, and you get less out of it.
            </p>
            <p>
              Soreness also gets smaller as your body gets used to leg day. If you train legs every week, the first few weeks are
              the worst. Increase your weights in small steps so you are not wrecked every time.
            </p>
          </div>
        </div>
      </section>

      {/* Soreness check */}
      <section className="bg-[#1c1917] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[#fcd34d] uppercase">Sore legs, running check</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">How sore is too sore to run?</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {CHECK.map((c, i) => (
              <li key={c.level} className={`flex flex-col gap-3 rounded-2xl border-2 p-6 ${c.tone}`}>
                <span className="text-sm font-semibold opacity-80">Level {i + 1}</span>
                <h3 className="text-2xl font-bold">{c.level}</h3>
                <p className="w-fit rounded-full bg-white/70 px-3 py-0.5 text-sm font-semibold text-[#1c1917]">{c.run}</p>
                <p className="leading-relaxed">{c.d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl leading-relaxed text-white/75">
            This is general guidance, not medical advice. If you have a past injury, joint pain or a health condition, check with a
            doctor or physiotherapist before running on sore legs.
          </p>
        </div>
      </section>

      {/* Same day */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <p className={kick}>Same day</p>
        <h2 className={h2}>Leg day and running on the same day</h2>
        <div className="mt-6 flex flex-col gap-4 text-[17px] leading-relaxed text-[#44403c]">
          <p>It is fine, as long as you choose which session gets your fresh legs:</p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              <b className="text-[#1c1917]">Easy run + leg day:</b> any order. A 10–15 minute jog is a good warm-up before squats.
            </li>
            <li>
              <b className="text-[#1c1917]">Hard run + leg day:</b> do the one that matters more first, and split them by several
              hours if you can (morning run, evening gym).
            </li>
            <li>
              <b className="text-[#1c1917]">Long run + heavy legs:</b> better on different days.
            </li>
          </ul>
          <p>
            For full weekly layouts with AM and PM slots, see the <A href="/running-and-lifting-schedule">running and lifting schedule</A>.
          </p>
        </div>
      </section>

      {/* Weekly order */}
      <section id="week" className="scroll-mt-8 border-y border-[#fde68a] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className={kick}>Sample week</p>
          <h2 className={h2}>A weekly order that keeps legs and runs happy</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#57534e]">
            The idea: leg day early, easy run the next day, the hard run a few days later, the long run at the weekend.
          </p>
          <ol className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {WEEK.map(([d, t, note]) => {
              const leg = t === 'Leg day';
              const rest = t === 'Rest';
              return (
                <li
                  key={d}
                  className={`flex flex-col gap-1 rounded-2xl p-4 lg:min-h-40 ${
                    leg ? 'bg-[#b45309] text-white' : rest ? 'border border-dashed border-[#d6d3d1] text-[#57534e]' : 'border border-[#fde68a] bg-[#fffbeb] text-[#1c1917]'
                  }`}
                >
                  <span className={`text-xs font-semibold uppercase ${leg ? 'text-white/80' : 'text-[#92400e]'}`}>{d}</span>
                  <span className="text-lg font-semibold">{t}</span>
                  <span className={`text-sm leading-snug ${leg ? 'text-white/85' : 'text-[#57534e]'}`}>{note}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-8 max-w-2xl leading-relaxed text-[#44403c]">
            Training for a race? Keep this order and use a plan like the <A href="/10k-training-plan">10K training plan</A> for the
            run days. Need leg exercises that suit runners? See <A href="/strength-training-for-runners">strength training for runners</A>.
            On a <A href="/push-pull-legs-workout-planner">push pull legs split</A>, put the hard run on push or pull day.
          </p>
        </div>
      </section>

      {/* RepUp */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
          <div className="flex justify-center">
            <PhoneMock screen="run-week" theme="light" className="-rotate-2" />
          </div>
          <div>
            <p className={kick}>In RepUp</p>
            <h2 className={h2}>See leg day and your runs in the same week</h2>
            <p className="mt-3 text-lg leading-relaxed text-[#57534e]">
              RepUp is a free gym and running tracker. Leg day goes in Workout mode, runs in Running mode, all in one account.
            </p>
            <ol className="mt-8 flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[#b45309] font-bold text-[#92400e]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#1c1917]">{s.name}</h3>
                    <p className="mt-1 leading-relaxed text-[#57534e]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Running after leg day: questions" />

      <CtaBand
        title="Log leg day. Run easy tomorrow. See both."
        body="Free, no ads. One account for your gym sets and your runs."
        cta="Track legs and runs free"
      />
    </LandingShell>
  );
}
