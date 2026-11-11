import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { formatW } from '@/lib/utils';
import { Modal } from './Modal';
import { NumberField } from './NumberField';

const PLATES = { kg: [25, 20, 15, 10, 5, 2.5, 1.25], lb: [45, 35, 25, 10, 5, 2.5] };
const BARS = { kg: [20, 15, 10], lb: [45, 35, 25] };
/** Plates need 2 decimals (1.25 kg), unlike set weights. */
const plate = (p: number) => String(Math.round(p * 100) / 100);

/** Greedy split of (target − bar) / 2 into the available plates. */
export function platesPerSide(target: number, bar: number, plates: number[]): { plates: number[]; loaded: number } {
  let left = Math.max(0, (target - bar) / 2);
  const out: number[] = [];
  for (const p of plates) {
    while (left >= p - 1e-9) {
      out.push(p);
      left -= p;
    }
  }
  return { plates: out, loaded: bar + out.reduce((a, b) => a + b, 0) * 2 };
}

export function PlateCalculator({ initial, onClose }: { initial: number | null; onClose: () => void }) {
  const { settings } = useAppState();
  const unit = settings.unit;
  const [target, setTarget] = useState<number | null>(initial);
  const [bar, setBar] = useState(BARS[unit][0]);
  const result = target ? platesPerSide(target, bar, PLATES[unit]) : null;

  return (
    <Modal title="Plate calculator" onClose={onClose}>
      <div className="plate-inputs">
        <NumberField label={`Total weight (${unit})`} decimal value={target} onValue={setTarget} placeholder="e.g. 100" />
        <div className="num-field">
          <small>Bar</small>
          <div className="segmented">
            {BARS[unit].map((b) => (
              <button key={b} className={bar === b ? 'on' : ''} onClick={() => setBar(b)}>
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && target ? (
        target < bar ? (
          <p className="muted center">The bar alone is {formatW(bar)}.</p>
        ) : (
          <div className="plate-result">
            <p className="muted small center">On each side of the bar</p>
            <div className="plate-bar" aria-hidden>
              <span className="bar-end" />
              {result.plates.map((p, i) => (
                <span key={i} className="plate" style={{ height: `${38 + (p / PLATES[unit][0]) * 62}%` }}>
                  {plate(p)}
                </span>
              ))}
            </div>
            <p className="plate-list">
              {result.plates.length ? result.plates.map((p) => plate(p)).join(' + ') : 'No plates — just the bar'}
            </p>
            {Math.abs(result.loaded - target) > 1e-6 && (
              <p className="muted small center">
                Closest you can load: <strong className="text">{formatW(result.loaded)}</strong>
              </p>
            )}
          </div>
        )
      ) : (
        <p className="muted center">Type the total weight you want on the bar.</p>
      )}
    </Modal>
  );
}
