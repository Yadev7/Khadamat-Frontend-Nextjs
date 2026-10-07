import api from './auth-api';
import { LOOKUP_LIMIT } from './cities-api'; 

export interface ServiceData {
  nameServAr: string;
  nameServFr: string;
  nameServEn?: string;
  descrAr?: string;
  descrFr?: string;
  descrEn?: string;
  image?: { id: string | number };
}

export const getServices = async () => {
  const response = await api.get('/v1/services', {
    params: { limit: LOOKUP_LIMIT },
  });
  return Array.isArray(response.data)
    ? response.data
    : response.data?.data || response.data || [];
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/v1/files/upload', formData);
  return response.data;
};

export const createService = async (data: ServiceData) => {
  const response = await api.post('/v1/services', data);
  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await api.delete(`/v1/services/${id}`);
  return response.data;
};

export const updateService = async (id: string, data: Partial<ServiceData>) => {
  const response = await api.patch(`/v1/services/${id}`, data);
  return response.data;
};