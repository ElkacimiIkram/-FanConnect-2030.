import { useCallback, useEffect, useState } from 'react';
import { bookingApi } from '../api/bookingApi';
import { getApiData, getApiError } from '../utils/apiHelpers';

export function useFanBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingApi.list();
      setBookings(getApiData(response) || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = async (id) => {
    await bookingApi.cancel(id);
    await loadBookings();
  };

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return { bookings, loading, error, reload: loadBookings, cancelBooking };
}