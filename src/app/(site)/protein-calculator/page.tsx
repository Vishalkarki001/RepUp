import { A, CtaBand, DataTable, FaqSection, LandingShell, Prose, Section } from '@/components/site/kit';
import { ProteinCalculatorTool } from '@/components/site/ProteinCalculatorTool';
import { breadcrumbLd, faqLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SiteNav } from '@/components/site/SiteChrome';
import { foodPage } from '@/lib/food/pages';
import { PROTEIN_GOALS, type ProteinFood } from '@/lib/food/protein';

/**
 * /protein-calculator: grams of protein a day from body weight and goal, and one
 * way to get there with Indian food. Protein per portion comes from RepUp's food
 * list (the same numbers as the /calories pages). Main keywords: protein
 * calculator, how much protein do I need, protein intake calculator, protein for
 * muscle gain, high protein Indian food, veg protein sources.
 */

const PATH = '/protein-calculator';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Protein Calculator: How Much Protein Do You Need? | RepUp',
  description:
    'Free protein calculator: grams of protein a day for fat loss or muscle gain from your body weight, and one way to get there with Indian food, veg or non-veg.',
  keywords: ['protein calculator', 'how much protein do I need', 'protein intake calculator', 'protein for muscle gain', 'high protein Indian food', 'veg protein sources'],
});

/** [slug, portion text, grams, veg], best everyday sources first. */
const PORTIONS: [string, string, number, boolean][] = [
  ['chicken-breast-cooked', '1 piece (120 g)', 120, false],
  ['egg-boiled', '2 eggs', 100, false],
  ['paneer', '100 g', 100, true],
  ['dal-plain-cooked', '1 katori (150 g)', 150, true],
  ['soya-chunks-dry', '1 handful dry (25 g)', 25, true],
  ['greek-yogurt-plain-low-fat', '1 cup (100 g)', 100, true],
  ['milk-toned', '1 glass (250 ml)', 250, true],
  ['whey-protein-1-scoop', '1 scoop (30 g)', 30, true],
  ['roasted-chana', '1 handful (30 g)', 30, true],
  ['fish-fry', '1 piece (80 g)', 80, false],
  ['peanuts', '1 handful (30 g)', 30, true],
  ['tofu-firm', '100 g', 100, true],
];

const FOODS: ProteinFood[] = PORTIONS.flatMap(([slug, portion, grams, veg]) => {
  const p = foodPage(slug);
  return p ? [{ slug, name: p.food.name, portion, protein: Math.round(((p.food.per100.protein * grams) / 100) * 10) / 10, veg }] : [];
});

/** Veg list: the veg foods in order. Non-veg: chicken, eggs and fish first, then the rest. */
const LISTS = {
  veg: FOODS.filter((f) => f.veg),
  nonVeg: [...FOODS.filter((f) => !f.veg), ...FOODS.filter((f) => f.veg)],
};

const FAQS: Faq[] = [
  {
    q: 'How much protein do I need a day?',
    a: 'If you lift weights to build muscle, about 1.6 g per kg of body weight is enough for most people, and up to 2.2 g per kg can still help a little. While losing fat, aim near the top so you keep your muscle. If you don’t train, about 0.8 g per kg covers your daily need.',
  },
  {
    q: 'Can vegetarians get enough protein?',
    a: 'Yes. Paneer, dal, soya chunks, curd, Greek yogurt, milk, chana and peanuts add up quickly. Soya chunks are one of the richest sources: a handful (25 g dry) has about 13 g of protein. Whey is from milk, so it’s vegetarian too.',
  },
  {
    q: 'Is too much protein harmful?',
    a: 'For healthy adults, up to about 2.2 g per kg a day is considered safe. If you have kidney disease or another medical condition, ask your doctor before eating more protein.',
  },
  {
    q: 'Do I need protein powder?',
    a: 'No. Powder is just a quick way to add 20–25 g when food falls short. If you reach your number with food, you don’t need it.',
  },
];

export default function ProteinCalculatorPage() {
  return (
    <LandingShell path={PATH} jsonLd={[faqLd(FAQS), breadcrumbLd(PATH, 'Protein calculator')]}>
      <div className="border-b border-[#e5e5e5] bg-white">
        <SiteNav loginClass="text-[#404040] hover:text-[#0a0a0a]" ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]" />
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 md:py-14">
        <p className="text-sm font-semibold tracking-wide text-[#7c3aed] uppercase">Free tool</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">How much protein do you need?</h1>
        <p className="text-lg leading-relaxed text-[#525252]">
          Enter your weight and goal. You’ll see grams of protein a day, how much in each meal, and one way to get there with Indian
          food, veg or non-veg.
        </p>
        <ProteinCalculatorTool foods={LISTS} />
      </section>

      <Section tone="white" width="narrow" title="How it works">
        <Prose>
          <p>
            Protein is counted per kg of body weight. For people who lift weights, about 1.6 g per kg is enough for most to build
            muscle, and up to 2.2 g per kg can still add a little. Eating a bit more while losing fat helps you keep muscle. If you
            don’t train, about 0.8 g per kg covers your daily need.
          </p>
        </Prose>
        <div className="mt-8">
          <DataTable
            minWidth={300}
            head={['Goal', 'Per kg', 'For 70 kg']}
            rows={PROTEIN_GOALS.map((g) => [
              g.label,
              `${g.perKg[0]}–${g.perKg[1]} g`,
              `${Math.round((70 * g.perKg[0]) / 5) * 5}–${Math.round((70 * g.perKg[1]) / 5) * 5} g`,
            ])}
          />
        </div>
      </Section>

      <Section width="narrow" title="Protein in everyday Indian food">
        <DataTable
          minWidth={300}
          head={['Food', 'Portion', 'Protein']}
          rows={[...FOODS].sort((a, b) => b.protein - a.protein).map((f) => [<A key={f.slug} href={`/calories/${f.slug}`}>{f.name}</A>, f.portion, `${f.protein} g`])}
        />
        <Prose className="mt-6">
          <p>
            Numbers come from RepUp’s food list (IFCT and USDA). See calories and protein for 230+ foods in the{' '}
            <A href="/calories">Indian food calorie chart</A>, or work out your daily calories with the{' '}
            <A href="/calorie-calculator">calorie calculator</A>.
          </p>
        </Prose>
      </Section>

      <FaqSection faqs={FAQS} />
      <CtaBand title="Hit your protein every day." body="Free calorie and protein counter with Indian food. No ads." cta="Start counting free" />
    </LandingShell>
  );
}
