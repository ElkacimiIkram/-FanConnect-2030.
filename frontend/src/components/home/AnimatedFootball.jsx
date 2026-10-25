export default function AnimatedFootball({ className = '' }) {
  return (
    <div className={`football-scene ${className}`} aria-hidden>
      <div className="football-orbit">
        <div className="football-bounce">
          <div className="football-ball">
            <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-2xl">
            <defs>
              <radialGradient id="ballShine" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#f8fafc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.15" />
              </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="56" fill="url(#ballShine)" stroke="#1e293b" strokeWidth="2" />
            <path
              d="M60 8 L72 28 L60 48 L48 28 Z"
              fill="#1e293b"
              opacity="0.85"
            />
            <path
              d="M60 48 L88 40 L96 68 L72 88 L48 68 L40 40 Z"
              fill="#1e293b"
              opacity="0.75"
            />
            <path
              d="M48 68 L60 88 L72 68 L60 48 Z"
              fill="#1e293b"
              opacity="0.9"
            />
            <path
              d="M40 40 L48 28 L60 48 L48 68 Z"
              fill="#334155"
              opacity="0.7"
            />
            <path
              d="M88 40 L96 68 L72 88 L60 68 L72 48 Z"
              fill="#334155"
              opacity="0.7"
            />
            <ellipse cx="42" cy="38" rx="14" ry="8" fill="#fff" opacity="0.35" transform="rotate(-25 42 38)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="football-trail football-trail--1" />
      <div className="football-trail football-trail--2" />
      <div className="football-trail football-trail--3" />

      <div className="pitch-line pitch-line--left" />
      <div className="pitch-line pitch-line--right" />
      <div className="pitch-center-circle" />
    </div>
  );
}