import api from './auth-api';

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

// Cities are small reference data the search page needs in full, so ask for the
// largest page the lookup endpoints allow instead of the 10-row default.
export const LOOKUP_LIMIT = 500;

export const getCities = async () => {
  const response = await api.get('/v1/cities', {
    params: { relations: 'localisation', limit: LOOKUP_LIMIT },
  });

  // Handles standard arrays as well as NestJS infinity/paginated response formats ({ data: [...] })
  return Array.isArray(response.data)
    ? response.data
    : (response.data?.data || []);
};

export const getCityById = async (id: string) => {
  if (!id || id === 'undefined') return null;
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