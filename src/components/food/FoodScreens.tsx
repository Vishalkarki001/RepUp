'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Download, GlassWater, Loader2, Minus, Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { downloadFoodPdf } from '@/lib/exportPdf';
import {
  ACTIVITY,
  addDays,
  foodStreak,
  goalFor,
  gramsFromSplit,
  maintenance,
  SPLIT_PRESETS,
  splitFromGoal,
  sumMacros,
  type MacroSplit,
} from '@/lib/food/core';
import { actions, useAppState } from '@/lib/store';
import { MEAL_LABELS, MEALS, WEEKDAYS, WEEKDAYS_LONG, type Activity, type FoodGoal, type FoodLog, type FoodPlan, type FoodProfile, type Meal, type Sex } from '@/lib/types';
import { cn, formatDate, startOfWeek, todayISO, uid, unitLabel, useNow } from '@/lib/utils';
import { BarChart, LineChart } from '../Charts';
import { SectionTitle, Stat, StatGrid } from '../common';
import { NumberField } from '../NumberField';
import { ScreenHeader } from '../ScreenHeader';
import { AddFood } from './AddFood';
import { amountLabel, fmtKcal, loadLocalFoods, logMacros, MacroBar, macroLine } from './FoodParts';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon … Sun
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dateLabel = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return formatDate(new Date(y, m - 1, d).getTime(), { weekday: 'long', day: 'numeric', month: 'long' });
};

/* ------------------------------------------------------------------ */
/* Diary: one day, four meals                                            */
/* ------------------------------------------------------------------ */

const WATER_GOAL = 8; // glasses of 250 ml ≈ 2 litres

export function FoodDiary({ onSetGoal }: { onSetGoal: () => void }) {
  const { foodLogs, foodGoal, water } = useAppState();
  const [exporting, setExporting] = useState(false);
  const now = useNow(60_000);
  const today = todayISO();
  const [date, setDate] = useState(today);
  const [adding, setAdding] = useState<{ meal: Meal; edit?: FoodLog } | null>(null);
  useEffect(() => setDate(today), [today]); // a new day → jump to it
  // Load the food list now, so the first search is instant (and it's saved for offline use).
  useEffect(() => void loadLocalFoods().catch(() => {}), []);

  // The week strip follows the chosen day (‹ › move a week).
  const [y, m, d] = date.split('-').map(Number);
  const weekStart = startOfWeek(new Date(y, m - 1, d).getTime());
  const days = DAY_ORDER.map((wd, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const key = iso(day);
    return { wd, key, date: day.getDate(), logged: foodLogs.some((l) => l.date === key), isToday: key === today };
  });
  const isThisWeek = days.some((x) => x.isToday);

  const dayLogs = useMemo(() => foodLogs.filter((l) => l.date === date), [foodLogs, date]);
  const total = sumMacros(dayLogs.map(logMacros));
  const left = foodGoal ? foodGoal.kcal - total.kcal : 0;
  const yesterday = addDays(date, -1);

  const copyMeal = (meal: Meal) => {
    const from = foodLogs.filter((l) => l.date === yesterday && l.meal === meal);
    const at = Date.now();
    from.forEach((l, i) => actions.addFoodLog({ ...l, id: uid(), date, loggedAt: at + i }));
    toast.success(`Copied ${from.length} ${from.length === 1 ? 'food' : 'foods'} from yesterday`);
  };

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow={date === today ? formatDate(now, { weekday: 'long', day: 'numeric', month: 'long' }) : dateLabel(date)} title="Food" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Previous week" onClick={() => setDate(addDays(date, -7))}>
          <ChevronLeft />
        </Button>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={1}
          value={date}
          onValueChange={(v) => v && setDate(v)}
          aria-label="Pick a day"
          className="grid min-w-0 flex-1 grid-cols-7"
        >
          {days.map(({ wd, key, date: dn, logged, isToday }) => (
            <ToggleGroupItem
              key={key}
              value={key}
              aria-label={`${WEEKDAYS_LONG[wd]} ${dn}`}
              className={cn(
                'h-auto min-w-0 flex-col gap-0.5 rounded-lg bg-card px-0 py-2 active:scale-95',
                isToday && 'border-primary/50',
                'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
              )}
            >
              <span className={cn('text-[11px] font-medium text-muted-foreground', date === key && 'text-primary-foreground/80', isToday && date !== key && 'text-brand')}>
                {WEEKDAYS[wd]}
              </span>
              <span className="text-base font-semibold tabular">{dn}</span>
              <span className={cn('size-1.5 rounded-full', logged ? (date === key ? 'bg-primary-foreground' : 'bg-success') : 'bg-transparent')} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button variant="ghost" size="icon-sm" aria-label="Next week" onClick={() => setDate(addDays(date, 7))}>
          <ChevronRight />
        </Button>
      </div>
      {!isThisWeek && (
        <Button variant="link" size="sm" className="-mt-3 h-auto self-center p-0 text-xs" onClick={() => setDate(today)}>
          Back to today
        </Button>
      )}

      {/* Calories: eaten / target, then macros */}
      <Card className="gap-4 px-4 py-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-semibold tracking-tight tabular">
              {fmtKcal(total.kcal)}
              {foodGoal && <span className="text-lg font-normal text-muted-foreground"> / {fmtKcal(foodGoal.kcal)}</span>}
            </div>
            <div className="text-xs text-muted-foreground">kcal eaten</div>
          </div>
          {foodGoal ? (
            <div className="text-right">
              <div className={cn('text-xl font-semibold tabular', left < 0 && 'text-warning')}>{fmtKcal(Math.abs(left))}</div>
              <div className="text-xs text-muted-foreground">{left < 0 ? 'over' : 'left'}</div>
            </div>
          ) : (
            <Button size="sm" onClick={onSetGoal}>
              <Target /> Set daily target
            </Button>
          )}
        </div>
        {foodGoal && (
          <Progress
            value={Math.min(100, (total.kcal / foodGoal.kcal) * 100)}
            className={cn('h-2', left < 0 && '[&>[data-slot=progress-indicator]]:bg-warning')}
            aria-label="Calories eaten of target"
          />
        )}
        <div className="grid grid-cols-3 gap-3">
          <MacroBar label="Protein" value={total.protein} target={foodGoal?.protein ?? null} />
          <MacroBar label="Carbs" value={total.carbs} target={foodGoal?.carbs ?? null} />
          <MacroBar label="Fat" value={total.fat} target={foodGoal?.fat ?? null} />
        </div>
      </Card>

      {MEALS.map((meal) => {
        const list = dayLogs.filter((l) => l.meal === meal);
        const kcal = sumMacros(list.map(logMacros)).kcal;
        const canCopy = !list.length && foodLogs.some((l) => l.date === yesterday && l.meal === meal);
        return (
          <section key={meal} className="flex flex-col gap-2">
            <SectionTitle
              action={
                kcal > 0 ? (
                  <span className="text-xs font-medium text-muted-foreground tabular">{fmtKcal(kcal)} kcal</span>
                ) : canCopy ? (
                  <Button variant="ghost" size="sm" className="-my-1 h-7 px-2 text-xs text-muted-foreground" onClick={() => copyMeal(meal)}>
                    <Copy /> Same as yesterday
                  </Button>
                ) : null
              }
            >
              {MEAL_LABELS[meal]}
            </SectionTitle>
            <Card className="gap-0 overflow-hidden py-0">
              {list.length > 0 && (
                <ItemGroup className="gap-0 divide-y border-b">
                  {list.map((l) => (
                    <Item key={l.id} asChild size="sm" className="flex-nowrap rounded-none px-4 text-left hover:bg-muted/50">
                      <button type="button" onClick={() => setAdding({ meal, edit: l })}>
                        <ItemContent className="min-w-0 gap-0.5">
                          <ItemTitle className="w-full truncate">{l.name}</ItemTitle>
                          <ItemDescription className="truncate text-xs tabular">
                            {l.source === 'quick' ? 'Quick add' : amountLabel(l.amount, l.unit)} · {macroLine(l)}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions className="text-sm font-semibold tabular">{fmtKcal(l.kcal)}</ItemActions>
                      </button>
                    </Item>
                  ))}
                </ItemGroup>
              )}
              <Button variant="ghost" className="h-11 justify-start rounded-none px-4 text-brand" onClick={() => setAdding({ meal })}>
                <Plus /> Add food
              </Button>
            </Card>
          </section>
        );
      })}

      {/* Water: tap + / − (a glass = 250 ml) */}
      <Card className="flex-row items-center gap-3 px-4 py-3">
        <GlassWater className="size-5 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tabular">
            {water[date] ?? 0} / {WATER_GOAL} glasses
          </div>
          <div className="text-xs text-muted-foreground tabular">Water · {((water[date] ?? 0) * 0.25).toFixed(2).replace(/\.?0+$/, '')} L</div>
        </div>
        <Button variant="outline" size="icon" aria-label="One glass less" disabled={!water[date]} onClick={() => actions.setWater(date, (water[date] ?? 0) - 1)}>
          <Minus />
        </Button>
        <Button size="icon" aria-label="One more glass" onClick={() => actions.setWater(date, (water[date] ?? 0) + 1)}>
          <Plus />
        </Button>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        disabled={exporting || !dayLogs.length}
        onClick={async () => {
          setExporting(true);
          try {
            await downloadFoodPdf(date, dayLogs, foodGoal, water[date] ?? 0);
          } catch {
            toast.error('Couldn’t make the PDF. Please try again.');
          } finally {
            setExporting(false);
          }
        }}
      >
        {exporting ? <Loader2 className="animate-spin" /> : <Download />} Download this day as PDF
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Values per 100 g from IFCT, the Indian Nutrient Databank, USDA and pack labels. Home-cooked food is an estimate (~).
      </p>

      {adding && <AddFood key={adding.edit?.id ?? adding.meal} date={date} meal={adding.meal} edit={adding.edit} onClose={() => setAdding(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Progress: calories by day, averages                                  */
/* ------------------------------------------------------------------ */

export function FoodProgress() {
  const { foodLogs, foodGoal, bodyWeights } = useAppState();
  const [kg, setKg] = useState<number | null>(null);
  const today = todayISO();
  const streak = foodStreak(new Set(foodLogs.map((l) => l.date)), today);
  const weights = [...bodyWeights].reverse().slice(-60);
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const byDay = last7.map((date) => ({ date, ...sumMacros(foodLogs.filter((l) => l.date === date).map(logMacros)) }));
  const logged = byDay.filter((d) => d.kcal > 0);
  const avg = (f: (d: (typeof byDay)[number]) => number) => (logged.length ? logged.reduce((a, d) => a + f(d), 0) / logged.length : 0);
  const onTarget = foodGoal ? logged.filter((d) => Math.abs(d.kcal - foodGoal.kcal) <= foodGoal.kcal * 0.1).length : 0;

  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  const days30 = last30.filter((date) => foodLogs.some((l) => l.date === date)).length;

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader title="Progress" />

      <section className="flex flex-col gap-2">
        <SectionTitle>Last 7 days · average a day</SectionTitle>
        <StatGrid>
          <Stat value={fmtKcal(avg((d) => d.kcal))} label={foodGoal ? `kcal (target ${fmtKcal(foodGoal.kcal)})` : 'kcal'} />
          <Stat value={streak ? `🔥 ${streak}` : '0'} label={streak === 1 ? 'day in a row' : 'days in a row'} />
          <Stat value={foodGoal ? onTarget : '–'} label="days on target (±10%)" />
        </StatGrid>
      </section>

      <Card className="gap-2 px-3 py-4">
        <SectionTitle className="px-1">Calories a day</SectionTitle>
        <BarChart
          label="Calories eaten each day, last 7 days"
          points={byDay.map((d) => {
            const [y, m, dd] = d.date.split('-').map(Number);
            const wd = new Date(y, m - 1, dd).getDay();
            return { label: WEEKDAYS[wd], value: Math.round(d.kcal), detail: `${dateLabel(d.date)} · ${macroLine(d)}` };
          })}
          fmt={(v) => fmtKcal(v)}
        />
      </Card>

      <section className="flex flex-col gap-2">
        <SectionTitle>Last 7 days · macros a day</SectionTitle>
        <StatGrid>
          <Stat value={`${Math.round(avg((d) => d.protein))} g`} label={foodGoal ? `protein (target ${foodGoal.protein})` : 'protein'} />
          <Stat value={`${Math.round(avg((d) => d.carbs))} g`} label={foodGoal ? `carbs (target ${foodGoal.carbs})` : 'carbs'} />
          <Stat value={`${Math.round(avg((d) => d.fat))} g`} label={foodGoal ? `fat (target ${foodGoal.fat})` : 'fat'} />
        </StatGrid>
      </section>

      <section className="flex flex-col gap-2">
        <SectionTitle>Body weight</SectionTitle>
        <Card className="gap-3 px-3 py-4">
          {weights.length > 1 ? (
            <LineChart
              label="Body weight"
              points={weights.map((w) => {
                const [y, m, d] = w.date.split('-').map(Number);
                return { label: formatDate(new Date(y, m - 1, d).getTime(), { day: 'numeric', month: 'short' }), value: w.kg, detail: dateLabel(w.date) };
              })}
              fmt={(v) => `${Math.round(v * 10) / 10} ${unitLabel()}`}
            />
          ) : (
            <p className="px-1 text-sm text-muted-foreground">
              {weights.length ? `Last: ${weights[0].kg} ${unitLabel()}. ` : ''}Log your weight once a week to see if your target is working.
            </p>
          )}
          <div className="flex items-end gap-2 px-1">
            <div className="flex-1">
              <NumberField label={`Today’s weight (${unitLabel()})`} value={kg} onValue={setKg} decimal placeholder={String(bodyWeights[0]?.kg ?? 70)} />
            </div>
            <Button
              className="h-10"
              disabled={!kg || kg < 20 || kg > 400}
              onClick={() => {
                actions.addBodyWeight(kg!, today);
                setKg(null);
                toast.success('Weight saved');
              }}
            >
              Save
            </Button>
          </div>
        </Card>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Logged on {days30} of the last 30 days. Averages count only days you logged.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Your own target: kcal + protein / carbs / fat in %                   */
/* ------------------------------------------------------------------ */

const MACRO_ROWS: { key: keyof MacroSplit; label: string; perGram: number }[] = [
  { key: 'protein', label: 'Protein', perGram: 4 },
  { key: 'carbs', label: 'Carbs', perGram: 4 },
  { key: 'fat', label: 'Fat', perGram: 9 },
];

/** Type calories, pick the % for protein, carbs and fat (5 % steps or typed): grams follow. Must add up to 100 %. */
function TargetEditor({ start, onSave }: { start: FoodGoal | null; onSave: (kcal: number, split: MacroSplit) => void }) {
  const [kcal, setKcal] = useState<number | null>(start?.kcal ?? null);
  const [split, setSplit] = useState<MacroSplit>(() => (start ? splitFromGoal(start) : SPLIT_PRESETS[0].split));
  const total = split.protein + split.carbs + split.fat;
  const kcalOk = !!kcal && kcal >= 800 && kcal <= 6000;
  const grams = kcalOk ? gramsFromSplit(kcal!, split) : null;
  const unchanged =
    !!start && kcal === start.kcal && grams?.protein === start.protein && grams?.carbs === start.carbs && grams?.fat === start.fat;
  const set = (k: keyof MacroSplit, v: number | null) => setSplit((s) => ({ ...s, [k]: Math.max(0, Math.min(100, Math.round(v ?? 0))) }));
  const preset = SPLIT_PRESETS.find((p) => p.split.protein === split.protein && p.split.carbs === split.carbs && p.split.fat === split.fat);

  return (
    <Card className="gap-4 px-4 py-5">
      <NumberField label="Calories a day (kcal)" value={kcal} onValue={setKcal} placeholder="2300" />

      <ToggleGroup
        type="single"
        variant="outline"
        spacing={1.5}
        value={preset?.id ?? ''}
        onValueChange={(v) => {
          const p = SPLIT_PRESETS.find((x) => x.id === v);
          if (p) setSplit(p.split);
        }}
        aria-label="Ready-made splits"
        className="flex w-full flex-wrap justify-start"
      >
        {SPLIT_PRESETS.map((p) => (
          <ToggleGroupItem
            key={p.id}
            value={p.id}
            className="h-8 rounded-full px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            {p.label} {p.split.protein}/{p.split.carbs}/{p.split.fat}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex flex-col gap-2.5">
        {MACRO_ROWS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-16 shrink-0 text-sm font-medium">{label}</div>
            <Button variant="outline" size="icon" className="size-9 shrink-0" aria-label={`Less ${label.toLowerCase()}`} disabled={split[key] <= 0} onClick={() => set(key, split[key] - 5)}>
              <Minus />
            </Button>
            <div className="relative w-16 shrink-0">
              <NumberField label={`${label} %`} hideLabel value={split[key]} onValue={(v) => set(key, v)} />
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
            <Button variant="outline" size="icon" className="size-9 shrink-0" aria-label={`More ${label.toLowerCase()}`} disabled={split[key] >= 100} onClick={() => set(key, split[key] + 5)}>
              <Plus />
            </Button>
            <div className="min-w-0 flex-1 text-right text-sm font-semibold tabular">{grams ? `${grams[key]} g` : '– g'}</div>
          </div>
        ))}
      </div>

      <p
        className={cn(
          'rounded-lg px-3 py-2 text-xs font-medium tabular',
          total === 100 ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
        )}
        role="status"
      >
        {total === 100
          ? 'Total 100% ✓'
          : `Total ${total}%: make it 100% (${total > 100 ? `${total - 100}% too much` : `${100 - total}% missing`})`}
      </p>

      <Button className="h-11 text-base" disabled={!kcalOk || total !== 100 || unchanged} onClick={() => onSave(Math.round(kcal!), split)}>
        {unchanged ? 'Your target ✓' : 'Save target'}
      </Button>
      {!kcalOk && kcal !== null && <p className="-mt-2 text-center text-xs text-muted-foreground">Calories between 800 and 6,000.</p>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Know your calories                                                    */
/* ------------------------------------------------------------------ */

const PLANS: { id: Exclude<FoodPlan, 'custom'>; title: string; hint: string }[] = [
  { id: 'lose', title: 'Lose fat', hint: 'About ½ kg a week' },
  { id: 'maintain', title: 'Stay the same', hint: 'Maintenance' },
  { id: 'gain', title: 'Build muscle', hint: 'About ¼ kg a week, lean' },
];

export function FoodCalories() {
  const { foodGoal, bodyWeights, settings } = useAppState();
  const saved = foodGoal?.profile;
  // Body weights are stored in the unit the user picked; the formula needs kg.
  const lastKg = bodyWeights[0] ? Math.round((settings.unit === 'lb' ? bodyWeights[0].kg * 0.4536 : bodyWeights[0].kg) * 10) / 10 : null;
  const [sex, setSex] = useState<Sex>(saved?.sex ?? 'male');
  const [age, setAge] = useState<number | null>(saved?.age ?? null);
  const [height, setHeight] = useState<number | null>(saved?.heightCm ?? null);
  const [weight, setWeight] = useState<number | null>(saved?.weightKg ?? lastKg);
  const [activity, setActivity] = useState<Activity>(saved?.activity ?? 'light');

  const ok = !!age && age >= 14 && age <= 90 && !!height && height >= 120 && height <= 230 && !!weight && weight >= 30 && weight <= 250;
  const profile: FoodProfile | null = ok ? { sex, age: age!, heightCm: height!, weightKg: weight!, activity } : null;
  const keep = profile ? Math.round(maintenance(profile) / 10) * 10 : null;

  const use = (plan: Exclude<FoodPlan, 'custom'>) => {
    if (!profile) return;
    const g = goalFor(profile, plan);
    actions.setFoodGoal(g);
    toast.success(`Daily target set: ${fmtKcal(g.kcal)} kcal`);
  };

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader title="Know your calories" />

      {foodGoal && (
        <Card className="flex-row items-center gap-3 border-primary/40 bg-accent/40 px-4 py-3">
          <Target className="size-5 shrink-0 text-brand" />
          <div className="min-w-0 flex-1 text-sm">
            <div className="font-semibold tabular">Your target: {fmtKcal(foodGoal.kcal)} kcal a day</div>
            <div className="text-xs text-muted-foreground tabular">
              {(() => {
                const pct = splitFromGoal(foodGoal);
                return `Protein ${foodGoal.protein} g (${pct.protein}%) · Carbs ${foodGoal.carbs} g (${pct.carbs}%) · Fat ${foodGoal.fat} g (${pct.fat}%)`;
              })()}
            </div>
          </div>
        </Card>
      )}

      <Card className="gap-4 px-4 py-5">
        <ToggleGroup type="single" variant="outline" spacing={0} value={sex} onValueChange={(v) => v && setSex(v as Sex)} aria-label="Sex" className="w-full">
          <ToggleGroupItem value="male" className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
            Male
          </ToggleGroupItem>
          <ToggleGroupItem value="female" className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
            Female
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Age" value={age} onValue={setAge} placeholder="25" />
          <NumberField label="Height (cm)" value={height} onValue={setHeight} placeholder="170" />
          <NumberField label="Weight (kg)" value={weight} onValue={setWeight} decimal placeholder="70" />
        </div>
        <Field className="gap-1">
          <FieldLabel className="text-xs font-normal text-muted-foreground">How active are you?</FieldLabel>
          <Select value={activity} onValueChange={(v) => setActivity(v as Activity)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label} <span className="text-muted-foreground">· {a.hint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <p className="text-[11px] text-muted-foreground">Height in feet? 5 ft = 152 cm, 5′6″ = 168 cm, 6 ft = 183 cm.</p>
      </Card>

      {profile && keep ? (
        <>
          <section className="flex flex-col gap-2">
            <SectionTitle>Your body burns about</SectionTitle>
            <Card className="px-4 py-4">
              <div className="text-3xl font-semibold tracking-tight tabular">
                {fmtKcal(keep)} <span className="text-base font-normal text-muted-foreground">kcal a day</span>
              </div>
              <p className="text-xs text-muted-foreground">Eat this much to stay at the same weight.</p>
            </Card>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>Pick your goal</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-3">
              {PLANS.map((p) => {
                const g = goalFor(profile, p.id);
                const current = foodGoal?.plan === p.id && foodGoal.kcal === g.kcal;
                return (
                  <Card key={p.id} className={cn('gap-3 px-4 py-4', current && 'border-primary')}>
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.hint}</div>
                    </div>
                    <div className="text-2xl font-semibold tabular">
                      {fmtKcal(g.kcal)} <span className="text-sm font-normal text-muted-foreground">kcal</span>
                    </div>
                    <div className="text-xs text-muted-foreground tabular">
                      Protein {g.protein} g · Carbs {g.carbs} g · Fat {g.fat} g
                    </div>
                    <Button variant={current ? 'secondary' : 'default'} disabled={current} onClick={() => use(p.id)}>
                      {current ? 'Your target ✓' : 'Use this'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Fill in age, height and weight to see your calories.</p>
      )}

      <section className="flex flex-col gap-2">
        <SectionTitle>{profile ? 'Or set your own target' : 'Set your own target'}</SectionTitle>
        {/* Starts from the current target; resets when a goal above is picked. */}
        <TargetEditor
          key={foodGoal ? `${foodGoal.kcal}-${foodGoal.protein}-${foodGoal.carbs}-${foodGoal.fat}` : 'none'}
          start={foodGoal}
          onSave={(kcal, split) => {
            actions.setFoodGoal({ plan: 'custom', kcal, ...gramsFromSplit(kcal, split), profile: profile ?? foodGoal?.profile });
            toast.success(`Daily target set: ${fmtKcal(kcal)} kcal`);
          }}
        />
      </section>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Worked out with the Mifflin–St Jeor formula. It’s a starting point: if your weight doesn’t move the way you want in 2–3 weeks, change
        the target by 100–200 kcal. Not for pregnancy or medical diets.
      </p>
    </div>
  );
}
