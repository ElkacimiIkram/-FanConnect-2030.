import api from './axios';

export const competitionApi = {
  list: () => api.get('/competitions'),
  matchCenter: () => api.get('/competitions/match-center'),
};