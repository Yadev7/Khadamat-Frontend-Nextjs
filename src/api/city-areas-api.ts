import api from './auth-api'; // استيراد النسخة المركزية

export interface CityAreaData {
  nameAr?: string;
  nameFr?: string;
  nameEn?: string;
  cityId?: string;
  city?: { id: string };
  localisation?: {
    latitude: string | number;
    longitude: string | number;
  };
}

export const getCityAreas = async () => {
  const response = await api.get('/v1/city-areas', {
    params: { relations: 'localisation' }
  });
  return response.data?.data || [];
};

export const getCityAreaById = async (id: string) => {
  const response = await api.get(`/v1/city-areas/${id}`);
  return response.data;
};

export const createCityArea = async (data: CityAreaData) => {
  const response = await api.post('/v1/city-areas', data);
  return response.data;
};

export const updateCityArea = async (id: string, data: Partial<CityAreaData>) => {
  const response = await api.patch(`/v1/city-areas/${id}`, data);
  return response.data;
};

export const deleteCityArea = async (id: string) => {
  const response = await api.delete(`/v1/city-areas/${id}`);
  return response.data;
};

export const getCityAreasByCityId = async (cityId: string) => {
  const response = await api.get(`/v1/city-areas?cityId=${cityId}`);
  return response.data?.data || [];
}