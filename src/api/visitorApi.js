import api from './client';

export const visitorApi = {
  createVisitorRequest: async (data) => {
    const response = await api.post('/visitors', data);
    return response.data;
  },

  getMyVisitors: async () => {
    const response = await api.get('/visitors/me');
    return response.data;
  },

  getAllVisitors: async (page = 0, size = 10) => {
    const response = await api.get(`/visitors?page=${page}&size=${size}`);
    return response.data;
  },

  updateVisitorStatus: async (id, status) => {
    const response = await api.put(`/visitors/${id}`, { status });
    return response.data;
  },
};
