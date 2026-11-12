import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'RepUp — Gym Workout Tracker',
  description: 'Log sets, reps and weight. See what you lifted last time and get a target for today.',
  applicationName: 'RepUp',
  appleWebApp: { capable: true, title: 'RepUp', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon-48.png?v=2', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png?v=2',
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
      <body>{children}</body>
    </html>
  );
}
