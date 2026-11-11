import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { actions, useAppState } from '@/lib/store';
import { EQUIPMENT, MUSCLES, type Equipment, type Muscle } from '@/lib/types';
import { PlusIcon, SearchIcon } from '../Icons';
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
    <div className="screen">
      <ScreenHeader eyebrow={`${s.exercises.length} exercises`} title="Exercises" />

      <div className="row gap">
        <div className="search grow">
          <SearchIcon />
          <input className="input" placeholder="Search exercises" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn primary" onClick={() => setCreating(true)}>
          <PlusIcon size={16} /> New
        </button>
      </div>
      <div className="chips">
        {(['All', ...MUSCLES] as const).map((m) => (
          <button key={m} className={`chip ${muscle === m ? 'on' : ''}`} onClick={() => setMuscle(m)}>
            {m}
          </button>
        ))}
      </div>

      {grouped.map(([m, list]) => (
        <section key={m}>
          <h2 className="section-title">{m}</h2>
          <ul className="lib-list card">
            {list.map((e) => (
              <li key={e.id}>
                <button className="lib-item" onClick={() => setOpenId(e.id)}>
                  <span>
                    <strong>{e.name}</strong>
                    <small>
                      {e.equipment}
                      {e.custom ? ' · yours' : ''}
                    </small>
                  </span>
                  {counts.get(e.id) ? <span className="badge">done {counts.get(e.id)}×</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!grouped.length && (
        <button className="btn ghost block" onClick={() => setCreating(true)}>
          + Create “{query.trim()}”
        </button>
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

  return (
    <Modal
      title="New exercise"
      onClose={onClose}
      footer={
        <button
          className="btn primary block"
          disabled={!name.trim() || duplicate}
          onClick={() => {
            actions.addExercise({ name: name.trim(), muscle, equipment });
            toast.success(`“${name.trim()}” created`);
            onClose();
          }}
        >
          Create exercise
        </button>
      }
    >
      <label className="field">
        <span>Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smith Machine Incline Press" autoFocus />
        {duplicate && <small className="down">An exercise with this name already exists.</small>}
      </label>
      <label className="field">
        <span>Muscle group</span>
        <select className="input" value={muscle} onChange={(e) => setMuscle(e.target.value as Muscle)}>
          {MUSCLES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Equipment (decides how much weight to add when you get stronger)</span>
        <select className="input" value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)}>
          {EQUIPMENT.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
    </Modal>
  );
}
