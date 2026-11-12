'use client';

import { useId } from 'react';
import { Area, AreaChart, Bar, BarChart as RBarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';

/**
 * shadcn/ui charts (Recharts). Tap / hover a point or bar to see its value.
 * Same props as before so screens didn't need to change.
 */

export interface Point {
  label: string;
  value: number;
  /** Longer text for the tooltip (defaults to label). */
  detail?: string;
}

type Fmt = (v: number) => string;
const defaultFmt: Fmt = (v) => String(Math.round(v * 10) / 10);

/** 3–5 round tick values covering [min, max] (e.g. 40, 50, 60, 70). */
function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.1);
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((x) => x >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step + step / 2; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

const config = { value: { label: 'Value', color: 'var(--chart-1)' } } satisfies ChartConfig;

/** Tooltip body: value first (bold), then the date / detail. */
function Tip({ active, payload, fmt }: { active?: boolean; payload?: { payload: Point }[]; fmt: Fmt }) {
  const p = active && payload?.[0]?.payload;
  if (!p) return null;
  return (
    <div data-chart-tip className="grid min-w-32 gap-0.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-xl">
      <span className="text-sm font-semibold text-popover-foreground tabular">{fmt(p.value)}</span>
      <span className="text-muted-foreground">{p.detail ?? p.label}</span>
    </div>
  );
}

function Empty() {
  return <p className="py-10 text-center text-sm text-muted-foreground">No data yet</p>;
}

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
  if (points.length === 0) return <Empty />;
  const values = points.map((p) => p.value);
  const ticks = niceTicks(Math.min(...values), Math.max(...values));

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }} role="img" aria-label={label}>
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
        <YAxis
          width={48}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          ticks={ticks}
          domain={[ticks[0], ticks[ticks.length - 1]]}
          interval={0}
          tickFormatter={(v: number) => fmt(v)}
        />
        <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<Tip fmt={fmt} />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gid})`}
          dot={points.length <= 24 ? { r: 3, fill: 'var(--color-value)', strokeWidth: 0 } : false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function BarChart({
  points,
  fmt = defaultFmt,
  height = 200,
  label = 'Bar chart',
  highlightLast = true,
}: {
  points: Point[];
  fmt?: Fmt;
  height?: number;
  label?: string;
  highlightLast?: boolean;
}) {
  if (points.length === 0) return <Empty />;
  const last = points.length - 1;

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }} role="img" aria-label={label}>
      <RBarChart data={points} margin={{ top: 20, right: 4, bottom: 0, left: 4 }} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} fontSize={11} />
        <YAxis hide domain={[0, (max: number) => Math.max(1, max)]} />
        <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<Tip fmt={fmt} />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false}>
          {points.map((_, i) => (
            <Cell key={i} fill="var(--color-value)" fillOpacity={highlightLast && i !== last ? 0.4 : 1} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            offset={6}
            className="fill-foreground text-[11px] font-semibold"
            formatter={(v: unknown) => (typeof v === 'number' && v > 0 ? fmt(v) : '')}
          />
        </Bar>
      </RBarChart>
    </ChartContainer>
  );
}
