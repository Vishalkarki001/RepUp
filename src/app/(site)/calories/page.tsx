import Link from 'next/link';
import { A, CtaBand, FaqSection, Hero, LandingShell, ShortAnswer } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { breadcrumbLd, faqLd, landingMetadata, type Faq } from '@/components/site/seo';
import { amountFor, CATEGORIES, FOOD_PAGES, mainServing, servingLabel } from '@/lib/food/pages';

/**
 * /calories: the Indian food calorie chart. Every food in RepUp's hand-checked
 * list, by group, linking to its own page. Main keywords: Indian food calorie
 * chart, calories in Indian food, food calorie list.
 */

const PATH = '/calories';
const count = FOOD_PAGES.length;

export const metadata = landingMetadata({
  path: PATH,
  title: `Indian Food Calorie Chart: ${count} Foods per Serving | RepUp`,
  description: `Calories, protein, carbs and fat for ${count} Indian and everyday foods: roti, rice, dal, sabzi, paneer, eggs, fruits, snacks and sweets, per katori, roti or piece.`,
  keywords: ['Indian food calorie chart', 'calories in Indian food', 'food calorie list', 'roti calories', 'dal calories', 'protein in Indian food'],
});

const FAQS: Faq[] = [
  {
    q: 'How accurate are these calories?',
    a: 'Raw foods, fruits, milk, eggs and packaged basics follow lab values from the Indian Food Composition Tables (IFCT 2017) and USDA. Home-cooked dishes are typical recipes: the real number changes with the oil, ghee and portion, usually by 10–20%.',
  },
  {
    q: 'What is a katori in grams?',
    a: 'In this chart a katori of dal, sabzi or curry is 150 g, a plate of rice is 250 g and a medium roti is 40 g. You can always log the exact grams in RepUp instead.',
  },
  {
    q: 'How do I count calories in Indian food every day?',
    a: 'Log each meal as you eat it: search the food, pick the serving (katori, roti, piece) or type grams. RepUp adds up calories, protein, carbs and fat against your daily target, free.',
  },
];

export default function CaloriesIndexPage() {
  return (
    <LandingShell path={PATH} jsonLd={[faqLd(FAQS), breadcrumbLd(PATH, 'Calories in Indian food')]}>
      <Hero
        variant="light"
        kicker={`${count} foods · per serving and per 100 g`}
        title={<>Indian food calorie chart</>}
        intro="Calories, protein, carbs and fat for the foods you actually eat: roti, rice, dal, sabzi, paneer, eggs, fruits, snacks and sweets, in katori, roti or piece sizes."
        cta="Count calories free"
        secondary={{ href: '#chart', label: 'See the chart' }}
        bullets={['Lab values for raw foods', 'Typical home recipes', 'Hindi names too']}
        mock={<PhoneMock screen="food" />}
      />

      <ShortAnswer label="Quick answer">
        A medium roti is about 106 kcal, a katori of cooked rice 195 kcal, a katori of dal tadka 188 kcal and 100 g of paneer
        265 kcal. Tap any food below for every serving size, protein, fibre and more, or{' '}
        <A href="/calorie-calculator">work out how many calories you need</A>.
      </ShortAnswer>

      <section id="chart" className="mx-auto flex w-full max-w-4xl scroll-mt-8 flex-col gap-10 px-4 pb-20 sm:px-6">
        <nav aria-label="Food groups" className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <a key={c} href={`#${c.toLowerCase().replace(/[^a-z]+/g, '-')}`} className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm hover:border-[#7c3aed]/40">
              {c}
            </a>
          ))}
        </nav>
        {CATEGORIES.map((c) => (
          <section key={c} id={c.toLowerCase().replace(/[^a-z]+/g, '-')} className="scroll-mt-8">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">{c}</h2>
            <div className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white">
              <ul className="divide-y divide-[#ededed]">
                {FOOD_PAGES.filter((p) => p.category === c).map((p) => {
                  const s = mainServing(p);
                  const v = amountFor(p, s.grams);
                  return (
                    <li key={p.slug}>
                      <Link href={`/calories/${p.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa]">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="block truncate text-xs text-[#737373]">
                            {servingLabel(s, p.food.liquid)} · {Math.round(v.protein * 10) / 10} g protein
                          </span>
                        </span>
                        <span className="shrink-0 text-right font-semibold tabular-nums">
                          {Math.round(v.kcal).toLocaleString('en-IN')} <span className="text-xs font-normal text-[#737373]">kcal</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}
      </section>

      <FaqSection faqs={FAQS} />
      <CtaBand title="Know what you eat, every day." body="Indian food, packets by barcode, protein and macros. Free, no ads." cta="Start counting free" />
    </LandingShell>
  );
}
