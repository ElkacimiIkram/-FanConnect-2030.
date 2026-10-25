import api from './axios';

export const recommendationApi = {
  forMatch: (matchId, { lat, lng, limit } = {}) =>
    api.get(`/recommendations/match/${matchId}`, {
      params: { lat, lng, limit },
    }),
};