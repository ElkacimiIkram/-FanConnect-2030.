import { OCCUPANCY_DESCRIPTIONS, OCCUPANCY_LABELS } from '../../utils/occupancy';

const LEVELS = [
  { level: 'GREEN', dot: 'bg-emerald-500', border: 'border-emerald-200 bg-emerald-50' },
  { level: 'ORANGE', dot: 'bg-amber-500', border: 'border-amber-200 bg-amber-50' },
  { level: 'RED', dot: 'bg-red-500', border: 'border-red-200 bg-red-50' },
];

export default function OccupancyMapLegend({ className = '', compact = false }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {LEVELS.map(({ level, dot, border }) => (
        <div
          key={level}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${border}`}
        >
          <span className={`h-3 w-3 rounded-full ${dot} shadow-sm`} />
          <div>
            <p className="font-bold text-ink">{OCCUPANCY_LABELS[level]}</p>
            {!compact && (
              <p className="text-ink-faint">{OCCUPANCY_DESCRIPTIONS[level]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}