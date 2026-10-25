import api from './axios';

export const cafeApi = {
  getAll: () => api.get('/cafes'),
  getById: (id) => api.get(`/cafes/${id}`),
  search: (params) => api.get('/cafes/search', { params }),
  getOccupancy: (id, dateTime) =>
    api.get(`/cafes/${id}/occupancy`, { params: { dateTime } }),
  getAllOccupancy: (dateTime) =>
    api.get('/cafes/occupancy', { params: { dateTime } }),
  create: (data) => api.post('/cafes', data),
  update: (id, data) => api.put(`/cafes/${id}`, data),
  delete: (id) => api.delete(`/cafes/${id}`),
};