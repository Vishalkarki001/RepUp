'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from 'cn';
import { ACTIVITY, goalFor, maintenance } from '@/lib/food/core';
import type { Activity, FoodProfile, Sex } from '@/lib/types';
import { SIGNUP_HREF } from './SiteChrome';

/**
 * The calorie calculator on /calorie-calculator: same maths as the app's
 * "Know your calories" (Mifflin–St Jeor, lib/food/core.ts). Works in the
 * browser, nothing is sent anywhere.
 */
const input =
  'h-12 w-full rounded-xl border border-[#d4d4d4] bg-white px-3 text-center text-lg font-semibold tabular-nums text-[#0a0a0a] outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25';

function Num({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm text-[#525252]">
      {label}
      <input className={input} inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))} />
    </label>
  );
}

export function CalorieCalculatorTool() {
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<Activity>('light');
  const a = Number(age);
  const h = Number(height);
  const w = Number(weight);
  const ok = a >= 14 && a <= 90 && h >= 120 && h <= 230 && w >= 30 && w <= 250;
  const profile: FoodProfile | null = ok ? { sex, age: a, heightCm: h, weightKg: w, activity } : null;
  const keep = profile ? Math.round(maintenance(profile) / 10) * 10 : null;
  const plans = profile
    ? ([
        ['Lose fat', 'about ½ kg a week', goalFor(profile, 'lose')],
        ['Stay the same', 'maintenance', goalFor(profile, 'maintain')],
        ['Build muscle', 'about ¼ kg a week, lean', goalFor(profile, 'gain')],
      ] as const)
    : [];

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-8">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sex">
        {(['male', 'female'] as const).map((x) => (
          <button
            key={x}
            type="button"
            role="radio"
            aria-checked={sex === x}
            onClick={() => setSex(x)}
            className={cn(
              'h-12 rounded-xl border text-base font-semibold capitalize',
              sex === x ? 'border-[#7c3aed] bg-[#f5f3ff] text-[#5b21b6]' : 'border-[#d4d4d4] text-[#404040]',
            )}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Num label="Age" value={age} onChange={setAge} placeholder="25" />
        <Num label="Height (cm)" value={height} onChange={setHeight} placeholder="170" />
        <Num label="Weight (kg)" value={weight} onChange={setWeight} placeholder="70" />
      </div>
      <p className="-mt-3 text-xs text-[#737373]">Height in feet? 5 ft = 152 cm · 5′6″ = 168 cm · 6 ft = 183 cm.</p>
      <label className="flex flex-col gap-1.5 text-sm text-[#525252]">
        How active are you?
        <select
          className="h-12 w-full rounded-xl border border-[#d4d4d4] bg-white px-3 text-base text-[#0a0a0a] outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25"
          value={activity}
          onChange={(e) => setActivity(e.target.value as Activity)}
        >
          {ACTIVITY.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}: {x.hint}
            </option>
          ))}
        </select>
      </label>

      {profile && keep ? (
        <div className="flex flex-col gap-4" aria-live="polite">
          <div className="rounded-2xl bg-[#0b0a1f] p-5 text-white">
            <p className="text-sm text-white/70">Your body burns about</p>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">
              {keep.toLocaleString('en-IN')} <span className="text-lg font-medium text-white/70">kcal a day</span>
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map(([title, hint, g]) => (
              <div key={title} className="flex flex-col gap-2 rounded-2xl border border-[#e5e5e5] p-4">
                <p className="font-semibold">
                  {title} <span className="block text-xs font-normal text-[#737373]">{hint}</span>
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  {g.kcal.toLocaleString('en-IN')} <span className="text-sm font-normal text-[#737373]">kcal</span>
                </p>
                <p className="text-xs text-[#525252] tabular-nums">
                  Protein {g.protein} g · Carbs {g.carbs} g · Fat {g.fat} g
                </p>
              </div>
            ))}
          </div>
          <Link href={SIGNUP_HREF} className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-center text-base font-semibold text-white hover:bg-[#6d28d9]">
            Track it free in RepUp: set this as your daily target
          </Link>
        </div>
      ) : (
        <p className="rounded-2xl bg-[#f5f5f5] p-5 text-center text-[#525252]">Fill in age, height and weight to see your calories.</p>
      )}
    </div>
  );
}
