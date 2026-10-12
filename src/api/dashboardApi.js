import api from './client';

export const dashboardApi = {
  getStaffStats: async () => {
    const response = await api.get('/dashboard/staff');
    return response.data;
  },

  getStudentStats: async () => {
    const response = await api.get('/dashboard/me');
    return response.data;
  },
};
