import MatchCompetitionGroup from './MatchCompetitionGroup';

export default function MatchFeedSections({ liveNowGroups, upcomingGroups, groups }) {
  const hasLive = liveNowGroups?.length > 0;
  const hasUpcoming = upcomingGroups?.length > 0;
  const hasMain = groups?.length > 0;

  if (!hasLive && !hasUpcoming && !hasMain) {
    return null;
  }

  return (
    <div className="space-y-6">
      {hasLive && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-red-700">
              En direct
            </h2>
          </div>
          <div className="space-y-4">
            {liveNowGroups.map((group) => (
              <MatchCompetitionGroup
                key={`live-${group.competitionCode}-${group.groupLabel}`}
                group={group}
              />
            ))}
          </div>
        </section>
      )}

      {hasUpcoming && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">
            À venir (7 prochains jours)
          </h2>
          <div className="space-y-4">
            {upcomingGroups.map((group) => (
              <MatchCompetitionGroup
                key={`upcoming-${group.competitionCode}-${group.groupLabel}`}
                group={group}
              />
            ))}
          </div>
        </section>
      )}

      {hasMain && (
        <section>
          {(hasLive || hasUpcoming) && (
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
              {hasLive ? 'Autres matchs' : 'Matchs du jour'}
            </h2>
          )}
          <div className="space-y-4">
            {groups.map((group) => (
              <MatchCompetitionGroup
                key={`${group.competitionCode}-${group.groupLabel}`}
                group={group}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}