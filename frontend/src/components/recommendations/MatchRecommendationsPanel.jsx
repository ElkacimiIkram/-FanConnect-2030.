import RecommendationCard from './RecommendationCard';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

export default function MatchRecommendationsPanel({
  data,
  recommendations,
  loading,
  error,
  geoEnabled,
  matchId,
  onRefreshLocation,
  onSelect,
  compact = false,
}) {
  if (loading) {
    return <Spinner label="Analyse des lieux à proximité..." />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (!recommendations?.length) {
    return (
      <div className="magic-card p-6 text-center">
        <span className="text-3xl">📍</span>
        <p className="mt-3 text-sm text-ink-muted">
          Aucun lieu approuvé trouvé pour ce match dans votre zone.
        </p>
        {!geoEnabled && onRefreshLocation && (
          <Button className="mt-4" size="sm" onClick={onRefreshLocation}>
            Activer ma position
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">
            {geoEnabled ? (
              <>
                Recherche dans un rayon de <strong className="text-ink">{data?.searchRadiusKm} km</strong>
                {data?.userCity ? ` · ${data.userCity}` : ''}
                {data?.radiusExpanded ? ' · rayon élargi' : ''}
              </>
            ) : (
              'Activez votre position pour des recommandations par proximité.'
            )}
          </p>
        </div>
        {onRefreshLocation && (
          <Button variant="ghost" size="sm" onClick={onRefreshLocation}>
            {geoEnabled ? 'Actualiser position' : 'Près de moi'}
          </Button>
        )}
      </div>

      <div className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {recommendations.map((venue, index) => (
          <RecommendationCard
            key={venue.id}
            venue={venue}
            matchId={matchId}
            rank={index + 1}
            compact={compact}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}