import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ownerApi } from '../../api/ownerApi';
import BusinessStatusBadge from '../../components/business/BusinessStatusBadge';
import OwnerLiveOccupancyPanel from '../../components/owner/OwnerLiveOccupancyPanel';
import OwnerOccupancyAnalyticsPanel from '../../components/owner/OwnerOccupancyAnalyticsPanel';
import OwnerReservationsPanel from '../../components/owner/OwnerReservationsPanel';
import OwnerVerificationPanel from '../../components/owner/OwnerVerificationPanel';
import TicketCheckInPanel from '../../components/owner/TicketCheckInPanel';
import StatCard from '../../components/admin/StatCard';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { ROUTES } from '../../utils/constants';

const TYPE_LABELS = {
  CAFE: 'Café',
  RESTAURANT: 'Restaurant',
};

const TAB_GROUPS = [
  {
    label: 'Accueil',
    tabs: [{ id: 'overview', label: 'Tableau de bord' }],
  },
  {
    label: 'Établissement',
    tabs: [
      { id: 'businesses', label: 'Établissements' },
      { id: 'verification', label: 'Vérification' },
    ],
  },
  {
    label: 'Jour J',
    tabs: [
      { id: 'reservations', label: 'Réservations' },
      { id: 'checkin', label: 'Check-in QR' },
      { id: 'occupancy', label: 'Affluence' },
    ],
  },
  {
    label: 'Performance',
    tabs: [
      { id: 'analytics', label: 'Statistiques' },
      { id: 'revenue', label: 'Revenus' },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((group) => group.tabs.map((tab) => tab.id));

export default function OwnerDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const reservationIdFromUrl = searchParams.get('reservationId');
  const businessIdFromUrl = searchParams.get('businessId');
  const ticketFromUrl = searchParams.get('ticket') || '';

  const initialTab = ALL_TABS.includes(tabFromUrl) ? tabFromUrl : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    businessIdFromUrl ? Number(businessIdFromUrl) : null
  );
  const [businesses, setBusinesses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [occupancyRefreshKey, setOccupancyRefreshKey] = useState(0);

  const loadBusinesses = useCallback(async () => {
    const response = await ownerApi.listBusinesses();
    const list = getApiData(response) || [];
    setBusinesses(list);
    setSelectedBusinessId((current) => {
      if (current && list.some((item) => item.id === current)) return current;
      const fromUrl = businessIdFromUrl ? Number(businessIdFromUrl) : null;
      if (fromUrl && list.some((item) => item.id === fromUrl)) return fromUrl;
      return list[0]?.id ?? null;
    });
    return list;
  }, [businessIdFromUrl]);

  const loadReservations = useCallback(async () => {
    const response = await ownerApi.getReservations();
    setReservations(getApiData(response) || []);
  }, []);

  const loadRevenue = useCallback(async () => {
    const response = await ownerApi.getRevenue();
    setRevenue(getApiData(response));
  }, []);

  const loadTab = useCallback(async (tab) => {
    setTabLoading(true);
    setError('');
    try {
      if (tab === 'overview') {
        await Promise.all([loadBusinesses(), loadReservations(), loadRevenue()]);
        return;
      }
      if (tab === 'businesses' || tab === 'verification' || tab === 'occupancy' || tab === 'analytics') {
        await loadBusinesses();
      }
      if (tab === 'reservations' || tab === 'checkin') await loadReservations();
      if (tab === 'revenue') await loadRevenue();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setTabLoading(false);
    }
  }, [loadBusinesses, loadReservations, loadRevenue]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadTab(initialTab);
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    init();
    // First paint only — later tab changes go through handleTabChange / URL sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const nextTab = ALL_TABS.includes(tabFromUrl) ? tabFromUrl : 'overview';
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
      loadTab(nextTab);
    }
  }, [tabFromUrl, activeTab, loadTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = {};
    if (tab !== 'overview') params.tab = tab;
    if (selectedBusinessId && ['verification', 'occupancy', 'analytics'].includes(tab)) {
      params.businessId = String(selectedBusinessId);
    }
    setSearchParams(params, { replace: true });
    loadTab(tab);
  };

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId),
    [businesses, selectedBusinessId]
  );

  const approvedBusinesses = useMemo(
    () => businesses.filter((b) => b.status === 'APPROVED'),
    [businesses]
  );

  const canEdit = (status) => status === 'PENDING' || status === 'REJECTED';
  const commissionPct = revenue?.commissionRate != null
    ? Math.round(Number(revenue.commissionRate) * 100)
    : 25;
  const ownerPct = 100 - commissionPct;

  const pendingCheckIns = reservations.filter((r) => r.status === 'CONFIRMED').length;

  const businessSelector = businesses.length > 0 && (
    <label className="mb-4 block text-sm font-semibold text-ink">
      Établissement
      <select
        value={selectedBusinessId || ''}
        onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
        className="select-arena mt-2"
      >
        {(activeTab === 'occupancy' || activeTab === 'analytics'
          ? approvedBusinesses
          : businesses
        ).map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.status})
          </option>
        ))}
      </select>
    </label>
  );

  if (loading) {
    return (
      <div className="page-container">
        <Spinner label="Chargement de votre espace propriétaire..." />
      </div>
    );
  }

  return (
    <section className="page-container page-enter max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="badge-gold">Espace propriétaire</span>
          <h1 className="section-title mt-3">Tableau de bord</h1>
          <p className="section-subtitle">
            Établissements, réservations, check-in et revenus ({ownerPct}% pour vous).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.OWNER_TAB('reservations')}>
            <Button variant="secondary">Réservations</Button>
          </Link>
          <Link to={ROUTES.OWNER_BUSINESS_NEW}>
            <Button>Ajouter un établissement</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <nav className="owner-nav mb-8 space-y-4" aria-label="Navigation propriétaire">
        {TAB_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-faint">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`nav-pill ${activeTab === tab.id ? 'nav-pill-active' : ''}`}
                >
                  {tab.label}
                  {tab.id === 'reservations' && pendingCheckIns > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-navy-950">
                      {pendingCheckIns}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Établissements" value={businesses.length} />
            <StatCard label="Réservations" value={reservations.length} hint={`${pendingCheckIns} à check-in`} />
            <StatCard
              label="Check-ins faits"
              value={reservations.filter((r) => r.status === 'CHECKED_IN').length}
            />
            <StatCard
              label={`Votre part (${ownerPct}%)`}
              value={revenue ? `${Number(revenue.ownerPayout).toFixed(0)} MAD` : '—'}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link to={ROUTES.OWNER_TAB('reservations')} className="block">
              <Card hover className="h-full">
                <p className="text-2xl">📋</p>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">Réservations</h3>
                <p className="mt-1 text-sm text-ink-muted">Liste complète des fans, tables et tickets.</p>
              </Card>
            </Link>
            <Link to={ROUTES.OWNER_TAB('checkin')} className="block">
              <Card hover className="h-full">
                <p className="text-2xl">📷</p>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">Check-in QR</h3>
                <p className="mt-1 text-sm text-ink-muted">Scanner ou saisir le code du ticket à l&apos;entrée.</p>
              </Card>
            </Link>
            <Link to={ROUTES.OWNER_TAB('occupancy')} className="block">
              <Card hover className="h-full">
                <p className="text-2xl">📡</p>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">Affluence</h3>
                <p className="mt-1 text-sm text-ink-muted">Occupation live de votre salle pendant le match.</p>
              </Card>
            </Link>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink">Dernières réservations</h2>
              <Link to={ROUTES.OWNER_TAB('reservations')} className="text-sm font-bold text-primary-400">
                Voir toutes →
              </Link>
            </div>
            {reservations.length === 0 ? (
              <p className="text-sm text-ink-muted">Pas encore de réservation payée.</p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {reservations.slice(0, 5).map((r) => (
                  <li key={r.reservationId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-semibold text-ink">{r.fanName}</p>
                      <p className="text-xs text-ink-muted">
                        {r.matchLabel} · Table {r.tableNumber || '—'}
                      </p>
                    </div>
                    <Link
                      to={ROUTES.OWNER_RESERVATION(r.reservationId)}
                      className="text-sm font-bold text-primary-400"
                    >
                      Détail →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'businesses' && (
        businesses.length === 0 ? (
          <Card className="text-center">
            <h2 className="font-display text-lg font-bold text-ink">Aucun établissement</h2>
            <p className="mt-2 text-ink-muted">
              Créez votre premier café ou restaurant, téléversez vos documents, puis soumettez pour validation.
            </p>
            <Link to={ROUTES.OWNER_BUSINESS_NEW} className="mt-6 inline-block">
              <Button>Commencer</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => (
              <Card key={business.id} className="magic-card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-ink">{business.name}</h2>
                    <BusinessStatusBadge status={business.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-faint">
                    {TYPE_LABELS[business.businessType] || business.businessType} · {business.city}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {business.totalCapacity} places · {business.totalTables} tables
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canEdit(business.status) && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedBusinessId(business.id);
                          handleTabChange('verification');
                          setSearchParams({ tab: 'verification', businessId: String(business.id) }, { replace: true });
                        }}
                      >
                        Vérification
                      </Button>
                      <Link to={ROUTES.OWNER_BUSINESS_EDIT(business.id)}>
                        <Button variant="ghost">Modifier</Button>
                      </Link>
                    </>
                  )}
                  {business.status === 'APPROVED' && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedBusinessId(business.id);
                          setSearchParams({ tab: 'occupancy', businessId: String(business.id) }, { replace: true });
                          setActiveTab('occupancy');
                          loadTab('occupancy');
                        }}
                      >
                        Affluence
                      </Button>
                      <Link to={ROUTES.CAFE_DETAILS(business.id)}>
                        <Button variant="ghost">Page publique</Button>
                      </Link>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'verification' && (
        <>
          {businessSelector}
          <OwnerVerificationPanel businessId={selectedBusinessId} />
        </>
      )}

      {activeTab === 'occupancy' && (
        <>
          {businessSelector}
          {approvedBusinesses.length === 0 ? (
            <Alert variant="info">L&apos;affluence live est disponible après approbation admin.</Alert>
          ) : (
            <OwnerLiveOccupancyPanel
              businessId={selectedBusinessId}
              capacity={selectedBusiness?.totalCapacity}
              refreshKey={occupancyRefreshKey}
            />
          )}
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {businessSelector}
          {approvedBusinesses.length === 0 ? (
            <Alert variant="info">Les statistiques seront disponibles après approbation.</Alert>
          ) : (
            <OwnerOccupancyAnalyticsPanel businessId={selectedBusinessId} />
          )}
        </>
      )}

      {activeTab === 'checkin' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              Validez les tickets à l&apos;entrée. La liste complète reste dans Réservations.
            </p>
            <Link to={ROUTES.OWNER_TAB('reservations')} className="text-sm font-bold text-primary-400">
              ← Toutes les réservations
            </Link>
          </div>
          <TicketCheckInPanel
            initialTicket={ticketFromUrl}
            onCheckedIn={() => {
              loadReservations();
              setOccupancyRefreshKey((key) => key + 1);
            }}
          />
        </div>
      )}

      {activeTab === 'reservations' && (
        tabLoading ? (
          <Spinner label="Chargement des réservations..." />
        ) : (
          <OwnerReservationsPanel
            reservations={reservations}
            highlightId={reservationIdFromUrl}
            onOpenCheckIn={(ticket) => {
              setSearchParams({ tab: 'checkin', ticket }, { replace: true });
              setActiveTab('checkin');
            }}
          />
        )
      )}

      {activeTab === 'revenue' && (
        tabLoading ? (
          <Spinner label="Chargement des revenus..." />
        ) : revenue ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Réservations payées" value={revenue.totalBookings} />
            <StatCard
              label="Revenu brut"
              value={`${Number(revenue.grossRevenue).toFixed(0)} ${revenue.currency}`}
            />
            <StatCard
              label={`Votre part (${ownerPct}%)`}
              value={`${Number(revenue.ownerPayout).toFixed(2)} ${revenue.currency}`}
            />
            <StatCard
              label={`Commission (${commissionPct}%)`}
              value={`${Number(revenue.platformFee).toFixed(2)} ${revenue.currency}`}
            />
          </div>
        ) : null
      )}
    </section>
  );
}
