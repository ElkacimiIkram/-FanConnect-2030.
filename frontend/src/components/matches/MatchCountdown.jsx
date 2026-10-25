import { useEffect, useState } from 'react';

function getRemaining(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function MatchCountdown({ matchDate, className = '' }) {
  const [remaining, setRemaining] = useState(() => getRemaining(matchDate));

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(matchDate));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [matchDate]);

  if (!remaining) return null;

  const blocks = [
    { label: 'Jours', value: remaining.days },
    { label: 'Heures', value: remaining.hours },
    { label: 'Min', value: remaining.minutes },
    { label: 'Sec', value: remaining.seconds },
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {blocks.map((block) => (
        <div
          key={block.label}
          className="min-w-[4.5rem] animate-scale-in rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-center shadow-soft"
        >
          <p className="font-display text-2xl font-bold tabular-nums text-primary-800">
            {String(block.value).padStart(2, '0')}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-600">
            {block.label}
          </p>
        </div>
      ))}
    </div>
  );
}