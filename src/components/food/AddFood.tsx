'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Loader2, Minus, PenLine, Plus, ScanBarcode, Search, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  believable,
  foodFromLog,
  makeSearchable,
  nutrientsFor,
  r1,
  recentFoods,
  searchFoods,
  sumMacros,
  type Food,
  type OilLevel,
} from '@/lib/food/core';
import { actions, useAppState } from '@/lib/store';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { MEAL_LABELS, MEALS, type FoodLog, type Meal } from '@/lib/types';
import { uid } from '@/lib/utils';
import { Modal } from '../Modal';
import { NumberField } from '../NumberField';
import { BarcodeScanner } from './BarcodeScanner';
import { amountLabel, fmtKcal, logMacros, SourceBadge, useLocalFoods } from './FoodParts';

type Step =
  | { kind: 'search' }
  | { kind: 'amount'; food: Food; amount?: number; unit?: string }
  | { kind: 'quick' }
  | { kind: 'label'; barcode?: string; name?: string; brand?: string }
  | { kind: 'scan' };

/**
 * "Add to Lunch": search (RepUp's list instantly, then the shared list + USDA),
 * scan a barcode, pick how much, add. Stays open so you can add the next food.
 * With `edit`, opens straight on the amount of an already logged food.
 */
export function AddFood({ date, meal: startMeal, edit, onClose }: { date: string; meal: Meal; edit?: FoodLog; onClose: () => void }) {
  const { foodLogs } = useAppState();
  const [meal, setMeal] = useState<Meal>(edit?.meal ?? startMeal);
  // A quick add has no grams: it's edited as calories, not as an amount.
  const editQuick = !!edit && edit.source === 'quick' && edit.grams <= 0;
  const [step, setStep] = useState<Step>(
    editQuick ? { kind: 'quick' } : edit ? { kind: 'amount', food: foodFromLog(edit), amount: edit.amount, unit: edit.unit } : { kind: 'search' },
  );
  const [query, setQuery] = useState('');
  /** Last food added while the sheet is open (shown inline: a toast would cover the buttons). */
  const [added, setAdded] = useState<string | null>(null);
  const mealKcal = sumMacros(foodLogs.filter((l) => l.date === date && l.meal === meal).map(logMacros)).kcal;
  const back = () => setStep({ kind: 'search' });
  // A toast from the screen behind would sit on top of this sheet's buttons.
  useEffect(() => void toast.dismiss(), []);

  const title =
    step.kind === 'quick'
      ? editQuick
        ? 'Edit quick add'
        : 'Quick add calories'
      : step.kind === 'label'
        ? 'Add a food from its label'
        : step.kind === 'scan'
          ? 'Scan a barcode'
          : edit
            ? 'Edit food'
            : `Add to ${MEAL_LABELS[meal]}`;

  return (
    <Modal
      title={title}
      description={!edit && (step.kind === 'search' || step.kind === 'amount') ? `${MEAL_LABELS[meal]} so far: ${fmtKcal(mealKcal)} kcal` : undefined}
      onClose={onClose}
      footer={
        step.kind === 'search' ? (
          <Button variant="outline" className="h-10 w-full" onClick={onClose}>
            Done
          </Button>
        ) : undefined
      }
    >
      {step.kind !== 'search' && !edit && (
        <Button variant="ghost" size="sm" className="-mt-1 -ml-2 w-fit text-muted-foreground" onClick={back}>
          <ArrowLeft /> Back to search
        </Button>
      )}

      {step.kind === 'search' && added && (
        <p className="-mb-1 flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-2 text-xs font-medium text-success" role="status">
          <Check className="size-3.5 shrink-0" /> <span className="truncate">Added: {added}</span>
        </p>
      )}

      {step.kind === 'search' && (
        <SearchStep
          query={query}
          setQuery={setQuery}
          onPick={(food, last) => setStep({ kind: 'amount', food, amount: last?.amount, unit: last?.unit })}
          onScan={() => setStep({ kind: 'scan' })}
          onQuick={() => setStep({ kind: 'quick' })}
          onLabel={() => setStep({ kind: 'label', name: query.trim() || undefined })}
        />
      )}

      {step.kind === 'amount' && (
        <AmountStep
          key={step.food.id}
          food={step.food}
          startAmount={step.amount}
          startUnit={step.unit}
          meal={meal}
          setMeal={setMeal}
          edit={edit}
          onSaved={(text) => {
            if (edit) return onClose();
            setAdded(text);
            setQuery('');
            back();
          }}
          onDeleted={onClose}
          date={date}
        />
      )}

      {step.kind === 'quick' && (
        <QuickAdd
          edit={editQuick ? edit : undefined}
          meal={meal}
          setMeal={setMeal}
          onDelete={() => {
            if (!edit) return;
            actions.deleteFoodLog(edit.id);
            toast('Food removed', { action: { label: 'Undo', onClick: () => actions.addFoodLog(edit) } });
            onClose();
          }}
          onSave={(name, m) => {
            if (editQuick && edit) {
              actions.updateFoodLog(edit.id, { name, meal, ...m });
              toast.success('Saved');
              return onClose();
            }
            actions.addFoodLog({
              id: uid(),
              date,
              meal,
              foodId: `quick:${uid()}`,
              name,
              amount: 1,
              unit: 'serving',
              grams: 0,
              ...m,
              source: 'quick',
              loggedAt: Date.now(),
            });
            setAdded(`${name} · ${fmtKcal(m.kcal)} kcal`);
            back();
          }}
        />
      )}

      {step.kind === 'label' && (
        <AddFromLabel
          barcode={step.barcode}
          name={step.name}
          brand={step.brand}
          onSaved={(food) => setStep({ kind: 'amount', food })}
        />
      )}

      {step.kind === 'scan' && <ScanStep onFound={(food) => setStep({ kind: 'amount', food })} onMissing={(s) => setStep({ kind: 'label', ...s })} />}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* search                                                               */
/* ------------------------------------------------------------------ */

type Remote = { q: string; foods: Food[]; state: 'loading' | 'done' | 'error' | 'offline' };

function SearchStep({
  query,
  setQuery,
  onPick,
  onScan,
  onQuick,
  onLabel,
}: {
  query: string;
  setQuery: (q: string) => void;
  onPick: (food: Food, last?: { amount: number; unit: string }) => void;
  onScan: () => void;
  onQuick: () => void;
  onLabel: () => void;
}) {
  const { foodLogs } = useAppState();
  const local = useLocalFoods();
  // Foods you've had, as RepUp's full entry when it has one (all servings, the oil option).
  const recent = useMemo(() => {
    const byId = new Map(local?.index.map((s) => [s.food.id, s.food]));
    return recentFoods(foodLogs).map((r) => ({ ...r, food: byId.get(r.food.id) ?? r.food }));
  }, [foodLogs, local]);
  const lastOf = useMemo(() => new Map(recent.map((r) => [r.food.id, r.last])), [recent]);
  const q = query.trim();
  const [remote, setRemote] = useState<Remote | null>(null);

  // RepUp's own list + foods you've had: instant, works offline.
  const instant = useMemo(() => {
    if (!q) return [];
    const mine = searchFoods(
      recent.map((r) => makeSearchable(r.food)),
      q,
      6,
    );
    const fromList = local ? searchFoods(local.index, q, 30, local.boost) : [];
    const seen = new Set(mine.map((f) => f.id));
    return [...mine, ...fromList.filter((f) => !seen.has(f.id))];
  }, [q, recent, local]);

  // The shared list + USDA: a moment later, while you keep typing.
  useEffect(() => {
    if (q.length < 3) return setRemote(null); // 1–2 letters: RepUp's own list is enough (saves USDA's hourly limit)
    if (typeof navigator !== 'undefined' && !navigator.onLine) return setRemote({ q, foods: [], state: 'offline' });
    setRemote((r) => (r?.q === q ? r : { q, foods: r?.foods ?? [], state: 'loading' }));
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/food/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = res.ok ? ((await res.json()) as { foods: Food[] }) : null;
        setRemote({ q, foods: data?.foods ?? [], state: data ? 'done' : 'error' });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setRemote({ q, foods: [], state: navigator.onLine ? 'error' : 'offline' });
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const more = useMemo(() => {
    if (!remote || remote.q !== q) return [];
    const shown = new Set(instant.map((f) => f.id));
    const names = new Set(instant.map((f) => f.name.toLowerCase()));
    return remote.foods.filter((f) => !shown.has(f.id) && !names.has(f.name.toLowerCase()));
  }, [remote, q, instant]);
  const loading = !!q && (!local || (q.length >= 3 && (!remote || remote.q !== q || remote.state === 'loading')));
  const nothing = !!q && !instant.length && !more.length && !loading;

  return (
    <>
      <InputGroup className="h-11">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          autoFocus
          type="text"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Search food: roti, dal, paneer…"
          aria-label="Search food"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-base"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" onClick={onScan} aria-label="Scan a barcode" title="Scan a barcode">
            <ScanBarcode />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {!q && (
        <>
          {recent.length > 0 ? (
            <FoodList title="Recent" foods={recent.map((r) => r.food)} lastOf={lastOf} onPick={onPick} />
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Type a food, or scan the barcode on a pack.
              <br />
              Indian food, fruits, packaged snacks: about 1,000 foods, more from USDA.
            </p>
          )}
        </>
      )}

      {instant.length > 0 && <FoodList title={more.length || loading ? 'Best matches' : undefined} foods={instant} lastOf={lastOf} onPick={onPick} />}

      {!!q && (
        <>
          {more.length > 0 && <FoodList title="More foods" foods={more} lastOf={lastOf} onPick={onPick} />}
          {loading && (
            <p className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Searching more foods…
            </p>
          )}
          {remote?.q === q && remote.state === 'offline' && (
            <p className="text-center text-xs text-muted-foreground">You’re offline: showing RepUp’s own list.</p>
          )}
          {remote?.q === q && remote.state === 'error' && (
            <p className="text-center text-xs text-muted-foreground">Couldn’t search more foods right now. Showing RepUp’s own list.</p>
          )}
        </>
      )}

      {nothing && <p className="pt-2 text-center text-sm text-muted-foreground">No food found for “{q}”.</p>}

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button variant="outline" className="h-auto flex-col gap-0.5 py-2.5 whitespace-normal" onClick={onLabel}>
          <span className="flex items-center gap-1.5 text-sm">
            <Tag /> Add from label
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">Saved for everyone</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-0.5 py-2.5 whitespace-normal" onClick={onQuick}>
          <span className="flex items-center gap-1.5 text-sm">
            <PenLine /> Quick add
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">Just type calories</span>
        </Button>
      </div>
    </>
  );
}

function FoodList({
  title,
  foods,
  lastOf,
  onPick,
}: {
  title?: string;
  foods: Food[];
  lastOf: Map<string, { amount: number; unit: string; grams: number }>;
  onPick: (food: Food, last?: { amount: number; unit: string }) => void;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      {title && <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>}
      <Card className="gap-0 overflow-hidden py-0">
        <ItemGroup className="gap-0 divide-y">
          {foods.map((f) => {
            const last = lastOf.get(f.id);
            const s = f.servings[0];
            const grams = last?.grams ?? s?.grams ?? 100;
            const what = last ? amountLabel(last.amount, last.unit) : s ? `1 ${s.label} (${s.grams} ${f.liquid ? 'ml' : 'g'})` : `100 ${f.liquid ? 'ml' : 'g'}`;
            return (
              <Item key={f.id} asChild size="sm" className="flex-nowrap rounded-none px-3 text-left hover:bg-muted/50">
                <button type="button" onClick={() => onPick(f, last)}>
                  <ItemContent className="min-w-0 gap-0.5">
                    <ItemTitle className="w-full">
                      <span className="truncate">{f.name}</span>
                      <SourceBadge food={f} />
                    </ItemTitle>
                    <ItemDescription className="truncate text-xs">
                      {f.brand ? `${f.brand} · ` : ''}
                      {what} · {fmtKcal(nutrientsFor(f, grams).kcal)} kcal
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRight className="size-4 text-muted-foreground/60" />
                  </ItemActions>
                </button>
              </Item>
            );
          })}
        </ItemGroup>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* how much                                                             */
/* ------------------------------------------------------------------ */

function AmountStep({
  food,
  startAmount,
  startUnit,
  meal,
  setMeal,
  edit,
  date,
  onSaved,
  onDeleted,
}: {
  food: Food;
  startAmount?: number;
  startUnit?: string;
  meal: Meal;
  setMeal: (m: Meal) => void;
  edit?: FoodLog;
  date: string;
  onSaved: (text: string) => void;
  onDeleted: () => void;
}) {
  const base = food.liquid ? 'ml' : 'g';
  const units = useMemo(() => [...food.servings, { label: base, grams: 1 }], [food, base]);
  const known = units.find((u) => u.label === startUnit);
  const first = known ?? units[0];
  const [unit, setUnit] = useState(first.label);
  // Last time's amount only makes sense in last time's unit.
  const [amount, setAmount] = useState<number | null>(known && startAmount ? startAmount : first.grams === 1 ? 100 : 1);
  const [oil, setOil] = useState<OilLevel>('normal');
  const unitGrams = units.find((u) => u.label === unit)?.grams ?? 1;
  const isWeight = unitGrams === 1 && unit === base;
  const grams = r1((amount ?? 0) * unitGrams);
  const n = nutrientsFor(food, grams, oil);
  const valid = grams > 0 && grams <= 5000;
  const step = isWeight ? 10 : 0.5;

  const changeUnit = (label: string) => {
    const u = units.find((x) => x.label === label);
    if (!u) return;
    // Keep roughly the same amount of food when switching units.
    const next = grams > 0 ? grams / u.grams : u.grams === 1 ? 100 : 1;
    setUnit(label);
    setAmount(u.grams === 1 ? Math.max(1, Math.round(next)) : Math.max(0.5, Math.round(next * 2) / 2));
  };

  const save = () => {
    if (!valid || amount === null) return;
    const name = food.brand && !food.name.toLowerCase().includes(food.brand.toLowerCase()) ? `${food.name} · ${food.brand}` : food.name;
    const entry = { meal, foodId: food.id, name: name.slice(0, 160), amount: r1(amount * 100) / 100, unit, grams, ...n, source: food.kind };
    if (edit) {
      actions.updateFoodLog(edit.id, entry);
      toast.success('Saved');
    } else {
      actions.addFoodLog({ id: uid(), date, ...entry, loggedAt: Date.now() });
    }
    onSaved(`${food.name} · ${fmtKcal(n.kcal)} kcal`);
  };

  const remove = () => {
    if (!edit) return;
    actions.deleteFoodLog(edit.id);
    toast('Food removed', { action: { label: 'Undo', onClick: () => actions.addFoodLog(edit) } });
    onDeleted();
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{food.name}</p>
          {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
        </div>
        <SourceBadge food={food} className="mt-0.5" />
      </div>

      {units.length > 1 && (
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={1.5}
          value={unit}
          onValueChange={(v) => v && changeUnit(v)}
          aria-label="Unit"
          className="flex w-full flex-wrap justify-start"
        >
          {units.map((u) => (
            <ToggleGroupItem
              key={u.label}
              value={u.label}
              className="h-9 rounded-lg px-3 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {u.label === base ? (base === 'ml' ? 'millilitres' : 'grams') : `${u.label} · ${u.grams} ${base}`}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-10 shrink-0"
          aria-label="Less"
          disabled={(amount ?? 0) <= step}
          onClick={() => setAmount((a) => Math.max(step, r1((a ?? 0) - step)))}
        >
          <Minus />
        </Button>
        <div className="flex-1">
          <NumberField label={isWeight ? `How much (${base})` : `How many (${unit})`} value={amount} onValue={setAmount} decimal />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-10 shrink-0"
          aria-label="More"
          onClick={() => setAmount((a) => r1((a ?? 0) + step))}
        >
          <Plus />
        </Button>
      </div>

      {food.oil && (
        <Field className="gap-1.5">
          <FieldLabel className="text-xs font-normal text-muted-foreground">Oil / ghee in it</FieldLabel>
          <ToggleGroup type="single" variant="outline" spacing={0} value={oil} onValueChange={(v) => v && setOil(v as OilLevel)} className="w-full">
            {(['less', 'normal', 'extra'] as const).map((o) => (
              <ToggleGroupItem key={o} value={o} className="h-9 flex-1 capitalize data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                {o}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      )}

      <Card className="flex-row items-center justify-between gap-3 bg-muted/40 px-4 py-3">
        <div>
          <div className="text-2xl font-semibold tabular">{valid ? fmtKcal(n.kcal) : '–'}</div>
          <div className="text-xs text-muted-foreground">kcal{valid && !isWeight ? ` · ${grams} ${base}` : ''}</div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {(
            [
              ['Protein', n.protein],
              ['Carbs', n.carbs],
              ['Fat', n.fat],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <div className="text-sm font-semibold tabular">{valid ? `${Math.round(v)} g` : '–'}</div>
              <div className="text-muted-foreground">{k}</div>
            </div>
          ))}
        </div>
      </Card>

      <MealPicker meal={meal} setMeal={setMeal} />

      <div className="flex gap-2">
        {edit && (
          <Button variant="outline" className="h-11 text-destructive" onClick={remove} aria-label="Remove food">
            <Trash2 />
          </Button>
        )}
        <Button className="h-11 flex-1 text-base" disabled={!valid} onClick={save}>
          {edit ? 'Save' : `Add to ${MEAL_LABELS[meal]}`}
        </Button>
      </div>
      {food.approx && (
        <p className="-mt-1 text-center text-[11px] text-muted-foreground">Home-style recipe: real calories change with how it’s made.</p>
      )}
    </>
  );
}

function MealPicker({ meal, setMeal }: { meal: Meal; setMeal: (m: Meal) => void }) {
  return (
    <ToggleGroup type="single" variant="outline" spacing={0} value={meal} onValueChange={(v) => v && setMeal(v as Meal)} aria-label="Meal" className="w-full">
      {MEALS.map((m) => (
        <ToggleGroupItem key={m} value={m} className="h-9 flex-1 px-1 text-xs data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
          {MEAL_LABELS[m]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/* ------------------------------------------------------------------ */
/* quick add / add from label / barcode                                 */
/* ------------------------------------------------------------------ */

function QuickAdd({
  edit,
  meal,
  setMeal,
  onSave,
  onDelete,
}: {
  edit?: FoodLog;
  meal: Meal;
  setMeal: (m: Meal) => void;
  onSave: (name: string, m: { kcal: number; protein: number; carbs: number; fat: number }) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(edit && edit.name !== 'Quick add' ? edit.name : '');
  const [kcal, setKcal] = useState<number | null>(edit?.kcal ?? null);
  const [p, setP] = useState<number | null>(edit?.protein || null);
  const [c, setC] = useState<number | null>(edit?.carbs || null);
  const [f, setF] = useState<number | null>(edit?.fat || null);
  const ok = !!kcal && kcal > 0 && kcal <= 5000;
  return (
    <>
      {!edit && <p className="text-sm text-muted-foreground">For a meal out or anything you only know the calories of. It’s saved just for you.</p>}
      <Field className="gap-1">
        <FieldLabel htmlFor="quick-name" className="text-xs font-normal text-muted-foreground">
          What was it? (optional)
        </FieldLabel>
        <Input id="quick-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Wedding dinner" className="h-10" maxLength={80} />
      </Field>
      <NumberField label="Calories (kcal)" value={kcal} onValue={setKcal} placeholder="500" />
      <div className="grid grid-cols-3 gap-2">
        <NumberField label="Protein g" value={p} onValue={setP} decimal placeholder="–" />
        <NumberField label="Carbs g" value={c} onValue={setC} decimal placeholder="–" />
        <NumberField label="Fat g" value={f} onValue={setF} decimal placeholder="–" />
      </div>
      {edit && <MealPicker meal={meal} setMeal={setMeal} />}
      <div className="flex gap-2">
        {edit && (
          <Button variant="outline" className="h-11 text-destructive" onClick={onDelete} aria-label="Remove food">
            <Trash2 />
          </Button>
        )}
        <Button
          className="h-11 flex-1 text-base"
          disabled={!ok}
          onClick={() => onSave(name.trim() || 'Quick add', { kcal: Math.round(kcal!), protein: p ?? 0, carbs: c ?? 0, fat: f ?? 0 })}
        >
          {edit ? 'Save' : `Add ${ok ? `${fmtKcal(kcal!)} kcal` : ''}`}
        </Button>
      </div>
    </>
  );
}

interface CatalogRow {
  id: string;
  source: 'usda' | 'off' | 'user';
  name: string;
  brand: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: { label: string; grams: number }[] | null;
  liquid: boolean;
}

/** A food typed from its pack label. Shared with everyone (marked "User added") once the numbers add up. */
function AddFromLabel({ barcode: scanned, name: startName, brand: startBrand, onSaved }: { barcode?: string; name?: string; brand?: string; onSaved: (f: Food) => void }) {
  const [name, setName] = useState(startName ?? '');
  const [brand, setBrand] = useState(startBrand ?? '');
  const [barcode, setBarcode] = useState(scanned ?? '');
  const [liquid, setLiquid] = useState(false);
  const [kcal, setKcal] = useState<number | null>(null);
  const [p, setP] = useState<number | null>(null);
  const [c, setC] = useState<number | null>(null);
  const [f, setF] = useState<number | null>(null);
  const [serving, setServing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const filled = name.trim().length >= 2 && kcal !== null && p !== null && c !== null && f !== null;
  const per100 = { kcal: kcal ?? 0, protein: p ?? 0, carbs: c ?? 0, fat: f ?? 0 };
  const adds = filled && believable(per100);
  const unit = liquid ? 'ml' : 'g';

  const save = async () => {
    if (!adds) return;
    setSaving(true);
    const servings = serving && serving > 0 && serving <= 2000 ? [{ label: 'serving', grams: serving }] : [];
    let food: Food | null = null;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase().rpc('add_food', {
        p_name: name.trim(),
        p_brand: brand.trim(),
        p_barcode: /^\d{6,14}$/.test(barcode) ? barcode : '',
        p_kcal: per100.kcal,
        p_protein: per100.protein,
        p_carbs: per100.carbs,
        p_fat: per100.fat,
        p_servings: servings,
        p_liquid: liquid,
      });
      const r = data as CatalogRow | null;
      if (!error && r) {
        food = {
          id: r.id,
          name: r.name,
          brand: r.brand ?? undefined,
          kind: r.source,
          per100: { kcal: Math.round(Number(r.kcal)), protein: Number(r.protein), carbs: Number(r.carbs), fat: Number(r.fat) },
          servings: r.servings ?? [],
          liquid: r.liquid,
        };
        toast.success(r.source === 'user' ? 'Saved. Everyone can find it now' : 'This barcode was already known: using its label values');
      } else if (error && /too many/i.test(error.message)) {
        toast.error('You’ve added a lot of foods today. It’s saved just for you.');
      }
    }
    // Offline or not shared: still usable, just for you.
    food ??= { id: `quick:${uid()}`, name: name.trim(), brand: brand.trim() || undefined, kind: 'quick', per100, servings, liquid };
    setSaving(false);
    onSaved(food);
  };

  return (
    <>
      <p className="text-sm text-muted-foreground">Copy the numbers from the nutrition table on the pack. Everyone using RepUp will be able to find it.</p>
      <Field className="gap-1">
        <FieldLabel htmlFor="label-name" className="text-xs font-normal text-muted-foreground">
          Food name
        </FieldLabel>
        <Input id="label-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masala oats" className="h-10" maxLength={120} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field className="gap-1">
          <FieldLabel htmlFor="label-brand" className="text-xs font-normal text-muted-foreground">
            Brand (optional)
          </FieldLabel>
          <Input id="label-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className="h-10" maxLength={80} />
        </Field>
        <Field className="gap-1">
          <FieldLabel htmlFor="label-code" className="text-xs font-normal text-muted-foreground">
            Barcode (optional)
          </FieldLabel>
          <Input
            id="label-code"
            inputMode="numeric"
            value={barcode}
            readOnly={!!scanned}
            onChange={(e) => setBarcode(e.target.value.replace(/\D/g, '').slice(0, 14))}
            className="h-10 tabular"
          />
        </Field>
      </div>
      <ToggleGroup type="single" variant="outline" spacing={0} value={liquid ? 'ml' : 'g'} onValueChange={(v) => v && setLiquid(v === 'ml')} className="w-full">
        <ToggleGroupItem value="g" className="h-9 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
          Per 100 g
        </ToggleGroupItem>
        <ToggleGroupItem value="ml" className="h-9 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
          Per 100 ml (drink)
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NumberField label="Energy (kcal)" value={kcal} onValue={setKcal} decimal />
        <NumberField label="Protein (g)" value={p} onValue={setP} decimal />
        <NumberField label="Carbs (g)" value={c} onValue={setC} decimal />
        <NumberField label="Fat (g)" value={f} onValue={setF} decimal />
      </div>
      <NumberField label={`One serving (${unit}), optional`} value={serving} onValue={setServing} decimal placeholder="30" />
      {filled && !adds && (
        <FieldDescription className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
          These numbers don’t add up. Check the label: calories should be about 4 × protein + 4 × carbs + 9 × fat (here{' '}
          {Math.round(4 * per100.protein + 4 * per100.carbs + 9 * per100.fat)}). Use the “per 100 {unit}” column, not per serving.
        </FieldDescription>
      )}
      <Button className="h-11 text-base" disabled={!adds || saving} onClick={() => void save()}>
        {saving ? <Loader2 className="animate-spin" /> : null} Save food
      </Button>
    </>
  );
}

function ScanStep({ onFound, onMissing }: { onFound: (f: Food) => void; onMissing: (s: { barcode: string; name?: string; brand?: string }) => void }) {
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0);
  const busyRef = useRef(false);
  const look = async (code: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await fetch(`/api/food/barcode?code=${code}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { found: true; food: Food } | { found: false; name?: string; brand?: string };
      if (data.found) onFound(data.food);
      else {
        toast('Not found yet. Add it from the label, and it’ll be there for everyone next time.');
        onMissing({ barcode: code, name: data.name, brand: data.brand });
      }
    } catch {
      toast.error(navigator.onLine ? 'Couldn’t look up that barcode. Try again.' : 'You’re offline. Search by name instead.');
      setKey((k) => k + 1); // restart the camera
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  return <BarcodeScanner key={key} busy={busy} onCode={(c) => void look(c)} />;
}

