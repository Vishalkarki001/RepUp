import type { ReactNode } from 'react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

/**
 * Small shared building blocks so every screen looks the same.
 * (shadcn/ui primitives live in components/ui; these compose them.)
 */

/** Uppercase label above a group of content. */
export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{children}</h2>
      {action}
    </div>
  );
}

/** A number with a label underneath, e.g. "3 · workouts". */
export function Stat({ value, label, className }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0 rounded-lg border bg-card px-3 py-3 sm:px-3.5', className)}>
      {/* Never cut off a number: slightly smaller on tiny phones, and wrap (e.g. "112.5 kg") if it still doesn't fit. */}
      <div className="text-lg leading-tight font-semibold tracking-tight [overflow-wrap:anywhere] tabular min-[400px]:text-xl">{value}</div>
      <div className="mt-0.5 text-xs leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

/** Grid of <Stat>s: 3 across (or 2 on tiny phones when `cols=4` → 2×2). */
export function StatGrid({ children, cols = 3 }: { children: ReactNode; cols?: 3 | 4 }) {
  return <div className={cn('grid gap-2', cols === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>{children}</div>;
}

/** Friendly empty state with an emoji, a title, a line of help and an optional action. */
export function EmptyState({
  emoji,
  title,
  children,
  action,
  className,
}: {
  emoji: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Empty className={cn('border border-dashed bg-card py-8', className)}>
      <EmptyHeader>
        <EmptyMedia className="text-4xl leading-none" aria-hidden>
          {emoji}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {children && <EmptyDescription>{children}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent className="w-full max-w-xs">{action}</EmptyContent>}
    </Empty>
  );
}

/** Small rounded number badge (1, 2, 3 …) used in exercise lists. */
export function NumBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-md bg-accent text-xs font-semibold text-accent-foreground tabular',
        className,
      )}
    >
      {children}
    </span>
  );
}
