import { useRef } from 'react';
import { toast } from 'sonner';
import { actions, useAppState } from '@/lib/store';
import { setThemePref, useTheme, type ThemePref } from '@/lib/theme';
import { todayISO } from '@/lib/utils';
import { confirmDialog } from '../Confirm';
import { Modal } from '../Modal';

const REST_OPTIONS = [0, 30, 45, 60, 90, 120, 150, 180, 240, 300];
const THEMES: { id: ThemePref; label: string }[] = [
  { id: 'light', label: '☀️ Light' },
  { id: 'dark', label: '🌙 Dark' },
  { id: 'system', label: 'Auto' },
];

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, workouts } = useAppState();
  const { pref } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([actions.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repup-backup-${todayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('Backup saved to your downloads');
  };

  const importData = async (file: File) => {
    const text = await file.text();
    const ok = await confirmDialog({
      title: 'Restore this backup?',
      message: 'Everything currently in the app will be replaced by the backup.',
      confirmLabel: 'Restore',
      danger: true,
    });
    if (!ok) return;
    if (actions.importJSON(text)) toast.success('Backup restored');
    else toast.error('This file is not a valid RepUp backup.');
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="field">
        <span>Theme</span>
        <div className="segmented" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button key={t.id} role="radio" aria-checked={pref === t.id} className={pref === t.id ? 'on' : ''} onClick={() => setThemePref(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="muted small">Auto follows your phone&apos;s setting.</p>
      </div>

      <div className="field">
        <span>Weight unit</span>
        <div className="segmented" role="radiogroup" aria-label="Weight unit">
          {(['kg', 'lb'] as const).map((u) => (
            <button
              key={u}
              role="radio"
              aria-checked={settings.unit === u}
              className={settings.unit === u ? 'on' : ''}
              onClick={() => {
                actions.updateSettings({ unit: u });
                toast.success(`Weights now shown in ${u}`);
              }}
            >
              {u === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}
            </button>
          ))}
        </div>
        <p className="muted small">Pick once. Switching later does not convert numbers you already saved.</p>
      </div>

      <label className="field">
        <span>Rest timer after each set</span>
        <select
          className="input"
          value={settings.restSeconds}
          onChange={(e) => actions.updateSettings({ restSeconds: Number(e.target.value) })}
        >
          {REST_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 0 ? 'Off' : s < 60 ? `${s} sec` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`}
            </option>
          ))}
        </select>
      </label>

      <div className="field">
        <span>Backup ({workouts.length} workouts saved on this device)</span>
        <div className="row gap">
          <button className="btn grow" onClick={exportData}>
            ⬇ Save backup
          </button>
          <button className="btn grow" onClick={() => fileRef.current?.click()}>
            ⬆ Restore
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importData(f);
            e.target.value = '';
          }}
        />
        <p className="muted small">Your data is saved only in this browser for now. Login & cloud sync are coming next.</p>
      </div>

      <div className="field">
        <span>Install on your phone</span>
        <p className="muted small">
          Android (Chrome): menu ⋮ → <b>Install app</b>. iPhone (Safari): Share → <b>Add to Home Screen</b>.
        </p>
      </div>

      <button
        className="btn danger-text block"
        onClick={async () => {
          const ok = await confirmDialog({
            title: 'Delete everything?',
            message: 'All workouts, plans, body weights and settings will be deleted. Save a backup first if you might want them. This cannot be undone.',
            confirmLabel: 'Delete everything',
            danger: true,
          });
          if (!ok) return;
          actions.resetAll();
          onClose();
          toast('All data deleted');
        }}
      >
        Reset all data
      </button>
    </Modal>
  );
}
