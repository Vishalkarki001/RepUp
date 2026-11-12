'use client';

import { useRef, type ReactNode } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  /** Optional one-line subtitle under the title. */
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Wider sheet on desktop (e.g. editors with lots of fields). */
  wide?: boolean;
}

/**
 * The app's one dialog: a bottom sheet on phones, a centred dialog on larger
 * screens. Built on shadcn/ui Dialog (Radix), so nested dialogs, Escape,
 * focus trapping and scroll locking are handled for us. Rendering it = open.
 */
export function Modal({ title, description, onClose, children, footer, className, wide }: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  return (
    <Dialog open onOpenChange={(open) => !open && onCloseRef.current()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex max-h-[86dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg',
          wide && 'sm:max-w-2xl',
          // phones: full-width sheet pinned to the bottom
          'max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:data-open:slide-in-from-bottom-10 max-sm:data-open:zoom-in-100',
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden" aria-hidden />
        <div className="flex shrink-0 items-start gap-3 border-b px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-tight">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="mt-1 text-xs">{description}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" className="-mr-1.5 shrink-0" aria-label="Close">
              <XIcon />
            </Button>
          </DialogPrimitive.Close>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
        {footer && <div className="shrink-0 border-t bg-muted/40 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
