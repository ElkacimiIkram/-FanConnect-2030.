import { useEffect, useMemo, useRef, useState } from 'react';
import { matchApi } from '../../api/matchApi';
import { useBusinesses } from '../../hooks/useBusinesses';
import { useBusinessOccupancy } from '../../hooks/useBusinessOccupancy';
import { getApiData } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/formatDate';
import BusinessCard from '../business/BusinessCard';
import OccupancyMapLegend from '../business/OccupancyMapLegend';
import VenuesMap from '../business/VenuesMap';
import VenueSearchBar from '../business/VenueSearchBar';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import { requestUserLocation } from '../../utils/geolocation';

export default function FanOccupancyMapPanel({
  bookings = [],
  defaultMatchId = '',
  highlightBusinessIds = [],
}) {
  const mapRef = useRef(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(defaultMatchId);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', lat: null, lng: null });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [highlightedBusinessId, setHighlightedBusinessId] = useState(null);

  const { businesses, loading: businessesLoading, error: businessesError } = useBusinesses({
    query: filters.query,
    lat: filters.lat,
    lng: filters.lng,
  });

  const { occupancyMap, loading: occupancyLoading } = useBusinessOccupancy(
    selectedMatchId ? Number(selectedMatchId) : null
  );

  useEffect(() => {
    const load = async () => {
      try {
        const response = await matchApi.listUpcoming();
        setMatches(getApiData(response) || []);
      } catch {
        setMatches([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (defaultMatchId) {
      setSelectedMatchId(defaultMatchId);
      return;
    }
    const bookingMatchIds = bookings.map((b) => b.matchId).filter(Boolean);
    if (bookingMatchIds.length > 0) {
      setSelectedMatchId(String(bookingMatchIds[0]));
    } else if (matches.length > 0) {
      setSelectedMatchId(String(matches[0].id));
    }
  }, [defaultMatchId, bookings, matches]);

  const matchOptions = useMemo(() => {
    const fromBookings = bookings
      .filter((b) => b.matchId && b.matchLabel)
      .map((b) => ({ id: b.matchId, label: b.matchLabel, date: b.reservationDateTime }));
    const seen = new Set(fromBookings.map((m) => m.id));
    const fromUpcoming = matches
      .filter((m) => !seen.has(m.id))
      .map((m) => ({
        id: m.id,
        label: `${m.homeTeam} vs ${m.awayTeam}`,
        date: m.matchDate,
      }));
    return [...fromBookings, ...fromUpcoming];
  }, [bookings, matches]);

  const selectedMatch = matchOptions.find((m) => String(m.id) === String(selectedMatchId));

  const handleSearch = (e) => {
    e.preventDefault();
    setGeoError('');
    setFilters((prev) => ({ ...prev, query: search.trim() }));
  };

  const handleNearMe = async () => {
    setGeoError('');
    if (filters.lat != null) {
      setFilters((prev) => ({ ...prev, lat: null, lng: null }));
      return;
    }
    setGeoLoading(true);
    try {
      const { lat, lng } = await requestUserLocation();
      setFilters((prev) => ({ ...prev, lat, lng }));
    } catch (err) {
      setGeoError(err.message);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleViewLocation = (business) => {
    setHighlightedBusinessId(business.id);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loading = businessesLoading || occupancyLoading;
  const error = businessesError || geoError;

  return (
    <div className="space-y-6">
      <div className="magic-card p-5">
        <h2 className="font-display text-lg font-bold text-ink">Affluence par match</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Choisissez un match : les marqueurs sur la carte passent au vert, orange ou rouge
          selon le taux de remplissage du café.
        </p>

        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="select-arena mt-4"
        >
          <option value="">Sélectionner un match…</option>
          {matchOptions.map((match) => (
            <option key={match.id} value={match.id}>
              {match.label}
              {match.date ? ` — ${formatDateTime(match.date)}` : ''}
            </option>
          ))}
        </select>

        {selectedMatchId && (
          <OccupancyMapLegend className="mt-4" />
        )}
      </div>

      {!selectedMatchId && (
        <Alert variant="info">
          Sélectionnez un match pour afficher l&apos;affluence en temps réel sur la carte.
        </Alert>
      )}

      {selectedMatchId && (
        <>
          <VenueSearchBar
            search={search}
            onSearchChange={setSearch}
            onSubmit={handleSearch}
            onNearMe={handleNearMe}
            nearMeLoading={geoLoading}
            nearMeActive={filters.lat != null}
          />

          {error && <Alert variant="error">{error}</Alert>}
          {loading && <Spinner label="Chargement de la carte…" />}

          {!loading && businesses.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-5">
              <div ref={mapRef} className="scroll-mt-24 lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
                <div className="magic-card overflow-hidden p-4 sm:p-5">
                  <h3 className="font-display text-base font-bold text-ink">
                    Carte — {selectedMatch?.label}
                  </h3>
                  <p className="mt-1 text-xs text-ink-faint">
                    Vert = disponible · Orange = modéré · Rouge = presque complet
                  </p>
                  <div className="mt-4">
                    <VenuesMap
                      businesses={businesses}
                      userLat={filters.lat}
                      userLng={filters.lng}
                      highlightedBusinessId={highlightedBusinessId}
                      onMarkerClick={setHighlightedBusinessId}
                      occupancyMap={occupancyMap}
                      matchId={Number(selectedMatchId)}
                      showOccupancyLegend={false}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                <p className="text-sm font-semibold text-ink">
                  {businesses.length} lieu{businesses.length > 1 ? 'x' : ''}
                </p>
                {businesses.map((business, index) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    isHighlighted={
                      highlightedBusinessId === business.id
                      || highlightBusinessIds.includes(business.id)
                    }
                    onViewLocation={handleViewLocation}
                    showBookAction
                    animationDelay={index * 60}
                    occupancy={occupancyMap[business.id]}
                    matchId={Number(selectedMatchId)}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && businesses.length === 0 && (
            <Alert variant="info">Aucun café partenaire trouvé pour cette recherche.</Alert>
          )}
        </>
      )}
    </div>
  );
}