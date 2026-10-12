import api from './client';

export const paymentApi = {
  recordPayment: async (data) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  getAllPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getMyPayments: async () => {
    const response = await api.get('/payments/me');
    return response.data;
  },

  getHostellerPayments: async (hostellerId) => {
    const response = await api.get(`/payments/hosteller/${hostellerId}`);
    return response.data;
  },

  getMonthlyPayments: async (year, month) => {
    const response = await api.get(`/payments/monthly?year=${year}&month=${month}`);
    return response.data;
  },
};
