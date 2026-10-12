import api from './client';

export const complaintApi = {
  createComplaint: async (data) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  getMyComplaints: async () => {
    const response = await api.get('/complaints/me');
    return response.data;
  },

  getAllComplaints: async (page = 0, size = 10) => {
    const response = await api.get(`/complaints?page=${page}&size=${size}`);
    return response.data;
  },

  updateComplaintStatus: async (id, data) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};
