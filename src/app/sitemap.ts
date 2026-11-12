import type { MetadataRoute } from 'next';
import { LANDING_PAGES, LEGAL_PAGES, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...LANDING_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path === '/' ? '' : p.path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: p.path === '/' ? 1 : 0.8,
    })),
    ...LEGAL_PAGES.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 })),
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
