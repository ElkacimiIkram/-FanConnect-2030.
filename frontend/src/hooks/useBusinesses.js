import { useCallback, useEffect, useState } from 'react';
import { businessApi } from '../api/businessApi';
import { getApiData, getApiError } from '../utils/apiHelpers';

export function useBusinesses({ query = '', city = '', lat = null, lng = null, radiusKm = null } = {}) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (query.trim()) params.query = query.trim();
      if (city.trim()) params.city = city.trim();
      if (lat != null && lng != null) {
        params.lat = lat;
        params.lng = lng;
        if (radiusKm != null) params.radiusKm = radiusKm;
      }

      const response = await businessApi.list(params);
      setBusinesses(getApiData(response) || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [query, city, lat, lng, radiusKm]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  return { businesses, loading, error, reload: loadBusinesses };
}