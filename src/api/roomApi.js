import api from './client';

export const roomApi = {
  getAllRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getAvailableRooms: async () => {
    const response = await api.get('/rooms/available');
    return response.data;
  },

  getMyRoom: async () => {
    const response = await api.get('/rooms/my-room');
    return response.data;
  },

  addRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  assignHosteller: async (hostellerId, roomId) => {
    const response = await api.put('/rooms/assign', { hostellerId, roomId });
    return response.data;
  },

  reassignHosteller: async (hostellerId, newRoomId) => {
    const response = await api.put(`/rooms/reassign/${hostellerId}/${newRoomId}`);
    return response.data;
  },
};
