'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Stat, StatGrid } from '../common';
import { confirmDialog } from '../Confirm';
import { adminApi, shortDate, type AdminFood, type AdminFoodStats } from './api';

const SOURCE_LABEL: Record<AdminFood['source'], string> = { usda: 'USDA', off: 'Label', user: 'User added' };

/**
 * The shared food list (food_catalog): foods found at USDA, packs scanned by
 * barcode (Open Food Facts) and foods users added from a label. An admin can
 * remove a wrong one; people who already logged it keep their own entry.
 * RepUp's ~1,000 built-in foods live in the app itself, not here.
 */
export function AdminFoods() {
  const [rows, setRows] = useState<AdminFood[] | null>(null);
  const [stats, setStats] = useState<AdminFoodStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<AdminFood['source'] | 'all'>('all');

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, s] = await Promise.all([adminApi.foods({ search, source: source === 'all' ? null : source }), adminApi.foodStats()]);
    setLoading(false);
    setError(list.error ?? s.error);
    if (list.data) setRows(list.data);
    if (s.data) setStats(s.data);
  }, [search, source]);

  useEffect(() => {
    setRows(null);
    void load();
  }, [load]);

  const remove = async (f: AdminFood) => {
    const ok = await confirmDialog({
      title: `Remove “${f.name}”?`,
      message: 'It disappears from search for everyone. People who already logged it keep their entries.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    const res = await adminApi.deleteFood(f.id);
    if (res.error) return void toast.error(res.error);
    setRows((r) => r?.filter((x) => x.id !== f.id) ?? r);
    toast.success('Food removed');
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <Stat value={stats ? stats.usda + stats.off + stats.user : '–'} label="shared foods (plus ~1,000 built in)" />
        <Stat value={stats ? `${stats.off} · ${stats.user}` : '–'} label="from labels · added by users" />
        <Stat value={stats ? stats.logs.toLocaleString('en-IN') : '–'} label="foods logged" />
        <Stat value={stats ? `${stats.loggers_7d}` : '–'} label={`people logging food (7 days) · ${stats?.with_goal ?? 0} with a target`} />
      </StatGrid>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-9 sm:max-w-xs">
          <InputGroupInput placeholder="Search name, brand or barcode" aria-label="Search foods" value={query} onChange={(e) => setQuery(e.target.value)} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={source}
          onValueChange={(v) => v && setSource(v as typeof source)}
          aria-label="Source"
        >
          {(['all', 'usda', 'off', 'user'] as const).map((s) => (
            <ToggleGroupItem key={s} value={s} className="px-3 text-xs">
              {s === 'all' ? 'All' : SOURCE_LABEL[s]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button variant="outline" size="sm" className="sm:ml-auto" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Card className="gap-0 overflow-hidden py-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Food (per 100 g)</TableHead>
              <TableHead className="hidden w-48 lg:table-cell">Added by</TableHead>
              <TableHead className="hidden w-16 text-right sm:table-cell">Used</TableHead>
              <TableHead className="w-20 text-right">kcal</TableHead>
              <TableHead className="w-12 pr-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows === null
              ? [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="px-4">
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="pl-4">
                      <div className="min-w-0">
                        <p className="flex min-w-0 items-center gap-1.5 font-medium">
                          <span className="truncate">{f.name}</span>
                          <Badge variant={f.source === 'user' ? 'secondary' : 'outline'} className="h-5 shrink-0 px-1.5 text-[10px]">
                            {SOURCE_LABEL[f.source]}
                          </Badge>
                        </p>
                        <p className="truncate text-xs text-muted-foreground tabular">
                          {f.brand ? `${f.brand} · ` : ''}P {Number(f.protein)} · C {Number(f.carbs)} · F {Number(f.fat)}
                          {f.barcode ? ` · ${f.barcode}` : ''} · {shortDate(f.created_at)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden truncate text-xs text-muted-foreground lg:table-cell">
                      {f.added_by ?? (f.source === 'user' ? 'Deleted account' : 'Server')}
                    </TableCell>
                    <TableCell className="hidden text-right tabular sm:table-cell">{f.uses}</TableCell>
                    <TableCell className="text-right font-semibold tabular">{Math.round(Number(f.kcal))}</TableCell>
                    <TableCell className="pr-2 text-right">
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${f.name}`} onClick={() => void remove(f)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {rows && rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No foods here yet. They appear when people search, scan barcodes or add foods from a label.
          </p>
        )}
      </Card>
    </div>
  );
}
