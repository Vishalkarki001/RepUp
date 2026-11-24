'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Mail, RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { deviceLabel } from '@/lib/feedback';
import { adminApi, ago, type AdminFeedback } from './api';

const KIND: Record<AdminFeedback['kind'], { label: string; className: string }> = {
  bug: { label: 'Problem', className: 'border-destructive/40 text-destructive' },
  idea: { label: 'Idea', className: 'border-success/40 text-success' },
  other: { label: 'Other', className: 'text-muted-foreground' },
};

/**
 * What users sent from "Send feedback" in Settings, newest first. Reply by email,
 * then mark it done.
 */
export function AdminFeedbackList() {
  const [status, setStatus] = useState<'new' | 'done' | 'all'>('new');
  const [rows, setRows] = useState<AdminFeedback[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.feedback(status === 'all' ? null : status);
    setLoading(false);
    setError(res.error);
    if (res.data) setRows(res.data);
  }, [status]);

  useEffect(() => {
    setRows(null);
    void load();
  }, [load]);

  const mark = async (f: AdminFeedback, next: AdminFeedback['status']) => {
    const res = await adminApi.setFeedbackStatus(f.id, next);
    if (res.error) return void toast.error(res.error);
    setRows((r) => (status === 'all' ? (r?.map((x) => (x.id === f.id ? { ...x, status: next } : x)) ?? r) : (r?.filter((x) => x.id !== f.id) ?? r)));
    toast.success(next === 'done' ? 'Marked done' : 'Moved back to new');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={status} onValueChange={(v) => v && setStatus(v as typeof status)} aria-label="Show">
          <ToggleGroupItem value="new" className="px-3 text-xs">
            New
          </ToggleGroupItem>
          <ToggleGroupItem value="done" className="px-3 text-xs">
            Done
          </ToggleGroupItem>
          <ToggleGroupItem value="all" className="px-3 text-xs">
            All
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-sm text-muted-foreground">{rows ? `${rows.length} ${status === 'all' ? 'messages' : status}` : ''}</p>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      {rows === null ? (
        [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
      ) : rows.length === 0 ? (
        <Card className="items-center py-10 text-center text-sm text-muted-foreground">
          {status === 'new' ? 'No new feedback. All caught up.' : 'Nothing here yet.'}
        </Card>
      ) : (
        rows.map((f) => {
          const device = deviceLabel(f.meta?.browser);
          const meta = [f.meta?.mode && `${f.meta.mode} mode`, device, f.meta?.installed ? 'installed app' : f.meta?.installed === false ? 'in browser' : '', f.meta?.screen, f.meta?.page]
            .filter(Boolean)
            .join(' · ');
          return (
            <Card key={f.id} className={cn('gap-3 px-4 py-4', f.status === 'done' && 'opacity-70')}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn('h-5 px-1.5 text-[11px]', KIND[f.kind].className)}>
                  {KIND[f.kind].label}
                </Badge>
                <span className="text-sm font-medium">{f.user_name || f.user_email || 'Deleted account'}</span>
                {f.user_name && f.user_email && <span className="text-xs text-muted-foreground">{f.user_email}</span>}
                <span className="ml-auto text-xs text-muted-foreground">{ago(f.created_at)}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">{f.message}</p>
              {meta && <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{meta}</p>}
              <div className="flex flex-wrap gap-2">
                {f.user_email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${f.user_email}?subject=${encodeURIComponent('About your RepUp feedback')}`}>
                      <Mail /> Reply by email
                    </a>
                  </Button>
                )}
                {f.status === 'new' ? (
                  <Button size="sm" onClick={() => void mark(f, 'done')}>
                    <Check /> Mark done
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => void mark(f, 'new')}>
                    <RotateCcw /> Move back to new
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
