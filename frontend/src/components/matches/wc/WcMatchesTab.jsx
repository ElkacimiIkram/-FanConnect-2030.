import WcMatchCard from './WcMatchCard';

function MatchSection({ title, subtitle, groups, accent }) {
  const matches = groups?.flatMap((g) => g.matches || []) || [];
  if (!matches.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        {accent && <span className={`h-3 w-3 rounded-full ${accent}`} />}
        <div>
          <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {matches.map((match) => (
          <WcMatchCard key={match.externalId || match.localId} match={match} />
        ))}
      </div>
    </section>
  );
}

export default function WcMatchesTab({ feed }) {
  const hasLive = (feed?.liveNowGroups?.length ?? 0) > 0;
  const hasUpcoming = (feed?.upcomingGroups?.length ?? 0) > 0;
  const hasDay = (feed?.groups?.length ?? 0) > 0;

  if (!hasLive && !hasUpcoming && !hasDay) {
    return (
      <p className="rounded-xl border border-surface-border bg-surface-card p-6 text-center text-sm text-ink-muted">
        Aucun match pour cette date. Essayez une autre date ou changez le filtre.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <MatchSection
        title="En direct"
        subtitle="Scores et minutes en temps réel"
        groups={feed?.liveNowGroups}
        accent="bg-red-500 animate-pulse"
      />
      <MatchSection
        title="Prochains matchs"
        subtitle="Compte à rebours et lieux de diffusion"
        groups={feed?.upcomingGroups}
      />
      <MatchSection
        title={feed?.dateLabel || 'Matchs du jour'}
        subtitle={`${feed?.totalMatches ?? 0} match(s)`}
        groups={feed?.groups}
      />
    </div>
  );
}