import Spinner from '../ui/Spinner';

export default function StandingsPanel({ standings, loading, onClose }) {
  return (
    <aside className="w-full shrink-0 overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-surface-card px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Classement</p>
          <h3 className="text-sm font-bold text-ink">
            {standings?.competitionName || 'Coupe du Monde FIFA 2026'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-ink-muted hover:bg-surface-muted"
        >
          ✕
        </button>
      </div>

      {loading && (
        <div className="p-4">
          <Spinner label="Chargement du classement..." />
        </div>
      )}

      {!loading && (!standings?.table || standings.table.length === 0) && (
        <p className="p-4 text-sm text-ink-muted">
          Classement non disponible. Configurez FOOTBALL_DATA_API_KEY ou attendez la phase de groupes.
        </p>
      )}

      {!loading && standings?.table?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-surface-muted text-left text-ink-faint">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Équipe</th>
                <th className="px-3 py-2">J</th>
                <th className="px-3 py-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.table.map((row) => (
                <tr key={`${row.position}-${row.teamName}`} className="border-b border-surface-border">
                  <td className="px-3 py-2 font-semibold text-ink">{row.position}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {row.teamCrest && (
                        <img src={row.teamCrest} alt="" className="h-4 w-4 object-contain" loading="lazy" />
                      )}
                      <span className="font-medium text-ink">{row.teamName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-ink-muted">{row.played}</td>
                  <td className="px-3 py-2 font-bold text-ink">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </aside>
  );
}