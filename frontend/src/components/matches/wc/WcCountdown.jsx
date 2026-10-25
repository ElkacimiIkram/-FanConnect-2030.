import { useEffect, useState } from 'react';

function getRemaining(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes };
}

function formatRemaining({ days, hours, minutes }) {
  const parts = [];
  if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  return parts.join(' ');
}

export default function WcCountdown({ matchDate, variant = 'blocks' }) {
  const [remaining, setRemaining] = useState(() => getRemaining(matchDate));

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(matchDate));
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [matchDate]);

  if (!remaining) return null;

  if (variant === 'text') {
    return (
      <p className="wc-countdown-text">
        Début dans {formatRemaining(remaining)}
      </p>
    );
  }

  const blocks = [
    { label: 'Jours', value: remaining.days },
    { label: 'Heures', value: remaining.hours },
    { label: 'Min', value: remaining.minutes },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {blocks.map((block) => (
        <div
          key={block.label}
          className="min-w-[3.5rem] rounded-lg border border-primary-200 bg-primary-50 px-2 py-1.5 text-center"
        >
          <p className="font-display text-lg font-bold tabular-nums text-primary-800">
            {String(block.value).padStart(2, '0')}
          </p>
          <p className="text-[9px] font-semibold uppercase text-primary-600">{block.label}</p>
        </div>
      ))}
    </div>
  );
}