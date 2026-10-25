import {
  getOccupancyBarStyle,
  getOccupancyDescription,
  getOccupancyLabel,
} from '../../utils/occupancy';

export default function OccupancyBar({ occupancy, showLegend = true }) {
  if (!occupancy?.level) return null;

  const percentage = Math.min(occupancy.occupancyPercentage ?? 0, 100);

  return (
    <div className="space-y-2">
      {showLegend && (
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-ink">{getOccupancyLabel(occupancy.level)}</span>
          <span className="tabular-nums text-ink-faint">
            {occupancy.bookedSeats}/{occupancy.capacity} places · {percentage}%
          </span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getOccupancyBarStyle(occupancy.level)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLegend && (
        <p className="text-[11px] text-ink-faint">{getOccupancyDescription(occupancy.level)}</p>
      )}
    </div>
  );
}