import api from './auth-api';
import { LOOKUP_LIMIT } from './cities-api';

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

const unwrap = (payload: any): any[] =>
  Array.isArray(payload) ? payload : payload?.data || [];

/**
 * @param cityId when provided, only the areas belonging to that city are returned.
 */
export const getCityAreas = async (cityId?: string) => {
  const response = await api.get('/v1/city-areas', {
    params: {
      relations: 'localisation',
      limit: LOOKUP_LIMIT,
      cityId: cityId || undefined,
    },
  });

  return unwrap(response.data);
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
  if (!cityId) return [];
  return getCityAreas(cityId);
};