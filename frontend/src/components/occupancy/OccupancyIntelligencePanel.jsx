import ProgressRing from '../ui/ProgressRing';
import OccupancyTimeline from './OccupancyTimeline';
import { getOccupancyRiskLabel, getOccupancyRiskStyle } from '../../utils/occupancy';

const SOURCE_LABELS = {
  ML: 'Random Forest ML',
  HEURISTIC: 'Estimated mode',
};

export default function OccupancyIntelligencePanel({ intelligence, loading, error, compact = false }) {
  if (loading) {
    return (
      <div className="fc-intelligence-panel fc-intelligence-panel--loading">
        <p className="text-sm text-ink-muted">Analyse IA en cours…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fc-intelligence-panel">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!intelligence) return null;

  const riskStyle = getOccupancyRiskStyle(intelligence.riskLevel);

  return (
    <section className={`fc-intelligence-panel ${compact ? 'fc-intelligence-panel--compact' : ''}`}>
      <header className="fc-intelligence-panel__header">
        <div>
          <span className="badge-gold">AI Occupancy Intelligence Center</span>
          <h3 className="mt-2 font-display text-lg font-bold text-ink">
            Prédiction d&apos;affluence
          </h3>
          {intelligence.matchLabel && (
            <p className="text-sm text-ink-muted">{intelligence.matchLabel}</p>
          )}
        </div>
        <div className="fc-intelligence-panel__source">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Source</span>
          <span className="text-xs font-semibold text-primary-400">
            {SOURCE_LABELS[intelligence.source] || intelligence.source}
          </span>
        </div>
      </header>

      <div className="fc-intelligence-panel__grid">
        <div className="fc-intelligence-panel__ring">
          <ProgressRing
            percentage={intelligence.currentOccupancyPct}
            level={intelligence.currentLevel}
            size={compact ? 72 : 88}
          />
          <p className="mt-2 text-center text-xs font-bold text-ink-muted">Actuel</p>
        </div>

        <div className="fc-intelligence-panel__metrics">
          <Metric label="Dans 1h" value={`${Math.round(intelligence.predicted1hPct)}%`} />
          <Metric label="Dans 2h" value={`${Math.round(intelligence.predicted2hPct)}%`} />
          <Metric label="Au coup d'envoi" value={`${Math.round(intelligence.predictedKickoffPct)}%`} highlight />
          <Metric
            label="Confiance"
            value={`${Math.round(intelligence.confidencePct)}%`}
          />
          {intelligence.expectedFullAt && (
            <Metric label="Complet vers" value={intelligence.expectedFullAt} accent />
          )}
        </div>
      </div>

      <div className={`rounded-xl border px-4 py-3 text-sm ${riskStyle}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">{getOccupancyRiskLabel(intelligence.riskLevel)}</p>
          <span className="text-xs font-bold uppercase">{intelligence.recommendation}</span>
        </div>
      </div>

      {!compact && intelligence.timeline?.length > 0 && (
        <div className="mt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
            Évolution prévue
          </p>
          <OccupancyTimeline timeline={intelligence.timeline} />
        </div>
      )}

      {intelligence.model && !compact && (
        <div className="fc-intelligence-panel__model">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Modèle</p>
          <p className="mt-1 text-sm text-ink">
            {intelligence.model.algorithm} · v{intelligence.model.version}
          </p>
          <p className="text-xs text-ink-muted">
            MAE {intelligence.model.mae}% · R² {intelligence.model.r2Score}
            {intelligence.model.sampleCount ? ` · ${intelligence.model.sampleCount} échantillons` : ''}
          </p>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, highlight = false, accent = false }) {
  return (
    <div className={`fc-intelligence-metric ${highlight ? 'fc-intelligence-metric--highlight' : ''} ${accent ? 'fc-intelligence-metric--accent' : ''}`}>
      <span className="fc-intelligence-metric__label">{label}</span>
      <span className="fc-intelligence-metric__value">{value}</span>
    </div>
  );
}