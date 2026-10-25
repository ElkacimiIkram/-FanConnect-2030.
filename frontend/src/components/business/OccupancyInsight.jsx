import OccupancyBadge from './OccupancyBadge';
import { getOccupancyRiskLabel, getOccupancyRiskStyle } from '../../utils/occupancy';

export default function OccupancyInsight({ occupancy }) {
  if (!occupancy?.prediction) return null;

  const { prediction } = occupancy;
  const riskStyle = getOccupancyRiskStyle(prediction.fullRisk);

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${riskStyle}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{getOccupancyRiskLabel(prediction.fullRisk)}</p>
        {prediction.predictedLevelAtKickoff && (
          <OccupancyBadge
            level={prediction.predictedLevelAtKickoff}
            percentage={prediction.projectedPeakPercent}
            compact
          />
        )}
      </div>
      <p className="mt-1 text-xs opacity-90">
        Pic estimé à l&apos;heure du match : {prediction.projectedPeakPercent}%
        {prediction.predicted1hPercent != null && (
          <> · +1h : {Math.round(prediction.predicted1hPercent)}%</>
        )}
        {prediction.confidencePercent != null && (
          <> · Confiance : {Math.round(prediction.confidencePercent)}%</>
        )}
      </p>
      {prediction.recommendation && (
        <p className="mt-2 text-xs font-semibold">{prediction.recommendation}</p>
      )}
    </div>
  );
}