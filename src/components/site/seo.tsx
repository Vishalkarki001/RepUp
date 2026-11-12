import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export type Faq = { q: string; a: string };

/** Title, description, canonical URL and share-card data for one landing page. */
export function landingMetadata({
  path,
  title,
  description,
  keywords,
  locale = 'en_IN',
}: {
  path: string;
  /** Full title (no "| RepUp" is added). Aim for 50–60 characters, keyword first. */
  title: string;
  /** 140–160 characters: what the reader gets, with the main keyword. */
  description: string;
  keywords: string[];
  locale?: string;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: SITE_NAME, url: path, title, description, locale },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;

/** schema.org data for the app itself. Only true facts: free, web/Android/iOS, no ratings. */
export function appLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description,
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Workout tracker',
    operatingSystem: 'Web, Android, iOS',
    browserRequirements: 'Requires JavaScript. Installable as a PWA.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    featureList: [
      'Weekly workout plan by day',
      'Log sets, reps and weight (kg or lb)',
      'Shows last time and a target for today (progressive overload)',
      'Progress charts and body-weight log',
      'Works offline, syncs across devices',
    ],
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function breadcrumbLd(path: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: abs('/') },
      ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name, item: abs(path) }]),
    ],
  };
}

export function howToLd(name: string, steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  };
}

/** Renders schema.org JSON-LD. `<` is escaped so text can never close the script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
