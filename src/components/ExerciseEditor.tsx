'use client';

import { useId, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { actions, getState, useAppState } from '@/lib/store';
import { EQUIPMENT, MUSCLES, WEEKDAYS, type Equipment, type Exercise, type Muscle } from '@/lib/types';
import { confirmDialog } from './Confirm';
import { Modal } from './Modal';

/**
 * Create a new exercise, or fix / delete one the user made.
 * Renaming keeps the same exercise, so its history and plans follow the new name.
 */
export function ExerciseEditor({
  exercise,
  initialName = '',
  initialMuscle = 'Chest',
  onClose,
  onCreated,
  onDeleted,
}: {
  /** Pass an exercise to edit it; leave out to create a new one. */
  exercise?: Exercise;
  initialName?: string;
  initialMuscle?: Muscle;
  onClose: () => void;
  onCreated?: (ex: Exercise) => void;
  onDeleted?: () => void;
}) {
  const { exercises } = useAppState();
  const editing = !!exercise;
  const [name, setName] = useState(exercise?.name ?? initialName);
  const [muscle, setMuscle] = useState<Muscle>(exercise?.muscle ?? initialMuscle);
  const [equipment, setEquipment] = useState<Equipment>(exercise?.equipment ?? 'Machine');
  const id = useId();

  const clean = name.trim().replace(/\s+/g, ' ');
  const duplicate = exercises.some((e) => e.id !== exercise?.id && e.name.toLowerCase() === clean.toLowerCase());
  const unchanged = editing && clean === exercise.name && muscle === exercise.muscle && equipment === exercise.equipment;

  const save = () => {
    if (!clean || duplicate) return;
    if (editing) {
      actions.updateExercise(exercise.id, { name: clean, muscle, equipment });
      toast.success(clean !== exercise.name ? `Renamed to “${clean}”` : 'Exercise updated');
    } else {
      const created = actions.addExercise({ name: clean, muscle, equipment });
      toast.success(`“${clean}” created`);
      onCreated?.(created);
    }
    onClose();
  };

  const remove = async () => {
    if (!exercise) return;
    const s = getState();
    const workouts = s.workouts.filter((w) => w.exercises.some((e) => e.exerciseId === exercise.id)).length;
    const days = s.plans.filter((p) => p.items.some((i) => i.exerciseId === exercise.id)).map((p) => WEEKDAYS[p.day]);
    const used = [
      workouts ? `${workouts} past workout${workouts === 1 ? '' : 's'} (they keep their numbers, shown as “Deleted exercise”)` : '',
      days.length ? `your ${days.join(', ')} plan${days.length === 1 ? '' : 's'} (it will be removed)` : '',
    ].filter(Boolean);
    const ok = await confirmDialog({
      title: `Delete “${exercise.name}”?`,
      message: used.length
        ? `It’s used in ${used.join(' and in ')}. If only the name is wrong, use Save with the right name instead.`
        : 'It isn’t used in any workout or plan yet.',
      confirmLabel: 'Delete exercise',
      danger: true,
    });
    if (!ok) return;
    actions.deleteExercise(exercise.id);
    toast(`“${exercise.name}” deleted`);
    onDeleted?.();
    onClose();
  };

  return (
    <Modal
      title={editing ? 'Edit exercise' : 'New exercise'}
      description={editing ? 'Fix a typo or change the muscle group. Your history keeps working.' : undefined}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="h-10 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={remove}>
              <Trash2 /> Delete
            </Button>
          )}
          <Button className="h-10 flex-1" disabled={!clean || duplicate || unchanged} onClick={save}>
            {editing ? 'Save' : 'Create exercise'}
          </Button>
        </div>
      }
    >
      <Field data-invalid={duplicate || undefined}>
        <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
        <Input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="e.g. Smith Machine Incline Press"
          aria-invalid={duplicate || undefined}
          maxLength={60}
          autoFocus
        />
        {duplicate && <FieldError className="text-xs">An exercise with this name already exists.</FieldError>}
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-muscle`}>Muscle group</FieldLabel>
        <Select value={muscle} onValueChange={(v) => setMuscle(v as Muscle)}>
          <SelectTrigger id={`${id}-muscle`} className="w-full data-[size=default]:h-10">
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
          <SelectTrigger id={`${id}-equipment`} className="w-full data-[size=default]:h-10">
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
