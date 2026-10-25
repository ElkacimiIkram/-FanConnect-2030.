import { Link } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import { teamVisualsFromTeam } from '../../../utils/teamFlags';
import WcTeamEmblem from './WcTeamEmblem';

function MiniMatch({ match }) {
  const url = match.externalId
    ? ROUTES.MATCH_LIVE_DETAIL(match.externalId)
    : match.localId
      ? ROUTES.MATCH_DETAIL(match.localId)
      : null;

  const content = (
    <div className="flex items-center justify-between rounded-lg bg-surface-muted px-2 py-1.5 text-xs">
      <span className="truncate font-medium text-ink">
        {match.homeTeam} vs {match.awayTeam}
      </span>
      {match.status === 'FINISHED' ? (
        <span className="font-bold tabular-nums text-ink-muted">
          {match.homeScore ?? 0}-{match.awayScore ?? 0}
        </span>
      ) : (
        <span className="text-ink-faint">À venir</span>
      )}
    </div>
  );

  if (url) return <Link to={url}>{content}</Link>;
  return content;
}

export default function WcTeamCard({ team }) {
  const visuals = teamVisualsFromTeam(team);

  return (
    <article className="wc-team-card">
      <div className="flex items-start gap-4">
        <WcTeamEmblem {...visuals} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-ink">{team.name}</h3>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-muted">
            {team.groupName && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 font-semibold text-primary-800">
                {team.groupName}
              </span>
            )}
            {team.fifaRanking && (
              <span>FIFA #{team.fifaRanking}</span>
            )}
            {team.coach && <span>Coach : {team.coach}</span>}
          </div>
        </div>
      </div>

      {team.upcomingMatches?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-faint">Prochains matchs</p>
          <div className="space-y-1.5">
            {team.upcomingMatches.map((m) => (
              <MiniMatch key={m.externalId || m.localId} match={m} />
            ))}
          </div>
        </div>
      )}

      {team.recentResults?.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-faint">Résultats</p>
          <div className="space-y-1.5">
            {team.recentResults.map((m) => (
              <MiniMatch key={`r-${m.externalId || m.localId}`} match={m} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}