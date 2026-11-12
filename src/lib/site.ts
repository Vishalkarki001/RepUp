/** Public website facts shared by the landing pages, sitemap, robots and JSON-LD. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://getrepup.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'RepUp';
export const SITE_TAGLINE = 'Free gym workout tracker: log sets, reps and kg, then beat last time.';

/**
 * Every landing page, in footer order. `path` is the URL; `label` is the
 * short link text used in the shared footer (internal links help SEO).
 */
export const LANDING_PAGES = [
  { path: '/', label: 'Gym workout tracker' },
  { path: '/workout-log', label: 'Workout log book' },
  { path: '/progressive-overload-tracker', label: 'Progressive overload tracker' },
  { path: '/push-pull-legs-workout-planner', label: 'Push pull legs planner' },
  { path: '/beginner-gym-workout-plan', label: 'Beginner gym plan' },
  { path: '/weight-loss-workout-tracker', label: 'Weight loss workout tracker' },
  { path: '/muscle-gain-workout-log', label: 'Muscle gain & protein' },
  { path: '/gym-workout-tracker-hindi', label: 'Gym diary app (Hindi)' },
  { path: '/strength-training-for-women', label: 'Strength training for women' },
  { path: '/offline-workout-tracker', label: 'Offline workout app' },
] as const;

export type LandingPath = (typeof LANDING_PAGES)[number]['path'];

/** Paths served to everyone (no login needed). */
export const MARKETING_PATHS: readonly string[] = LANDING_PAGES.map((p) => p.path).filter((p) => p !== '/');

/** What the app really does: the only claims landing pages may make. */
export const APP_FACTS = [
  'Free to use, no ads',
  'Weekly plan by day (Mon–Sun) with sets × reps for each exercise',
  'Log every set: kg (or lb) and reps, tick when done',
  'Shows what you lifted last time and suggests today’s target (progressive overload)',
  'History by date; edit past workouts',
  'Progress charts per exercise, weekly sets per muscle, body-weight log',
  'Plate calculator for barbell lifts',
  'Your own custom exercises',
  'Works offline at the gym; saves to your account when back online',
  'Same data on phone and laptop (log in with email or Google)',
  'Installs on Android and iPhone home screen (PWA), light and dark mode',
] as const;
