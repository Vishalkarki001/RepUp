'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Food, Searchable } from '@/lib/food/core';
import type { FoodLog, Macros } from '@/lib/types';
import { cn } from '@/lib/utils';

/** "1.5 roti", "150 g", "2 × 10 almonds". */
export function amountLabel(amount: number, unit: string): string {
  const n = Number.isInteger(amount) ? String(amount) : String(Math.round(amount * 100) / 100);
  if (unit === 'g' || unit === 'ml') return `${n} ${unit}`;
  return /^[\d½]/.test(unit) ? `${n} × ${unit}` : `${n} ${unit}`;
}

export const fmtKcal = (n: number) => Math.round(n).toLocaleString('en-IN');
/** 0.4 g, 12 g, 1,230 mg: one decimal for small numbers, whole numbers above 10. */
export const fmtNutrient = (n: number, unit: string) =>
  n >= 10 || unit === 'µg' ? Math.round(n).toLocaleString('en-IN') : String(Math.round(n * 10) / 10);
export const fmtG = (n: number) => `${Math.round(n)} g`;

/** Small badge saying where the numbers come from. */
export function SourceBadge({ food, className }: { food: Pick<Food, 'kind' | 'approx'>; className?: string }) {
  const [text, title] =
    food.kind === 'usda'
      ? ['✓ USDA', 'Lab data from USDA FoodData Central']
      : food.kind === 'off'
        ? ['✓ Label', 'From the pack label (Open Food Facts)']
        : food.kind === 'user'
          ? ['User added', 'Added from a pack label by a RepUp user']
          : food.kind === 'quick'
            ? ['Yours', 'Typed in by you']
            : food.approx
              ? ['~ Approx', 'Home-style recipe: depends on how it’s made']
              : ['✓ Verified', 'Checked against IFCT / USDA'];
  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(
        'h-5 shrink-0 px-1.5 text-[10px] font-medium',
        text.startsWith('✓') ? 'border-success/40 text-success' : 'text-muted-foreground',
        className,
      )}
    >
      {text}
    </Badge>
  );
}

/** "Protein  62 / 120 g" with a thin bar. Turns amber when over. */
export function MacroBar({ label, value, target }: { label: string; value: number; target: number | null }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const over = !!target && value > target * 1.05;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-1 text-xs">
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular">
        {Math.round(value)}
        <span className="font-normal text-muted-foreground">{target ? ` / ${target} g` : ' g'}</span>
      </div>
      {target ? <Progress value={pct} className={cn('mt-1.5 h-1.5', over && '[&>[data-slot=progress-indicator]]:bg-warning')} /> : null}
    </div>
  );
}

/** "P 12 · C 40 · F 6" */
export function macroLine(m: Macros): string {
  return `P ${Math.round(m.protein)} · C ${Math.round(m.carbs)} · F ${Math.round(m.fat)}`;
}

export const logMacros = (l: FoodLog): Macros => ({ kcal: l.kcal, protein: l.protein, carbs: l.carbs, fat: l.fat });

/** The app's own food list, loaded on first use (kept out of the main bundle). */
let localPromise: Promise<{ index: Searchable[]; boost: (id: string) => number }> | null = null;
export function loadLocalFoods() {
  return (localPromise ??= import('@/lib/food/local')
    .then((m) => ({ index: m.localIndex(), boost: m.localBoost }))
    .catch((e) => {
      localPromise = null; // offline before it was ever loaded: try again next time
      throw e;
    }));
}

export function useLocalFoods() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadLocalFoods>> | null>(null);
  useEffect(() => {
    let alive = true;
    loadLocalFoods().then(
      (d) => alive && setData(d),
      () => {},
    );
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
