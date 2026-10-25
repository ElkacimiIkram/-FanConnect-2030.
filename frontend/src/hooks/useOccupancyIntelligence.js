import { useCallback, useEffect, useState } from 'react';
import { businessApi } from '../api/businessApi';
import { getApiData, getApiError } from '../utils/apiHelpers';

export function useOccupancyIntelligence(businessId, matchId) {
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!businessId || !matchId) {
      setIntelligence(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await businessApi.getOccupancyIntelligence(businessId, matchId);
      setIntelligence(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
      setIntelligence(null);
    } finally {
      setLoading(false);
    }
  }, [businessId, matchId]);

  useEffect(() => {
    load();
  }, [load]);

  return { intelligence, loading, error, reload: load };
}