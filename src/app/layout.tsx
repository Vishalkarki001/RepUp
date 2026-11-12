import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'RepUp: Free Gym Workout Tracker', template: '%s | RepUp' },
  description:
    'Free gym workout tracker and workout log. Log sets, reps and kg, see what you lifted last time and get a target for today.',
  applicationName: SITE_NAME,
  keywords: [
    'gym workout tracker',
    'workout log app',
    'gym tracker app free',
    'progressive overload tracker',
    'workout planner',
    'gym diary',
    'fitness tracker India',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    url: '/',
    title: 'RepUp: Free Gym Workout Tracker',
    description: 'Log sets, reps and kg. See last time. Beat it.',
  },
  twitter: { card: 'summary_large_image', title: 'RepUp: Free Gym Workout Tracker', description: 'Log sets, reps and kg. See last time. Beat it.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  category: 'fitness',
  // Search Console / Bing Webmaster ownership checks. Paste the codes into Vercel env vars.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  appleWebApp: { capable: true, title: 'RepUp', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon-48.png?v=3', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png?v=3', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png?v=3',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
};

/** Applies the saved light/dark choice before first paint (no flash). */
const themeScript = `(function(){try{var p=localStorage.getItem('gym-theme');var d=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute('content',d?'#121212':'#fcfcfc')});}catch(e){}})();`;

/**
 * Development only: a service worker left behind by another project that ran on
 * the same localhost port can serve stale files and leave the app stuck on the
 * loader. Remove any registration and reload once. (Production registers our
 * own /sw.js, which replaces any old worker on its own.)
 */
const devServiceWorkerReset = `(function(){try{if(!('serviceWorker' in navigator))return;navigator.serviceWorker.getRegistrations().then(function(rs){if(!rs.length)return;Promise.all(rs.map(function(r){return r.unregister()})).then(function(){if(navigator.serviceWorker.controller&&!sessionStorage.getItem('repup-sw-reset')){sessionStorage.setItem('repup-sw-reset','1');location.reload();}});});}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`font-sans ${geist.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {process.env.NODE_ENV !== 'production' && <script dangerouslySetInnerHTML={{ __html: devServiceWorkerReset }} />}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
