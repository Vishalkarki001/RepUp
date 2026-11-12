'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { useAppState } from '@/lib/store';
import { MUSCLES, type Muscle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SectionTitle } from '../common';
import { ScreenHeader } from '../ScreenHeader';
import { ExerciseEditor } from '../ExerciseEditor';
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
        <ExerciseEditor initialName={query.trim()} initialMuscle={muscle === 'All' ? 'Chest' : muscle} onClose={() => setCreating(false)} />
      )}
    </div>
  );
}
