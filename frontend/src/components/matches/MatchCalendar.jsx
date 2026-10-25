import { useMemo } from 'react';
import WcMatchCard from './wc/WcMatchCard';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function toMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function buildCalendarCells(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push(iso);
  }
  return cells;
}

export default function MatchCalendar({
  calendar,
  monthKey,
  selectedDate,
  onMonthChange,
  onSelectDate,
  loading,
}) {
  const dayMap = useMemo(() => {
    const map = new Map();
    (calendar?.days || []).forEach((day) => map.set(day.date, day));
    return map;
  }, [calendar]);

  const cells = useMemo(() => buildCalendarCells(monthKey), [monthKey]);
  const selectedDay = selectedDate ? dayMap.get(selectedDate) : null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="arena-card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(monthKey, -1))}
          className="btn-arena-outline px-3 py-1.5 text-sm"
        >
          ← Mois précédent
        </button>
        <h2 className="font-display text-lg font-bold capitalize text-ink">
          {calendar?.monthLabel || monthKey}
        </h2>
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(monthKey, 1))}
          className="btn-arena-outline px-3 py-1.5 text-sm"
        >
          Mois suivant →
        </button>
      </div>

      <div className="arena-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-surface-border bg-surface-muted">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-center text-xs font-bold uppercase text-ink-faint">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((iso, index) => {
            if (!iso) {
              return <div key={`empty-${index}`} className="min-h-[5.5rem] border-b border-r border-surface-border bg-surface-muted/50" />;
            }

            const info = dayMap.get(iso);
            const isSelected = selectedDate === iso;
            const isToday = today === iso;
            const hasLive = (info?.liveCount ?? 0) > 0;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectDate(iso)}
                className={`min-h-[5.5rem] border-b border-r border-surface-border p-2 text-left transition hover:bg-surface-muted ${
                  isSelected ? 'bg-primary-50 ring-2 ring-inset ring-primary-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday ? 'bg-pitch-900 text-white' : 'text-ink-muted'
                    }`}
                  >
                    {Number(iso.slice(-2))}
                  </span>
                  {hasLive && <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />}
                </div>
                {info?.matchCount > 0 && (
                  <p className="mt-2 text-[11px] font-semibold text-ink-muted">
                    {info.matchCount} match{info.matchCount > 1 ? 's' : ''}
                  </p>
                )}
                {info?.liveCount > 0 && (
                  <p className="text-[10px] font-bold text-red-600">{info.liveCount} LIVE</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="text-center text-sm text-ink-faint">Chargement du calendrier...</p>
      )}

      {selectedDate && selectedDay && (
        <div className="arena-card overflow-hidden">
          <header className="border-b border-surface-border bg-surface-muted px-4 py-3">
            <h3 className="text-sm font-bold text-ink">
              Matchs du {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            <p className="text-xs text-ink-faint">{selectedDay.matchCount} rencontre(s)</p>
          </header>
          {selectedDay.matches?.length > 0 ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {selectedDay.matches.map((match) => (
                <WcMatchCard key={match.externalId || match.localId} match={match} />
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-sm text-ink-faint">Aucun match ce jour-là pour ce filtre.</p>
          )}
        </div>
      )}
    </div>
  );
}

export { toMonthKey };