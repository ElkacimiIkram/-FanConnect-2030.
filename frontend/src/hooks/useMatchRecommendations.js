import { useCallback, useEffect, useState } from 'react';
import { recommendationApi } from '../api/recommendationApi';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { requestUserLocation } from '../utils/geolocation';

export function useMatchRecommendations(matchId, { autoLocate = true, limit = 10 } = {}) {
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const load = useCallback(async (lat, lng) => {
    if (!matchId) {
      setData(null);
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await recommendationApi.forMatch(matchId, { lat, lng, limit });
      const payload = getApiData(response);
      setData(payload);
      setRecommendations(payload?.recommendations || []);
      setGeoEnabled(Boolean(payload?.geoEnabled));
    } catch (err) {
      setError(getApiError(err));
      setData(null);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [matchId, limit]);

  useEffect(() => {
    if (!matchId) return undefined;

    let cancelled = false;

    const init = async () => {
      if (autoLocate) {
        try {
          const { lat, lng } = await requestUserLocation();
          if (!cancelled) {
            setCoords({ lat, lng });
            await load(lat, lng);
          }
          return;
        } catch {
          /* fall through without geo */
        }
      }
      if (!cancelled) {
        setCoords({ lat: null, lng: null });
        await load(null, null);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [matchId, autoLocate, load]);

  const refreshWithLocation = useCallback(async () => {
    try {
      const { lat, lng } = await requestUserLocation();
      setCoords({ lat, lng });
      await load(lat, lng);
    } catch (err) {
      setError(err.message);
    }
  }, [load]);

  return {
    data,
    recommendations,
    loading,
    error,
    geoEnabled,
    coords,
    refreshWithLocation,
    reload: () => load(coords.lat, coords.lng),
  };
}