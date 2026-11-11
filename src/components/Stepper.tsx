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
    <div className="stepper" role="group" aria-label={label}>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label ?? ''}`}>
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label ?? ''}`}>
        +
      </button>
    </div>
  );
}
