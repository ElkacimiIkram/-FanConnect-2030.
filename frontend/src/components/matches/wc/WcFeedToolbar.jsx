function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tous' },
  { value: 'LIVE', label: 'En direct' },
  { value: 'SCHEDULED', label: 'À venir' },
  { value: 'FINISHED', label: 'Terminés' },
];

export default function WcFeedToolbar({
  feed,
  selectedDate,
  status,
  sort,
  onDateChange,
  onStatusChange,
  onSortChange,
  onRefresh,
  onSeedDemo,
  refreshing,
  seedingDemo,
}) {
  return (
    <div className="border-b border-surface-border bg-surface-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="select-arena max-w-[10rem] py-2 text-sm"
        />

        <div className="flex flex-wrap gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                status === opt.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-muted text-ink-muted hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="select-arena max-w-[9rem] py-2 text-sm"
        >
          <option value="TIME">Par heure</option>
          <option value="COMPETITION">Par compétition</option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing || seedingDemo}
          className="btn-arena-outline ml-auto py-2 text-xs"
        >
          {refreshing ? 'Actualisation…' : 'Actualiser'}
        </button>

        {onSeedDemo && (
          <button
            type="button"
            onClick={onSeedDemo}
            disabled={seedingDemo || refreshing}
            className="btn-arena py-2 text-xs"
          >
            {seedingDemo ? 'Chargement…' : 'Matchs démo 2026 / 2030'}
          </button>
        )}

        {feed?.lastSyncedAt && (
          <span className="w-full text-[10px] text-ink-faint sm:w-auto">
            Sync : {new Date(feed.lastSyncedAt).toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>
    </div>
  );
}

export { todayIso };