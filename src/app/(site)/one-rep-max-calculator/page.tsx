import { A, CtaBand, DataTable, FaqSection, LandingShell, Prose, Section } from '@/components/site/kit';
import { OneRepMaxTool } from '@/components/site/OneRepMaxTool';
import { breadcrumbLd, faqLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SiteNav } from '@/components/site/SiteChrome';
import { repTable } from '@/lib/strength';

/**
 * /one-rep-max-calculator: free 1RM calculator (Epley + Brzycki average) with a
 * reps-to-weight table. Main keywords: 1 rep max calculator, one rep max
 * calculator, 1RM calculator, bench press max calculator, max weight calculator.
 */

const PATH = '/one-rep-max-calculator';

export const metadata = landingMetadata({
  path: PATH,
  title: '1 Rep Max Calculator (1RM): Bench, Squat, Deadlift | RepUp',
  description:
    'Free one rep max calculator: enter a set you did (weight × reps) and see your 1RM, plus how much to lift for 1 to 12 reps. Works in kg or lb.',
  keywords: ['1 rep max calculator', 'one rep max calculator', '1RM calculator', 'bench press max calculator', 'max weight calculator', 'how much can I bench'],
});

const FAQS: Faq[] = [
  {
    q: 'What is a one rep max (1RM)?',
    a: 'The heaviest weight you can lift once with good form. It’s a handy number for planning: most programs give weights as a percentage of it, like 3 sets of 8 at 75%.',
  },
  {
    q: 'Do I need to test my real max?',
    a: 'No. Testing a true max is tiring and risky without a spotter. A hard set of 2 to 10 reps gives a good estimate, usually within a few kilos, and you can do that in a normal workout.',
  },
  {
    q: 'Which formula does this use?',
    a: 'The average of the Epley and Brzycki formulas, the two most used ones. They agree closely up to about 10 reps. Above 12 reps the guess gets poor, so the calculator stops there.',
  },
  {
    q: 'Why is my real max different?',
    a: 'Everyone is a little different: some people are stronger for singles, others for higher reps. Treat the number as a starting point and update it every few weeks from your recent sets.',
  },
];

const EXAMPLE = repTable(100);

export default function OneRepMaxCalculatorPage() {
  return (
    <LandingShell path={PATH} jsonLd={[faqLd(FAQS), breadcrumbLd(PATH, '1 rep max calculator')]}>
      <div className="border-b border-[#e5e5e5] bg-white">
        <SiteNav loginClass="text-[#404040] hover:text-[#0a0a0a]" ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]" />
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 md:py-14">
        <p className="text-sm font-semibold tracking-wide text-[#7c3aed] uppercase">Free tool</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">1 rep max calculator</h1>
        <p className="text-lg leading-relaxed text-[#525252]">
          Type the weight and reps of a hard set you did, for example bench press 60 kg × 8. You’ll see your estimated one-rep max and
          how much to lift for any number of reps, without testing a real max.
        </p>
        <OneRepMaxTool />
      </section>

      <Section tone="white" width="narrow" title="How it works">
        <Prose>
          <p>
            <b>1. Your set.</b> The more reps you can do with a weight, the further it is from your max. Two well-known formulas turn a
            set into a max: Epley (weight × (1 + reps ÷ 30)) and Brzycki (weight × 36 ÷ (37 − reps)). The calculator uses the average of
            both.
          </p>
          <p>
            <b>2. Your weights.</b> The same formulas the other way round give the weight for any number of reps, rounded to 2.5 kg (or
            5 lb) so you can load it on the bar.
          </p>
          <p>
            <b>3. Your training.</b> Heavy sets of 1–5 reps build strength, 6–12 reps build muscle, and lighter sets of 15+ build
            endurance. Most gym-goers spend most of their sets in 6–12.
          </p>
        </Prose>
        <div className="mt-8">
          <DataTable
            minWidth={360}
            head={['Reps', '% of your max', 'If your max is 100 kg']}
            rows={EXAMPLE.map((r) => [String(r.reps), `${r.percent}%`, `${r.weight} kg`])}
          />
        </div>
      </Section>

      <Section width="narrow" title="Then: watch it go up">
        <Prose>
          <p>
            RepUp works out your estimated max for every exercise from the sets you log, and draws it on a chart, so you can see your
            bench, squat and deadlift getting stronger week by week. It also shows last time’s numbers next to today’s sets and suggests
            when to go up in weight. See the <A href="/progressive-overload-tracker">progressive overload tracker</A> and the{' '}
            <A href="/workout-log">workout log</A>.
          </p>
        </Prose>
      </Section>

      <FaqSection faqs={FAQS} />
      <CtaBand title="Log your sets, see your max climb." body="Free gym workout tracker. No ads." cta="Start tracking free" />
    </LandingShell>
  );
}
