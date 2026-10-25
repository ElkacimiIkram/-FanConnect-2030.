import Spinner from '../../ui/Spinner';
import WcStandingsTable from './WcStandingsTable';

export default function WcGroupsTab({ standings, loading }) {
  if (loading) {
    return <Spinner label="Chargement des groupes..." />;
  }

  const groups = standings?.groups?.length
    ? standings.groups
    : standings?.table?.length
      ? [{ groupName: 'Classement', table: standings.table }]
      : [];

  if (!groups.length) {
    return (
      <p className="rounded-xl border border-surface-border bg-surface-card p-6 text-center text-sm text-ink-muted">
        Groupes non disponibles pour le moment.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {groups.map((group) => (
        <div key={group.groupName} className="wc-group-card">
          <div className="wc-group-header">
            <span className="text-base font-bold">{group.groupName}</span>
          </div>
          <WcStandingsTable rows={group.table} compact />
        </div>
      ))}
    </div>
  );
}