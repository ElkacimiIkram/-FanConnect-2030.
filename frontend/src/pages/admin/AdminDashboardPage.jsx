import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cafeApi } from '../../api/cafeApi';
import { adminApi } from '../../api/adminApi';
import { matchApi } from '../../api/matchApi';
import BusinessStatusBadge from '../../components/business/BusinessStatusBadge';
import AdminCompetitionsPanel from '../../components/admin/AdminCompetitionsPanel';
import AdminGlobalAnalyticsPanel from '../../components/admin/AdminGlobalAnalyticsPanel';
import AdminVerificationPanel from '../../components/admin/AdminVerificationPanel';
import StatCard from '../../components/admin/StatCard';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useAdminDashboard } from '../../hooks/useAdmin';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { ROUTES } from '../../utils/constants';
import { formatDateTime, toDateTimeLocalValue } from '../../utils/formatDate';

const TABS = ['statistics', 'revenue', 'competitions', 'matches', 'users', 'verification', 'businesses', 'cafes', 'reservations'];

const MATCH_STATUSES = ['SCHEDULED', 'LIVE', 'FINISHED', 'CANCELLED'];

const MATCH_STATUS_LABELS = {
  SCHEDULED: 'Programmé',
  LIVE: 'En direct',
  FINISHED: 'Terminé',
  CANCELLED: 'Annulé',
};

const EMPTY_MATCH_FORM = {
  competitionId: '',
  competition: 'Coupe du Monde FIFA 2026',
  groupName: '',
  roundLabel: '',
  homeTeam: '',
  awayTeam: '',
  matchDate: '',
  venueName: '',
  city: '',
  status: 'SCHEDULED',
  homeScore: '',
  awayScore: '',
  matchMinute: '',
};

export default function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { stats, users, cafes, reservations, loading, error, reload } = useAdminDashboard();
  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return tab && TABS.includes(tab) ? tab : 'statistics';
  }, [searchParams]);
  const verificationBusinessId = useMemo(() => {
    const id = searchParams.get('businessId');
    return id ? Number(id) : null;
  }, [searchParams]);

  const handleTabChange = (tab) => {
    const params = new URLSearchParams();
    if (tab !== 'statistics') {
      params.set('tab', tab);
    }
    if (tab === 'verification') {
      const businessId = searchParams.get('businessId');
      if (businessId) params.set('businessId', businessId);
    }
    setSearchParams(params, { replace: true });
  };
  const [actionError, setActionError] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'FAN_USER',
  });
  const [newCafe, setNewCafe] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    capacity: 20,
  });
  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchForm, setMatchForm] = useState(EMPTY_MATCH_FORM);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [savingMatch, setSavingMatch] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);

  const loadPendingVerificationCount = useCallback(async () => {
    try {
      const response = await adminApi.getPendingVerifications();
      setPendingVerificationCount((getApiData(response) || []).length);
    } catch {
      setPendingVerificationCount(0);
    }
  }, []);

  useEffect(() => {
    loadPendingVerificationCount();
  }, [loadPendingVerificationCount, activeTab]);

  const handleToggleUser = async (user) => {
    setActionError('');
    try {
      await adminApi.updateUser(user.id, { enabled: !user.enabled });
      await reload();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleDeleteUser = async (id) => {
    setActionError('');
    try {
      await adminApi.deleteUser(id);
      await reload();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await adminApi.createUser(newUser);
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'FAN_USER' });
      await reload();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleCreateCafe = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await cafeApi.create({
        ...newCafe,
        capacity: Number(newCafe.capacity),
      });
      setNewCafe({ name: '', description: '', address: '', city: '', capacity: 20 });
      await reload();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleToggleCafe = async (cafe) => {
    setActionError('');
    try {
      await cafeApi.update(cafe.id, { active: !cafe.active });
      await reload();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleCancelReservation = async (id) => {
    setActionError('');
    try {
      await adminApi.cancelReservation(id);
      await reload();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const loadBusinesses = useCallback(async () => {
    setBusinessesLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        adminApi.getBusinesses(),
        adminApi.getPendingBusinesses(),
      ]);
      setBusinesses(getApiData(allRes) || []);
      setPendingBusinesses(getApiData(pendingRes) || []);
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setBusinessesLoading(false);
    }
  }, []);

  const loadRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const response = await adminApi.getRevenue();
      setRevenue(getApiData(response));
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  const loadCompetitions = useCallback(async () => {
    try {
      const response = await adminApi.getCompetitions();
      setCompetitions(getApiData(response) || []);
    } catch (err) {
      setActionError(getApiError(err));
    }
  }, []);

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true);
    setActionError('');
    try {
      const response = await adminApi.getMatches();
      setMatches(getApiData(response) || []);
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'businesses') {
      loadBusinesses();
    }
    if (activeTab === 'revenue') {
      loadRevenue();
    }
    if (activeTab === 'competitions') {
      loadCompetitions();
    }
    if (activeTab === 'matches') {
      loadCompetitions();
      loadMatches();
    }
  }, [activeTab, loadBusinesses, loadRevenue, loadMatches, loadCompetitions]);

  const resetMatchForm = () => {
    setMatchForm(EMPTY_MATCH_FORM);
    setEditingMatchId(null);
  };

  const handleSaveMatch = async (e) => {
    e.preventDefault();
    setActionError('');
    setSavingMatch(true);
    try {
      const payload = {
        competitionId: matchForm.competitionId ? Number(matchForm.competitionId) : undefined,
        competition: matchForm.competition,
        groupName: matchForm.groupName || undefined,
        roundLabel: matchForm.roundLabel || undefined,
        homeTeam: matchForm.homeTeam,
        awayTeam: matchForm.awayTeam,
        matchDate: new Date(matchForm.matchDate).toISOString(),
        venueName: matchForm.venueName || undefined,
        city: matchForm.city || undefined,
        status: matchForm.status,
        homeScore: matchForm.homeScore !== '' ? Number(matchForm.homeScore) : undefined,
        awayScore: matchForm.awayScore !== '' ? Number(matchForm.awayScore) : undefined,
        matchMinute: matchForm.matchMinute !== '' ? Number(matchForm.matchMinute) : undefined,
      };
      if (editingMatchId) {
        await adminApi.updateMatch(editingMatchId, payload);
      } else {
        await adminApi.createMatch(payload);
      }
      resetMatchForm();
      await loadMatches();
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setSavingMatch(false);
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatchId(match.id);
    setMatchForm({
      competitionId: match.competitionId || '',
      competition: match.competitionName || match.competition,
      groupName: match.groupName || '',
      roundLabel: match.roundLabel || '',
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      matchDate: toDateTimeLocalValue(new Date(match.matchDate)),
      venueName: match.venueName || '',
      city: match.city || '',
      status: match.status,
      homeScore: match.homeScore ?? '',
      awayScore: match.awayScore ?? '',
      matchMinute: match.matchMinute ?? '',
    });
  };

  const handleSeedDemoMatches = async () => {
    setActionError('');
    setSeedingDemo(true);
    try {
      await matchApi.seedDemo();
      await loadMatches();
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setSeedingDemo(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Supprimer ce match ?')) return;
    setActionError('');
    try {
      await adminApi.deleteMatch(id);
      if (editingMatchId === id) resetMatchForm();
      await loadMatches();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleApproveBusiness = async (id) => {
    setActionError('');
    try {
      await adminApi.approveBusiness(id);
      await loadBusinesses();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleRejectBusiness = async (id) => {
    const reason = rejectReason[id]?.trim();
    if (!reason) {
      setActionError('A rejection reason is required.');
      return;
    }
    setActionError('');
    try {
      await adminApi.rejectBusiness(id, reason);
      setRejectingId(null);
      setRejectReason((prev) => ({ ...prev, [id]: '' }));
      await loadBusinesses();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  const handleDisableBusiness = async (id) => {
    setActionError('');
    try {
      await adminApi.disableBusiness(id);
      await loadBusinesses();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  if (loading) return <Spinner label="Loading admin dashboard..." />;

  return (
    <section className="page-container page-enter max-w-7xl">
      <div className="mb-8">
        <span className="badge-arena">Administration</span>
        <h1 className="section-title mt-3">Tableau de bord admin</h1>
        <p className="section-subtitle">
          Gérez les utilisateurs, cafés, réservations et statistiques de la plateforme.
        </p>
      </div>

      {(error || actionError) && (
        <div className="mb-6">
          <Alert variant="error">{error || actionError}</Alert>
        </div>
      )}

      {pendingVerificationCount > 0 && activeTab !== 'verification' && (
        <div className="mb-6">
        <Alert variant="warning">
          <p className="font-medium text-amber-900">
            {pendingVerificationCount} dossier{pendingVerificationCount > 1 ? 's' : ''} de vérification en attente
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Un propriétaire a soumis des documents. Examinez le café et les pièces jointes avant approbation.
          </p>
          <Link
            to={ROUTES.ADMIN_VERIFICATION()}
            className="mt-3 inline-flex text-sm font-semibold text-amber-900 underline hover:text-amber-950"
          >
            Ouvrir le centre de vérification →
          </Link>
        </Alert>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`nav-pill capitalize ${
              activeTab === tab ? 'nav-pill-active' : ''
            }`}
          >
            {tab === 'revenue'
              ? 'Revenus'
              : tab === 'matches'
                ? 'Matchs'
                : tab === 'competitions'
                  ? 'Compétitions'
                  : tab === 'verification'
                    ? (
                      <>
                        Vérification
                        {pendingVerificationCount > 0 && (
                          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                            {pendingVerificationCount}
                          </span>
                        )}
                      </>
                    )
                    : tab === 'businesses'
                      ? 'Établissements'
                      : tab}
          </button>
        ))}
      </div>

      {activeTab === 'revenue' && (
        revenueLoading ? (
          <Spinner label="Chargement des revenus..." />
        ) : revenue ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Réservations payées"
                value={revenue.totalPaidBookings}
              />
              <StatCard
                label="Revenu brut total"
                value={`${Number(revenue.totalGrossRevenue).toFixed(0)} ${revenue.currency}`}
              />
              <StatCard
                label={`Commission plateforme (${Math.round(Number(revenue.commissionRate) * 100)}%)`}
                value={`${Number(revenue.totalPlatformCommission).toFixed(2)} ${revenue.currency}`}
                hint="Vos revenus admin"
              />
              <StatCard
                label="Versé aux propriétaires (75%)"
                value={`${Number(revenue.totalOwnerPayouts).toFixed(2)} ${revenue.currency}`}
              />
            </div>

            <Card className="overflow-x-auto">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Dernières commissions (+25%)
              </h2>
              {(revenue.recentCommissions || []).length === 0 ? (
                <p className="text-sm text-gray-500">Aucun paiement enregistré.</p>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Établissement</th>
                      <th className="py-3 pr-4">Fan</th>
                      <th className="py-3 pr-4">Montant</th>
                      <th className="py-3 pr-4">Commission 25%</th>
                      <th className="py-3">Owner (75%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue.recentCommissions.map((entry) => (
                      <tr key={entry.paymentId} className="border-b">
                        <td className="py-3 pr-4">{formatDateTime(entry.paidAt)}</td>
                        <td className="py-3 pr-4">{entry.businessName}</td>
                        <td className="py-3 pr-4">{entry.fanName}</td>
                        <td className="py-3 pr-4">{Number(entry.grossAmount).toFixed(0)} MAD</td>
                        <td className="py-3 pr-4 font-medium text-amber-700">
                          +{Number(entry.platformFee).toFixed(2)} MAD
                        </td>
                        <td className="py-3">{Number(entry.ownerPayout).toFixed(2)} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
            <p className="text-sm text-gray-500">
              Les notifications de réservation et de commission apparaissent dans la cloche en haut à droite.
            </p>
          </div>
        ) : null
      )}

      {activeTab === 'competitions' && (
        <AdminCompetitionsPanel onError={setActionError} />
      )}

      {activeTab === 'matches' && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Jeu de démonstration (soutenance)</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Génère des matchs CDM 2026 et 2030 autour d&apos;aujourd&apos;hui : en direct,
                  à venir et terminés, utilisables dans le Match Center et les réservations.
                </p>
              </div>
              <Button type="button" onClick={handleSeedDemoMatches} disabled={seedingDemo}>
                {seedingDemo ? 'Chargement...' : 'Charger les matchs 2026 / 2030'}
              </Button>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingMatchId ? 'Modifier le match' : 'Créer un match'}
            </h2>
            <form onSubmit={handleSaveMatch} className="mt-4 grid gap-4 md:grid-cols-2">
              <select
                className="rounded-lg border border-gray-300 px-4 py-2 md:col-span-2"
                value={matchForm.competitionId}
                onChange={(e) => {
                  const selected = competitions.find((c) => String(c.id) === e.target.value);
                  setMatchForm({
                    ...matchForm,
                    competitionId: e.target.value,
                    competition: selected?.name || matchForm.competition,
                  });
                }}
              >
                <option value="">Compétition (liste admin)</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Input
                value={matchForm.competition}
                onChange={(e) => setMatchForm({ ...matchForm, competition: e.target.value })}
                placeholder="Nom compétition (si pas dans la liste)"
                required
              />
              <Input
                value={matchForm.groupName}
                onChange={(e) => setMatchForm({ ...matchForm, groupName: e.target.value })}
                placeholder="Groupe (ex. Groupe A)"
              />
              <Input
                value={matchForm.roundLabel}
                onChange={(e) => setMatchForm({ ...matchForm, roundLabel: e.target.value })}
                placeholder="Phase (ex. Phase de groupes)"
              />
              <select
                className="rounded-lg border border-gray-300 px-4 py-2"
                value={matchForm.status}
                onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
              >
                {MATCH_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {MATCH_STATUS_LABELS[s] || s}
                  </option>
                ))}
              </select>
              <Input
                value={matchForm.homeTeam}
                onChange={(e) => setMatchForm({ ...matchForm, homeTeam: e.target.value })}
                placeholder="Équipe domicile"
                required
              />
              <Input
                value={matchForm.awayTeam}
                onChange={(e) => setMatchForm({ ...matchForm, awayTeam: e.target.value })}
                placeholder="Équipe extérieur"
                required
              />
              <Input
                type="datetime-local"
                value={matchForm.matchDate}
                onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
                required
              />
              <Input
                value={matchForm.venueName}
                onChange={(e) => setMatchForm({ ...matchForm, venueName: e.target.value })}
                placeholder="Stade"
              />
              <Input
                value={matchForm.city}
                onChange={(e) => setMatchForm({ ...matchForm, city: e.target.value })}
                placeholder="Ville"
              />
              <Input
                type="number"
                min="0"
                value={matchForm.homeScore}
                onChange={(e) => setMatchForm({ ...matchForm, homeScore: e.target.value })}
                placeholder="Buts domicile"
              />
              <Input
                type="number"
                min="0"
                value={matchForm.awayScore}
                onChange={(e) => setMatchForm({ ...matchForm, awayScore: e.target.value })}
                placeholder="Buts extérieur"
              />
              <Input
                type="number"
                min="0"
                max="120"
                value={matchForm.matchMinute}
                onChange={(e) => setMatchForm({ ...matchForm, matchMinute: e.target.value })}
                placeholder="Minute (si en direct)"
              />
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button type="submit" disabled={savingMatch}>
                  {savingMatch
                    ? 'Enregistrement...'
                    : editingMatchId
                      ? 'Mettre à jour'
                      : 'Créer le match'}
                </Button>
                {editingMatchId && (
                  <Button type="button" variant="secondary" onClick={resetMatchForm}>
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {matchesLoading ? (
            <Spinner label="Chargement des matchs..." />
          ) : (
            <Card className="overflow-x-auto">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Tous les matchs ({matches.length})
              </h2>
              {matches.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun match programmé.</p>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-3 pr-4">Compétition</th>
                      <th className="py-3 pr-4">Groupe</th>
                      <th className="py-3 pr-4">Match</th>
                      <th className="py-3 pr-4">Score</th>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Lieu</th>
                      <th className="py-3 pr-4">Statut</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => (
                      <tr key={match.id} className="border-b">
                        <td className="py-3 pr-4">{match.competitionName || match.competition}</td>
                        <td className="py-3 pr-4">{match.groupName || '—'}</td>
                        <td className="py-3 pr-4 font-medium">
                          {match.homeTeam} vs {match.awayTeam}
                        </td>
                        <td className="py-3 pr-4">
                          {match.homeScore != null ? `${match.homeScore} - ${match.awayScore}` : '—'}
                        </td>
                        <td className="py-3 pr-4">{formatDateTime(match.matchDate)}</td>
                        <td className="py-3 pr-4">
                          {match.venueName || '—'}
                          {match.city && (
                            <span className="text-gray-500">, {match.city}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              match.status === 'SCHEDULED'
                                ? 'bg-primary-50 text-primary-800'
                                : match.status === 'LIVE'
                                  ? 'bg-red-50 text-red-700'
                                  : match.status === 'CANCELLED'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-green-50 text-green-800'
                            }`}
                          >
                            {MATCH_STATUS_LABELS[match.status] || match.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => handleEditMatch(match)}>
                              Modifier
                            </Button>
                            <Button variant="danger" onClick={() => handleDeleteMatch(match.id)}>
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'statistics' && stats && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total users" value={stats.totalUsers} />
            <StatCard label="Total cafés" value={stats.totalCafes} hint={`${stats.activeCafes} active`} />
            <StatCard label="Total reservations" value={stats.totalReservations} />
            <StatCard
              label="Confirmed"
              value={stats.confirmedReservations}
              hint={`${stats.pendingReservations} pending · ${stats.cancelledReservations} cancelled`}
            />
          </div>
          <AdminGlobalAnalyticsPanel />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900">Create user</h2>
            <form onSubmit={handleCreateUser} className="mt-4 grid gap-4 md:grid-cols-2">
              <Input value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} placeholder="First name" required />
              <Input value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} placeholder="Last name" required />
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" required />
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" required />
              <select
                className="rounded-lg border border-gray-300 px-4 py-2"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="FAN_USER">Fan</option>
                <option value="BUSINESS_OWNER">Business owner</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button type="submit">Create user</Button>
            </form>
          </Card>

          <Card className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 pr-4">{user.firstName} {user.lastName}</td>
                    <td className="py-3 pr-4">{user.email}</td>
                    <td className="py-3 pr-4">{user.role}</td>
                    <td className="py-3 pr-4">{user.enabled ? 'Active' : 'Disabled'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => handleToggleUser(user)}>
                          {user.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'verification' && (
        <AdminVerificationPanel
          initialBusinessId={verificationBusinessId}
          onPendingCountChange={setPendingVerificationCount}
        />
      )}

      {activeTab === 'businesses' && (
        <div className="space-y-6">
          {businessesLoading ? (
            <Spinner label="Loading businesses..." />
          ) : (
            <>
              <Card>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending approval ({pendingBusinesses.length})
                </h2>
                {pendingBusinesses.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">No businesses awaiting review.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {pendingBusinesses.map((business) => (
                      <div
                        key={business.id}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{business.name}</p>
                            <p className="text-sm text-gray-600">
                              {business.businessType} · {business.city} · {business.totalCapacity} seats
                            </p>
                          </div>
                          <BusinessStatusBadge status={business.status} />
                        </div>

                        {rejectingId === business.id ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Input
                              className="min-w-[240px] flex-1"
                              placeholder="Rejection reason"
                              value={rejectReason[business.id] || ''}
                              onChange={(e) =>
                                setRejectReason((prev) => ({
                                  ...prev,
                                  [business.id]: e.target.value,
                                }))
                              }
                            />
                            <Button variant="danger" onClick={() => handleRejectBusiness(business.id)}>
                              Confirm reject
                            </Button>
                            <Button variant="secondary" onClick={() => setRejectingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-4 flex gap-2">
                            <Button onClick={() => handleApproveBusiness(business.id)}>
                              Approve
                            </Button>
                            <Button variant="danger" onClick={() => setRejectingId(business.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="overflow-x-auto">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">All businesses</h2>
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">City</th>
                      <th className="py-3 pr-4">Capacity</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((business) => (
                      <tr key={business.id} className="border-b">
                        <td className="py-3 pr-4">{business.name}</td>
                        <td className="py-3 pr-4">{business.businessType}</td>
                        <td className="py-3 pr-4">{business.city}</td>
                        <td className="py-3 pr-4">{business.totalCapacity}</td>
                        <td className="py-3 pr-4">
                          <BusinessStatusBadge status={business.status} />
                        </td>
                        <td className="py-3">
                          {business.status === 'APPROVED' && (
                            <Button variant="danger" onClick={() => handleDisableBusiness(business.id)}>
                              Disable
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'cafes' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900">Create café</h2>
            <form onSubmit={handleCreateCafe} className="mt-4 grid gap-4 md:grid-cols-2">
              <Input value={newCafe.name} onChange={(e) => setNewCafe({ ...newCafe, name: e.target.value })} placeholder="Name" required />
              <Input value={newCafe.city} onChange={(e) => setNewCafe({ ...newCafe, city: e.target.value })} placeholder="City" required />
              <Input value={newCafe.address} onChange={(e) => setNewCafe({ ...newCafe, address: e.target.value })} placeholder="Address" required />
              <Input type="number" value={newCafe.capacity} onChange={(e) => setNewCafe({ ...newCafe, capacity: e.target.value })} placeholder="Capacity" required />
              <textarea
                className="md:col-span-2 w-full rounded-lg border border-gray-300 px-4 py-2"
                rows={3}
                value={newCafe.description}
                onChange={(e) => setNewCafe({ ...newCafe, description: e.target.value })}
                placeholder="Description"
                required
              />
              <Button type="submit">Create café</Button>
            </form>
          </Card>

          <Card className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">City</th>
                  <th className="py-3 pr-4">Capacity</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cafes.map((cafe) => (
                  <tr key={cafe.id} className="border-b">
                    <td className="py-3 pr-4">{cafe.name}</td>
                    <td className="py-3 pr-4">{cafe.city}</td>
                    <td className="py-3 pr-4">{cafe.capacity}</td>
                    <td className="py-3 pr-4">{cafe.active ? 'Active' : 'Inactive'}</td>
                    <td className="py-3">
                      <Button variant="secondary" onClick={() => handleToggleCafe(cafe)}>
                        {cafe.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'reservations' && (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Café</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Party</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-b">
                  <td className="py-3 pr-4">
                    <div>{reservation.userFullName}</div>
                    <div className="text-xs text-gray-500">{reservation.userEmail}</div>
                  </td>
                  <td className="py-3 pr-4">{reservation.cafeName}</td>
                  <td className="py-3 pr-4">{formatDateTime(reservation.reservationDateTime)}</td>
                  <td className="py-3 pr-4">{reservation.partySize}</td>
                  <td className="py-3 pr-4">{reservation.status}</td>
                  <td className="py-3">
                    {reservation.status !== 'CANCELLED' && (
                      <Button variant="danger" onClick={() => handleCancelReservation(reservation.id)}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}