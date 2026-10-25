import { useCallback, useEffect, useMemo, useState } from 'react';
import { ownerApi } from '../../api/ownerApi';
import BarChart from '../charts/BarChart';
import Alert from '../ui/Alert';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';

export default function OwnerOccupancyAnalyticsPanel({ businessId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      const response = await ownerApi.getOccupancyAnalytics(businessId);
      setAnalytics(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const weeklyChart = useMemo(
    () =>
      (analytics?.weeklyTrend || []).map((point) => ({
        label: point.date,
        value: point.averagePercent,
      })),
    [analytics]
  );

  const peakHoursChart = useMemo(
    () =>
      (analytics?.peakHours || []).map((h) => ({
        label: `${h.hour}h`,
        value: h.averagePercent,
      })),
    [analytics]
  );

  if (!businessId) {
    return (
      <Card>
        <p className="text-ink-muted">Sélectionnez un établissement approuvé.</p>
      </Card>
    );
  }

  if (loading) return <Spinner label="Chargement des statistiques..." />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="stat-pill text-center">
          <p className="stat-pill-value">{analytics.currentOccupancyPercent}%</p>
          <p className="stat-pill-label">Actuel</p>
        </Card>
        <Card className="stat-pill text-center">
          <p className="stat-pill-value">{analytics.weeklyAveragePercent}%</p>
          <p className="stat-pill-label">Moyenne 7 jours</p>
        </Card>
        <Card className="stat-pill text-center">
          <p className="stat-pill-value">{analytics.monthlyAveragePercent}%</p>
          <p className="stat-pill-label">Moyenne 30 jours</p>
        </Card>
      </div>

      {weeklyChart.length > 0 && (
        <Card>
          <h3 className="font-display font-bold text-ink">Tendance hebdomadaire</h3>
          <div className="mt-4">
            <BarChart data={weeklyChart} suffix="%" maxValue={100} color="primary" />
          </div>
        </Card>
      )}

      {peakHoursChart.length > 0 && (
        <Card>
          <h3 className="font-display font-bold text-ink">Heures de pointe</h3>
          <div className="mt-4">
            <BarChart data={peakHoursChart} suffix="%" maxValue={100} color="accent" />
          </div>
        </Card>
      )}
    </div>
  );
}