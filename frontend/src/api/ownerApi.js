import api from './axios';

export const ownerApi = {
  listBusinesses: () => api.get('/owner/businesses'),
  getBusiness: (id) => api.get(`/owner/businesses/${id}`),
  submitBusiness: (data) => api.post('/owner/businesses', data),
  updateBusiness: (id, data) => api.put(`/owner/businesses/${id}`, data),
  getRevenue: () => api.get('/owner/revenue'),
  getReservations: () => api.get('/owner/reservations'),
  verifyTicket: (ticketCode) => api.post('/owner/tickets/verify', { ticketCode }),
  checkInTicket: (ticketCode) => api.post('/owner/tickets/check-in', { ticketCode }),

  getVerificationStatus: (businessId) =>
    api.get(`/owner/businesses/${businessId}/verification`),
  uploadVerificationDocument: (businessId, type, file) => {
    const form = new FormData();
    form.append('type', type);
    form.append('file', file);
    return api.post(`/owner/businesses/${businessId}/verification/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteVerificationDocument: (businessId, documentId) =>
    api.delete(`/owner/businesses/${businessId}/verification/documents/${documentId}`),
  submitVerification: (businessId) =>
    api.post(`/owner/businesses/${businessId}/verification/submit`),
  fetchVerificationDocument: (businessId, documentId) =>
    api.get(`/owner/businesses/${businessId}/verification/documents/${documentId}/file`, {
      responseType: 'blob',
    }),

  updateLiveOccupancy: (businessId, data) =>
    api.put(`/owner/businesses/${businessId}/occupancy/live`, data),
  getLiveOccupancy: (businessId, matchId) =>
    api.get(`/owner/businesses/${businessId}/occupancy/live`, {
      params: matchId ? { matchId } : {},
    }),
  getOccupancyAnalytics: (businessId) =>
    api.get(`/owner/businesses/${businessId}/occupancy/analytics`),
};