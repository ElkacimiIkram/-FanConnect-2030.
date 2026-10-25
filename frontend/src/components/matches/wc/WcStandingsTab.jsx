import Spinner from '../../ui/Spinner';
import WcStandingsTable from './WcStandingsTable';

export default function WcStandingsTab({ standings, loading }) {
  if (loading) {
    return <Spinner label="Chargement des classements..." />;
  }

  if (!standings?.table?.length) {
    return (
      <p className="rounded-xl border border-surface-border bg-surface-card p-6 text-center text-sm text-ink-muted">
        Classement non disponible. Configurez FOOTBALL_DATA_API_KEY ou attendez la phase de groupes.
      </p>
    );
  }

  return (
    <div className="wc-group-card">
      <div className="wc-group-header">
        <span className="text-lg">🏆</span>
        <div>
          <h2 className="font-display text-lg font-bold">
            {standings.competitionName || 'Coupe du Monde FIFA'}
          </h2>
          {standings.season && (
            <p className="text-xs text-white/70">Saison {standings.season}</p>
          )}
        </div>
      </div>
      <WcStandingsTable rows={standings.table} />
    </div>
  );
}