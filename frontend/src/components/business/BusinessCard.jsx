import { Link } from 'react-router-dom';
import BusinessImage from './BusinessImage';
import OccupancyBadge from './OccupancyBadge';
import OccupancyBar from './OccupancyBar';
import OccupancyInsight from './OccupancyInsight';
import ProgressRing from '../ui/ProgressRing';
import Button from '../ui/Button';
import { ROUTES } from '../../utils/constants';
import { hasBusinessLocation } from '../../utils/businessLocation';

const TYPE_LABELS = {
  CAFE: 'Café',
  RESTAURANT: 'Restaurant',
};

export default function BusinessCard({
  business,
  isHighlighted = false,
  onViewLocation,
  showBookAction = false,
  animationDelay = 0,
  occupancy = null,
  matchId = null,
}) {
  const hasLocation = hasBusinessLocation(business);

  const handleViewLocation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onViewLocation?.(business);
  };

  return (
    <article
      className={`fc-glass-card fc-glass-card--hover group overflow-hidden ${
        isHighlighted ? 'ring-2 ring-primary-500/50 shadow-glow scale-[1.02]' : ''
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Link to={ROUTES.CAFE_DETAILS(business.id)} className="block">
        <div className="relative h-44 overflow-hidden sm:h-48">
          <BusinessImage
            business={business}
            alt={business.name}
            className="h-full w-full transition-transform duration-700 group-hover:scale-110"
            overlay
          />
          <div className="absolute left-3 top-3">
            <span className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-soft backdrop-blur-sm">
              {TYPE_LABELS[business.businessType] || business.businessType}
            </span>
          </div>
          <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
            {occupancy && (
              <OccupancyBadge
                level={occupancy.level}
                percentage={occupancy.occupancyPercentage}
                compact
              />
            )}
            {business.distanceKm != null && (
              <span className="rounded-lg bg-emerald-600/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                {Number(business.distanceKm).toFixed(1)} km
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="truncate font-display text-lg font-bold text-white drop-shadow-md">
              {business.name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-white/85">
              {business.city}
              {business.address && ` · ${business.address}`}
            </p>
          </div>
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        {occupancy && (
          <div className="mb-4 flex items-start gap-4">
            <ProgressRing
              percentage={occupancy.occupancyPercentage}
              level={occupancy.level}
              size={64}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <OccupancyBar occupancy={occupancy} />
              <OccupancyInsight occupancy={occupancy} />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="stat-pill flex-1 group-hover:border-primary-100 group-hover:bg-primary-50/50">
            <p className="stat-pill-value">{business.totalCapacity}</p>
            <p className="stat-pill-label">places</p>
          </div>
          <div className="stat-pill flex-1 group-hover:border-primary-100 group-hover:bg-primary-50/50">
            <p className="stat-pill-value">{business.totalTables}</p>
            <p className="stat-pill-label">tables</p>
          </div>
          <div className="stat-pill flex-1 group-hover:border-primary-100 group-hover:bg-primary-50/50">
            <p className="stat-pill-value">
              {business.minMatchDayPrice != null
                ? `${Number(business.minMatchDayPrice).toFixed(0)}`
                : '—'}
            </p>
            <p className="stat-pill-label">MAD / match</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {hasLocation && onViewLocation && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full transition-transform group-hover:shadow-md"
              onClick={handleViewLocation}
            >
              Voir sur la carte
            </Button>
          )}
          <div className="flex gap-2">
            <Link
              to={ROUTES.CAFE_DETAILS(business.id)}
              className="btn-arena-outline flex-1 py-2.5 text-xs"
            >
              Détails
            </Link>
            {showBookAction && (
              <Link
                to={ROUTES.BOOK({ businessId: business.id, matchId })}
                className="btn-arena flex-1 py-2.5 text-xs"
              >
                Réserver
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}