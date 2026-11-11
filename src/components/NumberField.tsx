import { useState } from 'react';

/** Labelled number box. Keeps the raw text while typing so "62." is not lost. */
export function NumberField({
  label,
  value,
  onValue,
  decimal = false,
  placeholder,
  hideLabel = false,
}: {
  label: string;
  value: number | null | undefined;
  onValue: (n: number | null) => void;
  decimal?: boolean;
  placeholder?: string;
  /** Visually hide the label (still read by screen readers), e.g. on repeated rows. */
  hideLabel?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className="num-field">
      <small className={hideLabel ? 'sr-only' : undefined}>{label}</small>
      <input
        className="input"
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        autoComplete="off"
        placeholder={placeholder}
        value={draft ?? (value ?? '')}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const v = e.target.value.replace(decimal ? /[^0-9.,]/g : /[^0-9]/g, '');
          setDraft(v);
          const n = Number(v.replace(',', '.'));
          onValue(v.trim() === '' || !Number.isFinite(n) ? null : n);
        }}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
}
