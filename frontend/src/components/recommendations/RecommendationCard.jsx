import { Link } from 'react-router-dom';
import BusinessImage from '../business/BusinessImage';
import OccupancyBadge from '../business/OccupancyBadge';
import OccupancyBar from '../business/OccupancyBar';
import { ROUTES } from '../../utils/constants';

const RISK_LABELS = {
  LOW: { text: 'Faible', className: 'text-emerald-400' },
  MEDIUM: { text: 'Modéré', className: 'text-amber-400' },
  HIGH: { text: 'Élevé', className: 'text-red-400' },
};

export default function RecommendationCard({
  venue,
  matchId,
  rank,
  compact = false,
  onSelect,
}) {
  const risk = RISK_LABELS[venue.riskLevel] || RISK_LABELS.LOW;

  const occupancy = {
    level: venue.occupancyLevel,
    occupancyPercentage: venue.currentOccupancyPct,
    availableSeats: venue.availableSeats,
    prediction: { projectedPeakPercent: venue.predictedOccupancyPct },
  };

  return (
    <article className={`fc-recommendation-card ${compact ? 'fc-recommendation-card--compact' : ''}`}>
      <div className="fc-recommendation-card__header">
        {rank != null && (
          <span className="fc-recommendation-card__rank">#{rank}</span>
        )}
        <div className="fc-recommendation-card__score">
          <span className="fc-recommendation-card__score-value">{venue.aiScore}</span>
          <span className="fc-recommendation-card__score-label">AI Score</span>
        </div>
      </div>

      <div className="fc-recommendation-card__media">
        <BusinessImage business={venue} alt={venue.name} className="h-full w-full" overlay />
        <div className="absolute left-3 top-3">
          <OccupancyBadge
            level={venue.occupancyLevel}
            percentage={venue.currentOccupancyPct}
            compact
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="truncate font-display text-base font-bold text-white">{venue.name}</h3>
          <p className="truncate text-xs text-white/85">
            {venue.city}
            {venue.distanceKm != null ? ` · ${venue.distanceKm.toFixed(1)} km` : ''}
          </p>
        </div>
      </div>

      <div className="fc-recommendation-card__metrics">
        <div>
          <span className="fc-recommendation-card__metric-label">Occupation</span>
          <span className="fc-recommendation-card__metric-value">{Math.round(venue.currentOccupancyPct)}%</span>
        </div>
        <div>
          <span className="fc-recommendation-card__metric-label">Prédiction IA</span>
          <span className="fc-recommendation-card__metric-value">{Math.round(venue.predictedOccupancyPct)}%</span>
        </div>
        <div>
          <span className="fc-recommendation-card__metric-label">Tables</span>
          <span className="fc-recommendation-card__metric-value">{venue.availableTables}</span>
        </div>
        <div>
          <span className="fc-recommendation-card__metric-label">Risque</span>
          <span className={`fc-recommendation-card__metric-value ${risk.className}`}>{risk.text}</span>
        </div>
      </div>

      {!compact && (
        <div className="border-b border-surface-border px-3 py-2">
          <OccupancyBar occupancy={occupancy} showLegend={false} />
        </div>
      )}

      <p className="fc-recommendation-card__reason">{venue.reason}</p>

      <div className="fc-recommendation-card__actions">
        <Link
          to={ROUTES.CAFE_DETAILS(venue.id)}
          className="btn-arena-outline flex-1 py-2 text-xs"
        >
          Détails
        </Link>
        {matchId && (
          onSelect ? (
            <button
              type="button"
              onClick={() => onSelect(venue)}
              className="btn-arena flex-1 py-2 text-xs"
            >
              Choisir
            </button>
          ) : (
            <Link
              to={ROUTES.BOOK({ matchId, businessId: venue.id })}
              className="btn-arena flex-1 py-2 text-xs"
            >
              Réserver
            </Link>
          )
        )}
      </div>
    </article>
  );
}