import { useState } from 'react';
import { Field, FieldTitle } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppState } from '@/lib/store';
import { platesPerSide } from '@/lib/plates';
import { formatW } from '@/lib/utils';
import { Modal } from './Modal';
import { NumberField } from './NumberField';

const PLATES = { kg: [25, 20, 15, 10, 5, 2.5, 1.25], lb: [45, 35, 25, 10, 5, 2.5] };
const BARS = { kg: [20, 15, 10], lb: [45, 35, 25] };
/** Plates need 2 decimals (1.25 kg), unlike set weights. */
const plate = (p: number) => String(Math.round(p * 100) / 100);


export function PlateCalculator({ initial, onClose }: { initial: number | null; onClose: () => void }) {
  const { settings } = useAppState();
  const unit = settings.unit;
  const [target, setTarget] = useState<number | null>(initial);
  const [bar, setBar] = useState(BARS[unit][0]);
  const result = target ? platesPerSide(target, bar, PLATES[unit]) : null;

  return (
    <Modal title="Plate calculator" onClose={onClose}>
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <NumberField label={`Total weight (${unit})`} decimal value={target} onValue={setTarget} placeholder="e.g. 100" />
        </div>
        <Field className="w-auto shrink-0 gap-1.5 *:w-auto">
          <FieldTitle className="text-xs text-muted-foreground">Bar</FieldTitle>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={String(bar)}
            onValueChange={(v) => v && setBar(Number(v))}
            aria-label="Bar weight"
          >
            {BARS[unit].map((b) => (
              <ToggleGroupItem
                key={b}
                value={String(b)}
                className="h-9 min-w-10 tabular data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                {b}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </div>

      {result && target ? (
        target < bar ? (
          <p className="py-4 text-center text-sm text-muted-foreground">The bar alone is {formatW(bar)}.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-center text-xs text-muted-foreground">On each side of the bar</p>
            <div className="flex h-32 items-center gap-1 overflow-x-auto rounded-lg border bg-muted px-3" aria-hidden>
              <span className="h-5 w-3 shrink-0 rounded-sm bg-muted-foreground/40" />
              {result.plates.map((p, i) => (
                <span
                  key={i}
                  className="flex w-7 shrink-0 items-center justify-center rounded-sm bg-primary text-[11px] font-semibold text-primary-foreground tabular [writing-mode:vertical-rl]"
                  style={{ height: `${38 + (p / PLATES[unit][0]) * 62}%` }}
                >
                  {plate(p)}
                </span>
              ))}
              <span className="h-2.5 min-w-6 flex-1 rounded-r-sm bg-muted-foreground/30" />
            </div>
            <p className="text-center text-2xl font-bold tracking-tight tabular">
              {result.plates.length ? result.plates.map((p) => plate(p)).join(' + ') : 'No plates — just the bar'}
            </p>
            {Math.abs(result.loaded - target) > 1e-6 && (
              <p className="text-center text-xs text-muted-foreground">
                Closest you can load: <strong className="font-semibold text-foreground">{formatW(result.loaded)}</strong>
              </p>
            )}
          </div>
        )
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">Type the total weight you want on the bar.</p>
      )}
    </Modal>
  );
}
