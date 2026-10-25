import { useEffect, useRef, useState } from 'react';
import { matchApi } from '../api/matchApi';
import BusinessCard from '../components/business/BusinessCard';
import OccupancyMapLegend from '../components/business/OccupancyMapLegend';
import VenuesMap from '../components/business/VenuesMap';
import VenueSearchBar from '../components/business/VenueSearchBar';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { useBusinesses } from '../hooks/useBusinesses';
import { useBusinessOccupancy } from '../hooks/useBusinessOccupancy';
import { getApiData } from '../utils/apiHelpers';
import { requestUserLocation } from '../utils/geolocation';
import { formatDateTime } from '../utils/formatDate';

export default function CafesPage() {
  const mapSectionRef = useRef(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', lat: null, lng: null });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [highlightedBusinessId, setHighlightedBusinessId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');

  const { businesses, loading, error } = useBusinesses({
    query: filters.query,
    lat: filters.lat,
    lng: filters.lng,
  });

  const { occupancyMap, loading: occupancyLoading } = useBusinessOccupancy(
    selectedMatchId ? Number(selectedMatchId) : null
  );

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await matchApi.listUpcoming();
        const list = getApiData(response) || [];
        setMatches(list);
        if (list.length > 0 && !selectedMatchId) {
          setSelectedMatchId(String(list[0].id));
        }
      } catch {
        setMatches([]);
      }
    };
    loadMatches();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setGeoError('');
    setFilters((prev) => ({ ...prev, query: search.trim() }));
  };

  const handleNearMe = async () => {
    setGeoError('');
    if (filters.lat != null && filters.lng != null) {
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
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-container page-enter">
      <header className="relative overflow-hidden rounded-3xl bg-hero-pitch px-6 py-10 text-white shadow-glow sm:px-10">
        <div className="absolute inset-0 bg-mesh-hero opacity-40" />
        <div className="hero-sparkle -right-10 top-0 h-40 w-40" />
        <div className="relative">
          <span className="badge-gold border-white/20 bg-white/10 text-white">📍 Places partenaires</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Cafés &amp; restaurants approuvés
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-100">
            Carte interactive, occupation en temps réel et réservation pour chaque match.
          </p>
        </div>
      </header>

      <div className="mt-8 magic-card p-5 sm:p-6">
        <label className="block font-display text-base font-semibold text-ink">
          Match pour l&apos;affluence (vert / orange / rouge)
        </label>
        <p className="mt-1 text-sm text-ink-faint">
          Le calcul compare les places réservées à la capacité totale du café pour ce match.
        </p>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="select-arena mt-3"
        >
          <option value="">Choisir un match…</option>
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.homeTeam} vs {match.awayTeam}
              {match.matchDate ? ` — ${formatDateTime(match.matchDate)}` : ''}
            </option>
          ))}
        </select>
        {selectedMatchId && <OccupancyMapLegend className="mt-3" compact />}
      </div>

      <VenueSearchBar
        search={search}
        onSearchChange={setSearch}
        onSubmit={handleSearch}
        onNearMe={handleNearMe}
        nearMeLoading={geoLoading}
        nearMeActive={filters.lat != null}
        className="mt-6"
      />

      {filters.lat != null && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50/80 px-4 py-3 text-sm text-primary-800 backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          Résultats triés par distance depuis votre position.
        </div>
      )}

      {(error || geoError) && (
        <div className="mt-6">
          <Alert variant="error">{error || geoError}</Alert>
        </div>
      )}

      {(loading || occupancyLoading) && (
        <div className="mt-12">
          <Spinner label="Chargement des lieux..." />
        </div>
      )}

      {!loading && !occupancyLoading && !error && businesses.length > 0 && (
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div
            ref={mapSectionRef}
            className="scroll-mt-24 lg:col-span-3 lg:sticky lg:top-20 lg:self-start"
          >
            <div className="magic-card p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-ink">Carte des lieux</h2>
                <p className="mt-1 text-sm text-ink-faint">
                  Cliquez sur un marqueur ou « Voir sur la carte » pour localiser un établissement.
                </p>
              </div>
              <VenuesMap
                businesses={businesses}
                userLat={filters.lat}
                userLng={filters.lng}
                highlightedBusinessId={highlightedBusinessId}
                onMarkerClick={setHighlightedBusinessId}
                occupancyMap={selectedMatchId ? occupancyMap : null}
                matchId={selectedMatchId ? Number(selectedMatchId) : null}
                showOccupancyLegend={false}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-5 flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  {businesses.length} résultat{businesses.length > 1 ? 's' : ''}
                </h2>
                <p className="text-sm text-ink-faint">Établissements approuvés sur FanConnect</p>
              </div>
            </div>
            <div className="space-y-5">
                {businesses.map((business, index) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    isHighlighted={highlightedBusinessId === business.id}
                    onViewLocation={handleViewLocation}
                    showBookAction
                    animationDelay={index * 80}
                    occupancy={occupancyMap[business.id]}
                    matchId={selectedMatchId ? Number(selectedMatchId) : null}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && businesses.length === 0 && (
        <div className="mt-10 magic-card p-8 text-center">
          <span className="text-4xl">🔍</span>
          <h2 className="mt-4 font-display text-xl font-bold text-ink">Aucun résultat</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Essayez un autre nom ou une autre ville, ou activez « Près de moi ».
          </p>
        </div>
      )}
    </div>
  );
}