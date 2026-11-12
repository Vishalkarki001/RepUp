# RepUp — Gym Workout Tracker

A fast, mobile-first workout logger (Next.js 16 + React 19, Tailwind CSS v4 + shadcn/ui, installable PWA, works offline).

**Main idea:** you log each exercise (weight × reps for every set). The next time you do the
same exercise, the app shows **what you lifted last time** next to every set and gives you a
**progressive-overload target** for today.

## Run

```bash
npm install
npm run dev        # http://localhost:3000  (also on your Wi-Fi: http://<mac-ip>:3000)
npm run build && npm start   # production build (service worker / offline only runs here)
npm run lint       # TypeScript check
```

Open on your phone (same Wi-Fi) → Chrome menu → **Install app** / Safari → Share → **Add to Home Screen**.
Note: browsers only allow install + offline on `https://` or `localhost`. For real phone use,
deploy it (e.g. Vercel). Over plain `http://<ip>:3000`, the app works but doesn't install.

## Features

- **Plan your week** – tap any day (Mon–Sun) to see its workout. **Edit** → name it, add exercises
  (pick from the list or type a new name) and set **Sets / Reps / Kg** for each. A day with no exercises is a rest day.
- **Last time, per set** – the *Previous* column shows set 1/2/3 from your last session; ▲/▼ shows
  whether you beat it.
- **Target for today** – each exercise has a goal rep count (e.g. 3 × 10).
  - Not every set hit the goal yet → *same weight, go for the goal reps*.
  - Every working set hit the goal → *add weight* (2.5 kg; 2 kg for dumbbells/kettlebells).
  - Targets appear as placeholders; tap ✓ to log the target as-is, or type what you actually did. **Fill** writes the targets into all sets.
- **Warm-up sets** – tap the set number to mark it **W**. Warm-ups are ignored for targets, PRs and stats.
- **PRs** – a summary after each workout lists new personal records (estimated 1RM, Epley).
- **Progress** – per-exercise charts (heaviest, est. max, volume; tap for each session), workouts per week,
  sets per muscle group this week (10-set guide line), body-weight log.
- **History** – every workout with all sets; do it again, delete.
- **Light / dark theme** – sun/moon button on every screen, or Settings → Theme (Auto follows the phone).
- **Responsive** – bottom tabs + bottom-sheet dialogs on phones, sidebar + centred dialogs on laptops.
- **First-run setup** – new users pick Full Body (3 days), Upper/Lower (4), Bro Split (5) or Push/Pull/Legs (6), or an empty week.
- **Plan follows your workout** – added/removed an exercise or changed sets mid-workout? The summary offers "Update Monday's plan".
- **Edit past workouts** – History → open a workout → Edit (fix weights, reps, add/delete sets).
- **History calendar** – month view; training days highlighted, tap one to open it.
- **Plate calculator** – "Plates" button on barbell exercises shows what to load on each side.
- **Screen stays on** during a workout (where the browser supports it). No timers — the app just records what you lift.
- **Toasts & undo** – messages appear as toasts (Sonner); deleting a workout, discarding one or making a day a rest day can be undone. Confirmations use an in-app dialog, never browser popups.
- **kg or lb** – Settings → Weight unit (a label; numbers already saved are not converted).
- **Backup** – Save / Restore JSON in Settings.

## Accounts & cloud sync (Supabase)

- **Login required.** `src/proxy.ts` (Next.js 16 Proxy, formerly Middleware) checks the session on every
  page request and sends signed-out visitors to `/login`. Email + password (with email confirmation),
  "Forgot password" (same answer whether or not the email exists) and "Continue with Google".
- **Data lives in the database**, one row per record, every row owned by a user. Row Level Security
  (`supabase/migrations/*.sql`) means a user can only ever read or write their own rows — even with the
  public key. Admins are flagged in `profiles.role` and read the user list through `admin_users()`.
- **Offline-first sync** (`src/lib/sync.ts`): the device keeps a copy per user; changes are pushed
  ~1.5 s later, pulled on sign-in / focus / reconnect; deletes are soft so other devices see them.
  Workouts saved before accounts existed are moved into the first account that signs in on that device.
  Signing out removes that user's copy from the device.

### Setup
1. Create a Supabase project. Copy `.env.example` → `.env` and fill in the URL + publishable key.
2. Run `supabase/migrations/20261112000000_init.sql` once (Supabase → SQL Editor → paste → Run).
3. Supabase → Authentication → URL Configuration: Site URL = your app URL, add `<app URL>/**` to Redirect URLs.
4. (Google) Create an OAuth client in Google Cloud, redirect URI `https://<ref>.supabase.co/auth/v1/callback`,
   then paste the Client ID/secret in Supabase → Authentication → Sign In / Providers → Google.
5. Make yourself admin: SQL Editor → `update public.profiles set role = 'admin' where email = 'you@example.com';`

## Code map

```
src/app/            layout, page, manifest.ts (PWA), globals.css
src/components/     App shell, tab screens (screens/*), Modal/Confirm, common.tsx (Stat, EmptyState…)
src/components/ui/  shadcn/ui components (Radix, Tailwind v4) — add more with `npx shadcn@latest add <name>`
src/lib/types.ts    data model (one interface per future DB table: exercises, plans, workouts, body weights)
src/lib/store.ts    state + actions (per-user copy on the device)
src/lib/sync.ts     Supabase sync engine · src/lib/account.ts sign-out / delete account
src/lib/supabase/   browser + server clients · src/proxy.ts login gate
src/app/login, reset-password, auth/callback   auth pages + email/OAuth return route
src/lib/progression.ts  progression targets + set comparison
src/lib/theme.ts    light/dark preference (per device)
src/lib/data/defaults.ts  starter exercises + Push/Pull/Legs week plan
public/sw.js        service worker (offline)
```

## Next steps (planned)

1. **Login** – e.g. Supabase Auth / Auth.js.
2. **Database** – tables mirror `src/lib/types.ts`: `exercises`, `routines` (+ `routine_items`),
   `workouts` → `workout_exercises` → `sets`, `body_weights`, `settings`, all keyed by `user_id`.
   Keep `store.ts` as the offline cache and sync changes to the server so the gym works without signal.
3. One-time import of the localStorage data into the user's account after first login.
