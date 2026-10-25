import { useCallback, useEffect, useState } from 'react';
import { matchApi } from '../../api/matchApi';
import { ownerApi } from '../../api/ownerApi';
import OccupancyBadge from '../business/OccupancyBadge';
import OccupancyBar from '../business/OccupancyBar';
import OccupancyIntelligencePanel from '../occupancy/OccupancyIntelligencePanel';
import { useOccupancyIntelligence } from '../../hooks/useOccupancyIntelligence';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { getOccupancyLevel } from '../../utils/occupancy';

export default function OwnerLiveOccupancyPanel({ businessId, capacity = 0, refreshKey = 0 }) {
  const [matches, setMatches] = useState([]);
  const [matchId, setMatchId] = useState('');
  const [count, setCount] = useState(0);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { intelligence, loading: intelligenceLoading, error: intelligenceError, reload: reloadIntelligence } =
    useOccupancyIntelligence(businessId, matchId ? Number(matchId) : null);

  const loadMatches = useCallback(async () => {
    try {
      const response = await matchApi.listUpcoming();
      const list = getApiData(response) || [];
      setMatches(list);
      if (list.length > 0) {
        setMatchId((current) => current || String(list[0].id));
      }
    } catch {
      setMatches([]);
    }
  }, []);

  const loadLive = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      const response = await ownerApi.getLiveOccupancy(
        businessId,
        matchId ? Number(matchId) : undefined
      );
      const data = getApiData(response);
      setLive(data);
      setCount(data?.currentCustomers ?? 0);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [businessId, matchId, refreshKey]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await ownerApi.updateLiveOccupancy(businessId, {
        matchId: matchId ? Number(matchId) : null,
        currentCustomers: Number(count),
      });
      setLive(getApiData(response));
      reloadIntelligence();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!businessId) {
    return (
      <Card>
        <p className="text-ink-muted">Sélectionnez un établissement approuvé.</p>
      </Card>
    );
  }

  const cap = live?.capacity || capacity || 1;
  const manualPercent = cap > 0 ? Math.min(100, Math.round((count / cap) * 1000) / 10) : 0;
  const manualLevel = getOccupancyLevel(manualPercent);
  const effectivePercent = live?.effectiveOccupancyPercentage ?? manualPercent;
  const effectiveLevel = live?.effectiveLevel ?? manualLevel;
  const effectiveCount = live?.effectiveOccupancy ?? count;

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-ink">Affluence en direct</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Indiquez le nombre réel de clients présents. L&apos;affluence affichée aux fans combine
          votre décompte, les check-ins QR et les réservations confirmées.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <label className="block text-sm font-semibold text-ink">
        Match
        <select
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="select-arena mt-2"
        >
          <option value="">Sans match spécifique</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.homeTeam} vs {m.awayTeam}
            </option>
          ))}
        </select>
      </label>

      {!matchId && (
        <Alert variant="info">
          Sélectionnez un match pour voir l&apos;affluence réelle combinée et la prédiction IA.
        </Alert>
      )}

      {loading ? (
        <Spinner label="Chargement..." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="btn-arena-outline h-12 w-12 text-xl"
              onClick={() => setCount((c) => Math.max(0, c - 10))}
            >
              −10
            </button>
            <div className="text-center">
              <input
                type="number"
                min={0}
                max={cap}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="input-arena w-32 text-center font-display text-2xl font-bold"
              />
              <p className="mt-1 text-xs text-ink-faint">clients présents / {cap} places</p>
            </div>
            <button
              type="button"
              className="btn-arena-outline h-12 w-12 text-xl"
              onClick={() => setCount((c) => Math.min(cap, c + 10))}
            >
              +10
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <OccupancyBadge level={manualLevel} percentage={manualPercent} />
            {!live?.fresh && live?.reportedAt && (
              <span className="text-xs text-amber-700">
                Dernière mise à jour il y a plus de 15 min — actualisez
              </span>
            )}
            {live?.fresh && (
              <span className="text-xs text-primary-700">● En direct</span>
            )}
          </div>

          <OccupancyBar
            occupancy={{
              level: manualLevel,
              occupancyPercentage: manualPercent,
              bookedSeats: count,
              capacity: cap,
            }}
          />

          {matchId && live?.breakdown && (
            <div className="space-y-4 rounded-xl border border-surface-border bg-surface-muted/40 p-4">
              <div>
                <h3 className="font-semibold text-ink">Affluence réelle (affichée aux fans)</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Combine votre décompte physique et les signaux de réservation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <OccupancyBadge level={effectiveLevel} percentage={effectivePercent} />
                <span className="text-sm font-semibold text-ink">
                  {effectiveCount} / {cap} places
                </span>
              </div>
              <OccupancyBar
                occupancy={{
                  level: effectiveLevel,
                  occupancyPercentage: effectivePercent,
                  bookedSeats: effectiveCount,
                  capacity: cap,
                }}
              />
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-2 rounded-lg bg-surface-card px-3 py-2">
                  <dt className="text-ink-faint">Check-in QR</dt>
                  <dd className="font-semibold text-ink">{live.checkedInSeats ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2 rounded-lg bg-surface-card px-3 py-2">
                  <dt className="text-ink-faint">Confirmées (pas encore arrivées)</dt>
                  <dd className="font-semibold text-ink">{live.confirmedNotCheckedIn ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2 rounded-lg bg-surface-card px-3 py-2">
                  <dt className="text-ink-faint">En attente de paiement</dt>
                  <dd className="font-semibold text-ink">{live.pendingReservations ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2 rounded-lg bg-surface-card px-3 py-2">
                  <dt className="text-ink-faint">Réservations app seules</dt>
                  <dd className="font-semibold text-ink">{live.reservationOnlyEstimate ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2 rounded-lg bg-surface-card px-3 py-2 sm:col-span-2">
                  <dt className="text-ink-faint">Clients sans réservation (walk-in estimé)</dt>
                  <dd className="font-semibold text-ink">{live.walkInEstimate ?? 0}</dd>
                </div>
              </dl>
              {matchId && (
                <OccupancyIntelligencePanel
                  intelligence={intelligence}
                  loading={intelligenceLoading}
                  error={intelligenceError}
                />
              )}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Publier l\'affluence'}
          </Button>
        </>
      )}
    </Card>
  );
}