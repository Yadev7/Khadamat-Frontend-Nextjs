import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = Cookies?.get('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export const getServices = async () => {
  const response = await api.get('/v1/services');
  return response.data?.data || response.data || [];
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/v1/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createService = async (data: {
  nameServAr: string;
  nameServFr: string;
  nameServEn?: string;
  descrAr?: string;
  descrFr?: string;
  descrEn?: string;
  image?: { id: string | number };
}) => {
  const response = await api.post('/v1/services', data);
  return response.data;
};

// استخدام id: any أو string | number لتفادي تعارض الأنواع مع UUID
export const deleteService = async (id: string) => {
  const response = await api.delete(`/v1/services/${id}`);
  return response.data;
};

export const updateService = async (id: string, data: any) => {
  const response = await api.patch(`/v1/services/${id}`, data);
  return response.data;
};