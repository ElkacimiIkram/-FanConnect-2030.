import { Link } from 'react-router-dom';
import BusinessImage from '../business/BusinessImage';
import OccupancyBadge from '../business/OccupancyBadge';
import OccupancyBar from '../business/OccupancyBar';
import Spinner from '../ui/Spinner';
import { ROUTES } from '../../utils/constants';

export default function MatchVenuesSection({ venues, loading, matchId, occupancyMap = {} }) {
  if (loading) {
    return <Spinner label="Chargement des lieux..." />;
  }

  if (!venues?.length) {
    return (
      <p className="text-sm text-ink-muted">
        Aucun café partenaire disponible pour le moment. Consultez la page{' '}
        <Link to={ROUTES.CAFES} className="font-semibold text-primary-600 hover:text-primary-700">
          Lieux
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {venues.map((venue) => {
        const occupancy = occupancyMap[venue.id];
        return (
          <article
            key={venue.id}
            className="magic-card overflow-hidden transition hover:-translate-y-0.5"
          >
            <div className="relative h-32">
              <BusinessImage business={venue} alt={venue.name} className="h-full w-full" overlay />
              {occupancy && (
                <div className="absolute left-3 top-3">
                  <OccupancyBadge
                    level={occupancy.level}
                    percentage={occupancy.occupancyPercentage}
                    compact
                  />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="truncate font-display text-base font-bold text-white">{venue.name}</h3>
                <p className="truncate text-xs text-white/85">{venue.city}</p>
              </div>
            </div>
            {occupancy && (
              <div className="border-b border-surface-border px-3 py-2">
                <OccupancyBar occupancy={occupancy} showLegend={false} />
              </div>
            )}
            <div className="space-y-2 border-t border-surface-border p-3">
              <div className="flex flex-wrap gap-3 text-xs text-ink-muted">
                {occupancy && (
                  <>
                    <span>
                      <strong className="text-ink">{occupancy.availableSeats}</strong> places libres
                    </span>
                    <span>
                      Occupation <strong className="text-ink">{Math.round(occupancy.occupancyPercentage)}%</strong>
                    </span>
                  </>
                )}
                {venue.totalTables > 0 && (
                  <span>
                    <strong className="text-ink">{venue.totalTables}</strong> tables
                  </span>
                )}
                {venue.distanceKm != null && (
                  <span>{venue.distanceKm.toFixed(1)} km</span>
                )}
                {venue.minMatchDayPrice != null && (
                  <span>À partir de <strong className="text-ink">{venue.minMatchDayPrice} €</strong></span>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={ROUTES.CAFE_DETAILS(venue.id)}
                  className="btn-arena-outline flex-1 py-2 text-xs"
                >
                  Détails
                </Link>
                {matchId && (
                  <Link
                    to={ROUTES.BOOK({ matchId, businessId: venue.id })}
                    className="btn-arena flex-1 py-2 text-xs"
                  >
                    Réserver
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}