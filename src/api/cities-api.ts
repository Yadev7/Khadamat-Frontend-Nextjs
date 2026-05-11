import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const api = axios.create({
  baseURL: API_URL,
});


api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token'); // Ensure this cookie name is exactly correct
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      Cookies.remove('auth_token');

      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);




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


export const createCity = async (data: any) => {
  const response = await api.post('/v1/cities', data);
  return response.data;
};

export const updateCity = async (id: string, data: any) => {
  console.log(`Updating City ID ${id} with Payload:`, JSON.stringify(data, null, 2));
  const response = await api.patch(`/v1/cities/${id}`, data);
  return response.data;
};

export const deleteCity = async (id: string) => {
  const response = await api.delete(`/v1/cities/${id}`);
  return response.data;
};
