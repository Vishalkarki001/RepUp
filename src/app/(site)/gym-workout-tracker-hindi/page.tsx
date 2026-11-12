import Link from 'next/link';
import type { ReactNode } from 'react';
import { Mukta } from 'next/font/google';
import { PhoneMock } from '@/components/site/PhoneMock';
import { appLd, breadcrumbLd, faqLd, howToLd, landingMetadata, type Faq } from '@/components/site/seo';
import { SIGNUP_HREF, SiteNav } from '@/components/site/SiteChrome';
import { A, CtaBand, FaqSection, LandingShell, PlanCard } from '@/components/site/kit';

/**
 * Hinglish landing page for Indian gym-goers.
 * Look: "centred desi poster". Brand violet for actions, saffron (#f59e0b) as
 * this page's accent with marigold dot garlands; Pehle vs Ab split; big
 * Devanagari numerals; Android / iPhone install cards side by side.
 * Main keywords: gym workout tracker app in hindi, gym diary app, gym workout plan in hindi.
 */

const PATH = '/gym-workout-tracker-hindi';

// Only a fallback for Devanagari glyphs: Latin text stays in the brand font (Geist).
const mukta = Mukta({ subsets: ['devanagari'], weight: ['400', '600', '700'], variable: '--font-mukta', display: 'swap' });

export const metadata = landingMetadata({
  path: PATH,
  title: 'Gym Workout Tracker App in Hindi: Free Gym Diary | RepUp',
  description:
    'RepUp free gym diary app hai: sets, reps aur kg likho, last time kitna uthaya tha turant dekho. Hinglish me gym workout plan aur beginner tips. No ads.',
  keywords: [
    'gym workout tracker app in hindi',
    'gym diary app',
    'gym workout plan in hindi',
    'gym jane ka plan',
    'workout kaise track kare',
    'जिम वर्कआउट प्लान',
    'free gym app India',
  ],
  locale: 'hi_IN',
});

const FAQS: Faq[] = [
  {
    q: 'Kya RepUp app Hindi me hai?',
    a: 'App ki screens simple English me hain: Sets, Reps, kg, Last time jaise chhote words. Yeh guide Hinglish me hai taaki samajhna aasaan ho. Gym me jo words bolte ho, wahi app me dikhte hain.',
  },
  {
    q: 'Kya RepUp free hai?',
    a: 'Haan. RepUp free hai aur isme koi ads nahi hain. Workouts save karne ke liye sirf email ya Google account se login karna hota hai.',
  },
  {
    q: 'Gym me internet nahi aata, tab bhi chalega?',
    a: 'Haan. Ek baar app khul jaye, phir bina internet ke bhi sets log kar sakte ho. Network wapas aate hi data aapke account me save ho jata hai.',
  },
  {
    q: 'Workout kaise track kare?',
    a: 'Har exercise ke har set ka weight (kg) aur reps likho. Agli baar shuru karne se pehle last time ke numbers dekho aur thoda sa better karo: ek rep zyada ya thoda weight zyada. RepUp yeh numbers khud dikhata hai aur aaj ka target batata hai.',
  },
  {
    q: 'Beginner ko hafte me kitne din gym jana chahiye?',
    a: 'Shuru me hafte me 3 din kaafi hain, jaise Monday, Wednesday, Friday. Beech ke din body recover karti hai. Jab aadat ban jaye, tab 4 ya 5 din kar sakte ho.',
  },
  {
    q: 'Kya RepUp calories ya diet track karta hai?',
    a: 'Nahi. RepUp sirf workout ke liye hai: sets, reps, kg, progress charts aur body weight. Khana ya calories track nahi karta, aur isme rest timer bhi nahi hai. Simple rakha gaya hai.',
  },
];

const ANDROID = [
  { name: 'Chrome me kholo', text: 'Android phone par Chrome me getrepup.vercel.app kholo.' },
  { name: '⋮ menu dabao', text: 'Upar right corner me ⋮ (teen dots) dabao.' },
  { name: 'Install app', text: '“Install app” ya “Add to Home screen” chuno. Phir home screen ke icon se kholo aur login karo.' },
];

const IPHONE = [
  { name: 'Safari me kholo', text: 'iPhone par Safari me getrepup.vercel.app kholo.' },
  { name: 'Share dabao', text: 'Neeche Share button dabao (box aur upar ka arrow).' },
  { name: 'Add to Home Screen', text: '“Add to Home Screen”, phir “Add” dabao. Icon se kholo aur email ya Google se login karo.' },
];

const TIPS = [
  {
    t: 'Form pehle, weight baad me',
    d: 'Halke weight se sahi tareeka seekho. Mirror ya trainer se check karwao. Galat form se injury hoti hai, aur injury se gym band.',
  },
  {
    t: 'Protein ghar ke khane se',
    d: 'Har meal me protein rakho: dal, rajma, chana, paneer, dahi, eggs, soya chunks, chicken ya fish. Supplement zaroori nahi, pehle khana theek karo.',
  },
  { t: 'Neend bhi workout ka hissa hai', d: 'Muscle gym me nahi, aaram ke time banti hai. Roz 7–9 ghante sone ki koshish karo.' },
  { t: 'Warm-up mat chhodo', d: '5 minute halka cardio, phir pehli exercise ke 1–2 halke sets. Body garam hogi to lift bhi achha hoga.' },
];

const PEHLE_AB: [string, string][] = [
  ['Pichhle hafte 40 kg tha ya 45? Yaad nahi.', 'Har set ke bagal me last time ke kg × reps.'],
  ['Diary ghar pe reh gayi, ya pages palatne padte hain.', 'Phone me hamesha saath, aur laptop par bhi same data.'],
  ['Phone notes me scroll karke dhoondhna padta hai.', 'Har exercise ka progress chart, ek tap me.'],
  ['Wahi weight phir se, hafte nikal jaate hain.', 'Aaj ka target: ek rep zyada ya thoda weight zyada.'],
];

const STEPS = [
  { n: '१', t: 'Hafte ka plan banao', d: 'Har din ke liye exercises chuno, sets × reps ke saath. Ek baar banao, har hafte wahi plan dikhega.' },
  { n: '२', t: 'Har set log karo', d: 'kg aur reps type karo, ✓ tick karo. Last time ke numbers wahin bagal me dikhte hain.' },
  { n: '३', t: 'Last time ko harao', d: 'RepUp aaj ka target batata hai: ek rep zyada, ya sab sets poore hue to thoda weight badhao.' },
];

/** A row of marigold dots, like a garland. */
function Garland({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-3 w-full ${className}`}
      style={{
        backgroundImage: 'radial-gradient(circle, #f59e0b 4px, transparent 4.5px), radial-gradient(circle, #fbbf24 2.5px, transparent 3px)',
        backgroundSize: '22px 12px, 22px 12px',
        backgroundPosition: '0 0, 11px 0',
      }}
    />
  );
}

function Kicker({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <p className={`mb-3 flex items-center gap-2 text-base font-semibold text-[#b45309] ${center ? 'justify-center' : ''}`}>
      <span aria-hidden className="inline-block size-2.5 rotate-45 bg-[#f59e0b]" />
      {children}
    </p>
  );
}

function Bubble({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <div
      className={`relative w-full max-w-[17rem] rounded-3xl border-2 bg-white px-5 py-4 shadow-lg ${
        side === 'left' ? 'border-[#f59e0b] shadow-[#f59e0b]/15 md:justify-self-end' : 'border-[#7c3aed] shadow-[#7c3aed]/15 md:justify-self-start'
      } mx-auto md:mx-0`}
    >
      {children}
      <span
        aria-hidden
        className={`absolute top-1/2 hidden size-4 -translate-y-1/2 rotate-45 bg-white md:block ${
          side === 'left' ? '-right-[9px] border-t-2 border-r-2 border-[#f59e0b]' : '-left-[9px] border-b-2 border-l-2 border-[#7c3aed]'
        }`}
      />
    </div>
  );
}

const h2 = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';

export default function Page() {
  return (
    <LandingShell
      path={PATH}
      lang="hi"
      className={`${mukta.variable} [font-family:var(--font-sans),var(--font-mukta),sans-serif]`}
      jsonLd={[
        appLd('Free gym diary app: weekly plan, sets, reps aur kg log karo, last time dekho aur aaj ka target pao.'),
        faqLd(FAQS),
        breadcrumbLd(PATH, 'Gym workout tracker app in Hindi'),
        howToLd('RepUp ko Android phone par install kaise kare', ANDROID),
        howToLd('RepUp ko iPhone par install kaise kare', IPHONE),
      ]}
    >
      {/* Hero: centred desi poster */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 45%, #ffffff 100%)' }}>
        <Garland />
        <SiteNav
          upClass="text-[#7c3aed]"
          loginClass="text-[#404040] hover:text-[#0a0a0a]"
          ctaClass="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          ctaLabel="Free shuru karo"
        />
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-8 pb-16 text-center sm:px-6 md:pt-14 md:pb-24">
          <p className="w-fit rounded-full bg-[#f59e0b] px-4 py-1 text-sm font-semibold text-[#0a0a0a]">मुफ़्त जिम डायरी · No ads</p>
          <p className="mt-6 text-4xl leading-tight font-bold text-[#0a0a0a] sm:text-5xl md:text-6xl">
            आपकी जिम डायरी,{' '}
            <span className="bg-[linear-gradient(transparent_62%,#fcd34d_62%)] px-1">अब आपके फ़ोन में</span>
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#404040] sm:text-3xl">
            Gym workout tracker app in Hindi <span className="text-[#7c3aed]">(Hinglish guide)</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Kaagaz ki diary bhool jao. RepUp me har set ka kg aur reps likho. Agli baar app khud batayega ki last time kitna uthaya
            tha, aur aaj kitna try karna hai.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGNUP_HREF}
              className="rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9]"
            >
              Free me shuru karo
            </Link>
            <a href="#plan" className="rounded-xl border-2 border-[#f59e0b] bg-white px-6 py-3.5 text-base font-semibold text-[#0a0a0a] hover:bg-[#fff7ed]">
              Weekly plan dekho
            </a>
          </div>
          <p className="mt-4 text-sm text-[#525252]">Note: app ki screens simple English me hain (Sets, Reps, kg). Yeh guide Hinglish me hai.</p>

          <div className="mt-12 grid w-full items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8">
            <Bubble side="left">
              <p className="text-lg font-semibold text-[#0a0a0a]">Pichhli baar kitna uthaya tha? 🤔</p>
              <p className="mt-1 text-sm text-[#525252]">40 kg? 45 kg? 8 reps ya 10?</p>
            </Bubble>
            <PhoneMock screen="log" className="rotate-1" />
            <Bubble side="right">
              <p className="text-2xl font-bold text-[#7c3aed] tabular-nums">
                60 kg × 10 <span className="text-[#059669]">✓</span>
              </p>
              <p className="mt-1 text-sm font-medium text-[#404040]">RepUp yaad rakhta hai</p>
            </Bubble>
          </div>
        </div>
      </section>

      {/* Short answer */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-[#fde68a] bg-[#fffbeb] p-6 sm:p-8">
          <h2 className="text-sm font-semibold tracking-wide text-[#b45309] uppercase">सीधा जवाब: gym diary app kya hai?</h2>
          <p className="mt-3 text-xl leading-relaxed text-[#262626] sm:text-2xl">
            RepUp ek free gym diary app hai jo phone ke browser me chalta hai aur Android ya iPhone par install ho jata hai. Har
            set ka kg aur reps likho. Agli baar RepUp dikhata hai ki last time kitna uthaya tha aur aaj ka target batata hai. Koi
            ads nahi. Screens simple English me hain.
          </p>
        </div>
      </section>

      {/* Pehle vs Ab */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="text-center">
          <Kicker center>असली समस्या</Kicker>
          <h2 className={h2}>“Last time kitna uthaya tha?” Yaad nahi aata?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
            Body tab strong hoti hai jab har hafte thoda sa zyada karo: ek rep zyada, ya 2.5 kg zyada. Isko{' '}
            <A href="/progressive-overload-tracker">progressive overload</A> kehte hain. Iske liye numbers likhna zaroori hai.
          </p>
        </div>
        <div className="mt-10 grid overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white md:grid-cols-2">
          <div>
            <div className="bg-[#f59e0b] px-6 py-5">
              <p className="text-sm font-semibold text-[#0a0a0a]/70">पहले</p>
              <h3 className="text-2xl font-bold text-[#0a0a0a]">Pehle: kaagaz ki diary</h3>
            </div>
            <ul className="divide-y divide-[#f5f5f5]">
              {PEHLE_AB.map(([p]) => (
                <li key={p} className="flex gap-3 px-6 py-4 text-[16px] leading-relaxed text-[#525252]">
                  <span aria-hidden className="font-bold text-[#b45309]">✗</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-[#e5e5e5] md:border-t-0 md:border-l">
            <div className="bg-[#7c3aed] px-6 py-5 text-white">
              <p className="text-sm font-semibold text-white/75">अब</p>
              <h3 className="text-2xl font-bold">Ab: RepUp ke saath</h3>
            </div>
            <ul className="divide-y divide-[#f5f5f5]">
              {PEHLE_AB.map(([p, a]) => (
                <li key={p} className="flex gap-3 px-6 py-4 text-[16px] leading-relaxed text-[#262626]">
                  <span aria-hidden className="font-bold text-[#059669]">✓</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-[#fde68a] bg-[#fffbeb]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Kicker>तरीका</Kicker>
          <h2 className={h2}>RepUp se workout kaise track kare</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-5 md:flex-col">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-4xl font-bold text-[#0a0a0a] shadow-[0_0_0_6px_#fde68a]">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 leading-relaxed text-[#525252]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-2xl text-[17px] leading-relaxed text-[#404040]">
            Progress charts me har exercise ka graph dikhta hai, aur body weight bhi log kar sakte ho. Barbell ke liye plate
            calculator bhi hai.
          </p>
        </div>
      </section>

      {/* Weekly plan */}
      <section id="plan" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-16 sm:px-6 md:py-20">
        <Kicker>हफ़्ते का जिम वर्कआउट प्लान</Kicker>
        <h2 className={h2}>Gym jane ka plan: beginners ke liye weekly plan</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Yeh ek example plan hai: hafte me 3 din, Push / Pull / Legs, har exercise 3 sets. Weight itna rakho ki aakhri 1–2 reps
          mushkil lagen, par form na toote. Poori detail ke liye <A href="/push-pull-legs-workout-planner">push pull legs planner</A>{' '}
          ya <A href="/beginner-gym-workout-plan">beginner gym plan</A> dekho.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <PlanCard
            title="Monday · Push"
            subtitle="Chest, shoulders, triceps"
            rows={[
              ['Bench press', '3 × 8–10'],
              ['Shoulder press', '3 × 8–10'],
              ['Tricep pushdown', '3 × 10–12'],
            ]}
          />
          <PlanCard
            title="Wednesday · Pull"
            subtitle="Back, biceps"
            featured
            rows={[
              ['Lat pulldown', '3 × 8–10'],
              ['Seated cable row', '3 × 10–12'],
              ['Dumbbell curl', '3 × 10–12'],
            ]}
          />
          <PlanCard
            title="Friday · Legs"
            subtitle="Thighs, glutes, calves"
            rows={[
              ['Squat', '3 × 8–10'],
              ['Leg press', '3 × 10–12'],
              ['Calf raise', '3 × 12–15'],
            ]}
          />
        </div>
        <p className="mt-6 max-w-2xl rounded-2xl border-l-4 border-[#f59e0b] bg-white px-5 py-4 text-[15px] leading-relaxed text-[#525252]">
          Baaki din: aaram, 20–30 min walk ya halka stretching. 2–3 mahine baad 4–5 din karna ho to Push, Pull, Legs, Rest, phir
          repeat. Yeh plan RepUp me Mon–Sun ke hisaab se daal sakte ho.
        </p>
      </section>

      <Garland className="mx-auto max-w-6xl" />

      {/* Tips */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <Kicker>शुरुआत के टिप्स</Kicker>
        <h2 className={h2}>Gym beginners ke liye 4 zaroori tips</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#525252]">
          Muscle banana hai to protein aur training dono chahiye. Detail me padho:{' '}
          <A href="/muscle-gain-workout-log">muscle gain aur protein guide</A>.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((t) => (
            <li key={t.t} className="rounded-2xl border border-[#e5e5e5] border-t-4 border-t-[#f59e0b] bg-white p-6">
              <h3 className="text-lg font-semibold">{t.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#525252]">{t.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Install */}
      <section id="install" className="scroll-mt-8 bg-[#0b0a1f] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-3 flex items-center gap-2 text-base font-semibold text-[#fbbf24]">
            <span aria-hidden className="inline-block size-2.5 rotate-45 bg-[#f59e0b]" />
            फ़ोन पर इंस्टॉल करें
          </p>
          <h2 className={h2}>Gym diary app phone par kaise install kare</h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/75">
            Play Store ki zaroorat nahi. RepUp browser se seedha home screen par aa jata hai, aur gym me network na ho tab bhi
            chalta hai (
            <Link href="/offline-workout-tracker" className="font-medium text-[#fcd34d] underline underline-offset-4">
              offline workout app
            </Link>
            ).
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { title: 'Android (Chrome)', steps: ANDROID },
              { title: 'iPhone (Safari)', steps: IPHONE },
            ].map((b) => (
              <div key={b.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <h3 className="text-xl font-semibold">{b.title}</h3>
                <ol className="mt-6 flex flex-col gap-5">
                  {b.steps.map((s, i) => (
                    <li key={s.name} className="flex gap-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] font-bold text-[#0a0a0a]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="mt-1 leading-relaxed text-white/70">{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection faqs={FAQS} title="Aapke sawaal" />

      <CtaBand
        title="Aaj ka workout likho. Agli baar usse aage jao."
        body="Free hai. Setup me ek minute lagta hai. Email ya Google se login."
        cta="RepUp free me shuru karo"
      />
    </LandingShell>
  );
}
