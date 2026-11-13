import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // Everyone, AI answer engines included, may read the public pages.
    rules: [{ userAgent: '*', allow: '/', disallow: ['/auth/', '/reset-password', '/admin'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
