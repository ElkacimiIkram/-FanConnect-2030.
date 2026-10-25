import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { ROUTES } from '../../utils/constants';
import { MATCH_STATUS_LABELS } from '../../utils/matchLabels';

export default function StickyReserveBar({ match, observeId = 'match-reserve-cta' }) {
  const [visible, setVisible] = useState(false);

  const canReserve = match?.bookable && match?.localId && match?.status !== 'FINISHED';

  useEffect(() => {
    if (!canReserve) return undefined;

    const target = document.getElementById(observeId);
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [canReserve, observeId]);

  if (!canReserve) return null;

  const isLive = match.status === 'LIVE';
  const scoreLabel = isLive
    ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
    : MATCH_STATUS_LABELS[match.status] || match.status;

  return (
    <div
      className={`fc-sticky-reserve ${visible ? 'fc-sticky-reserve--visible' : ''}`}
      role="region"
      aria-label="Réserver une place"
      aria-hidden={!visible}
    >
      <div className="fc-sticky-reserve__inner">
        <div className="fc-sticky-reserve__match">
          <p className="fc-sticky-reserve__teams">
            {match.homeTeam?.name || match.homeTeam}{' '}
            <span className="text-ink-faint">vs</span>{' '}
            {match.awayTeam?.name || match.awayTeam}
          </p>
          <p className="fc-sticky-reserve__meta">
            {scoreLabel}
            {isLive && match.matchMinute != null && (
              <span className="ml-2 text-red-400">{match.matchMinute}&apos;</span>
            )}
          </p>
        </div>
        <Link to={ROUTES.BOOK({ matchId: match.localId })} className="shrink-0">
          <Button size="sm">Réserver</Button>
        </Link>
      </div>
    </div>
  );
}