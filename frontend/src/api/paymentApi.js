import api from './axios';

export const paymentApi = {
  getConfig: () => api.get('/payments/config'),
};