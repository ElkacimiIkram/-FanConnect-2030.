import { Link } from 'react-router-dom';

import { ROUTES } from '../../../utils/constants';
import { MATCH_IMPORTANCE_LABELS, MATCH_STATUS_LABELS } from '../../../utils/matchLabels';
import { teamVisuals } from '../../../utils/teamFlags';
import { formatDateTime } from '../../../utils/formatDate';
import WcCountdown from './WcCountdown';
import WcTeamEmblem from './WcTeamEmblem';

function matchDetailUrl(match) {
  if (match.externalId) return ROUTES.MATCH_LIVE_DETAIL(match.externalId);
  if (match.localId) return ROUTES.MATCH_DETAIL(match.localId);
  return null;
}

function MatchSummary({ match }) {
  const isFinished = match.status === 'FINISHED';
  if (!isFinished) return null;

  const winner = (match.homeScore ?? 0) > (match.awayScore ?? 0)
    ? match.homeTeam
    : (match.awayScore ?? 0) > (match.homeScore ?? 0)
      ? match.awayTeam
      : null;

  return (
    <p className="mt-3 text-xs text-ink-muted">
      {winner
        ? `Victoire de ${winner} — Score final ${match.homeScore ?? 0}-${match.awayScore ?? 0}`
        : `Match nul ${match.homeScore ?? 0}-${match.awayScore ?? 0}`}
    </p>
  );
}

export default function WcMatchCard({ match }) {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isScheduled = match.status === 'SCHEDULED';
  const home = teamVisuals(match, 'home');
  const away = teamVisuals(match, 'away');
  const detailUrl = matchDetailUrl(match);
  const importance = MATCH_IMPORTANCE_LABELS[match.matchImportance] || match.roundLabel;

  const card = (
    <article
      className={`wc-match-card fc-glass-card fc-glass-card--hover p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${isLive ? 'wc-match-card-live' : ''}`}
      style={isLive ? { boxShadow: '0 0 30px rgba(239,68,68,0.25)' } : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {match.competitionEmblem && (
            <img src={match.competitionEmblem} alt="" className="h-5 w-5 object-contain" loading="lazy" />
          )}
          <span className="text-xs font-semibold text-ink-muted">
            {match.competitionName}
            {match.groupName ? ` · ${match.groupName}` : ''}
          </span>
        </div>
        {isLive ? (
          <span className="wc-live-pill">
            <span className="wc-live-dot" />
            {match.matchMinute != null ? `${match.matchMinute}'` : 'LIVE'}
          </span>
        ) : (
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
            {MATCH_STATUS_LABELS[match.status] || match.status}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <WcTeamEmblem {...home} />
          <p className="text-sm font-bold text-ink">{home.name}</p>
        </div>

        <div className="text-center">
          {isScheduled ? (
            <p className="text-lg font-bold text-ink-faint">vs</p>
          ) : (
            <p className={`wc-score-display ${isLive ? 'text-red-600' : 'text-ink'}`}>
              {match.homeScore ?? 0}
              <span className="mx-1 text-ink-faint">-</span>
              {match.awayScore ?? 0}
            </p>
          )}
          {isLive && match.matchMinute != null && (
            <p className="mt-1 text-xs font-bold text-red-600">{match.matchMinute}&apos;</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <WcTeamEmblem {...away} />
          <p className="text-sm font-bold text-ink">{away.name}</p>
        </div>
      </div>

      {isScheduled && match.matchDate && (
        <div className="mt-4 border-t border-surface-border pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">Coup d&apos;envoi</p>
          <WcCountdown matchDate={match.matchDate} variant="text" />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
        {importance && <span className="wc-importance-badge">{importance}</span>}
        {match.matchDate && <span>{formatDateTime(match.matchDate)}</span>}
      </div>

      {(match.venueName || match.city) && (
        <div className="mt-2 text-xs text-ink-muted">
          <span className="font-semibold text-ink">📍 {match.venueName || 'Stade'}</span>
          {(match.city || match.country) && (
            <span className="text-ink-faint">
              {' '}· {[match.city, match.country].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      )}

      <MatchSummary match={match} />

      {match.bookable && match.localId && !isFinished && (
        <div className="wc-reserve-cta">
          <span className="font-semibold text-primary-800">Réserver une place pour ce match</span>
          <Link
            to={ROUTES.BOOK({ matchId: match.localId })}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg bg-primary-600 px-3 py-1.5 font-bold text-white hover:bg-primary-700"
          >
            Réserver
          </Link>
        </div>
      )}
    </article>
  );

  if (detailUrl) {
    return <Link to={detailUrl} className="block">{card}</Link>;
  }
  return card;
}