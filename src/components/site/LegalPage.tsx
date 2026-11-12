import type { ReactNode } from 'react';
import { breadcrumbLd } from './seo';
import { LandingShell } from './kit';
import { SiteNav } from './SiteChrome';

/** Simple, readable layout for the privacy policy and terms. */
export function LegalPage({
  path,
  title,
  updated,
  intro,
  children,
}: {
  path: string;
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <LandingShell path={path} jsonLd={[breadcrumbLd(path, title)]}>
      <div className="border-b border-[#e5e5e5] bg-white">
        <SiteNav loginClass="text-[#404040] hover:text-[#0a0a0a]" ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]" />
      </div>
      <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-sm font-semibold tracking-wide text-[#7c3aed] uppercase">RepUp</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-[#737373]">Last updated: {updated}</p>
        <div className="mt-6 text-lg leading-relaxed text-[#404040]">{intro}</div>
        <div className="mt-10 flex flex-col gap-8 text-[16px] leading-relaxed text-[#404040] [&_a]:font-medium [&_a]:text-[#7c3aed] [&_a]:underline [&_a]:underline-offset-4 [&_b]:font-semibold [&_b]:text-[#0a0a0a] [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0a0a0a] [&_li]:pl-1 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </LandingShell>
  );
}
