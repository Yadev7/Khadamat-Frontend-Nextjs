import api from './auth-api';
export { api };

export const getMessages = async (
  businessId?: string,
  page: number = 1,
  limit: number = 50,
) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (businessId) params.append('businessId', businessId);

  const response = await api.get(`/v1/messages?${params.toString()}`);
  return response.data?.data || response.data || [];
};

export const createMessage = async (data: any) => {
  const response = await api.post('/v1/messages', data);
  return response.data;
};

export const deleteMessage = async (id: string) => {
  const response = await api.delete(`/v1/messages/${id}`);
  return response.data;
};
