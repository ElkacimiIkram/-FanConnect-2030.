import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiData, getApiError } from '../utils/apiHelpers';

export function useAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getCafes(),
        adminApi.getReservations(),
      ]);

      const labels = ['statistics', 'users', 'cafés', 'reservations'];
      const errors = [];

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          errors.push(`${labels[index]}: ${getApiError(result.reason)}`);
          return;
        }

        const data = getApiData(result.value);
        switch (index) {
          case 0:
            setStats(data);
            break;
          case 1:
            setUsers(data || []);
            break;
          case 2:
            setCafes(data || []);
            break;
          case 3:
            setReservations(data || []);
            break;
          default:
            break;
        }
      });

      if (errors.length > 0) {
        setError(errors.join(' · '));
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    stats,
    users,
    cafes,
    reservations,
    loading,
    error,
    reload: loadAll,
  };
}