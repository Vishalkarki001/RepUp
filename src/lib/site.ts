/** Public website facts shared by the landing pages, sitemap, robots and JSON-LD. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://getrepup.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'RepUp';
export const SITE_TAGLINE = 'Free gym workout and running tracker: log sets, reps and kg, track your runs, beat last time.';

export type PageGroup = 'gym' | 'running' | 'both';

/** Footer headings for the three groups of guides. */
export const PAGE_GROUPS: { id: PageGroup; label: string }[] = [
  { id: 'gym', label: 'Gym' },
  { id: 'running', label: 'Running' },
  { id: 'both', label: 'Gym + running' },
];

/**
 * Every landing page, in footer order. `path` is the URL; `label` is the
 * short link text used in the shared footer (internal links help SEO).
 */
export const LANDING_PAGES = [
  { path: '/', label: 'Gym workout tracker', group: 'gym' },
  { path: '/workout-log', label: 'Workout log book', group: 'gym' },
  { path: '/progressive-overload-tracker', label: 'Progressive overload tracker', group: 'gym' },
  { path: '/push-pull-legs-workout-planner', label: 'Push pull legs planner', group: 'gym' },
  { path: '/beginner-gym-workout-plan', label: 'Beginner gym plan', group: 'gym' },
  { path: '/weight-loss-workout-tracker', label: 'Weight loss workout tracker', group: 'gym' },
  { path: '/muscle-gain-workout-log', label: 'Muscle gain & protein', group: 'gym' },
  { path: '/gym-workout-tracker-hindi', label: 'Gym diary app (Hindi)', group: 'gym' },
  { path: '/strength-training-for-women', label: 'Strength training for women', group: 'gym' },
  { path: '/offline-workout-tracker', label: 'Offline workout app', group: 'gym' },

  { path: '/running-tracker-app', label: 'Running tracker app', group: 'running' },
  { path: '/couch-to-5k-plan', label: 'Couch to 5K plan', group: 'running' },
  { path: '/running-pace-calculator', label: 'Running pace calculator', group: 'running' },
  { path: '/walking-tracker-app', label: 'Walking tracker', group: 'running' },
  { path: '/10k-training-plan', label: '10K training plan', group: 'running' },
  { path: '/half-marathon-training-plan', label: 'Half marathon plan', group: 'running' },
  { path: '/running-for-weight-loss', label: 'Running for weight loss', group: 'running' },
  { path: '/running-in-hot-weather', label: 'Running in the heat', group: 'running' },
  { path: '/treadmill-workout-log', label: 'Treadmill log', group: 'running' },
  { path: '/improve-5k-time', label: 'Run a faster 5K', group: 'running' },

  { path: '/gym-and-running-tracker', label: 'Gym + running tracker', group: 'both' },
  { path: '/hybrid-training-plan', label: 'Hybrid training plan', group: 'both' },
  { path: '/running-and-lifting-schedule', label: 'Running + lifting schedule', group: 'both' },
  { path: '/run-after-leg-day', label: 'Running after leg day', group: 'both' },
  { path: '/strength-training-for-runners', label: 'Strength training for runners', group: 'both' },
  { path: '/cardio-vs-weights-for-fat-loss', label: 'Cardio vs weights', group: 'both' },
  { path: '/fitness-tracker-app-india', label: 'Fitness tracker app (India)', group: 'both' },
  { path: '/weekly-fitness-planner', label: 'Weekly fitness planner', group: 'both' },
  { path: '/cardio-tracker-app', label: 'Cardio tracker', group: 'both' },
  { path: '/home-workout-and-walking-plan', label: 'Home workout + walking', group: 'both' },
] as const satisfies readonly { path: string; label: string; group: PageGroup }[];

export type LandingPath = (typeof LANDING_PAGES)[number]['path'];

/** Legal pages (needed for Google sign-in publishing and for users' trust). */
export const LEGAL_PAGES = [
  { path: '/privacy', label: 'Privacy policy' },
  { path: '/terms', label: 'Terms of use' },
] as const;

export const CONTACT_EMAIL = 'repup.contact@gmail.com';

/** Paths served to everyone (no login needed). */
export const MARKETING_PATHS: readonly string[] = [
  ...LANDING_PAGES.map((p) => p.path).filter((p) => p !== '/'),
  ...LEGAL_PAGES.map((p) => p.path),
];

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

/**
 * Running mode: the only running claims pages may make. Note the limits:
 * it's a web app, so tracking needs the screen on and RepUp open.
 */
export const RUN_FACTS = [
  'Running mode: switch from the account menu (Workout mode / Running mode)',
  'Run or walk: GPS distance, moving time, average pace, splits for every km',
  'Pause / resume; a lock button so pocket or sweaty touches do nothing',
  'Voice and vibration at every km ("2 kilometres, last kilometre 6 minutes 5 seconds"), can be turned off',
  'Weather (temperature) at the start of a run',
  'Route map after the run (OpenStreetMap)',
  'Steps: counted with the phone motion sensor when available, otherwise estimated from distance (shown with ~)',
  'Calories: an estimate from distance and body weight (shown with ~)',
  'GPS smoothing so standing still or noisy GPS does not add fake distance',
  'Add a run or walk by hand (treadmill, or a run without the phone)',
  'Week view (tap a day to see its runs), history by month, progress: weekly km, longest run, best pace, pace chart',
  'Same account and data as workouts, synced to phone and laptop, free, no ads',
  'LIMIT: tracking needs the screen on and RepUp open (phone in hand or an armband); screen off / other apps pause GPS, and the gap is joined with a straight line',
  'LIMIT: no heart rate, no live notification, no Apple Watch / Wear OS app, no training plans built into the app (plans on the website are guides)',
] as const;
