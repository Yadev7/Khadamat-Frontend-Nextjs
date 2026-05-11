import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("الجلسة انتهت! يتم التوجيه لصفحة تسجيل الدخول...");
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);


export const getCityAreas = async () => {
  const response = await api.get('/v1/city-areas', {
    params: { relations: 'localisation' } // Add this to get coordinates
  });
  return response.data?.data || [];
};

export const getCityAreaById = async (id: string) => {
  const response = await api.get(`/v1/city-areas/${id}`);
  return response.data;
};

export const createCityArea = async (data: any) => {
  console.log("Sending Payload:", JSON.stringify(data, null, 2));
  const response = await api.post('/v1/city-areas', data);
  return response.data;
};

export const updateCityArea = async (id: string, data: any) => {
  console.log(`Updating City Area ID ${id} with Payload:`, JSON.stringify(data, null, 2));
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

