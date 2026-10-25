import { useCallback, useEffect, useMemo, useState } from 'react';
import { businessApi } from '../api/businessApi';
import { getApiData, getApiError } from '../utils/apiHelpers';

/**
 * Loads occupancy for all match IDs present in the fan's bookings.
 * Returns nested map: occupancyByMatch[matchId][businessId] = occupancy
 */
export function useFanBookingOccupancy(bookings) {
  const [occupancyByMatch, setOccupancyByMatch] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const matchIds = useMemo(() => {
    const ids = new Set();
    (bookings || []).forEach((b) => {
      if (b.matchId) ids.add(b.matchId);
    });
    return [...ids];
  }, [bookings]);

  const load = useCallback(async () => {
    if (matchIds.length === 0) {
      setOccupancyByMatch({});
      return;
    }

    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        matchIds.map(async (matchId) => {
          const response = await businessApi.allOccupancy(matchId);
          const list = getApiData(response) || [];
          const map = list.reduce((acc, item) => {
            acc[item.businessId] = item;
            return acc;
          }, {});
          return [matchId, map];
        })
      );
      setOccupancyByMatch(Object.fromEntries(results));
    } catch (err) {
      setError(getApiError(err));
      setOccupancyByMatch({});
    } finally {
      setLoading(false);
    }
  }, [matchIds]);

  useEffect(() => {
    load();
    if (matchIds.length === 0) return undefined;
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load, matchIds.length]);

  const getOccupancy = useCallback(
    (matchId, businessId) => occupancyByMatch[matchId]?.[businessId] ?? null,
    [occupancyByMatch]
  );

  return { occupancyByMatch, getOccupancy, loading, error, reload: load };
}