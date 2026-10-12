import api from './client';

export const noticeApi = {
  getAllNotices: async () => {
    const response = await api.get('/notices');
    return response.data;
  },

  createNotice: async (data) => {
    const response = await api.post('/notices', data);
    return response.data;
  },

  updateNotice: async (id, data) => {
    const response = await api.put(`/notices/${id}`, data);
    return response.data;
  },

  deleteNotice: async (id) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  },
};
