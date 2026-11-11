import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { actions, useAppState } from '@/lib/store';
import { MUSCLES, type Muscle } from '@/lib/types';
import { CheckIcon, PlusIcon, SearchIcon } from './Icons';
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
        <button className="btn primary block lg" disabled={!selected.length} onClick={() => onPick(selected)}>
          {selected.length ? `Add ${selected.length} exercise${selected.length > 1 ? 's' : ''}` : 'Tap exercises to select'}
        </button>
      }
    >
      <div className="search">
        <SearchIcon />
        <input
          className="input"
          placeholder="Search or type a new exercise"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !list.length && createNew()}
          enterKeyHint="search"
          autoFocus
        />
      </div>

      {q && !exact && (
        <div className="create-box">
          <div className="grow">
            <small className="muted">{list.length ? 'Not the one?' : 'Not in the list'}</small>
            <strong>Add “{q}” as new</strong>
          </div>
          {muscle === 'All' && (
            <select
              className="input compact"
              value={newMuscle}
              onChange={(e) => setNewMuscle(e.target.value as Muscle)}
              aria-label="Muscle group"
            >
              {MUSCLES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          )}
          <button className="btn primary small" onClick={createNew}>
            <PlusIcon size={16} /> Add
          </button>
        </div>
      )}

      <div className="chips">
        {(['All', ...MUSCLES] as const).map((m) => (
          <button key={m} className={`chip ${muscle === m ? 'on' : ''}`} onClick={() => setMuscle(m)}>
            {m}
          </button>
        ))}
      </div>

      <ul className="pick-list">
        {list.map((e) => {
          const order = selected.indexOf(e.id);
          return (
            <li key={e.id}>
              <button className={`pick-item ${order >= 0 ? 'on' : ''}`} onClick={() => toggle(e.id)} aria-pressed={order >= 0}>
                <span className="grow">
                  <strong>{e.name}</strong>
                  <small>
                    {e.muscle}
                    {e.custom ? ' · yours' : ''}
                  </small>
                </span>
                <span className="pick-badge">{order >= 0 ? <CheckIcon size={14} /> : <PlusIcon size={14} />}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
