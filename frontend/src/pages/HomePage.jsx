import { Link } from 'react-router-dom';
import HeroPremium from '../components/home/HeroPremium';
import LiveMatchTicker from '../components/home/LiveMatchTicker';
import GlassCard from '../components/ui/GlassCard';
import { ROUTES } from '../utils/constants';

const STEPS = [
  { step: '01', icon: '⚽', title: 'Select Match', text: 'World Cup 2026 & 2030 — live scores, groups and countdowns.', link: ROUTES.MATCHES, label: 'Match Center' },
  { step: '02', icon: '📍', title: 'Find Your Spot', text: 'Interactive map with real-time green / orange / red occupancy.', link: ROUTES.CAFES, label: 'Explore Places' },
  { step: '03', icon: '🎫', title: 'Reserve & Pay', text: 'Premium booking flow with QR tickets and instant confirmation.', link: ROUTES.BOOK(), label: 'Reserve Now' },
];

export default function HomePage() {
  return (
    <div className="fc-home">
      <LiveMatchTicker />
      <HeroPremium />

      <section className="page-container py-20">
        <div className="text-center animate-fade-up">
          <span className="badge-gold">How it works</span>
          <h2 className="section-title mt-4">Three steps to match-day glory</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            A premium experience built for World Cup fans — reserve before the crowd arrives.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.step} className={`animate-on-load stagger-${i + 1}`}>
              <GlassCard className="group h-full p-7" glow={i === 1}>
                <span className="font-display text-4xl font-black text-primary-500/30">{s.step}</span>
                <span className="mt-4 block text-3xl">{s.icon}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
                <Link
                  to={s.link}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary-400 transition group-hover:gap-2"
                >
                  {s.label} →
                </Link>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container pb-24">
        <GlassCard className="overflow-hidden p-8 sm:p-12" glow>
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            <div className="flex h-24 w-24 shrink-0 animate-bounce-soft items-center justify-center rounded-3xl bg-gold-shine text-5xl shadow-glow-gold">
              🏆
            </div>
            <div className="flex-1">
              <h2 className="font-display text-3xl font-bold text-ink">
                Ready for the next kickoff?
              </h2>
              <p className="mt-3 text-ink-muted">
                Stadium atmosphere. Apple-grade polish. SofaScore-level match data.
                All in one platform.
              </p>
            </div>
            <Link to={ROUTES.MATCHES} className="fc-btn fc-btn--gold shrink-0 px-10">
              Enter Match Center
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}