import { useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemFooter, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { actions, exerciseMap, planForDay, useAppState } from '@/lib/store';
import { unitLabel } from '@/lib/utils';
import { WEEKDAYS, WEEKDAYS_LONG, type PlanItem } from '@/lib/types';
import { NumBadge, SectionTitle } from '../common';
import { ExercisePicker } from '../ExercisePicker';
import { Modal } from '../Modal';
import { NumberField } from '../NumberField';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Edit what to train on one weekday: a name + exercises with sets × reps. */
export function DayPlanEditor({ day, onClose }: { day: number; onClose: () => void }) {
  const s = useAppState();
  const nameId = useId();
  const exMap = useMemo(() => exerciseMap(s), [s]);
  const existing = planForDay(s, day);
  const [name, setName] = useState(existing?.name ?? '');
  const [items, setItems] = useState<PlanItem[]>(existing?.items ?? []);
  const [picking, setPicking] = useState(false);

  const otherDays = DAY_ORDER.filter((d) => d !== day)
    .map((d) => planForDay(s, d))
    .filter((p) => p !== null);

  const patch = (i: number, p: Partial<PlanItem>) => setItems((l) => l.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const move = (i: number, dir: -1 | 1) =>
    setItems((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const copy = [...l];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const save = () => {
    const clean = items.map((x) => ({
      ...x,
      sets: Math.max(1, x.sets || 3),
      reps: Math.max(1, x.reps || s.settings.defaultReps),
      weight: x.weight && x.weight > 0 ? Math.round(x.weight * 100) / 100 : null,
    }));
    actions.savePlan({ day, name: name.trim() || 'Workout', items: clean });
    toast.success(`${WEEKDAYS_LONG[day]}’s workout saved`);
    onClose();
  };

  const makeRestDay = () => {
    const before = existing;
    actions.savePlan({ day, name: '', items: [] });
    onClose();
    toast(`${WEEKDAYS_LONG[day]} plan deleted. It’s a rest day now.`, {
      duration: 6000,
      action: before ? { label: 'Undo', onClick: () => actions.savePlan(before) } : undefined,
    });
  };

  return (
    <Modal
      title={`${WEEKDAYS_LONG[day]}'s workout`}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-2">
          {existing && (
            <Button variant="ghost" className="h-11 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={makeRestDay}>
              <Trash2 /> Delete plan
            </Button>
          )}
          <Button size="lg" className="h-11 flex-1 text-base" onClick={save} disabled={!items.length}>
            {items.length ? 'Save' : 'Add an exercise first'}
          </Button>
        </div>
      }
    >
      <Field className="gap-1.5">
        <FieldLabel htmlFor={nameId}>Workout name</FieldLabel>
        <Input
          id={nameId}
          className="h-10"
          placeholder="e.g. Chest day, Legs, Push"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
      </Field>

      <section className="flex flex-col gap-2">
        <SectionTitle>Exercises</SectionTitle>
        {items.length === 0 && <p className="text-sm text-muted-foreground">No exercises yet. Tap “Add exercise” below.</p>}
        {items.length > 0 && (
          <ItemGroup className="gap-2">
            {items.map((it, i) => (
              <Item key={it.exerciseId + i} role="listitem" variant="outline" size="sm" className="gap-x-2 gap-y-2.5 bg-card p-3">
                <ItemMedia>
                  <NumBadge>{i + 1}</NumBadge>
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="w-full truncate">{exMap.get(it.exerciseId)?.name ?? 'Deleted exercise'}</ItemTitle>
                </ItemContent>
                <ItemActions className="-mr-1 gap-0">
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                    <ChevronUp />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                    <ChevronDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setItems((l) => l.filter((_, j) => j !== i))}
                    aria-label="Remove"
                  >
                    <X />
                  </Button>
                </ItemActions>
                <ItemFooter className="grid grid-cols-3 gap-2">
                  <NumberField label="Sets" value={it.sets || null} onValue={(n) => patch(i, { sets: Math.min(20, n ?? 0) })} />
                  <NumberField label="Reps" value={it.reps || null} onValue={(n) => patch(i, { reps: Math.min(999, n ?? 0) })} />
                  <NumberField
                    label={unitLabel() === 'kg' ? 'Kg' : 'Lb'}
                    decimal
                    placeholder="—"
                    value={it.weight ?? null}
                    onValue={(n) => patch(i, { weight: n })}
                  />
                </ItemFooter>
              </Item>
            ))}
          </ItemGroup>
        )}
        <Button variant="outline" className="h-11 w-full border-dashed" onClick={() => setPicking(true)}>
          <Plus /> Add exercise
        </Button>
        {items.length > 0 && <p className="text-xs text-muted-foreground">Weight is optional — leave it empty if you’re not sure yet.</p>}
      </section>

      {items.length === 0 && otherDays.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>Or copy another day</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {otherDays.map((p) => (
              <Button
                key={p.day}
                variant="secondary"
                size="sm"
                className="h-8 max-w-full"
                onClick={() => {
                  setName(p.name);
                  setItems(p.items.map((x) => ({ ...x })));
                }}
              >
                <span className="truncate">
                  <span className="font-semibold">{WEEKDAYS[p.day]}</span> · {p.name}
                </span>
              </Button>
            ))}
          </div>
        </section>
      )}

      {picking && (
        <ExercisePicker
          onClose={() => setPicking(false)}
          onPick={(ids) => {
            const reps = s.settings.defaultReps;
            setItems((l) => [...l, ...ids.map((exerciseId) => ({ exerciseId, sets: 3, reps }))]);
            setPicking(false);
          }}
        />
      )}
    </Modal>
  );
}
