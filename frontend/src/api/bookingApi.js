import api from './axios';

export const bookingApi = {
  list: () => api.get('/fan/bookings'),
  getById: (id) => api.get(`/fan/bookings/${id}`),
  cancel: (id) => api.delete(`/fan/bookings/${id}`),
  getTables: (params) => api.get('/fan/bookings/tables', { params }),
  create: (data) => api.post('/fan/bookings', data),
  createPaymentIntent: (id) => api.post(`/fan/bookings/${id}/payment-intent`),
  pay: (id, data = {}) => api.post(`/fan/bookings/${id}/pay`, data),
  getTicket: (id) => api.get(`/fan/bookings/${id}/ticket`),
  downloadTicketPdf: (id) =>
    api.get(`/fan/bookings/${id}/ticket/pdf`, { responseType: 'blob' }),
};