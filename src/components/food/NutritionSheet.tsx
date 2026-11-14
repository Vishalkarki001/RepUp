'use client';

import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { NUTRIENTS, splitFromGoal, sumMacros, sumMicro } from '@/lib/food/core';
import { MEAL_LABELS, MEALS, type FoodGoal, type FoodLog } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SectionTitle } from '../common';
import { Modal } from '../Modal';
import { fmtKcal, fmtNutrient, logMacros } from './FoodParts';

const MACROS = [
  { key: 'protein', label: 'Protein', kcalPerG: 4, color: 'bg-primary' },
  { key: 'carbs', label: 'Carbs', kcalPerG: 4, color: 'bg-success' },
  { key: 'fat', label: 'Fat', kcalPerG: 9, color: 'bg-warning' },
] as const;

/**
 * Everything eaten on a day: calories, protein / carbs / fat (grams, % of
 * calories, vs the target), calories per meal, and the other nutrients with %
 * of the Daily Value. Totals for "other nutrients" only count foods whose
 * source measured them, and say so.
 */
export function NutritionSheet({
  dateLabel,
  logs,
  goal,
  onClose,
  onEditGoal,
}: {
  dateLabel: string;
  logs: FoodLog[];
  goal: FoodGoal | null;
  onClose: () => void;
  onEditGoal: () => void;
}) {
  const total = sumMacros(logs.map(logMacros));
  const { total: micro, counted } = sumMicro(logs);
  // Quick adds are only calories: they can't have other nutrients, so they aren't "missing" any.
  const measurable = logs.filter((l) => l.source !== 'quick').length;
  const macroKcal = total.protein * 4 + total.carbs * 4 + total.fat * 9;
  const goalSplit = goal ? splitFromGoal(goal) : null;

  return (
    <Modal
      title={`Nutrition · ${dateLabel}`}
      description={`${logs.length} ${logs.length === 1 ? 'food' : 'foods'} logged`}
      onClose={onClose}
      footer={
        <Button
          variant="outline"
          className="h-10 w-full"
          onClick={() => {
            onClose();
            onEditGoal();
          }}
        >
          <Target /> {goal ? 'Change my target' : 'Set a daily target'}
        </Button>
      }
    >
      {/* Calories */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold tracking-tight tabular">
            {fmtKcal(total.kcal)}
            {goal && <span className="text-lg font-normal text-muted-foreground"> / {fmtKcal(goal.kcal)}</span>}
          </div>
          <div className="text-xs text-muted-foreground">kcal eaten</div>
        </div>
        {goal && (
          <div className="text-right">
            <div className={cn('text-xl font-semibold tabular', total.kcal > goal.kcal && 'text-warning')}>{fmtKcal(Math.abs(goal.kcal - total.kcal))}</div>
            <div className="text-xs text-muted-foreground">{total.kcal > goal.kcal ? 'over' : 'left'}</div>
          </div>
        )}
      </div>

      {/* Macros: grams, % of calories, target */}
      <section className="flex flex-col gap-2">
        <SectionTitle>Protein · carbs · fat</SectionTitle>
        {macroKcal > 0 && (
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
            {MACROS.map((m) => (
              <span key={m.key} className={m.color} style={{ width: `${((total[m.key] * m.kcalPerG) / macroKcal) * 100}%` }} />
            ))}
          </div>
        )}
        <div className="flex flex-col divide-y rounded-lg border">
          {MACROS.map((m) => {
            const pct = macroKcal > 0 ? Math.round(((total[m.key] * m.kcalPerG) / macroKcal) * 100) : 0;
            const target = goal?.[m.key];
            return (
              <div key={m.key} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className={cn('size-2.5 shrink-0 rounded-full', m.color)} />
                <span className="flex-1 font-medium">{m.label}</span>
                <span className="text-xs text-muted-foreground tabular">
                  {pct}%{goalSplit ? ` (target ${goalSplit[m.key]}%)` : ''}
                </span>
                <span className="w-24 text-right font-semibold tabular">
                  {Math.round(total[m.key])}
                  <span className="font-normal text-muted-foreground">{target ? ` / ${target} g` : ' g'}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Calories by meal */}
      {total.kcal > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>By meal</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MEALS.map((meal) => {
              const kcal = sumMacros(logs.filter((l) => l.meal === meal).map(logMacros)).kcal;
              return (
                <div key={meal} className="rounded-lg border px-3 py-2">
                  <div className="text-xs text-muted-foreground">{MEAL_LABELS[meal]}</div>
                  <div className="text-sm font-semibold tabular">
                    {fmtKcal(kcal)} <span className="text-xs font-normal text-muted-foreground">kcal · {Math.round((kcal / total.kcal) * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Other nutrients */}
      <section className="flex flex-col gap-2">
        <SectionTitle>Other nutrients</SectionTitle>
        <div className="flex flex-col divide-y rounded-lg border">
          {NUTRIENTS.map((n) => {
            const v = micro[n.key];
            const pct = v !== undefined && n.dv ? Math.round((v / n.dv) * 100) : null;
            const partial = v !== undefined && (counted[n.key] ?? 0) < measurable;
            return (
              <div key={n.key} className="flex flex-col gap-1.5 px-3 py-2.5">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="flex-1 font-medium">{n.label}</span>
                  <span className="font-semibold tabular">{v === undefined ? '–' : `${fmtNutrient(v, n.unit)} ${n.unit}`}</span>
                  <span className="w-12 text-right text-xs text-muted-foreground tabular">{pct !== null ? `${pct}%` : ''}</span>
                </div>
                {pct !== null && <Progress value={Math.min(100, pct)} className="h-1.5" aria-label={`${n.label}: ${pct}% of daily value`} />}
                {partial && (
                  <span className="text-[11px] text-muted-foreground">
                    From {counted[n.key]} of {measurable} foods: the others have no data for it.
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          % = share of the Daily Value (US FDA, for a 2,000 kcal diet). Values come from USDA, the Indian Nutrient Databank and pack labels;
          home-cooked food is an estimate. Quick adds only count calories. Not medical advice.
        </p>
      </section>
    </Modal>
  );
}
