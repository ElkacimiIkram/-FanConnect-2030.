import api from './axios';

export const businessApi = {
  list: (params) => api.get('/businesses', { params }),
  getById: (id) => api.get(`/businesses/${id}`),
  allOccupancy: (matchId) => api.get('/businesses/occupancy', { params: { matchId } }),
  occupancy: (businessId, matchId) =>
    api.get(`/businesses/${businessId}/occupancy`, { params: { matchId } }),
  getOccupancyIntelligence: (businessId, matchId) =>
    api.get(`/businesses/${businessId}/occupancy/intelligence`, { params: { matchId } }),
};