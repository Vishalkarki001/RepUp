import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from 'cn';
import { JsonLd, type Faq } from './seo';
import { SIGNUP_HREF, SiteFooter, SiteNav } from './SiteChrome';

/**
 * RepUp website design kit: one theme for every landing page.
 *
 * Brand: deep indigo hero (#0b0a1f) with the violet glow, RepUp violet (#7c3aed)
 * for actions and highlights, calm near-white sections, neutral greys, Geist.
 * Colours are fixed hex values so pages look the same in light or dark system mode.
 */

export const T = {
  ink: 'text-[#0a0a0a]',
  muted: 'text-[#525252]',
  violet: 'text-[#7c3aed]',
  border: 'border-[#e5e5e5]',
} as const;

/** Inline link inside body text. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-[#7c3aed] underline decoration-[#7c3aed]/40 underline-offset-4 hover:decoration-[#7c3aed]">
      {children}
    </Link>
  );
}

/** Page wrapper: JSON-LD, page background, footer. Put <Hero/> first inside. */
export function LandingShell({
  path,
  jsonLd,
  lang,
  className,
  children,
}: {
  path: string;
  jsonLd: object[];
  lang?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div lang={lang} className={cn('min-h-dvh overflow-x-clip bg-[#fafafa] text-[#0a0a0a] [color-scheme:light]', className)}>
      <JsonLd data={jsonLd} />
      {children}
      <SiteFooter current={path} className="border-[#e5e5e5] bg-white" mutedClass="text-[#525252]" />
    </div>
  );
}

/** Dark brand hero with the nav, H1, intro, buttons, tick list and a phone. */
export function Hero({
  kicker,
  title,
  intro,
  cta = 'Start tracking free',
  secondary,
  bullets = [],
  mock,
  variant = 'dark',
  children,
}: {
  /** Same brand, three moods: dark indigo glow, light with violet glow, or solid violet gradient. */
  variant?: 'dark' | 'light' | 'violet';
  kicker: ReactNode;
  /** The H1. Wrap the punchline in <Hl> for the violet highlight. */
  title: ReactNode;
  intro: ReactNode;
  cta?: string;
  secondary?: { href: string; label: string };
  bullets?: string[];
  /** Usually a <PhoneMock/>; dark theme reads best here. */
  mock?: ReactNode;
  /** Extra content under the bullets (e.g. a small note). */
  children?: ReactNode;
}) {
  const v = HERO[variant];
  return (
    <section className={cn('relative overflow-hidden', v.section)}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: v.glow }} />
      <SiteNav className="relative" upClass={v.up} loginClass={v.login} ctaClass={v.navCta} />
      <div
        className={cn(
          'relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-8 pb-20 sm:px-6 md:pt-14 md:pb-24 [&>*]:min-w-0',
          mock && 'md:grid-cols-[1.15fr_1fr]',
        )}
      >
        <div className="flex flex-col gap-6">
          <p className={cn('w-fit rounded-full border px-3 py-1 text-xs font-medium', v.kicker)}>{kicker}</p>
          <h1 className="text-4xl leading-[1.07] font-semibold tracking-tight text-balance sm:text-5xl md:text-[3.4rem]">{title}</h1>
          <div className={cn('max-w-xl text-lg leading-relaxed', v.intro)}>{intro}</div>
          <div className="flex flex-wrap gap-3">
            <Link href={SIGNUP_HREF} className={cn('rounded-xl px-6 py-3.5 text-base font-semibold', v.cta)}>
              {cta}
            </Link>
            {secondary && (
              <a href={secondary.href} className={cn('rounded-xl border px-6 py-3.5 text-base font-semibold', v.secondary)}>
                {secondary.label}
              </a>
            )}
          </div>
          {bullets.length > 0 && (
            <ul className={cn('flex flex-wrap gap-x-5 gap-y-2 text-sm', v.bullets)}>
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-1.5">
                  <span className={v.tick}>✓</span> {b}
                </li>
              ))}
            </ul>
          )}
          {children}
        </div>
        {mock && <div className="relative flex justify-center md:justify-end">{mock}</div>}
      </div>
    </section>
  );
}

const HERO = {
  dark: {
    section: 'bg-[#0b0a1f] text-white',
    glow: 'radial-gradient(60% 60% at 75% 30%, rgba(124,58,237,0.45), transparent 70%), radial-gradient(40% 50% at 10% 90%, rgba(37,99,235,0.35), transparent 70%)',
    up: 'text-[#a78bfa]',
    login: 'text-white/80 hover:text-white',
    navCta: 'bg-white text-[#0b0a1f] hover:bg-white/90',
    kicker: 'border-white/15 bg-white/5 text-white/80',
    intro: 'text-white/70',
    cta: 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9]',
    secondary: 'border-white/20 text-white hover:bg-white/5',
    bullets: 'text-white/60',
    tick: 'text-[#34d399]',
  },
  light: {
    section: 'bg-[#fafafa] text-[#0a0a0a] border-b border-[#e5e5e5]',
    glow: 'radial-gradient(55% 60% at 80% 20%, rgba(124,58,237,0.16), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(37,99,235,0.10), transparent 70%)',
    up: 'text-[#7c3aed]',
    login: 'text-[#404040] hover:text-[#0a0a0a]',
    navCta: 'bg-[#0b0a1f] text-white hover:bg-[#1e1b4b]',
    kicker: 'border-[#7c3aed]/20 bg-[#7c3aed]/5 text-[#6d28d9]',
    intro: 'text-[#525252]',
    cta: 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]',
    secondary: 'border-[#d4d4d4] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5]',
    bullets: 'text-[#525252]',
    tick: 'text-[#059669]',
  },
  violet: {
    section: 'bg-[#5b21b6] text-white',
    glow: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 55%, #2563eb 100%)',
    up: 'text-[#c4b5fd]',
    login: 'text-white/85 hover:text-white',
    navCta: 'bg-white text-[#4c1d95] hover:bg-white/90',
    kicker: 'border-white/25 bg-white/10 text-white',
    intro: 'text-white/85',
    cta: 'bg-white text-[#4c1d95] shadow-lg shadow-black/20 hover:bg-white/90',
    secondary: 'border-white/35 text-white hover:bg-white/10',
    bullets: 'text-white/80',
    tick: 'text-[#a7f3d0]',
  },
} as const;

/** Highlight inside the hero H1 (pass the same variant as the Hero). */
export function Hl({ children, variant = 'dark' }: { children: ReactNode; variant?: 'dark' | 'light' | 'violet' }) {
  const c = variant === 'light' ? 'text-[#7c3aed]' : variant === 'violet' ? 'text-[#c4b5fd]' : 'text-[#a78bfa]';
  return <span className={c}>{children}</span>;
}

/**
 * The 40–60 word direct answer near the top: for readers in a hurry and for
 * AI answer engines. `label` is the question it answers.
 */
export function ShortAnswer({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h2 className="text-sm font-semibold tracking-wide text-[#7c3aed] uppercase">{label}</h2>
      <div className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">{children}</div>
    </section>
  );
}

/**
 * A page section. `tone`: plain (page grey), white (white band with borders),
 * dark (brand indigo). `width`: narrow for reading, wide for grids.
 */
export function Section({
  id,
  kicker,
  title,
  intro,
  tone = 'plain',
  width = 'wide',
  children,
  className,
}: {
  id?: string;
  kicker?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  tone?: 'plain' | 'white' | 'dark';
  width?: 'narrow' | 'wide';
  children?: ReactNode;
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-8',
        tone === 'white' && 'border-y border-[#e5e5e5] bg-white',
        dark && 'bg-[#0b0a1f] text-white',
        className,
      )}
    >
      <div className={cn('mx-auto w-full px-4 py-16 sm:px-6 md:py-20', width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl')}>
        {kicker && (
          <p className={cn('mb-3 text-sm font-semibold tracking-wide uppercase', dark ? 'text-[#a78bfa]' : 'text-[#7c3aed]')}>
            {kicker}
          </p>
        )}
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {intro && <div className={cn('mt-3 max-w-2xl text-lg leading-relaxed', dark ? 'text-white/70' : 'text-[#525252]')}>{intro}</div>}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}

/** Body copy block with comfortable reading styles (paragraphs, lists, bold). */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-4 text-[17px] leading-relaxed text-[#404040] [&_b]:font-semibold [&_b]:text-[#0a0a0a] [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#0a0a0a] [&_li]:pl-1 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-[#0a0a0a] [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Numbered step cards (how-to). */
export function Steps({ steps, cols = 3 }: { steps: { title: string; body: ReactNode }[]; cols?: 2 | 3 | 4 }) {
  return (
    <ol className={cn('grid gap-4', cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3')}>
      {steps.map((s, i) => (
        <li key={s.title} className="flex flex-col gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-6">
          <span className="text-sm font-semibold text-[#7c3aed] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="text-lg font-semibold">{s.title}</h3>
          <div className="leading-relaxed text-[#525252]">{s.body}</div>
        </li>
      ))}
    </ol>
  );
}

/** Grid of small titled cards (features, tips, benefits). */
export function Cards({
  items,
  cols = 3,
}: {
  items: { title: string; body: ReactNode; tag?: string }[];
  cols?: 2 | 3 | 4;
}) {
  return (
    <ul className={cn('grid gap-4', cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3')}>
      {items.map((it) => (
        <li key={it.title} className="flex flex-col gap-2 rounded-2xl border border-[#e5e5e5] bg-white p-6">
          {it.tag && (
            <span className="w-fit rounded-full bg-[#7c3aed]/10 px-2.5 py-0.5 text-xs font-semibold text-[#6d28d9]">{it.tag}</span>
          )}
          <h3 className="text-lg font-semibold">{it.title}</h3>
          <div className="text-[15px] leading-relaxed text-[#525252]">{it.body}</div>
        </li>
      ))}
    </ul>
  );
}

/** A workout day: title, muscles, and exercise rows with sets × reps. */
export function PlanCard({
  title,
  subtitle,
  rows,
  featured,
}: {
  title: string;
  subtitle?: string;
  rows: [exercise: string, setsReps: string][];
  featured?: boolean;
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-white', featured ? 'border-[#7c3aed] ring-1 ring-[#7c3aed]' : 'border-[#e5e5e5]')}>
      <div className={cn('px-5 py-4', featured ? 'bg-[#7c3aed] text-white' : 'bg-[#f5f3ff]')}>
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className={cn('text-sm', featured ? 'text-white/80' : 'text-[#6d28d9]')}>{subtitle}</p>}
      </div>
      <ul className="divide-y divide-[#ededed]">
        {rows.map(([name, sr]) => (
          <li key={name} className="flex items-center justify-between gap-3 px-5 py-3 text-[15px]">
            <span className="font-medium">{name}</span>
            <span className="shrink-0 font-semibold text-[#404040] tabular-nums">{sr}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Responsive table that scrolls sideways on small phones. `highlight` = column index to tint violet. */
export function DataTable({
  head,
  rows,
  highlight,
  caption,
  minWidth = 520,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  highlight?: number;
  caption?: ReactNode;
  minWidth?: number;
}) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-2xl border border-[#e5e5e5] bg-white">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead className="bg-[#f5f5f5] text-[#404040]">
            <tr>
              {head.map((h, i) => (
                <th key={i} scope="col" className={cn('p-4 font-semibold', i === highlight && 'text-[#7c3aed]')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ededed]">
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row" className="p-4 font-medium">
                      {c}
                    </th>
                  ) : (
                    <td key={ci} className={cn('p-4 text-[#525252] tabular-nums', ci === highlight && 'font-semibold text-[#7c3aed]')}>
                      {c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="text-xs text-[#737373]">{caption}</figcaption>}
    </figure>
  );
}

/** Highlighted note box. `tone="tip"` violet, `tone="note"` neutral. */
export function Callout({ title, children, tone = 'tip' }: { title?: ReactNode; children: ReactNode; tone?: 'tip' | 'note' }) {
  return (
    <aside
      className={cn(
        'rounded-2xl border p-5 text-[15px] leading-relaxed',
        tone === 'tip' ? 'border-[#7c3aed]/25 bg-[#f5f3ff] text-[#3b0764]' : 'border-[#e5e5e5] bg-[#f5f5f5] text-[#404040]',
      )}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </aside>
  );
}

/** Phone on one side, text on the other (white band). */
export function Split({
  id,
  kicker,
  title,
  mock,
  children,
  reverse,
}: {
  id?: string;
  kicker?: ReactNode;
  title: ReactNode;
  mock: ReactNode;
  children: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-y border-[#e5e5e5] bg-white">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20 [&>*]:min-w-0">
        <div className={cn(reverse && 'md:order-2')}>{mock}</div>
        <div>
          {kicker && <p className="mb-3 text-sm font-semibold tracking-wide text-[#7c3aed] uppercase">{kicker}</p>}
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** FAQ list (details/summary). Pass the same array to faqLd(). */
export function FaqSection({ faqs, title = 'Questions' }: { faqs: Faq[]; title?: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <div className="mt-8 divide-y divide-[#e5e5e5] rounded-2xl border border-[#e5e5e5] bg-white">
        {faqs.map((f) => (
          <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              <h3>{f.q}</h3>
              <span className="text-xl text-[#a3a3a3] transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-[#525252]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Closing call to action band. */
export function CtaBand({
  title,
  body,
  cta = 'Start tracking free',
}: {
  title: ReactNode;
  body?: ReactNode;
  cta?: string;
}) {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5 overflow-hidden rounded-3xl bg-[#0b0a1f] px-6 py-16 text-center text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 80% at 50% 0%, rgba(124,58,237,0.4), transparent 70%)' }}
        />
        <h2 className="relative text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {body && <p className="relative max-w-lg text-white/70">{body}</p>}
        <Link href={SIGNUP_HREF} className="relative rounded-xl bg-[#7c3aed] px-7 py-3.5 font-semibold text-white hover:bg-[#6d28d9]">
          {cta}
        </Link>
      </div>
    </section>
  );
}
