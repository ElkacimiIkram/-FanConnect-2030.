import {
  getOccupancyDotStyle,
  getOccupancyLabel,
  getOccupancyStyle,
} from '../../utils/occupancy';

export default function OccupancyBadge({ level, percentage, compact = false }) {
  if (!level) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-soft ring-1 ring-inset ${getOccupancyStyle(level)}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${getOccupancyDotStyle(level)}`} />
      {!compact && percentage != null && (
        <span className="tabular-nums">{percentage}%</span>
      )}
      <span>{getOccupancyLabel(level)}</span>
    </span>
  );
}