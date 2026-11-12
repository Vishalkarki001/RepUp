import Link from 'next/link';
import { cn } from 'cn';
import { LANDING_PAGES } from '@/lib/site';

export const SIGNUP_HREF = '/login?mode=signup';
export const LOGIN_HREF = '/login';

/** Icon + "RepUp" wordmark. Text colour comes from the parent; pass `upClass` to colour "Up". */
export function Brand({ className, upClass = 'text-[#8b5cf6]' }: { className?: string; upClass?: string }) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2', className)} aria-label="RepUp home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png?v=3" alt="" width={32} height={32} className="size-8" />
      <span className="text-xl font-extrabold tracking-tight italic">
        Rep<span className={upClass}>Up</span>
      </span>
    </Link>
  );
}

/**
 * Top bar for landing pages. Styling is up to each page: pass classes for the
 * bar, the login link and the main button.
 */
export function SiteNav({
  className,
  loginClass,
  ctaClass,
  ctaLabel = 'Start free',
  upClass,
}: {
  className?: string;
  loginClass?: string;
  ctaClass?: string;
  ctaLabel?: string;
  upClass?: string;
}) {
  return (
    <header className={cn('mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6', className)}>
      <Brand upClass={upClass} />
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
        <Link href={LOGIN_HREF} className={cn('rounded-lg px-3 py-2 text-sm font-medium', loginClass)}>
          Log in
        </Link>
        <Link href={SIGNUP_HREF} className={cn('rounded-lg px-4 py-2 text-sm font-semibold', ctaClass)}>
          {ctaLabel}
        </Link>
      </nav>
    </header>
  );
}

/**
 * Shared footer: links to every landing page (helps visitors and search
 * engines find them), plus the honest small print.
 */
export function SiteFooter({ className, mutedClass, current }: { className?: string; mutedClass?: string; current?: string }) {
  return (
    <footer className={cn('border-t', className)}>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-3">
          <Brand />
          <p className={cn('max-w-xs text-sm leading-relaxed', mutedClass)}>
            Free gym workout tracker. Log sets, reps and kg, see last time, beat it. Works offline on Android, iPhone and laptop.
          </p>
          <Link href={SIGNUP_HREF} className="w-fit text-sm font-semibold underline underline-offset-4">
            Start free →
          </Link>
        </div>
        <nav aria-label="RepUp guides">
          <p className="mb-3 text-sm font-semibold">Guides & tools</p>
          <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {LANDING_PAGES.map((p) => (
              <li key={p.path}>
                <Link
                  href={p.path}
                  aria-current={p.path === current ? 'page' : undefined}
                  className={cn('hover:underline', p.path === current ? 'font-semibold' : mutedClass)}
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={cn('mx-auto w-full max-w-6xl px-4 pb-10 text-xs leading-relaxed sm:px-6', mutedClass)}>
        <p>
          Training and diet tips here are general information, not medical advice. If you have an injury or a health condition,
          check with a doctor first. © {new Date().getFullYear()} RepUp.
        </p>
      </div>
    </footer>
  );
}
