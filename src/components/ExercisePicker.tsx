import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { actions, useAppState } from '@/lib/store';
import { MUSCLES, type Muscle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ExerciseEditor } from './ExerciseEditor';
import { Modal } from './Modal';

interface Props {
  title?: string;
  onClose: () => void;
  onPick: (exerciseIds: string[]) => void;
}

/** Pick existing exercises (multi-select, keeps tap order) or type a new name to create one. */
export function ExercisePicker({ title = 'Add exercise', onClose, onPick }: Props) {
  const { exercises } = useAppState();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<Muscle | 'All'>('All');
  const [newMuscle, setNewMuscle] = useState<Muscle>('Chest');
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingEx = editingId ? exercises.find((x) => x.id === editingId) : undefined;

  const q = query.trim();
  const list = useMemo(() => {
    const lq = q.toLowerCase();
    return exercises
      .filter((e) => (muscle === 'All' || e.muscle === muscle) && (!lq || e.name.toLowerCase().includes(lq)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, q, muscle]);
  const exact = exercises.some((e) => e.name.toLowerCase() === q.toLowerCase());

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const createNew = () => {
    if (!q || exact) return;
    const e = actions.addExercise({ name: q, muscle: muscle === 'All' ? newMuscle : muscle, equipment: 'Other' });
    setSelected((s) => [...s, e.id]);
    setQuery('');
    toast.success(`“${e.name}” added to your exercises`);
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <Button size="lg" className="h-11 w-full text-base" disabled={!selected.length} onClick={() => onPick(selected)}>
          {selected.length ? `Add ${selected.length} exercise${selected.length > 1 ? 's' : ''}` : 'Tap exercises to select'}
        </Button>
      }
    >
      <InputGroup className="h-10">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search or type a new exercise"
          aria-label="Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !list.length && createNew()}
          enterKeyHint="search"
          autoFocus
        />
      </InputGroup>

      {q && !exact && (
        <Item variant="outline" size="sm" className="border-dashed border-primary/40 bg-accent text-accent-foreground">
          <ItemContent className="min-w-0 gap-0.5">
            <ItemDescription className="text-xs text-accent-foreground/75">{list.length ? 'Not the one?' : 'Not in the list'}</ItemDescription>
            <ItemTitle className="w-full truncate font-semibold">Add “{q}” as new</ItemTitle>
          </ItemContent>
          <ItemActions>
            {muscle === 'All' && (
              <Select value={newMuscle} onValueChange={(v) => setNewMuscle(v as Muscle)}>
                <SelectTrigger className="bg-background data-[size=default]:h-9" aria-label="Muscle group">
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
            )}
            <Button className="h-9" onClick={createNew}>
              <Plus /> Add
            </Button>
          </ItemActions>
        </Item>
      )}

      <div className="-mx-4 flex shrink-0 gap-2 overflow-x-auto px-4 no-scrollbar sm:-mx-5 sm:px-5" role="group" aria-label="Filter by muscle">
        {(['All', ...MUSCLES] as const).map((m) => (
          <Button
            key={m}
            size="sm"
            variant={muscle === m ? 'default' : 'outline'}
            className="h-8 shrink-0 rounded-full px-3"
            aria-pressed={muscle === m}
            onClick={() => setMuscle(m)}
          >
            {m}
          </Button>
        ))}
      </div>

      <ItemGroup className="gap-1.5">
        {list.map((e) => {
          const on = selected.includes(e.id);
          return (
            <div key={e.id} role="listitem" className="flex items-stretch gap-1.5">
              <Item
                asChild
                variant="outline"
                size="sm"
                className={cn(
                  'min-h-12 min-w-0 flex-1 cursor-pointer flex-nowrap bg-card py-2 text-left hover:bg-muted',
                  on && 'border-primary bg-accent hover:bg-accent',
                )}
              >
                <button type="button" onClick={() => toggle(e.id)} aria-pressed={on}>
                  <ItemContent className="min-w-0 gap-0.5">
                    <ItemTitle className="w-full truncate">{e.name}</ItemTitle>
                    <ItemDescription className="text-xs">
                      {e.muscle}
                      {e.custom ? ' · yours' : ''}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full border text-muted-foreground',
                        on && 'border-primary bg-primary text-primary-foreground',
                      )}
                      aria-hidden
                    >
                      {on ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                    </span>
                  </ItemActions>
                </button>
              </Item>
              {e.custom && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-auto w-11 shrink-0 bg-card"
                  aria-label={`Rename or delete ${e.name}`}
                  title="Rename or delete"
                  onClick={() => setEditingId(e.id)}
                >
                  <Pencil />
                </Button>
              )}
            </div>
          );
        })}
      </ItemGroup>
      {editingEx && (
        <ExerciseEditor
          exercise={editingEx}
          onClose={() => setEditingId(null)}
          onDeleted={() => setSelected((sel) => sel.filter((x) => x !== editingEx.id))}
        />
      )}
    </Modal>
  );
}
