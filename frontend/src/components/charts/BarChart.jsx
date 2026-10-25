export default function BarChart({
  data = [],
  labelKey = 'label',
  valueKey = 'value',
  maxValue,
  suffix = '',
  color = 'primary',
  height = 8,
  showValues = true,
  className = '',
}) {
  if (!data.length) {
    return <p className="text-sm text-ink-faint">Aucune donnée disponible.</p>;
  }

  const peak = maxValue ?? Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  const colorClass = color === 'accent' ? 'bg-accent-500' : color === 'gold' ? 'bg-accent-400' : 'bg-primary-500';

  return (
    <div className={`fc-bar-chart space-y-3 ${className}`}>
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const pct = Math.min((value / peak) * 100, 100);

        return (
          <div key={item.id ?? item[labelKey] ?? index} className="fc-bar-chart__row">
            <div className="fc-bar-chart__label">
              <span className="truncate text-sm text-ink-muted">{item[labelKey]}</span>
              {showValues && (
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                  {value}
                  {suffix}
                </span>
              )}
            </div>
            <div
              className="fc-bar-chart__track"
              style={{ height }}
              role="presentation"
            >
              <div
                className={`fc-bar-chart__fill ${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}