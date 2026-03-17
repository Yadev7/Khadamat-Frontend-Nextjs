import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getServices = async () => {
  const response = await api.get('/v1/services');
  return response.data;
};

export const createService = async (data: { name_ar: string, name_fr: string, icon?: string }) => {
  const response = await api.post('/v1/services', data);
  return response.data;
};

export const deleteService = async (id: number) => {
  await api.delete(`/v1/services/${id}`);
};