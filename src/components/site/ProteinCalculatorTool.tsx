'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from 'cn';
import { PROTEIN_GOALS, proteinTarget, sampleDay, type ProteinFood, type ProteinGoal } from '@/lib/food/protein';
import { SIGNUP_HREF } from './SiteChrome';

/**
 * The protein calculator on /protein-calculator: body weight + goal → grams a day,
 * and one way to get there with Indian food (veg or non-veg). The foods and their
 * protein come from RepUp's food list (passed in by the page). Nothing is sent anywhere.
 */
const input =
  'h-12 w-full rounded-xl border border-[#d4d4d4] bg-white px-3 text-center text-lg font-semibold tabular-nums text-[#0a0a0a] outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25';
const choice = (on: boolean) => cn('rounded-xl border text-left', on ? 'border-[#7c3aed] bg-[#f5f3ff] text-[#5b21b6]' : 'border-[#d4d4d4] text-[#404040]');

export function ProteinCalculatorTool({ foods }: { foods: { veg: ProteinFood[]; nonVeg: ProteinFood[] } }) {
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<ProteinGoal>('gain');
  const [veg, setVeg] = useState(true);
  const t = proteinTarget(Number(weight), goal);
  const day = t ? sampleDay(veg ? foods.veg : foods.nonVeg, t.target, veg) : null;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-8">
      <label className="flex flex-col gap-1.5 text-sm text-[#525252]">
        Your weight (kg)
        <input className={input} inputMode="decimal" value={weight} placeholder="70" onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))} />
      </label>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-[#525252]">Your goal</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Goal">
          {PROTEIN_GOALS.map((g) => (
            <button key={g.id} type="button" role="radio" aria-checked={goal === g.id} onClick={() => setGoal(g.id)} className={cn('px-4 py-3', choice(goal === g.id))}>
              <span className="block text-base font-semibold">{g.label}</span>
              <span className="block text-xs text-[#737373]">{g.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Diet">
        {[
          [true, 'Veg'],
          [false, 'Non-veg'],
        ].map(([v, label]) => (
          <button key={String(v)} type="button" role="radio" aria-checked={veg === v} onClick={() => setVeg(v as boolean)} className={cn(choice(veg === v), 'h-12 text-center text-base font-semibold')}>
            {label as string}
          </button>
        ))}
      </div>

      {t && day ? (
        <div className="flex flex-col gap-4" aria-live="polite">
          <div className="rounded-2xl bg-[#0b0a1f] p-5 text-white">
            <p className="text-sm text-white/70">Aim for about</p>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">
              {t.target} g <span className="text-lg font-medium text-white/70">protein a day</span>
            </p>
            <p className="mt-1 text-sm text-white/70 tabular-nums">
              Anywhere from {t.low} to {t.high} g is fine · about {t.perMeal} g in each of 4 meals
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e5e5e5]">
            <p className="border-b border-[#f0f0f0] px-4 py-3 font-semibold">
              One way to get {t.target} g{' '}
              <span className="font-normal text-[#737373]">({veg ? 'veg' : 'non-veg'})</span>
            </p>
            <ul className="divide-y divide-[#f0f0f0] text-sm">
              {day.items.map(({ food, count }) => (
                <li key={food.slug} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <Link href={`/calories/${food.slug}`} className="font-medium text-[#0a0a0a] underline-offset-2 hover:underline">
                      {food.name}
                    </Link>
                    <span className="block text-xs text-[#737373]">
                      {count > 1 ? `${count} × ` : ''}
                      {food.portion}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">{Math.round(food.protein * count)} g</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 bg-[#fafafa] px-4 py-2.5 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{day.total} g</span>
              </li>
            </ul>
          </div>

          <Link href={SIGNUP_HREF} className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-center text-base font-semibold text-white hover:bg-[#6d28d9]">
            Track it free in RepUp: see protein left for the day
          </Link>
        </div>
      ) : (
        <p className="rounded-2xl bg-[#f5f5f5] p-5 text-center text-[#525252]">Type your weight to see how much protein you need.</p>
      )}
    </div>
  );
}
