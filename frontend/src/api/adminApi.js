import api from './axios';

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getGlobalAnalytics: () => api.get('/admin/analytics/global'),
  getRevenue: () => api.get('/admin/revenue'),
  getMatches: () => api.get('/admin/matches'),
  createMatch: (data) => api.post('/admin/matches', data),
  updateMatch: (id, data) => api.put(`/admin/matches/${id}`, data),
  deleteMatch: (id) => api.delete(`/admin/matches/${id}`),
  getCompetitions: () => api.get('/admin/competitions'),
  createCompetition: (data) => api.post('/admin/competitions', data),
  updateCompetition: (id, data) => api.put(`/admin/competitions/${id}`, data),
  deleteCompetition: (id) => api.delete(`/admin/competitions/${id}`),
  syncCompetition: (id) => api.post(`/admin/competitions/${id}/sync`),
  syncAllCompetitions: () => api.post('/admin/competitions/sync-all'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCafes: () => api.get('/admin/cafes'),
  getBusinesses: () => api.get('/admin/businesses'),
  getPendingBusinesses: () => api.get('/admin/businesses/pending'),
  approveBusiness: (id) => api.put(`/admin/businesses/${id}/approve`),
  rejectBusiness: (id, reason) => api.put(`/admin/businesses/${id}/reject`, { reason }),
  disableBusiness: (id) => api.put(`/admin/businesses/${id}/disable`),

  getPendingVerifications: () => api.get('/admin/verifications/pending'),
  getVerificationDetail: (businessId) => api.get(`/admin/verifications/${businessId}`),
  approveVerification: (businessId) => api.put(`/admin/verifications/${businessId}/approve`),
  rejectVerification: (businessId, reason) =>
    api.put(`/admin/verifications/${businessId}/reject`, { reason }),
  fetchVerificationDocument: (businessId, documentId) =>
    api.get(`/admin/verifications/${businessId}/documents/${documentId}/file`, {
      responseType: 'blob',
    }),
  getReservations: () => api.get('/admin/reservations'),
  updateReservationStatus: (id, status) =>
    api.put(`/admin/reservations/${id}/status`, { status }),
  cancelReservation: (id) => api.delete(`/admin/reservations/${id}`),
};