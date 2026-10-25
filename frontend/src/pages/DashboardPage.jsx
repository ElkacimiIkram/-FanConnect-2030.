import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FanMatchGroup from '../components/fan/FanMatchGroup';
import FanOccupancyMapPanel from '../components/fan/FanOccupancyMapPanel';
import FanBookingCard, { downloadBookingPdf } from '../components/fan/FanBookingCard';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useFanBookings } from '../hooks/useFanBookings';
import { useFanBookingOccupancy } from '../hooks/useFanBookingOccupancy';
import { getApiError } from '../utils/apiHelpers';
import { ROUTES } from '../utils/constants';

const TABS = [
  { id: 'bookings', label: 'Mes réservations', icon: '🎫' },
  { id: 'map', label: 'Carte & affluence', icon: '🗺️' },
];

function groupBookingsByMatch(bookings) {
  const groups = new Map();
  bookings.forEach((booking) => {
    const key = booking.matchId || booking.matchLabel || `other-${booking.id}`;
    if (!groups.has(key)) {
      groups.set(key, {
        matchId: booking.matchId,
        matchLabel: booking.matchLabel || booking.businessName || 'Réservation',
        competition: booking.competition,
        matchDate: booking.reservationDateTime,
        bookings: [],
      });
    }
    groups.get(key).bookings.push(booking);
  });
  return [...groups.values()];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { bookings, loading, error, cancelBooking } = useFanBookings();
  const { getOccupancy, loading: occupancyLoading } = useFanBookingOccupancy(bookings);

  const [activeTab, setActiveTab] = useState('bookings');
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'PENDING'),
    [bookings]
  );
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'PENDING' && b.status !== 'CANCELLED'),
    [bookings]
  );
  const matchGroups = useMemo(() => groupBookingsByMatch(activeBookings), [activeBookings]);
  const uniqueMatches = useMemo(
    () => new Set(bookings.filter((b) => b.matchId).map((b) => b.matchId)).size,
    [bookings]
  );
  const reservedBusinessIds = useMemo(
    () => bookings.filter((b) => b.businessId).map((b) => b.businessId),
    [bookings]
  );
  const defaultMatchId = useMemo(() => {
    const withMatch = bookings.find((b) => b.matchId);
    return withMatch ? String(withMatch.matchId) : '';
  }, [bookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    setActionError('');
    setCancellingId(id);
    try {
      await cancelBooking(id);
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadPdf = async (booking) => {
    setActionError('');
    try {
      await downloadBookingPdf(booking);
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  return (
    <section className="page-container page-enter max-w-6xl">
      <header className="relative overflow-hidden rounded-3xl bg-hero-pitch px-6 py-10 text-white shadow-glow sm:px-10">
        <div className="absolute inset-0 bg-mesh-hero opacity-40" />
        <div className="relative">
          <span className="badge-gold border-white/20 bg-white/10 text-white">Espace fan</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Mon tableau de bord
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-100">
            Bonjour {user?.firstName} — suivez vos réservations match-day, l&apos;affluence de vos
            cafés et trouvez le meilleur lieu sur la carte.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="font-display text-2xl font-black">{bookings.length}</p>
              <p className="text-[10px] font-bold uppercase text-primary-100">Réservations</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="font-display text-2xl font-black">{uniqueMatches}</p>
              <p className="text-[10px] font-bold uppercase text-primary-100">Matchs</p>
            </div>
            {pendingBookings.length > 0 && (
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/20 px-4 py-2 backdrop-blur-sm">
                <p className="font-display text-2xl font-black">{pendingBookings.length}</p>
                <p className="text-[10px] font-bold uppercase text-amber-100">À payer</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-xl border border-surface-border bg-surface-card p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <Link to={ROUTES.MATCHES}>
          <Button>Nouvelle réservation</Button>
        </Link>
      </div>

      {(loading || (activeTab === 'bookings' && occupancyLoading)) && (
        <div className="mt-8">
          <Spinner label="Chargement de vos réservations…" />
        </div>
      )}

      {(error || actionError) && (
        <div className="mt-6">
          <Alert variant="error">{error || actionError}</Alert>
        </div>
      )}

      {!loading && activeTab === 'bookings' && (
        <div className="mt-8 space-y-10">
          {!error && bookings.length === 0 && (
            <Card className="text-center">
              <p className="text-ink-muted">Vous n&apos;avez pas encore de réservation.</p>
              <Link to={ROUTES.MATCHES} className="mt-4 inline-block">
                <Button>Voir les matchs</Button>
              </Link>
            </Card>
          )}

          {pendingBookings.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                Paiement en attente ({pendingBookings.length})
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {pendingBookings.map((booking) => (
                  <FanBookingCard
                    key={booking.id}
                    booking={booking}
                    occupancy={getOccupancy(booking.matchId, booking.businessId)}
                    onCancel={handleCancel}
                    cancelling={cancellingId === booking.id}
                    onDownloadPdf={handleDownloadPdf}
                  />
                ))}
              </div>
            </section>
          )}

          {matchGroups.length > 0 && (
            <section className="space-y-8">
              {pendingBookings.length > 0 && (
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint">
                  Mes matchs réservés
                </h2>
              )}
              {matchGroups.map((group) => (
                <FanMatchGroup
                  key={group.matchId || group.matchLabel}
                  matchLabel={group.matchLabel}
                  competition={group.competition}
                  matchDate={group.matchDate}
                  bookings={group.bookings}
                  getOccupancy={getOccupancy}
                  onCancel={handleCancel}
                  cancellingId={cancellingId}
                  onDownloadPdf={handleDownloadPdf}
                />
              ))}
            </section>
          )}
        </div>
      )}

      {!loading && activeTab === 'map' && (
        <div className="mt-8">
          <FanOccupancyMapPanel
            bookings={bookings}
            defaultMatchId={defaultMatchId}
            highlightBusinessIds={reservedBusinessIds}
          />
        </div>
      )}
    </section>
  );
}