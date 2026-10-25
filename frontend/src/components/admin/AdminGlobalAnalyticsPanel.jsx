import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import BarChart from '../charts/BarChart';
import Alert from '../ui/Alert';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';

const HEAT_STYLES = {
  HOT: 'fc-heatmap-cell--hot',
  WARM: 'fc-heatmap-cell--warm',
  COOL: 'fc-heatmap-cell--cool',
};

const HEAT_LABELS = {
  HOT: 'Fort',
  WARM: 'Modéré',
  COOL: 'Calme',
};

export default function AdminGlobalAnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getGlobalAnalytics();
      setAnalytics(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const topVenueChart = useMemo(
    () =>
      (analytics?.topVenues || []).map((v) => ({
        label: `${v.name} (${v.city})`,
        value: v.reservationCount,
      })),
    [analytics]
  );

  const cityReservationChart = useMemo(
    () =>
      (analytics?.cityHeatmap || []).slice(0, 8).map((c) => ({
        label: c.city,
        value: c.reservationCount,
      })),
    [analytics]
  );

  if (loading) return <Spinner label="Chargement des analytics globales..." />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-bold text-ink">Carte thermique par ville</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Activité des réservations et occupation moyenne sur 30 jours.
        </p>
        {(analytics.cityHeatmap || []).length === 0 ? (
          <p className="mt-4 text-sm text-ink-faint">Aucune donnée ville pour le moment.</p>
        ) : (
          <div className="fc-heatmap-grid mt-5">
            {analytics.cityHeatmap.map((city) => (
              <div
                key={city.city}
                className={`fc-heatmap-cell ${HEAT_STYLES[city.heatLevel] || HEAT_STYLES.COOL}`}
              >
                <p className="font-display font-bold text-ink">{city.city}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {city.venueCount} lieu{city.venueCount > 1 ? 'x' : ''} · {city.reservationCount} résa.
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {city.averageOccupancyPct}% occ.
                </p>
                <span className="fc-heatmap-cell__badge">
                  {HEAT_LABELS[city.heatLevel] || city.heatLevel}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-bold text-ink">Matchs les plus réservés</h2>
          {(analytics.popularMatches || []).length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">Aucune réservation liée à un match.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analytics.popularMatches.map((match, index) => (
                <li
                  key={match.matchId}
                  className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-muted/50 px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600/20 text-sm font-bold text-primary-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    <p className="text-xs text-ink-faint">{match.competition}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-ink">{match.reservationCount}</p>
                    <p className="text-xs text-ink-faint">{match.totalPartySize} places</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold text-ink">Top établissements</h2>
          <div className="mt-4">
            <BarChart data={topVenueChart} color="gold" suffix=" résa." />
          </div>
        </Card>
      </div>

      {cityReservationChart.length > 0 && (
        <Card>
          <h2 className="font-display text-lg font-bold text-ink">Réservations par ville</h2>
          <div className="mt-4">
            <BarChart data={cityReservationChart} color="primary" suffix=" résa." />
          </div>
        </Card>
      )}
    </div>
  );
}