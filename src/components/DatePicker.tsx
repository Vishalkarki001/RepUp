'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatDate } from '@/lib/utils';

/** 'YYYY-MM-DD' in local time (no UTC shift). */
const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

/** shadcn date picker (Popover + Calendar). Value is 'YYYY-MM-DD'. Future dates are off by default. */
export function DatePicker({
  value,
  onChange,
  allowFuture = false,
  className,
  label = 'Date',
}: {
  value: string;
  onChange: (iso: string) => void;
  allowFuture?: boolean;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = fromISO(value);
  const today = new Date();
  const isToday = value === toISO(today);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('justify-start gap-2 font-normal', className)} aria-label={`${label}: ${formatDate(value)}`}>
          <CalendarIcon className="text-muted-foreground" />
          <span className="truncate">{isToday ? 'Today' : formatDate(value, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          weekStartsOn={1}
          disabled={allowFuture ? undefined : { after: today }}
          onSelect={(d) => {
            if (!d) return;
            onChange(toISO(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
