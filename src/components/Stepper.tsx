import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** − value + control with large tap targets. */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 100,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={label}>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="size-10"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Fewer ${label ?? ''}`}
      >
        <Minus />
      </Button>
      <span aria-live="polite" className="min-w-10 text-center text-lg font-semibold tabular">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="size-10"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`More ${label ?? ''}`}
      >
        <Plus />
      </Button>
    </div>
  );
}
