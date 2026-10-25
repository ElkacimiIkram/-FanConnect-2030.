export default function OccupancyTimeline({ timeline = [] }) {
  if (!timeline.length) return null;

  const max = Math.max(...timeline.map((p) => p.predictedPct), 100);

  return (
    <div className="fc-occupancy-timeline">
      <div className="fc-occupancy-timeline__chart">
        {timeline.map((point) => {
          const height = Math.max(8, (point.predictedPct / max) * 100);
          return (
            <div key={point.time} className="fc-occupancy-timeline__bar-wrap">
              <div
                className={`fc-occupancy-timeline__bar ${point.peak ? 'fc-occupancy-timeline__bar--peak' : ''}`}
                style={{ height: `${height}%` }}
                title={`${point.time} — ${Math.round(point.predictedPct)}%`}
              />
              <span className="fc-occupancy-timeline__time">{point.time}</span>
              <span className="fc-occupancy-timeline__pct">{Math.round(point.predictedPct)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}