import { A, CtaBand, DataTable, FaqSection, Hero, Hl, LandingShell, ShortAnswer, Split, Steps } from '@/components/site/kit';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { FOOD_PAGES } from '@/lib/food/pages';

/**
 * /calorie-counter-app: RepUp's food mode. Only claims from FOOD_FACTS
 * (src/lib/site.ts). Main keywords: calorie counter app India, Indian food
 * calorie tracker, free calorie counter, protein tracker app, macro tracker,
 * barcode calorie scanner.
 */

const PATH = '/calorie-counter-app';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Free Calorie Counter App for Indian Food: Protein & Macros | RepUp',
  description:
    'Count calories in roti, dal, sabzi and paneer in katori or roti sizes, scan packets by barcode and track protein, carbs and fat. Free, no ads, Android and iPhone.',
  keywords: [
    'calorie counter app India',
    'Indian food calorie tracker',
    'free calorie counter',
    'protein tracker app',
    'macro tracker app',
    'barcode calorie scanner',
    'diet tracker app India',
  ],
});

const FAQS: Faq[] = [
  {
    q: 'Is RepUp’s calorie counter free?',
    a: 'Yes. Food mode is free with no ads: the food diary, barcode scanning, the calorie calculator and all nutrients. You only need an email or Google account.',
  },
  {
    q: 'Does it have Indian food?',
    a: 'Yes: about 1,000 foods are built in, from roti, dal, rice, sabzi and paneer to idli, poha, samosa and sweets, in katori, roti or piece sizes, and you can search by Hindi names like dahi, kela or anda. More foods come from USDA, and packets by barcode.',
  },
  {
    q: 'How accurate is it for home-cooked food?',
    a: 'Raw foods and packets are lab or label values. Home-cooked dishes are typical recipes and are marked “~”: the real number changes with oil and ingredients, so RepUp lets you pick less, normal or extra oil and change the amount in grams.',
  },
  {
    q: 'Can I set my own calorie and macro target?',
    a: 'Yes. Either let RepUp work it out from your age, height, weight and activity (lose fat, stay the same or build muscle), or type your calories and choose the protein, carbs and fat split in %. Grams are worked out for you.',
  },
  {
    q: 'Can I scan a barcode?',
    a: 'Yes, with the phone camera, or by typing the numbers. Packets come from Open Food Facts and the RepUp food list. A packet that isn’t known yet can be added from its label once, and then it scans for everyone.',
  },
];

const STEPS = [
  { title: 'Get your daily target', body: 'Answer four questions, or type your own calories and protein / carbs / fat split.' },
  { title: 'Log what you eat', body: 'Search roti, dal, paneer… pick katori, roti or grams. Scan packets by barcode.' },
  { title: 'See what’s left', body: 'Calories and protein left for the day, fibre, iron and vitamins, your week and your weight.' },
];

export default function CalorieCounterPage() {
  return (
    <LandingShell
      path={PATH}
      jsonLd={[
        appLd('Free calorie counter with Indian food: log meals in katori or roti sizes, scan barcodes, track protein, carbs and fat.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Calorie counter app'),
        howToLd('How to count calories with RepUp', STEPS.map((s) => ({ name: s.title, text: s.body }))),
      ]}
    >
      <Hero
        kicker="Free calorie counter · Indian food · no ads"
        title={
          <>
            Count calories in <Hl>roti, dal and paneer</Hl>, not just salads.
          </>
        }
        intro="RepUp’s food diary knows Indian food in katori, roti and piece sizes, scans packets by barcode and shows the protein, carbs and fat left for your day."
        cta="Start counting free"
        secondary={{ href: '#how', label: 'How it works' }}
        bullets={['~1,000 foods built in', 'Barcode scan', 'Protein & macros', 'Android & iPhone']}
        mock={<PhoneMock screen="food" />}
      />

      <ShortAnswer label="What is it?">
        A free calorie counter inside RepUp (Food mode). Set a daily target, log each meal by searching the food and choosing a katori,
        a roti or grams, and see calories and protein left for the day. Curious about one food first? Look it up in the{' '}
        <A href="/calories">Indian food calorie chart</A> ({FOOD_PAGES.length} foods).
      </ShortAnswer>

      <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 pb-20 sm:px-6">
        <h2 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">How to count calories with RepUp</h2>
        <Steps steps={STEPS} />
      </section>

      <Split title="Made for how India eats." mock={<PhoneMock screen="food" theme="light" />}>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {[
            ['Indian servings', '1 katori dal, 2 roti, 1 plate poha: or type the grams.'],
            ['Oil and ghee', 'Home food: pick less, normal or extra oil.'],
            ['Hindi names', 'Search dahi, kela, anda, chawal and more.'],
            ['Barcode scan', 'Packets in a second; add a new one from its label once.'],
            ['Every nutrient', 'Tap your day for fibre, sodium, iron, vitamins and % daily value.'],
            ['Same as yesterday', 'Copy a meal in one tap. Water glasses too.'],
          ].map(([t, d]) => (
            <li key={t}>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#525252]">{d}</p>
            </li>
          ))}
        </ul>
      </Split>

      <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">A day in RepUp</h2>
        <DataTable
          head={['Meal', 'What', 'kcal', 'Protein']}
          highlight={2}
          rows={[
            ['Breakfast', 'Poha (1 plate) + chai', '381', '8.5 g'],
            ['Lunch', '2 roti, dal tadka, 100 g paneer', '664', '34.3 g'],
            ['Snack', '1 banana + 10 almonds', '158', '3.6 g'],
            ['Dinner', 'Rice (1 katori) + chicken curry (1 katori)', '419', '23.6 g'],
            ['Total', 'vs a 1,800 kcal target', '1,622', '70 g'],
          ]}
          caption="Example day with RepUp’s own food values. Your target comes from the calorie calculator."
        />
        <p className="mt-6 text-[#525252]">
          Not sure what your target should be? Try the free <A href="/calorie-calculator">calorie calculator</A>.
        </p>
      </section>

      <FaqSection faqs={FAQS} />
      <CtaBand title="Your first meal takes a minute to log." body="Free. No ads. Gym and running tracking in the same app." cta="Start counting free" />
    </LandingShell>
  );
}
