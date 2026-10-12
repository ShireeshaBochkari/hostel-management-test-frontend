import api from './client';

export const hostellerApi = {
  getAllHostellers: async (page = 0, size = 10) => {
    const response = await api.get(`/hostellers?page=${page}&size=${size}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/hostellers/me');
    return response.data;
  },

  updateMyProfile: async (data) => {
    const response = await api.put('/hostellers/me', data);
    return response.data;
  },

  updateHosteller: async (id, data) => {
    const response = await api.put(`/hostellers/${id}`, data);
    return response.data;
  },

  deleteHosteller: async (id) => {
    const response = await api.delete(`/hostellers/${id}`);
    return response.data;
  },
};
