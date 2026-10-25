import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';

export default function MatchFeedRow({ match }) {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const showScore = isLive || isFinished;
  const detailUrl = match.externalId
    ? ROUTES.MATCH_LIVE_DETAIL(match.externalId)
    : match.localId
      ? ROUTES.MATCH_DETAIL(match.localId)
      : null;

  const content = (
    <>
      <div className="text-center">
        <span
          className={`inline-block min-w-[3rem] text-xs font-extrabold tabular-nums ${
            isLive ? 'text-red-600' : isFinished ? 'text-ink-faint' : 'text-ink'
          }`}
        >
          {match.kickoffLabel}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {match.homeTeamCrest && (
            <img src={match.homeTeamCrest} alt="" className="h-6 w-6 object-contain" loading="lazy" />
          )}
          <span className={`truncate text-sm font-semibold ${showScore && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'text-ink' : 'text-ink-muted'}`}>
            {match.homeTeam}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {match.awayTeamCrest && (
            <img src={match.awayTeamCrest} alt="" className="h-6 w-6 object-contain" loading="lazy" />
          )}
          <span className={`truncate text-sm font-semibold ${showScore && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'text-ink' : 'text-ink-muted'}`}>
            {match.awayTeam}
          </span>
        </div>
        {(match.groupName || match.roundLabel || match.venueName) && (
          <p className="mt-1 text-[10px] text-ink-faint">
            {[match.groupName, match.roundLabel, match.venueName].filter(Boolean).join(' · ')}
          </p>
        )}
        {match.status === 'SCHEDULED' && match.matchDate && (
          <p className="mt-0.5 text-[11px] text-ink-faint">{formatDateTime(match.matchDate)}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {showScore ? (
          <div className={`rounded-xl px-2.5 py-1.5 text-center text-sm font-extrabold tabular-nums ${isLive ? 'bg-red-50 text-red-700' : 'bg-surface text-ink'}`}>
            <div>{match.homeScore ?? 0}</div>
            <div className="mt-0.5">{match.awayScore ?? 0}</div>
          </div>
        ) : (
          <span className="text-xs font-bold text-ink-faint">vs</span>
        )}
        {isLive && <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />}
        {match.bookable && match.localId && !isFinished && (
          <Link
            to={ROUTES.BOOK({ matchId: match.localId })}
            onClick={(e) => e.stopPropagation()}
            className="hidden rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100 sm:inline-block"
          >
            Réserver
          </Link>
        )}
      </div>
    </>
  );

  const rowClass =
    'match-feed-row group grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 border-b border-surface-border px-4 py-3 transition-colors duration-200 hover:bg-primary-50/50 sm:grid-cols-[5rem_1fr_7rem]';

  if (detailUrl) {
    return <Link to={detailUrl} className={rowClass}>{content}</Link>;
  }
  return <div className={rowClass}>{content}</div>;
}