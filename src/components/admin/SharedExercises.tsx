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
import { cn } from '@/lib/utils';
import { confirmDialog } from '../Confirm';
import { adminApi, shortDate, type AdminSharedExercise } from './api';

/**
 * Exercises people created, shared so others can find them (exercise_catalog).
 * Remove a wrong or rude one: it leaves the shared list; people who already
 * added it keep their own copy. The built-in exercises aren't listed here.
 */
export function AdminSharedExercises() {
  const [rows, setRows] = useState<AdminSharedExercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.sharedExercises(search);
    setLoading(false);
    setError(res.error);
    if (res.data) setRows(res.data);
  }, [search]);

  useEffect(() => {
    setRows(null);
    void load();
  }, [load]);

  const remove = async (x: AdminSharedExercise) => {
    const ok = await confirmDialog({
      title: `Remove “${x.name}”?`,
      message: 'It disappears from search for everyone. People who already added it keep theirs.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    const res = await adminApi.deleteSharedExercise(x.id);
    if (res.error) return void toast.error(res.error);
    setRows((r) => r?.filter((y) => y.id !== x.id) ?? r);
    toast.success('Exercise removed from the shared list');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-9 sm:max-w-xs">
          <InputGroupInput placeholder="Search exercises" aria-label="Search shared exercises" value={query} onChange={(e) => setQuery(e.target.value)} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <p className="text-sm text-muted-foreground">{rows ? `${rows.length} shared` : ''}</p>
        <Button variant="outline" size="sm" className="sm:ml-auto" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Card className="gap-0 overflow-hidden py-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Exercise</TableHead>
              <TableHead className="hidden w-48 lg:table-cell">Added by</TableHead>
              <TableHead className="w-20 text-right">Used by</TableHead>
              <TableHead className="w-12 pr-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows === null
              ? [0, 1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="px-4">
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="pl-4">
                      <p className="flex min-w-0 items-center gap-1.5 font-medium">
                        <span className="truncate">{x.name}</span>
                        <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">
                          {x.muscle}
                        </Badge>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {x.equipment} · {shortDate(x.created_at)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden truncate text-xs text-muted-foreground lg:table-cell">{x.added_by ?? 'Deleted account'}</TableCell>
                    <TableCell className="text-right tabular">{x.users}</TableCell>
                    <TableCell className="pr-2 text-right">
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${x.name}`} onClick={() => void remove(x)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {rows && rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No shared exercises yet. They appear when people create exercises.</p>
        )}
      </Card>
    </div>
  );
}
