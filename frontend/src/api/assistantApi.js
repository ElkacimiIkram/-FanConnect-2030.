import api from './axios';

export const assistantApi = {
  suggestions: () => api.get('/assistant/suggestions'),
  chat: (payload) => api.post('/assistant/chat', payload),
};
