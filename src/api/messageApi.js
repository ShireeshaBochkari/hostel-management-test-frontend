import api from './client';

export const messageApi = {
  sendMessage: async (receiverId, content) => {
    const response = await api.post('/messages', { receiverId, content });
    return response.data;
  },

  getConversation: async () => {
    const response = await api.get('/messages/conversation');
    return response.data;
  },

  getInbox: async () => {
    const response = await api.get('/messages/inbox');
    return response.data;
  },

  getRecipients: async () => {
    const response = await api.get('/messages/recipients');
    return response.data;
  },
};
