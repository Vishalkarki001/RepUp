import { LegalPage } from '@/components/site/LegalPage';
import { landingMetadata } from '@/components/site/seo';
import { CONTACT_EMAIL } from '@/lib/site';

const PATH = '/privacy';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Privacy Policy | RepUp',
  description:
    'What RepUp, the free gym workout tracker, stores about you, where it is kept, who can see it and how to delete it. No ads, no selling of data.',
  keywords: ['RepUp privacy policy', 'workout tracker privacy'],
});

export default function PrivacyPage() {
  return (
    <LegalPage
      path={PATH}
      title="Privacy policy"
      updated="13 November 2026"
      intro={
        <p>
          RepUp is a free gym workout tracker. We keep only what the app needs to work: your login and your workouts. We do not
          show ads, we do not sell your data, and we do not use tracking or advertising cookies.
        </p>
      }
    >
      <section>
        <h2>What we store</h2>
        <ul>
          <li>
            <b>Account:</b> your email address, your name, and a profile photo if you add one. If you sign in with Google, we
            receive your name, email address and Google profile photo from Google, and nothing else.
          </li>
          <li>
            <b>Your training:</b> your weekly plan, exercises (including ones you create), workouts with sets, kg and reps, notes,
            body-weight entries and app settings (like kg or lb).
          </li>
          <li>
            <b>Runs and walks (only if you use running mode):</b> time, distance, pace, estimated steps and calories, the weather at
            the start, and your route on the map. Your location is used only while you are tracking a run, after you allow it, and
            only the route of that run is saved.
          </li>
          <li>
            <b>Basic account activity:</b> when you signed up, last signed in and last opened the app.
          </li>
          <li>
            <b>On your device:</b> a copy of your data is kept in your browser so the app works without internet, plus a login
            cookie that keeps you signed in. Logging out removes the copy from that device.
          </li>
        </ul>
        <p className="mt-3">We do not collect payment details, your location outside of a run you are tracking, your contacts or anything from your phone’s other apps.</p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          Only to run RepUp for you: to log you in, save your workouts, show them on your other devices, show what you lifted last
          time and your progress charts, and send you account emails (confirming your email or resetting your password). We do not
          send marketing emails.
        </p>
      </section>

      <section>
        <h2>Who can see it</h2>
        <ul>
          <li>
            <b>You.</b> Each account can only read and change its own data; the database enforces this for every request.
          </li>
          <li>
            <b>RepUp admins</b> (the small team that runs RepUp) can see your account details (name, email, photo, sign-up and
            last-active dates), your logged workouts (exercises, sets, weights, reps and notes) and your runs (distance, time, pace,
            steps, calories, weather and notes, but not your route map). We use this only to run and
            improve RepUp, help you when you ask, and stop misuse. Admins can also block or delete an account that breaks our{' '}
            <a href="/terms">terms</a>. Every admin action is recorded.
          </li>
          <li>
            <b>Service providers</b> that host the app for us: Supabase (database, login and photo storage, servers in Mumbai,
            India), Vercel (website hosting), Google (sign-in with Google, and the Gmail account that sends our emails), Open-Meteo (the
            weather when a run starts; it receives your position rounded to about 1 km) and OpenStreetMap (map images of your route). They
            process data only to provide their service to us.
          </li>
        </ul>
        <p className="mt-3">We never sell or rent your data and never share it with advertisers.</p>
      </section>

      <section>
        <h2>Google sign-in</h2>
        <p>
          RepUp’s use and transfer of information received from Google APIs adheres to the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We only use your Google name, email and photo to create and show your RepUp
          account.
        </p>
      </section>

      <section>
        <h2>Keeping it safe</h2>
        <p>
          Connections are encrypted (HTTPS). Passwords are never stored in readable form. Access to each account’s data is checked
          by the database itself, not just by the app.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>
            <b>See and edit:</b> everything you saved is visible in the app, and you can edit or delete workouts, exercises and
            body-weight entries at any time.
          </li>
          <li>
            <b>Download:</b> open any workout and tap Download PDF. For a copy of everything in your account, email us and we’ll send it.
          </li>
          <li>
            <b>Delete your account:</b> Settings → Delete my account permanently deletes your account, workouts and profile photo.
            This cannot be undone.
          </li>
        </ul>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          As long as you have an account. When you delete it, your data is removed from our database straight away; copies in our
          hosting provider’s routine backups are cleared as those backups expire.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>RepUp is not meant for children under 13, and we do not knowingly collect their data.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If we change this policy, we will update this page and the date at the top.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions or requests about your data: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>
    </LegalPage>
  );
}
