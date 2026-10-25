import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { businessApi } from '../api/businessApi';
import { matchApi } from '../api/matchApi';
import { recommendationApi } from '../api/recommendationApi';
import MatchRecommendationsPanel from '../components/recommendations/MatchRecommendationsPanel';
import VenuesMap from '../components/business/VenuesMap';
import BookingProgressTracker from '../components/booking/BookingProgressTracker';
import PaymentStep from '../components/payment/PaymentStep';
import GlassCard from '../components/ui/GlassCard';

import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { ROUTES } from '../utils/constants';
import { formatDateTime } from '../utils/formatDate';
import { useBusinessOccupancy } from '../hooks/useBusinessOccupancy';
import { requestUserLocation } from '../utils/geolocation';

const STEPS = [
  'Match',
  'Lieu',
  'Date',
  'Espace',
  'Table',
  'Confirmation',
  'Paiement',
  'Billet',
];

const SPACE_TYPE_LABELS = {
  TERRACE: 'Terrasse',
  INDOOR_HALL: 'Salle intérieure',
  VIP_ROOM: 'Salle VIP',
  FAMILY_AREA: 'Espace famille',
  WOMEN_AREA: 'Espace femmes',
  OTHER: 'Autre',
};

export default function BookingWizardPage() {
  const [searchParams] = useSearchParams();

  const initialMatchId = searchParams.get('matchId');
  const initialBusinessId = searchParams.get('businessId');
  const initialBookingId = searchParams.get('bookingId');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [matches, setMatches] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [tables, setTables] = useState([]);

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [pendingReservation, setPendingReservation] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [venueLat, setVenueLat] = useState(null);
  const [venueLng, setVenueLng] = useState(null);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [venueGeoError, setVenueGeoError] = useState('');
  const [highlightedVenueId, setHighlightedVenueId] = useState(null);
  const venueMapRef = useRef(null);

  const { occupancyMap } = useBusinessOccupancy(selectedMatch?.id ?? null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (initialBookingId) {
        const booking = getApiData(await bookingApi.getById(initialBookingId));
        if (booking.status !== 'PENDING') {
          setError('Cette réservation n\'est plus en attente de paiement.');
          return;
        }
        const [matchRes, businessRes] = await Promise.all([
          matchApi.getById(booking.matchId),
          businessApi.getById(booking.businessId),
        ]);
        const match = getApiData(matchRes);
        const business = getApiData(businessRes);
        const space = business?.spaces?.find((s) => s.id === booking.spaceId);

        setPendingReservation(booking);
        setSelectedMatch(match);
        setSelectedBusiness(business);
        setSelectedSpace(space || null);
        setSelectedTable({
          id: booking.tableId,
          tableNumber: booking.tableNumber,
          matchDayPrice: booking.totalPrice,
          capacity: booking.partySize,
        });
        setPartySize(booking.partySize);
        setSpecialRequests(booking.specialRequests || '');
        setStep(7);
        return;
      }

      const matchesRes = await matchApi.listUpcoming();
      const matchList = getApiData(matchesRes) || [];
      setMatches(matchList);

      if (initialMatchId) {
        const match = matchList.find((m) => String(m.id) === initialMatchId)
          || getApiData(await matchApi.getById(initialMatchId));
        if (match) setSelectedMatch(match);
      }

      if (initialBusinessId) {
        const business = getApiData(await businessApi.getById(initialBusinessId));
        if (business) setSelectedBusiness(business);
      }

      if (initialMatchId && initialBusinessId) {
        setStep(4);
      } else if (initialMatchId) {
        setStep(2);
      } else if (initialBusinessId) {
        setStep(1);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [initialMatchId, initialBusinessId, initialBookingId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadVenues = useCallback(async () => {
    if (!selectedMatch?.id) return;
    setVenuesLoading(true);
    setVenueGeoError('');
    try {
      const params = { limit: 12 };
      if (venueLat != null && venueLng != null) {
        params.lat = venueLat;
        params.lng = venueLng;
      }
      const response = await recommendationApi.forMatch(selectedMatch.id, params);
      const payload = getApiData(response);
      setRecommendationsData(payload);
      setBusinesses(payload?.recommendations || []);
    } catch (err) {
      setError(getApiError(err));
      setRecommendationsData(null);
      setBusinesses([]);
    } finally {
      setVenuesLoading(false);
    }
  }, [selectedMatch, venueLat, venueLng]);

  useEffect(() => {
    if (step === 2 && selectedMatch?.id) {
      loadVenues();
    }
  }, [step, selectedMatch, loadVenues]);

  const handleVenueNearMe = async () => {
    setVenueGeoError('');
    if (venueLat != null && venueLng != null) {
      setVenueLat(null);
      setVenueLng(null);
      return;
    }
    setVenuesLoading(true);
    try {
      const { lat, lng } = await requestUserLocation();
      setVenueLat(lat);
      setVenueLng(lng);
    } catch (err) {
      setVenueGeoError(err.message);
      setVenuesLoading(false);
    }
  };

  const loadTables = useCallback(async () => {
    if (!selectedBusiness || !selectedSpace || !selectedMatch) return;
    try {
      const response = await bookingApi.getTables({
        businessId: selectedBusiness.id,
        spaceId: selectedSpace.id,
        matchId: selectedMatch.id,
      });
      setTables(getApiData(response) || []);
    } catch (err) {
      setError(getApiError(err));
    }
  }, [selectedBusiness, selectedSpace, selectedMatch]);

  useEffect(() => {
    if (step === 5) {
      loadTables();
    }
  }, [step, loadTables]);

  const price = useMemo(() => {
    if (pendingReservation?.totalPrice != null) {
      return Number(pendingReservation.totalPrice);
    }
    if (selectedTable?.matchDayPrice != null) {
      return Number(selectedTable.matchDayPrice);
    }
    if (selectedSpace?.matchDayPrice != null) {
      return Number(selectedSpace.matchDayPrice);
    }
    return 0;
  }, [pendingReservation, selectedTable, selectedSpace]);

  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
    setStep(selectedBusiness ? 4 : 2);
  };

  const handleSelectBusiness = async (business) => {
    setLoading(true);
    setError('');
    try {
      const detail = getApiData(await businessApi.getById(business.id));
      setSelectedBusiness(detail);
      setStep(3);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpace = (space) => {
    setSelectedSpace(space);
    setSelectedTable(null);
    setStep(5);
  };

  const handleSelectTable = (table) => {
    if (!table.available) return;
    setSelectedTable(table);
    setPartySize(Math.min(partySize, table.capacity));
    setStep(6);
  };

  const handleReserve = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await bookingApi.create({
        matchId: selectedMatch.id,
        businessId: selectedBusiness.id,
        spaceId: selectedSpace.id,
        tableId: selectedTable.id,
        partySize: Number(partySize),
        specialRequests: specialRequests || undefined,
      });
      setPendingReservation(getApiData(response));
      setStep(7);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    setPaymentResult(payment);
    setBookingResult(payment.reservation || payment);
    setStep(8);
  };

  const handleDownloadPdf = async () => {
    if (!bookingResult?.id) return;
    try {
      const response = await bookingApi.downloadTicketPdf(bookingResult.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${bookingResult.ticketCode || bookingResult.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  if (loading && step === 1) {
    return (
      <div className="page-container">
        <Spinner label="Chargement de la réservation..." />
      </div>
    );
  }

  return (
    <section className="page-container page-enter max-w-3xl">
      <div className="mb-8">
        <span className="badge-arena">Réservation match-day</span>
        <h1 className="section-title mt-3">Réservez votre table</h1>
        <p className="section-subtitle">
          Choisissez votre match, votre café, payez en ligne et recevez votre billet PDF avec QR code.
        </p>
      </div>

      <BookingProgressTracker steps={STEPS} currentStep={step} />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {step === 1 && (
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">1. Choisir un match</h2>
          <div className="mt-4 space-y-3">
            {matches.map((match) => (
              <button
                key={match.id}
                type="button"
                onClick={() => handleSelectMatch(match)}
                className="choice-card"
              >
                <p className="text-xs font-semibold text-primary-400">{match.competition}</p>
                <p className="font-semibold text-ink">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
                <p className="text-sm text-ink-faint">{formatDateTime(match.matchDate)}</p>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {step === 2 && (
        <Card>
          <h2 className="font-display text-lg font-bold text-ink">2. Choisir un lieu recommandé</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam} — proximité, occupation et score IA
          </p>
          {venueGeoError && (
            <div className="mt-3">
              <Alert variant="error">{venueGeoError}</Alert>
            </div>
          )}
          {!venuesLoading && businesses.length > 0 && (
            <div ref={venueMapRef} className="mt-4">
              <VenuesMap
                businesses={businesses}
                userLat={venueLat}
                userLng={venueLng}
                highlightedBusinessId={highlightedVenueId}
                onMarkerClick={setHighlightedVenueId}
                occupancyMap={occupancyMap}
                matchId={selectedMatch?.id}
              />
            </div>
          )}
          <div className="mt-4">
            <MatchRecommendationsPanel
              data={recommendationsData}
              recommendations={businesses}
              loading={venuesLoading}
              error={error}
              geoEnabled={recommendationsData?.geoEnabled}
              matchId={selectedMatch?.id}
              onRefreshLocation={handleVenueNearMe}
              onSelect={handleSelectBusiness}
              compact
            />
          </div>
          <Button variant="secondary" className="mt-4" onClick={() => setStep(1)}>
            Retour
          </Button>
        </Card>
      )}

      {step === 3 && selectedMatch && (
        <Card>
          <h2 className="font-display text-lg font-bold text-ink">3. Date du match</h2>
          <p className="mt-4 text-ink-muted">
            Votre réservation est pour le jour du match :
          </p>
          <p className="mt-2 font-display text-xl font-bold text-ink">
            {formatDateTime(selectedMatch.matchDate)}
          </p>
          <p className="mt-2 text-sm text-ink-faint">
            {selectedMatch.homeTeam} vs {selectedMatch.awayTeam} · {selectedBusiness?.name}
          </p>
          <Button className="mt-6" onClick={() => setStep(4)}>
            Choisir un espace
          </Button>
        </Card>
      )}

      {step === 4 && selectedBusiness && (
        <Card>
          <h2 className="font-display text-lg font-bold text-ink">4. Choisir un espace</h2>
          <div className="mt-4 space-y-3">
            {(selectedBusiness.spaces || []).map((space) => (
              <button
                key={space.id}
                type="button"
                onClick={() => handleSelectSpace(space)}
                className="choice-card flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-ink">{space.name}</p>
                  <p className="text-sm text-ink-faint">
                    {SPACE_TYPE_LABELS[space.spaceType] || space.spaceType} · {space.capacity} places
                  </p>
                </div>
                <span className="font-display font-bold text-primary-700">
                  {Number(space.matchDayPrice).toFixed(0)} MAD
                </span>
              </button>
            ))}
          </div>
          <Button variant="secondary" className="mt-4" onClick={() => setStep(selectedMatch ? 3 : 2)}>
            Retour
          </Button>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <h2 className="font-display text-lg font-bold text-ink">5. Choisir une table</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tables.map((table) =>
              table.available ? (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => handleSelectTable(table)}
                  className="choice-card"
                >
                  <p className="font-medium text-ink">Table {table.tableNumber}</p>
                  <p className="text-sm text-ink-faint">{table.capacity} places</p>
                  <p className="mt-1 text-xs font-bold text-primary-700">Disponible</p>
                </button>
              ) : (
                <div
                  key={table.id}
                  className="choice-card choice-card-disabled"
                  aria-disabled="true"
                >
                  <p className="font-medium text-ink-muted">Table {table.tableNumber}</p>
                  <p className="text-sm text-ink-faint">{table.capacity} places</p>
                  <p className="mt-1 text-xs font-medium text-ink-faint">Réservée</p>
                </div>
              )
            )}
          </div>
          <Button variant="secondary" className="mt-4" onClick={() => setStep(4)}>
            Retour
          </Button>
        </Card>
      )}

      {step === 6 && selectedTable && (
        <Card>
          <h2 className="font-display text-lg font-bold text-ink">6. Confirmer les détails</h2>
          <dl className="mt-4 space-y-2 rounded-xl bg-surface-muted p-4 text-sm text-ink-muted">
            <div><dt className="inline font-semibold text-ink">Match : </dt>{selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}</div>
            <div><dt className="inline font-semibold text-ink">Lieu : </dt>{selectedBusiness?.name}</div>
            <div><dt className="inline font-semibold text-ink">Espace : </dt>{selectedSpace?.name}</div>
            <div><dt className="inline font-semibold text-ink">Table : </dt>{selectedTable.tableNumber}</div>
            <div><dt className="inline font-semibold text-ink">Prix : </dt>{price.toFixed(0)} MAD</div>
          </dl>
          <div className="mt-4 space-y-3">
            <Input
              type="number"
              min={1}
              max={selectedTable.capacity}
              label="Nombre de personnes"
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
            />
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Demandes spéciales</span>
              <textarea
                className="input-arena"
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleReserve} disabled={submitting}>
              {submitting ? 'Réservation...' : 'Réserver et payer'}
            </Button>
            <Button variant="secondary" onClick={() => setStep(5)}>Retour</Button>
          </div>
        </Card>
      )}

      {step === 7 && pendingReservation && (
        <Card>
          {initialBookingId && (
            <div className="mb-4">
              <Alert variant="info">
                Reprise du paiement — réservation #{pendingReservation.id} en attente.
              </Alert>
            </div>
          )}
          <PaymentStep
            reservationId={pendingReservation.id}
            price={price}
            businessName={selectedBusiness?.name}
            onPaid={handlePaymentSuccess}
            onBack={() => setStep(6)}
          />
        </Card>
      )}

      {step === 8 && bookingResult && (
        <GlassCard className="p-8 text-center" glow>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-600/20 text-3xl shadow-glow">
            ✓
          </div>
          <span className="badge-gold">Billet confirmé</span>
          <h2 className="mt-3 font-display text-lg font-bold text-ink">8. Votre billet</h2>
          <div className="mt-4">
            <Alert variant="success">
              Paiement effectué — votre réservation est confirmée. Consultez vos notifications.
            </Alert>
          </div>
          <p className="mt-6 font-mono text-3xl font-bold tracking-widest text-primary-700">
            {bookingResult.ticketCode}
          </p>
          <dl className="mx-auto mt-6 max-w-sm space-y-1 rounded-xl bg-surface-muted p-4 text-left text-sm text-ink-muted">
            <div>{bookingResult.matchLabel}</div>
            <div>{bookingResult.businessName} · Table {bookingResult.tableNumber}</div>
            <div>{formatDateTime(bookingResult.reservationDateTime)}</div>
            <div>{bookingResult.partySize} personnes · {Number(bookingResult.totalPrice).toFixed(0)} MAD</div>
            {paymentResult?.platformFee != null && (
              <div className="text-xs text-ink-faint">
                Payé · commission plateforme {Number(paymentResult.platformFee).toFixed(2)} MAD
              </div>
            )}
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={handleDownloadPdf}>Télécharger le PDF</Button>
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="secondary">Mes réservations</Button>
            </Link>
            <Link to={ROUTES.MATCHES}>
              <Button variant="ghost">Coupe du Monde</Button>
            </Link>
          </div>
        </GlassCard>
      )}
    </section>
  );
}