import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { A, Callout, CtaBand, DataTable, FaqSection, LandingShell } from '@/components/site/kit';
import { breadcrumbLd, faqLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';
import { NUTRIENTS } from '@/lib/food/core';
import { amountFor, calorieSplit, FOOD_PAGES, foodPage, mainServing, relatedPages, servingLabel, type FoodPage } from '@/lib/food/pages';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * /calories/[food]: one page per food in RepUp's hand-checked list
 * ("calories in 1 roti", "paneer protein per 100 g"…). Generated at build
 * time from src/lib/food/foods.ts + curated-micro.json; unknown names 404.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return FOOD_PAGES.map((p) => ({ food: p.slug }));
}

const fmt = (n: number) => (n >= 100 ? Math.round(n).toLocaleString('en-IN') : String(Math.round(n * 10) / 10));
const kcal = (n: number) => Math.round(n).toLocaleString('en-IN');
const path = (p: FoodPage) => `/calories/${p.slug}`;
/** "Roti / chapati (plain)" → "roti / chapati (plain)" inside a sentence, keeping words like "Maggi". */
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export async function generateMetadata({ params }: { params: Promise<{ food: string }> }): Promise<Metadata> {
  const p = foodPage((await params).food);
  if (!p) return {};
  const s = mainServing(p);
  const a = amountFor(p, s.grams);
  // "1 roti", "10 almonds", "100 g"
  const per = !p.food.servings.length ? (p.food.liquid ? '100 ml' : '100 g') : /^[\d½]/.test(s.label) ? s.label : `1 ${s.label}`;
  // Keep titles under ~65 characters (Google cuts longer ones): drop the extras when the name is long.
  const full = `${p.name} Calories: ${kcal(a.kcal)} kcal in ${per} | Protein & Carbs`;
  const title = full.length <= 65 ? full : `${p.name} Calories: ${kcal(a.kcal)} kcal in ${per}`;
  return landingMetadata({
    path: path(p),
    title: title.length <= 70 ? title : `${p.name}: ${kcal(a.kcal)} kcal in ${per}`,
    description: `${servingLabel(s, p.food.liquid)} of ${lower(p.name)} has about ${kcal(a.kcal)} kcal, ${fmt(a.protein)} g protein, ${fmt(a.carbs)} g carbs and ${fmt(a.fat)} g fat. Per 100 ${p.food.liquid ? 'ml' : 'g'}: ${kcal(p.food.per100.kcal)} kcal. Full nutrition and a free calorie counter.`,
    keywords: [
      `${lower(p.name)} calories`,
      `calories in ${lower(p.name)}`,
      `${lower(p.name)} protein`,
      ...p.aliases.slice(0, 4).map((x) => `${x} calories`),
      'Indian food calories',
    ],
  });
}

export default async function FoodCaloriesPage({ params }: { params: Promise<{ food: string }> }) {
  const p = foodPage((await params).food);
  if (!p) notFound();
  const unit = p.food.liquid ? 'ml' : 'g';
  const s = mainServing(p);
  const a = amountFor(p, s.grams);
  const per100 = amountFor(p, 100);
  const split = calorieSplit(per100);
  const related = relatedPages(p);
  const servingRows = [...p.food.servings, { label: `100 ${unit}`, grams: 100 }];
  const micro = NUTRIENTS.filter((n) => p.food.micro?.[n.key] !== undefined);
  const twoOf = p.food.servings[0];

  const faqs: Faq[] = [
    {
      q: `How many calories are in ${servingLabel(s, p.food.liquid).replace(/^1 /, 'one ')} of ${lower(p.name)}?`,
      a: `About ${kcal(a.kcal)} kcal, with ${fmt(a.protein)} g protein, ${fmt(a.carbs)} g carbs and ${fmt(a.fat)} g fat.${p.food.approx ? ' Home-made versions vary with the recipe and the oil or ghee used.' : ''}`,
    },
    {
      q: `How much protein is in ${lower(p.name)}?`,
      a: `${fmt(per100.protein)} g of protein per 100 ${unit}${twoOf ? `, or ${fmt(amountFor(p, twoOf.grams).protein)} g in ${servingLabel(twoOf, p.food.liquid)}` : ''}. Protein gives ${split.protein}% of its calories.`,
    },
    ...(twoOf && !/^[\d½]/.test(twoOf.label)
      ? [
          {
            q: `How many calories are in 2 ${twoOf.label}?`,
            a: `About ${kcal(amountFor(p, twoOf.grams * 2).kcal)} kcal (${twoOf.grams * 2} ${unit}).`,
          },
        ]
      : []),
    ...(p.food.approx
      ? [
          {
            q: `Why do calories in home-made ${lower(p.name)} change?`,
            a: `Every kitchen uses a different amount of oil or ghee and different ingredients. These numbers are for a typical home recipe. In RepUp you can pick less, normal or extra oil${p.food.oil ? '' : ' for curries and sabzi'}, and change the amount in grams.`,
          },
        ]
      : []),
  ];

  return (
    <LandingShell
      path={path(p)}
      jsonLd={[
        faqLd(faqs),
        {
          ...breadcrumbLd(path(p), p.name),
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Calories in Indian food', item: `${SITE_URL}/calories` },
            { '@type': 'ListItem', position: 3, name: p.name, item: `${SITE_URL}${path(p)}` },
          ],
        },
      ]}
    >
      <div className="border-b border-[#e5e5e5] bg-white">
        <SiteNav loginClass="text-[#404040] hover:text-[#0a0a0a]" ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]" />
      </div>

      <article className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 md:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-[#737373]">
          <Link href="/" className="hover:underline">
            RepUp
          </Link>{' '}
          ›{' '}
          <Link href="/calories" className="hover:underline">
            Calories in Indian food
          </Link>{' '}
          › <span className="text-[#404040]">{p.name}</span>
        </nav>

        <header className="flex flex-col gap-5">
          <p className="text-sm font-semibold tracking-wide text-[#7c3aed] uppercase">{p.category}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Calories in {lower(p.name)}</h1>
          {p.aliases.length > 0 && <p className="-mt-2 text-[#737373]">Also called {p.aliases.slice(0, 5).join(', ')}.</p>}

          <div className="flex flex-col gap-4 rounded-3xl bg-[#0b0a1f] p-6 text-white sm:p-8">
            <p className="text-white/70">{servingLabel(s, p.food.liquid)}</p>
            <p className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
              {kcal(a.kcal)} <span className="text-2xl font-medium text-white/70">kcal</span>
            </p>
            <dl className="grid grid-cols-3 gap-3 text-center">
              {(
                [
                  ['Protein', a.protein],
                  ['Carbs', a.carbs],
                  ['Fat', a.fat],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/10 px-2 py-3">
                  <dd className="text-xl font-semibold tabular-nums">{fmt(v)} g</dd>
                  <dt className="text-xs text-white/60">{k}</dt>
                </div>
              ))}
            </dl>
            <p className="text-sm text-white/70">
              Per 100 {unit}: {kcal(per100.kcal)} kcal · {fmt(per100.protein)} g protein · {fmt(per100.carbs)} g carbs · {fmt(per100.fat)} g fat.{' '}
              {p.food.approx ? 'Typical home recipe: real values change with oil and ingredients.' : 'Lab values (IFCT / USDA).'}
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Calories by serving</h2>
          <DataTable
            minWidth={460}
            head={['Serving', 'kcal', 'Protein', 'Carbs', 'Fat']}
            highlight={1}
            rows={servingRows.map((x) => {
              const v = amountFor(p, x.grams);
              return [x.grams === 100 && x.label === `100 ${unit}` ? `100 ${unit}` : servingLabel(x, p.food.liquid), kcal(v.kcal), `${fmt(v.protein)} g`, `${fmt(v.carbs)} g`, `${fmt(v.fat)} g`];
            })}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Where the calories come from</h2>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#ededed]" aria-hidden>
            <span className="bg-[#7c3aed]" style={{ width: `${split.protein}%` }} />
            <span className="bg-[#10b981]" style={{ width: `${split.carbs}%` }} />
            <span className="bg-[#f59e0b]" style={{ width: `${split.fat}%` }} />
          </div>
          <p className="text-[17px] leading-relaxed text-[#404040]">
            <b className="text-[#7c3aed]">{split.protein}% protein</b>, <b className="text-[#047857]">{split.carbs}% carbs</b> and{' '}
            <b className="text-[#b45309]">{split.fat}% fat</b>.{' '}
            {split.protein >= 30
              ? 'A high-protein food: useful if you’re trying to eat more protein.'
              : split.fat >= 50
                ? 'Most of its calories come from fat, so small amounts add up quickly.'
                : split.carbs >= 60
                  ? 'Mostly carbohydrate: your main energy food.'
                  : 'A mix of all three.'}
          </p>
        </section>

        {micro.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Other nutrients</h2>
            <DataTable
              minWidth={420}
              head={['Nutrient', servingLabel(s, p.food.liquid), `100 ${unit}`, '% Daily Value']}
              rows={micro.map((n) => {
                const one = a.micro?.[n.key] ?? 0;
                const hundred = p.food.micro![n.key]!;
                return [n.label, `${fmt(one)} ${n.unit}`, `${fmt(hundred)} ${n.unit}`, n.dv ? `${Math.round((one / n.dv) * 100)}%` : '–'];
              })}
              caption="% Daily Value for one serving (US FDA, 2,000 kcal diet). Sources: USDA FoodData Central and the Indian Nutrient Databank."
            />
          </section>
        )}

        <Callout title={`Track ${lower(p.name)} in RepUp, free`}>
          Search “{p.aliases[0] ?? lower(p.name)}”, pick {p.food.servings[0] ? `${p.food.servings[0].label}, ` : ''}grams or any amount, and RepUp adds
          the calories, protein, carbs and fat to your day.{p.food.oil ? ' Set the oil to less, normal or extra.' : ''}{' '}
          <A href={SIGNUP_HREF}>Start free →</A>
        </Callout>

        {related.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Similar foods</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {related.map((r) => {
                const rs = mainServing(r);
                return (
                  <li key={r.slug}>
                    <Link
                      href={path(r)}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#e5e5e5] bg-white px-4 py-3 hover:border-[#7c3aed]/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.name}</span>
                        <span className="block text-xs text-[#737373]">{servingLabel(rs, r.food.liquid)}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{kcal(amountFor(r, rs.grams).kcal)} kcal</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-sm">
              <A href="/calories">All {FOOD_PAGES.length} foods: Indian food calorie chart →</A>
            </p>
          </section>
        )}
      </article>

      <FaqSection faqs={faqs} title={`${p.name}: questions`} />
      <CtaBand title="Count calories the easy way." body="Indian food, packets by barcode, protein and macros. Free, no ads." cta="Start counting free" />
    </LandingShell>
  );
}
