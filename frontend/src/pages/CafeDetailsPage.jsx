import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { matchApi } from '../api/matchApi';
import { businessApi } from '../api/businessApi';
import BusinessImage from '../components/business/BusinessImage';
import OccupancyBar from '../components/business/OccupancyBar';
import OccupancyBadge from '../components/business/OccupancyBadge';
import OccupancyIntelligencePanel from '../components/occupancy/OccupancyIntelligencePanel';
import { useOccupancyIntelligence } from '../hooks/useOccupancyIntelligence';
import VenuesMap from '../components/business/VenuesMap';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';
import Section from '../components/ui/Section';
import Spinner from '../components/ui/Spinner';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { getBusinessGalleryUrls } from '../utils/businessImage';
import { hasBusinessLocation } from '../utils/businessLocation';
import { ROUTES } from '../utils/constants';
import { formatDateTime } from '../utils/formatDate';

const TYPE_LABELS = { CAFE: 'Café', RESTAURANT: 'Restaurant' };

const SPACE_TYPE_LABELS = {
  TERRACE: 'Terrasse',
  INDOOR_HALL: 'Salle intérieure',
  VIP_ROOM: 'Salle VIP',
  FAMILY_AREA: 'Espace famille',
  WOMEN_AREA: 'Espace femmes',
  OTHER: 'Autre',
};

export default function CafeDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(searchParams.get('matchId') || '');
  const [occupancy, setOccupancy] = useState(null);
  const { intelligence, loading: intelligenceLoading, error: intelligenceError } =
    useOccupancyIntelligence(id, selectedMatchId ? Number(selectedMatchId) : null);

  useEffect(() => {
    const loadBusiness = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await businessApi.getById(id);
        setBusiness(getApiData(response));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
  }, [id]);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await matchApi.listUpcoming();
        const list = getApiData(response) || [];
        setMatches(list);
        if (!selectedMatchId && list.length > 0) {
          setSelectedMatchId(String(list[0].id));
        }
      } catch {
        setMatches([]);
      }
    };
    loadMatches();
  }, []);

  useEffect(() => {
    if (!selectedMatchId || !id) {
      setOccupancy(null);
      return undefined;
    }

    const loadOccupancy = async () => {
      try {
        const response = await businessApi.occupancy(id, selectedMatchId);
        setOccupancy(getApiData(response));
      } catch {
        setOccupancy(null);
      }
    };
    loadOccupancy();
    return undefined;
  }, [id, selectedMatchId]);

  if (loading) return <div className="page-container"><Spinner label="Chargement..." /></div>;

  if (error) {
    return (
      <div className="page-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  const showMap = hasBusinessLocation(business);
  const gallery = getBusinessGalleryUrls(business, 4);

  return (
    <div className="page-container page-enter">
      <Link
        to={ROUTES.CAFES}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
      >
        ← Retour aux lieux
      </Link>

      <header className="mt-6">
        <span className="badge-arena">
          {TYPE_LABELS[business.businessType] || business.businessType}
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          {business.name}
        </h1>
        <p className="mt-2 text-ink-muted">
          {business.address}, {business.city}, {business.country}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="magic-card overflow-hidden p-0">
            <div className="relative h-64 sm:h-80">
              <BusinessImage
                business={{ ...business, coverImageUrl: gallery[activeImage] }}
                alt={business.name}
                className="h-full w-full"
                imageIndex={activeImage}
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {gallery.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImage === index
                        ? 'border-primary-500 shadow-glow'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Section title="À propos" className="magic-card">
            <p className="leading-relaxed text-ink-muted">{business.description}</p>
          </Section>

          {business.spaces?.length > 0 && (
            <Section
              title="Espaces & tarifs"
              description="Prix pour un jour de match."
              className="magic-card"
            >
              <div className="space-y-3">
                {business.spaces.map((space) => (
                  <div
                    key={space.id}
                    className="flex items-center justify-between rounded-xl border border-surface-border bg-gradient-to-r from-surface-muted to-surface-card px-4 py-3 transition-colors hover:border-primary-200 hover:from-primary-50/40"
                  >
                    <div>
                      <p className="font-semibold text-ink">{space.name}</p>
                      <p className="text-sm text-ink-faint">
                        {SPACE_TYPE_LABELS[space.spaceType] || space.spaceType} · {space.capacity} places · {space.numberOfTables} tables
                      </p>
                    </div>
                    <p className="font-display text-lg font-bold text-primary-700">
                      {Number(space.matchDayPrice).toFixed(0)} MAD
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {showMap && (
            <Section
              title="Localisation"
              className="magic-card"
              action={
                business.googleMapsUrl ? (
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Google Maps ↗
                  </a>
                ) : null
              }
            >
              <VenuesMap
                businesses={[business]}
                singleBusiness
                highlightedBusinessId={business.id}
              />
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Card className="magic-card">
            <h3 className="font-display text-lg font-bold text-ink">Affluence pour un match</h3>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="select-arena mt-3"
            >
              <option value="">Sélectionner un match…</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.homeTeam} vs {match.awayTeam}
                  {match.matchDate ? ` — ${formatDateTime(match.matchDate)}` : ''}
                </option>
              ))}
            </select>
            {selectedMatchId && (
              <div className="mt-4">
                <OccupancyIntelligencePanel
                  intelligence={intelligence}
                  loading={intelligenceLoading}
                  error={intelligenceError}
                  compact
                />
              </div>
            )}
            {occupancy && !selectedMatchId && (
              <div className="mt-4 space-y-3">
                <OccupancyBadge
                  level={occupancy.level}
                  percentage={occupancy.occupancyPercentage}
                />
                <OccupancyBar occupancy={occupancy} />
              </div>
            )}
          </Card>

          <Card className="magic-card sticky top-24">
            <h3 className="font-display text-lg font-bold text-ink">Informations</h3>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="info-row">
                <dt className="text-ink-faint">Capacité</dt>
                <dd className="font-semibold text-ink">{business.totalCapacity} places</dd>
              </div>
              <div className="info-row">
                <dt className="text-ink-faint">Tables</dt>
                <dd className="font-semibold text-ink">{business.totalTables}</dd>
              </div>
              <div className="info-row">
                <dt className="text-ink-faint">Espaces</dt>
                <dd className="font-semibold">{business.spaces?.length ?? 0}</dd>
              </div>
            </dl>

            {(business.contactPhone || business.contactEmail) && (
              <div className="mt-5 border-t border-surface-border pt-4 text-sm text-ink-muted">
                {business.contactPhone && <p>Tél. {business.contactPhone}</p>}
                {business.contactEmail && <p>{business.contactEmail}</p>}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to={ROUTES.BOOK({
                  businessId: business.id,
                  matchId: selectedMatchId ? Number(selectedMatchId) : undefined,
                })}
                className="btn-arena w-full py-3"
              >
                Réserver pour un match
              </Link>
              <Link
                to={ROUTES.MATCHES}
                className="btn-arena-outline w-full py-3"
              >
                Voir les matchs
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}