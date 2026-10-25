import { useCallback, useEffect, useState } from 'react';
import { businessApi } from '../api/businessApi';
import { getApiData, getApiError } from '../utils/apiHelpers';

export function useBusinessOccupancy(matchId) {
  const [occupancyMap, setOccupancyMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!matchId) {
      setOccupancyMap({});
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await businessApi.allOccupancy(matchId);
      const list = getApiData(response) || [];
      const map = list.reduce((acc, item) => {
        acc[item.businessId] = item;
        return acc;
      }, {});
      setOccupancyMap(map);
    } catch (err) {
      setError(getApiError(err));
      setOccupancyMap({});
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
    if (!matchId) return undefined;

    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load, matchId]);

  return { occupancyMap, loading, error, reload: load };
}