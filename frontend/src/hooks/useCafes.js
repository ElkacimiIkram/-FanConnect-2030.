import { useCallback, useEffect, useState } from 'react';
import { cafeApi } from '../api/cafeApi';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { toDateTimeLocalValue } from '../utils/formatDate';

export function useCafes({ query = '', city = '' } = {}) {
  const [cafes, setCafes] = useState([]);
  const [occupancyMap, setOccupancyMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCafes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const hasFilters = query.trim() || city.trim();
      const cafesResponse = hasFilters
        ? await cafeApi.search({ q: query || undefined, city: city || undefined })
        : await cafeApi.getAll();

      const cafeList = getApiData(cafesResponse) || [];
      setCafes(cafeList);

      const dateTime = toDateTimeLocalValue(new Date());
      const occupancyResponse = await cafeApi.getAllOccupancy(dateTime);
      const occupancyList = getApiData(occupancyResponse) || [];

      const map = occupancyList.reduce((acc, item) => {
        acc[item.cafeId] = item;
        return acc;
      }, {});

      setOccupancyMap(map);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [query, city]);

  useEffect(() => {
    loadCafes();
  }, [loadCafes]);

  return { cafes, occupancyMap, loading, error, reload: loadCafes };
}