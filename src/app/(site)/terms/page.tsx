import { LegalPage } from '@/components/site/LegalPage';
import { landingMetadata } from '@/components/site/seo';
import { CONTACT_EMAIL } from '@/lib/site';

const PATH = '/terms';

export const metadata = landingMetadata({
  path: PATH,
  title: 'Terms of Use | RepUp',
  description:
    'The simple rules for using RepUp, the free gym workout tracker: your account, your data, safe training and our limits of responsibility.',
  keywords: ['RepUp terms of use', 'workout tracker terms'],
});

export default function TermsPage() {
  return (
    <LegalPage
      path={PATH}
      title="Terms of use"
      updated="13 November 2026"
      intro={
        <p>
          By creating a RepUp account or using the app, you agree to these terms. They are short on purpose. If you do not agree,
          please do not use RepUp.
        </p>
      }
    >
      <section>
        <h2>The service</h2>
        <p>
          RepUp is a free app for planning gym workouts and recording sets, reps and weight. We may improve, change or stop
          features over time. We aim to keep it running, but we cannot promise it will always be available or error-free.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>You must be at least 13 years old to use RepUp.</li>
          <li>Give a real email address and keep your password to yourself. You are responsible for what happens in your account.</li>
          <li>One person per account. Tell us if you think someone else has used yours.</li>
        </ul>
      </section>

      <section>
        <h2>Your data</h2>
        <p>
          Your workouts belong to you. You can download any workout as a PDF, ask us for a copy of all your data, or delete your account at any time (Settings →
          Delete my account). How we handle your data is explained in our <a href="/privacy">privacy policy</a>.
        </p>
      </section>

      <section>
        <h2>Train safely</h2>
        <p>
          RepUp suggests targets (like adding a rep or a little weight) based only on the numbers you enter. It is not a coach or a
          doctor and does not know your health. Training and diet information on our website is general, not medical advice. Use
          good form, stop if something hurts, and talk to a doctor before starting if you have an injury or a health condition. You
          train at your own risk.
        </p>
      </section>

      <section>
        <h2>Fair use</h2>
        <p>
          Do not misuse RepUp: no trying to access other people’s accounts or data, no attacking or overloading the service, no
          automated sign-ups and no illegal content in names, notes or photos. We may suspend accounts that do.
        </p>
      </section>

      <section>
        <h2>Limits of responsibility</h2>
        <p>
          RepUp is provided “as is”, free of charge. As far as the law allows, we are not responsible for injuries, lost data or
          other losses from using the app. Download a PDF of any workout you want to keep a separate copy of.
        </p>
      </section>

      <section>
        <h2>Changes and ending</h2>
        <p>
          We may update these terms; the date at the top shows the latest version, and using RepUp after a change means you accept
          it. You can stop using RepUp and delete your account whenever you like.
        </p>
      </section>

      <section>
        <h2>Law and contact</h2>
        <p>
          These terms are governed by the laws of India. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>
    </LegalPage>
  );
}
