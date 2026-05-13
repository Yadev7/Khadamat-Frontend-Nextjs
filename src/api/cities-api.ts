import api from './auth-api'; // استيراد النسخة المركزية

export interface CityData {
  nameAr?: string;
  nameFr?: string;
  nameEn?: string;
  country?: { id: string };
  localisation?: {
    latitude: string | number;
    longitude: string | number;
  };
}

export const getCities = async () => {
  const response = await api.get('/v1/cities', {
    params: { relations: 'localisation' }
  });
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const getCityById = async (id: string) => {
  const response = await api.get(`/v1/cities/${id}`);
  return response.data;
};

export const createCity = async (data: CityData) => {
  const response = await api.post('/v1/cities', data);
  return response.data;
};

export const updateCity = async (id: string, data: Partial<CityData>) => {
  const response = await api.patch(`/v1/cities/${id}`, data);
  return response.data;
};

export const deleteCity = async (id: string) => {
  const response = await api.delete(`/v1/cities/${id}`);
  return response.data;
};