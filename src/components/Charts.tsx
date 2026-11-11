import { useEffect, useId, useState, type KeyboardEvent, type PointerEvent } from 'react';

/**
 * Small, dependency-free SVG charts. They measure their container so text stays
 * the same size on a phone and on a laptop, and show a tooltip on tap / hover /
 * arrow keys.
 */

export interface Point {
  label: string;
  value: number;
  /** Longer text for the tooltip (defaults to label). */
  detail?: string;
}

type Fmt = (v: number) => string;
const defaultFmt: Fmt = (v) => String(Math.round(v * 10) / 10);

/** Callback ref + live width of that element (re-attaches if the element changes). */
function useWidth<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, width] as const;
}

/** 3–5 round tick values covering [min, max]. */
function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.1);
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

function Tooltip({ x, width, point, fmt }: { x: number; width: number; point: Point; fmt: Fmt }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div className="chart-tip" style={{ left }} role="status">
      <strong>{fmt(point.value)}</strong>
      <span>{point.detail ?? point.label}</span>
    </div>
  );
}

function useKeyNav(n: number, setIdx: (fn: (i: number | null) => number | null) => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setIdx((i) => Math.min(n - 1, (i ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, (i ?? n) - 1));
    else if (e.key === 'Escape') setIdx(() => null);
    else return;
    e.preventDefault();
    e.stopPropagation(); // Escape here clears the tooltip, it must not also close the sheet
  };
}

const PAD = { l: 44, r: 16, t: 18, b: 28 };

export function LineChart({
  points,
  fmt = defaultFmt,
  height = 210,
  label = 'Progress chart',
}: {
  points: Point[];
  fmt?: Fmt;
  height?: number;
  label?: string;
}) {
  const gid = useId().replace(/:/g, '');
  const [ref, W] = useWidth<HTMLDivElement>();
  const [rawIdx, setIdx] = useState<number | null>(null);
  const onKey = useKeyNav(points.length, setIdx);
  // The data can shrink while a point is selected (e.g. an entry deleted).
  const idx = rawIdx !== null && rawIdx < points.length ? rawIdx : null;

  if (points.length === 0) return <p className="muted center chart-empty">No data yet</p>;

  const values = points.map((p) => p.value);
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const min = ticks[0];
  const max = ticks[ticks.length - 1];
  const iw = Math.max(1, W - PAD.l - PAD.r);
  const ih = height - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.t + ih - ((v - min) / (max - min || 1)) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${PAD.t + ih} L${x(0).toFixed(1)},${PAD.t + ih} Z`;
  const maxLabels = Math.max(2, Math.floor(iw / 84));
  const every = Math.ceil(points.length / maxLabels);
  const showDots = points.length <= 24;
  const last = points.length - 1;

  const pick = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = points.length === 1 ? 0 : Math.round(((px - PAD.l) / iw) * (points.length - 1));
    setIdx(Math.max(0, Math.min(last, i)));
  };

  return (
    <div
      ref={ref}
      className="chart-wrap"
      tabIndex={0}
      onKeyDown={onKey}
      onBlur={() => setIdx(null)}
      aria-label={`${label}. Use arrow keys to read values.`}
    >
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label={label}>
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className="area-top" />
              <stop offset="100%" className="area-bottom" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="grid" />
              <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="axis">
                {fmt(t)}
              </text>
            </g>
          ))}
          <path d={area} fill={`url(#${gid})`} />
          <path d={line} className="line" />
          {points.map((p, i) =>
            i % every === 0 || i === last ? (
              <text
                key={'l' + i}
                x={x(i)}
                y={height - 8}
                textAnchor={points.length === 1 ? 'middle' : i === 0 ? 'start' : i === last ? 'end' : 'middle'}
                className="axis"
              >
                {i !== last && last - i < every ? '' : p.label}
              </text>
            ) : null,
          )}
          {showDots && points.map((p, i) => <circle key={'d' + i} cx={x(i)} cy={y(p.value)} r={i === last ? 5 : 3.5} className="dot" />)}
          {idx !== null && (
            <g>
              <line x1={x(idx)} x2={x(idx)} y1={PAD.t} y2={PAD.t + ih} className="crosshair" />
              <circle cx={x(idx)} cy={y(points[idx].value)} r={6} className="dot active" />
            </g>
          )}
          <rect
            x={0}
            y={0}
            width={W}
            height={height}
            fill="transparent"
            className="hit"
            onPointerDown={pick}
            onPointerMove={pick}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setIdx(null)}
          />
        </svg>
      )}
      {idx !== null && W > 0 && <Tooltip x={x(idx)} width={W} point={points[idx]} fmt={fmt} />}
    </div>
  );
}

/** Rounded-top bar path anchored to the baseline. */
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

export function BarChart({
  points,
  fmt = defaultFmt,
  height = 190,
  label = 'Bar chart',
  highlightLast = true,
}: {
  points: Point[];
  fmt?: Fmt;
  height?: number;
  label?: string;
  highlightLast?: boolean;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [rawIdx, setIdx] = useState<number | null>(null);
  const onKey = useKeyNav(points.length, setIdx);
  const idx = rawIdx !== null && rawIdx < points.length ? rawIdx : null;

  const max = Math.max(1, ...points.map((p) => p.value));
  const top = 20;
  const bottom = 26;
  const ih = height - top - bottom;
  const slot = W / Math.max(1, points.length);
  const bw = Math.min(44, slot - 6);
  const last = points.length - 1;

  return (
    <div
      ref={ref}
      className="chart-wrap"
      tabIndex={0}
      onKeyDown={onKey}
      onBlur={() => setIdx(null)}
      aria-label={`${label}. Use arrow keys to read values.`}
    >
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label={label}>
          <line x1={0} x2={W} y1={top + ih} y2={top + ih} className="baseline" />
          {points.map((p, i) => {
            const h = p.value > 0 ? Math.max(3, (p.value / max) * ih) : 0;
            const bx = i * slot + (slot - bw) / 2;
            const on = idx === i;
            return (
              <g key={i}>
                {h > 0 ? (
                  <path
                    d={barPath(bx, top + ih - h, bw, h)}
                    className={`bar ${highlightLast && i === last ? 'current' : ''} ${on ? 'active' : ''}`}
                  />
                ) : (
                  <rect x={bx} y={top + ih - 2} width={bw} height={2} rx={1} className="bar empty" />
                )}
                {p.value > 0 && (
                  <text x={bx + bw / 2} y={top + ih - h - 6} textAnchor="middle" className="axis strong">
                    {fmt(p.value)}
                  </text>
                )}
                <text x={bx + bw / 2} y={height - 8} textAnchor="middle" className="axis">
                  {p.label}
                </text>
                <rect
                  x={i * slot}
                  y={0}
                  width={slot}
                  height={height}
                  fill="transparent"
                  className="hit"
                  onPointerDown={() => setIdx(i)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setIdx(i)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      )}
      {idx !== null && W > 0 && <Tooltip x={idx * slot + slot / 2} width={W} point={points[idx]} fmt={fmt} />}
    </div>
  );
}
