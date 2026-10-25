import Spinner from '../../ui/Spinner';
import WcTeamCard from './WcTeamCard';

export default function WcTeamsTab({ teams, loading }) {
  if (loading) {
    return <Spinner label="Chargement des équipes..." />;
  }

  if (!teams?.length) {
    return (
      <p className="rounded-xl border border-surface-border bg-surface-card p-6 text-center text-sm text-ink-muted">
        Aucune équipe disponible pour cette compétition.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <WcTeamCard key={team.name} team={team} />
      ))}
    </div>
  );
}