'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, GlassWater, Loader2, RefreshCw, Search, Utensils, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadFoodPdf } from '@/lib/exportPdf';
import { MEAL_LABELS, MEALS, type FoodLog } from '@/lib/types';
import { cn } from '@/lib/utils';
import { adminApi, displayName, type AdminFoodDay } from './api';

const DAYS = 14;
const r = Math.round;
const kcal = (n: number) => r(Number(n)).toLocaleString('en-IN');

/** "Fri, 13 Nov" from "2026-11-13" (a diary date is the person's own calendar day). */
function dayLabel(date: string, withYear = false): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
}

/** "1.5 roti", "300 g" */
function amount(f: AdminFoodDay['foods'][number]): string {
  if (f.source === 'quick') return 'Quick add';
  const n = +Number(f.amount).toFixed(2);
  return f.unit === 'g' || f.unit === 'ml' ? `${n} ${f.unit}` : `${n} ${f.unit} (${r(Number(f.grams))} g)`;
}

/** Everyone's food diaries, one row per person per day (newest first). Can be narrowed to one person or searched. */
export function AdminFoodDiary({ user, onClearUser }: { user: { id: string; label: string } | null; onClearUser: () => void }) {
  const [rows, setRows] = useState<AdminFoodDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<AdminFoodDay | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (append = false, before: string | null = null) => {
      setLoading(true);
      const res = await adminApi.foodDays({ user: user?.id ?? null, search, before, days: DAYS });
      setLoading(false);
      setError(res.error);
      if (!res.data) return;
      setRows((prev) => (append && prev ? [...prev, ...res.data!] : res.data));
      setMore(new Set(res.data.map((d) => d.date)).size === DAYS);
    },
    [user?.id, search],
  );

  useEffect(() => {
    setRows(null);
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-9 sm:max-w-xs">
          <InputGroupInput
            placeholder={user ? 'Search their food' : 'Search name, email or food'}
            aria-label="Search food diaries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {user && (
          <Badge variant="secondary" className="h-7 gap-1 pr-1 text-sm font-normal">
            {user.label}
            <button type="button" onClick={onClearUser} className="rounded-sm p-0.5 hover:bg-muted" aria-label="Show everyone’s food">
              <X className="size-3.5" />
            </button>
          </Badge>
        )}
        <Button variant="outline" size="sm" className="sm:ml-auto" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Card className="gap-0 overflow-hidden py-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Day</TableHead>
              <TableHead className="hidden w-40 md:table-cell">Protein · Carbs · Fat</TableHead>
              <TableHead className="hidden w-16 text-right sm:table-cell">Foods</TableHead>
              <TableHead className="w-28 pr-4 text-right">kcal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows === null
              ? [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="px-4">
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((d) => (
                  <TableRow key={`${d.user_id}-${d.date}`} className="cursor-pointer" onClick={() => setOpen(d)}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground [&_svg]:size-4">
                          <Utensils />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{dayLabel(d.date)}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {displayName(d)} · <span className="hidden md:inline">{d.user_email}</span>
                            <span className="md:hidden">
                              {d.items} {d.items === 1 ? 'food' : 'foods'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular md:table-cell">
                      {r(d.protein)} · {r(d.carbs)} · {r(d.fat)} g
                    </TableCell>
                    <TableCell className="hidden text-right tabular sm:table-cell">{d.items}</TableCell>
                    <TableCell className="pr-4 text-right tabular">
                      <span className="font-semibold">{kcal(d.kcal)}</span>
                      {d.goal_kcal ? <span className="text-xs text-muted-foreground"> / {kcal(d.goal_kcal)}</span> : null}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {rows && rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No food logged yet.</p>}
      </Card>

      {rows && more && (
        <Button variant="outline" className="self-center" disabled={loading} onClick={() => void load(true, rows[rows.length - 1].date)}>
          {loading && <Loader2 className="animate-spin" />} Load more
        </Button>
      )}

      <DaySheet day={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function DaySheet({ day, onClose }: { day: AdminFoodDay | null; onClose: () => void }) {
  const [exporting, setExporting] = useState(false);
  if (!day) return <Sheet open={false} />;
  const left = day.goal_kcal ? day.goal_kcal - Number(day.kcal) : null;
  const facts: [string, string][] = [
    ['Eaten', `${kcal(day.kcal)} kcal`],
    ['Target', day.goal_kcal ? `${kcal(day.goal_kcal)} kcal${left !== null ? ` (${left < 0 ? `${kcal(-left)} over` : `${kcal(left)} left`})` : ''}` : 'Not set'],
    ['Protein', `${r(day.protein)} g`],
    ['Carbs · Fat', `${r(day.carbs)} g · ${r(day.fat)} g`],
  ];

  const pdf = async () => {
    setExporting(true);
    try {
      const logs: FoodLog[] = day.foods.map((f, i) => ({
        id: String(i),
        date: day.date,
        meal: f.meal,
        foodId: '',
        name: f.name,
        amount: Number(f.amount),
        unit: f.unit,
        grams: Number(f.grams),
        kcal: Number(f.kcal),
        protein: Number(f.protein),
        carbs: Number(f.carbs),
        fat: Number(f.fat),
        source: f.source as FoodLog['source'],
        loggedAt: i,
      }));
      await downloadFoodPdf(
        day.date,
        logs,
        day.goal_kcal ? { plan: 'custom', kcal: day.goal_kcal, protein: 0, carbs: 0, fat: 0 } : null,
        day.water ?? 0,
      );
    } catch {
      toast.error('Couldn’t make the PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="pr-8">Food · {dayLabel(day.date, true)}</SheetTitle>
          <SheetDescription>
            {day.items} {day.items === 1 ? 'food' : 'foods'}
            {day.water ? ` · ${day.water} ${day.water === 1 ? 'glass' : 'glasses'} of water` : ''}
          </SheetDescription>
          <p className="min-w-0 text-sm">
            <span className="font-medium">{displayName(day)}</span> <span className="break-all text-muted-foreground">· {day.user_email}</span>
          </p>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className={cn('font-medium break-words tabular', k === 'Target' && left !== null && left < 0 && 'text-warning')}>{v}</dd>
              </div>
            ))}
          </dl>

          {MEALS.map((meal) => {
            const list = day.foods.filter((f) => f.meal === meal);
            if (!list.length) return null;
            return (
              <div key={meal} className="flex flex-col gap-2">
                <p className="flex items-center justify-between text-sm font-semibold">
                  {MEAL_LABELS[meal]}
                  <span className="text-xs font-normal text-muted-foreground tabular">{kcal(list.reduce((a, f) => a + Number(f.kcal), 0))} kcal</span>
                </p>
                <ol className="flex flex-col divide-y rounded-lg border">
                  {list.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{f.name}</p>
                        <p className="truncate text-xs text-muted-foreground tabular">
                          {amount(f)} · P {r(f.protein)} · C {r(f.carbs)} · F {r(f.fat)}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold tabular">{kcal(f.kcal)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}

          {day.water ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <GlassWater className="size-4" /> {day.water} {day.water === 1 ? 'glass' : 'glasses'} ({(day.water * 0.25).toFixed(2).replace(/\.?0+$/, '')} L)
            </p>
          ) : null}

          <Button variant="outline" disabled={exporting} onClick={() => void pdf()}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
