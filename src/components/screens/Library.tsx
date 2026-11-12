'use client';

import { useId, useMemo, useState } from 'react';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { actions, useAppState } from '@/lib/store';
import { EQUIPMENT, MUSCLES, type Equipment, type Muscle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SectionTitle } from '../common';
import { Modal } from '../Modal';
import { ScreenHeader } from '../ScreenHeader';
import { ExerciseHistoryModal } from './ExerciseHistory';

export function LibraryScreen() {
  const s = useAppState();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<Muscle | 'All'>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of s.workouts) for (const e of w.exercises) m.set(e.exerciseId, (m.get(e.exerciseId) ?? 0) + 1);
    return m;
  }, [s.workouts]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = s.exercises
      .filter((e) => (muscle === 'All' || e.muscle === muscle) && (!q || e.name.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
    return MUSCLES.map((m) => [m, list.filter((e) => e.muscle === m)] as const).filter(([, l]) => l.length);
  }, [s.exercises, query, muscle]);

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow={`${s.exercises.length} exercises`} title="Exercises" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <InputGroup className="h-9 min-w-0 flex-1">
            <InputGroupInput
              type="search"
              placeholder="Search exercises"
              aria-label="Search exercises"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <Button className="h-9" onClick={() => setCreating(true)}>
            <Plus /> New
          </Button>
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          {(['All', ...MUSCLES] as const).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={muscle === m ? 'default' : 'outline'}
              aria-pressed={muscle === m}
              className={cn('shrink-0 rounded-full', muscle !== m && 'text-muted-foreground')}
              onClick={() => setMuscle(m)}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {grouped.map(([m, list]) => (
        <section key={m} className="flex flex-col gap-2">
          <SectionTitle>{m}</SectionTitle>
          <Card className="gap-0 py-0">
            <ItemGroup role={undefined} className="gap-0 divide-y">
              {list.map((e) => (
                <Item key={e.id} asChild size="sm" className="flex-nowrap rounded-none px-4 text-left hover:bg-muted/50">
                  <button onClick={() => setOpenId(e.id)}>
                    <ItemContent className="min-w-0 gap-0.5">
                      <ItemTitle className="w-full truncate">{e.name}</ItemTitle>
                      <ItemDescription className="truncate text-xs">
                        {e.equipment}
                        {e.custom ? ' · yours' : ''}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions className="gap-1.5">
                      {counts.get(e.id) ? (
                        <Badge variant="secondary" className="font-normal tabular">
                          done {counts.get(e.id)}×
                        </Badge>
                      ) : null}
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
                    </ItemActions>
                  </button>
                </Item>
              ))}
            </ItemGroup>
          </Card>
        </section>
      ))}
      {!grouped.length && (
        <Button variant="outline" className="w-full border-dashed text-muted-foreground" onClick={() => setCreating(true)}>
          <Plus /> Create “{query.trim()}”
        </Button>
      )}

      {openId && <ExerciseHistoryModal exerciseId={openId} onClose={() => setOpenId(null)} />}
      {creating && (
        <NewExerciseModal
          initialName={query.trim()}
          initialMuscle={muscle === 'All' ? 'Chest' : muscle}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}

function NewExerciseModal({
  initialName,
  initialMuscle,
  onClose,
}: {
  initialName: string;
  initialMuscle: Muscle;
  onClose: () => void;
}) {
  const { exercises } = useAppState();
  const [name, setName] = useState(initialName);
  const [muscle, setMuscle] = useState<Muscle>(initialMuscle);
  const [equipment, setEquipment] = useState<Equipment>('Machine');
  const duplicate = exercises.some((e) => e.name.toLowerCase() === name.trim().toLowerCase());
  const id = useId();

  return (
    <Modal
      title="New exercise"
      onClose={onClose}
      footer={
        <Button
          className="h-10 w-full"
          disabled={!name.trim() || duplicate}
          onClick={() => {
            actions.addExercise({ name: name.trim(), muscle, equipment });
            toast.success(`“${name.trim()}” created`);
            onClose();
          }}
        >
          Create exercise
        </Button>
      }
    >
      <Field data-invalid={duplicate || undefined}>
        <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
        <Input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Smith Machine Incline Press"
          aria-invalid={duplicate || undefined}
          autoFocus
        />
        {duplicate && <FieldError className="text-xs">An exercise with this name already exists.</FieldError>}
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-muscle`}>Muscle group</FieldLabel>
        <Select value={muscle} onValueChange={(v) => setMuscle(v as Muscle)}>
          <SelectTrigger id={`${id}-muscle`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MUSCLES.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-equipment`}>Equipment</FieldLabel>
        <Select value={equipment} onValueChange={(v) => setEquipment(v as Equipment)}>
          <SelectTrigger id={`${id}-equipment`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription className="text-xs">Decides how much weight to add when you get stronger.</FieldDescription>
      </Field>
    </Modal>
  );
}
