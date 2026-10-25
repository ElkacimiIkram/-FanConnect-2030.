import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { ROUTES } from '../../utils/constants';
import { formatCountdown, MATCH_STATUS_LABELS } from '../../utils/matchLabels';
import { formatDateTime } from '../../utils/formatDate';

function useKickoffCountdown(match) {
  const [seconds, setSeconds] = useState(match.secondsUntilKickoff ?? null);

  useEffect(() => {
    if (match.status !== 'SCHEDULED' || !match.matchDate) {
      return undefined;
    }
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(match.matchDate).getTime() - Date.now()) / 1000));
      setSeconds(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [match.matchDate, match.status]);

  return seconds;
}

export default function MatchCard({ match }) {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const showScore = isLive || isFinished;
  const countdownSeconds = useKickoffCountdown(match);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary-200 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {match.groupName && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
              {match.groupName}
              {match.roundLabel ? ` · ${match.roundLabel}` : ''}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-lg font-bold text-gray-900">{match.homeTeam}</p>
            {showScore ? (
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-lg font-bold text-gray-900">
                {match.homeScore ?? 0} - {match.awayScore ?? 0}
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-400">vs</span>
            )}
            <p className="text-lg font-bold text-gray-900">{match.awayTeam}</p>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {formatDateTime(match.matchDate)}
            {match.venueName && ` · ${match.venueName}`}
            {match.city && `, ${match.city}`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isLive
                ? 'bg-red-100 text-red-700'
                : isFinished
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isLive && match.matchMinute != null
              ? `${match.matchMinute}'`
              : MATCH_STATUS_LABELS[match.status] || match.status}
          </span>

          {!isFinished && !isLive && countdownSeconds != null && (
            <span className="text-xs font-medium text-gray-500">
              Début dans {formatCountdown(countdownSeconds)}
            </span>
          )}
        </div>
      </div>

      {!isFinished && (
        <div className="mt-4">
          <Link to={ROUTES.BOOK({ matchId: match.id })}>
            <Button size="sm">Réserver une table</Button>
          </Link>
        </div>
      )}
    </div>
  );
}