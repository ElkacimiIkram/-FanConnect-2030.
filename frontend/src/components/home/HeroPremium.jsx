import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const FLAGS = [
  { code: 'br', label: 'Brazil' },
  { code: 'ar', label: 'Argentina' },
  { code: 'fr', label: 'France' },
  { code: 'ma', label: 'Morocco' },
  { code: 'es', label: 'Spain' },
  { code: 'pt', label: 'Portugal' },
  { code: 'us', label: 'USA' },
  { code: 'de', label: 'Germany' },
];

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: 4 + ((i * 37) % 92),
  y: 6 + ((i * 53) % 86),
  size: 2 + (i % 4),
  delay: (i % 8) * 0.35,
}));

const EASE = [0.22, 1, 0.36, 1];

const STATS = [
  { v: '50+', l: 'Partner venues' },
  { v: 'LIVE', l: 'Real-time occupancy' },
  { v: 'QR', l: 'Secure tickets' },
];

function TrophyIcon() {
  return (
    <svg viewBox="0 0 80 100" className="h-20 w-16 sm:h-28 sm:w-20">
      <defs>
        <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5c842" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#92700f" />
        </linearGradient>
      </defs>
      <path
        d="M20 12 H60 L58 32 Q58 48 40 52 Q22 48 22 32 Z"
        fill="url(#trophyGold)"
        stroke="#b8941f"
        strokeWidth="1"
      />
      <path d="M16 12 H24 V28 Q24 36 16 36 Q8 36 8 28 V20 Q8 12 16 12" fill="url(#trophyGold)" />
      <path d="M64 12 H56 V28 Q56 36 64 36 Q72 36 72 28 V20 Q72 12 64 12" fill="url(#trophyGold)" />
      <rect x="34" y="52" width="12" height="14" fill="url(#trophyGold)" />
      <rect x="28" y="66" width="24" height="8" rx="2" fill="url(#trophyGold)" />
      <rect x="24" y="74" width="32" height="6" rx="2" fill="#92700f" />
    </svg>
  );
}

function Football3D() {
  return (
    <motion.div
      className="fc-hero__ball"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
      style={{ transformOrigin: 'center center' }}
    >
      <motion.div
        className="relative"
        animate={{ y: [0, -10, 0], rotate: [0, 360] }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.3 },
          rotate: { duration: 16, repeat: Infinity, ease: 'linear', delay: 1.3 },
        }}
        style={{ transformOrigin: 'center center' }}
      >
        <div className="fc-hero__ball-glow" />
        <svg viewBox="0 0 120 120" className="h-28 w-28 sm:h-36 sm:w-36">
          <defs>
            <radialGradient id="ball3d" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0.2" />
            </radialGradient>
            <filter id="ballShadow">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.4" />
            </filter>
          </defs>
          <circle cx="60" cy="60" r="54" fill="url(#ball3d)" filter="url(#ballShadow)" stroke="#1e293b" strokeWidth="2" />
          <path d="M60 10 L72 30 L60 50 L48 30 Z" fill="#1e293b" opacity="0.85" />
          <path d="M60 50 L90 42 L98 70 L72 90 L48 70 L40 42 Z" fill="#1e293b" opacity="0.75" />
          <ellipse cx="42" cy="36" rx="14" ry="8" fill="#fff" opacity="0.4" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default function HeroPremium() {
  return (
    <section className="fc-hero">
      <div className="fc-hero__bg" aria-hidden>
        <div className="fc-hero__stadium-lights" />
        <div className="fc-hero__rays" />
        <div className="fc-hero__pitch" />
        <div className="fc-hero__crowd-glow" />
        <div className="fc-hero__mesh" />
      </div>

      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="fc-hero__particle fc-hero-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="fc-hero__grid">
        <div className="fc-hero__copy">
          <motion.span
            className="fc-hero__badge"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
          >
            <span className="fc-hero__badge-dot" />
            FIFA World Cup 2030
          </motion.span>

          <motion.h1
            className="fc-hero__headline"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
            style={{ transformOrigin: 'center center' }}
          >
            Welcome to{' '}
            <span className="fc-hero__headline-accent">FanConnect 2030</span>
          </motion.h1>

          <motion.p
            className="fc-hero__sub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
          >
            Find the best place to watch every match.
          </motion.p>
          <motion.p
            className="fc-hero__sub fc-hero__sub--gold"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: EASE }}
          >
            Reserve your table before everyone else.
          </motion.p>

          <div className="fc-hero__cta">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.5, ease: EASE }}
              style={{ transformOrigin: 'center center' }}
            >
              <Link to={ROUTES.BOOK()} className="fc-btn fc-btn--primary">
                Reserve Now
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.65, ease: EASE }}
              style={{ transformOrigin: 'center center' }}
            >
              <Link to={ROUTES.MATCHES} className="fc-btn fc-btn--glass">
                Explore Matches
              </Link>
            </motion.div>
          </div>

          <div className="fc-hero__stats">
            {STATS.map((s, i) => (
              <motion.div
                key={s.l}
                className="fc-hero__stat"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, transition: { duration: 0.25, delay: 0 } }}
                transition={{ duration: 0.5, delay: 1.75 + i * 0.12, ease: EASE }}
              >
                <span className="fc-hero__stat-value">{s.v}</span>
                <span className="fc-hero__stat-label">{s.l}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="fc-hero__visual">
          <div className="fc-hero__orbit-ring" />
          <div className="fc-hero__scene">
            <motion.div
              className="fc-hero__trophy"
              initial={{ opacity: 0, scale: 0.7, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
              style={{ transformOrigin: 'center center' }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.7 }}
              >
                <TrophyIcon />
              </motion.div>
            </motion.div>

            <Football3D />

            <div className="fc-hero__flags-orbit">
              {FLAGS.map((flag, i) => {
                const angle = (i / FLAGS.length) * 360;
                return (
                  <div
                    key={flag.code}
                    className="fc-hero__flag"
                    style={{
                      transform: `rotate(${angle}deg) translateX(var(--fc-orbit)) rotate(-${angle}deg)`,
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: EASE }}
                      style={{ transformOrigin: 'center center' }}
                    >
                      <img
                        src={`https://flagcdn.com/w80/${flag.code}.png`}
                        alt={flag.label}
                        className="fc-hero__flag-img"
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
