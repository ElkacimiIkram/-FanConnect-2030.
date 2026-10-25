import MatchFeedRow from './MatchFeedRow';

export default function MatchCompetitionGroup({ group }) {
  return (
    <section className="arena-card overflow-hidden animate-fade-up">
      <header className="flex items-center gap-3 border-b border-surface-border bg-surface px-4 py-3.5">
        {group.competitionEmblem && (
          <img src={group.competitionEmblem} alt="" className="h-7 w-7 object-contain" loading="lazy" />
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-bold text-ink">{group.groupLabel}</h3>
          <p className="truncate text-xs text-ink-muted">
            {[group.competitionName !== group.groupLabel ? group.competitionName : null, group.areaName]
              .filter(Boolean)
              .join(' · ') || group.competitionName}
          </p>
        </div>
      </header>
      <div>
        {group.matches.map((match) => (
          <MatchFeedRow
            key={match.externalId || match.localId || `${match.homeTeam}-${match.awayTeam}`}
            match={match}
          />
        ))}
      </div>
    </section>
  );
}