import Button from '../ui/Button';
import { formatDateTime } from '../../utils/formatDate';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tous' },
  { value: 'LIVE', label: 'En direct' },
  { value: 'SCHEDULED', label: 'À venir' },
  { value: 'FINISHED', label: 'Terminés' },
];

const SORT_OPTIONS = [
  { value: 'TIME', label: 'Heure' },
  { value: 'COMPETITION', label: 'Compétition' },
];

function shiftDate(dateStr, days) {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function MatchFeedToolbar({
  feed,
  selectedDate,
  status,
  sort,
  onDateChange,
  onStatusChange,
  onSortChange,
  onRefresh,
  refreshing,
}) {
  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  return (
    <div className="border-b border-surface-border bg-surface-card px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {feed?.liveMatchCount > 0 && (
              <span className="badge-gold animate-pulse">
                {feed.liveMatchCount} LIVE
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">
            {feed?.dateLabel || 'Matchs'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {feed?.totalMatches ?? 0} match{(feed?.totalMatches ?? 0) !== 1 ? 's' : ''}
            {feed?.lastSyncedAt && (
              <span className="block text-xs text-ink-faint">
                Sync API {formatDateTime(feed.lastSyncedAt)}
              </span>
            )}
            {feed?.fetchedAt && (
              <span className="block text-xs text-ink-faint">
                Affichage {formatDateTime(feed.fetchedAt)}
              </span>
            )}
          </p>
        </div>
        <Button variant="secondary" size="sm" disabled={refreshing} onClick={onRefresh}>
          {refreshing ? '...' : 'Actualiser'}
        </Button>
      </div>

      <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center gap-2">
        <button type="button" onClick={() => onDateChange(shiftDate(selectedDate, -1))} className="btn-arena-outline !px-3 !py-2">
          ←
        </button>
        <button
          type="button"
          onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
          className={isToday ? 'btn-arena !py-2' : 'btn-arena-outline !py-2'}
        >
          Aujourd&apos;hui
        </button>
        <button type="button" onClick={() => onDateChange(shiftDate(selectedDate, 1))} className="btn-arena-outline !px-3 !py-2">
          →
        </button>
        <span className="mx-1 hidden h-6 w-px bg-surface-border sm:block" />
        <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="select-arena !w-auto !py-2" aria-label="Filtrer">
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="select-arena !w-auto !py-2" aria-label="Trier">
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}