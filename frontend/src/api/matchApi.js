import api from './axios';

export const matchApi = {
  listUpcoming: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  matchCenter: () => api.get('/competitions/match-center'),
  liveFeed: ({ date, nav, status, sort, refresh } = {}) =>
    api.get('/competitions/live-feed', { params: { date, nav, status, sort, refresh } }),
  calendar: ({ month, nav, selectedDate } = {}) =>
    api.get('/competitions/calendar', { params: { month, nav, selectedDate } }),
  navigation: () => api.get('/competitions/navigation'),
  standings: (code) => api.get(`/competitions/${code}/standings`),
  teams: (nav) => api.get('/competitions/teams', { params: { nav } }),
  seedDemo: () => api.get('/competitions/demo/seed'),
  liveDetail: (externalId) => api.get(`/matches/live/${externalId}`),
  localDetail: (localId) => api.get(`/matches/detail/${localId}`),
  venues: (matchId, { lat, lng, limit } = {}) =>
    api.get(`/matches/${matchId}/venues`, { params: { lat, lng, limit } }),
};