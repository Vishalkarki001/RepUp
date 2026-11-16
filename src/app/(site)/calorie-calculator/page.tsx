import { A, CtaBand, DataTable, FaqSection, LandingShell, Prose, Section } from '@/components/site/kit';
import { CalorieCalculatorTool } from '@/components/site/CalorieCalculatorTool';
import { breadcrumbLd, faqLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SiteNav } from '@/components/site/SiteChrome';
import { ACTIVITY } from '@/lib/food/core';

/**
 * /calorie-calculator: free daily calorie (TDEE) and macro calculator, the
 * same Mifflin–St Jeor maths as the app's "Know your calories". Main keywords:
 * calorie calculator, maintenance calories calculator, TDEE calculator India,
 * calories to lose weight, macro calculator.
 */

const PATH = '/calorie-calculator';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Calorie Calculator: Maintenance, Fat Loss & Muscle Gain | RepUp',
  description:
    'Free calorie calculator: how many calories you burn a day, and how much to eat to lose fat or build muscle, with protein, carbs and fat in grams. Mifflin–St Jeor formula.',
  keywords: ['calorie calculator', 'maintenance calories calculator', 'TDEE calculator', 'calories to lose weight', 'macro calculator', 'how many calories should I eat'],
});

const FAQS: Faq[] = [
  {
    q: 'How many calories should I eat to lose weight?',
    a: 'About 500 kcal less than your maintenance calories, which loses roughly half a kilo a week. The calculator never goes below the calories your body burns at rest, and not below 1,200 (women) or 1,500 (men), because eating less than that makes it hard to keep muscle and energy.',
  },
  {
    q: 'How much protein do I need?',
    a: 'This calculator uses 1.6 g of protein per kg of body weight, or 2 g per kg while losing fat to help keep muscle. For a 70 kg person that is 112–140 g a day.',
  },
  {
    q: 'How accurate is it?',
    a: 'Mifflin–St Jeor is the most accurate simple formula for most adults, usually within about 10%. Treat the number as a starting point: weigh yourself every week and if your weight doesn’t move the way you want after 2–3 weeks, change the target by 100–200 kcal.',
  },
  {
    q: 'Is this for everyone?',
    a: 'It’s for healthy adults. It isn’t meant for pregnancy, breastfeeding, children or medical diets: ask a doctor or dietitian for those.',
  },
];

export default function CalorieCalculatorPage() {
  return (
    <LandingShell path={PATH} jsonLd={[faqLd(FAQS), breadcrumbLd(PATH, 'Calorie calculator')]}>
      <div className="border-b border-[#e5e5e5] bg-white">
        <SiteNav loginClass="text-[#404040] hover:text-[#0a0a0a]" ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]" />
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 md:py-14">
        <p className="text-sm font-semibold tracking-wide text-[#7c3aed] uppercase">Free tool</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">How many calories do you need?</h1>
        <p className="text-lg leading-relaxed text-[#525252]">
          Enter your age, height, weight and how active you are. You’ll see the calories you burn in a day, and how much to eat to lose
          fat or build muscle, with protein, carbs and fat in grams.
        </p>
        <CalorieCalculatorTool />
      </section>

      <Section tone="white" width="narrow" title="How it works">
        <Prose>
          <p>
            <b>1. Calories at rest.</b> The Mifflin–St Jeor formula estimates what your body burns doing nothing: 10 × weight (kg) +
            6.25 × height (cm) − 5 × age, plus 5 for men or minus 161 for women.
          </p>
          <p>
            <b>2. Your day.</b> That number is multiplied by how active you are (below), which gives your maintenance calories: eat this
            much and your weight stays the same.
          </p>
          <p>
            <b>3. Your goal.</b> To lose fat, eat about 500 kcal less (roughly ½ kg a week). To build muscle with little fat, eat about
            300 kcal more and train with weights.
          </p>
          <p>
            <b>4. Macros.</b> Protein 1.6 g per kg (2 g per kg while losing fat), fat 25% of calories, and carbs make up the rest.
          </p>
        </Prose>
        <div className="mt-8">
          <DataTable
            minWidth={420}
            head={['How active you are', 'Example', '× resting calories']}
            rows={ACTIVITY.map((a) => [a.label, a.hint, `× ${a.factor}`])}
          />
        </div>
      </Section>

      <Section width="narrow" title="Then: actually hit the number">
        <Prose>
          <p>
            Knowing your calories is the easy part. RepUp’s free calorie counter has Indian food built in (roti, dal, sabzi, paneer…),
            reads packet barcodes and shows protein, carbs and fat left for the day. See the{' '}
            <A href="/calories">Indian food calorie chart</A> or the <A href="/calorie-counter-app">calorie counter app</A>.
          </p>
        </Prose>
      </Section>

      <FaqSection faqs={FAQS} />
      <CtaBand title="Turn your number into a daily target." body="Free calorie counter with Indian food. No ads." cta="Start counting free" />
    </LandingShell>
  );
}
