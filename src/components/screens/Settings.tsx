import { useId, useRef } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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

const restLabel = (s: number) => (s === 0 ? 'Off' : s < 60 ? `${s} sec` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`);

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, workouts } = useAppState();
  const { pref } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const restId = useId();

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
      <FieldGroup className="gap-6">
        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Theme
          </FieldLegend>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            className="w-full"
            aria-label="Theme"
            value={pref}
            onValueChange={(v) => v && setThemePref(v as ThemePref)}
          >
            {THEMES.map((t) => (
              <ToggleGroupItem key={t.id} value={t.id} className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                {t.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription className="text-xs">Auto follows your phone&apos;s setting.</FieldDescription>
        </FieldSet>

        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Weight unit
          </FieldLegend>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            className="w-full"
            aria-label="Weight unit"
            value={settings.unit}
            onValueChange={(v) => {
              if (v !== 'kg' && v !== 'lb') return;
              actions.updateSettings({ unit: v });
              toast.success(`Weights now shown in ${v}`);
            }}
          >
            {(['kg', 'lb'] as const).map((u) => (
              <ToggleGroupItem key={u} value={u} className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                {u === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription className="text-xs">Pick once. Switching later does not convert numbers you already saved.</FieldDescription>
        </FieldSet>

        <Field className="gap-2">
          <FieldLabel htmlFor={restId}>Rest timer after each set</FieldLabel>
          <Select value={String(settings.restSeconds)} onValueChange={(v) => actions.updateSettings({ restSeconds: Number(v) })}>
            <SelectTrigger id={restId} className="w-full data-[size=default]:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REST_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {restLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Backup{' '}
            <span className="font-normal text-muted-foreground">
              ({workouts.length} workouts saved on this device)
            </span>
          </FieldLegend>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-10" onClick={exportData}>
              <Download /> Save backup
            </Button>
            <Button variant="outline" className="h-10" onClick={() => fileRef.current?.click()}>
              <Upload /> Restore
            </Button>
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
          <FieldDescription className="text-xs">
            Your data is saved only in this browser for now. Login &amp; cloud sync are coming next.
          </FieldDescription>
        </FieldSet>

        <FieldSet className="gap-1">
          <FieldLegend variant="label" className="mb-0">
            Install on your phone
          </FieldLegend>
          <FieldDescription className="text-xs">
            Android (Chrome): menu ⋮ → <b className="font-medium text-foreground">Install app</b>. iPhone (Safari): Share →{' '}
            <b className="font-medium text-foreground">Add to Home Screen</b>.
          </FieldDescription>
        </FieldSet>
      </FieldGroup>

      <Separator />

      <Button
        variant="destructive"
        className="h-10 w-full"
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
        <Trash2 /> Reset all data
      </Button>
    </Modal>
  );
}
