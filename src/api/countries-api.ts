import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to handle JWT tokens
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
      
      // 1. مسح التوكن من الكوكيز
      Cookies.remove('auth_token');
      
      // 2. توجيه المستخدم (إذا كنا في المتصفح)
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);


// 1. Get All Members
export const getCountries = async () => {
  const response = await api.get('/v1/countries');
  // Return the inner 'data' array from the response object
  return response.data?.data || []; 
};

export const getCountryById = async (id: string) => {
  const response = await api.get(`/v1/countries/${id}`);
  return response.data;
};

export const createCountry = async (data: any) => {
  console.log("Sending Payload:", JSON.stringify(data, null, 2));
  const response = await api.post('/v1/countries', data);
  return response.data;
};

export const updateCountry = async (id: string, data: any) => { 
    console.log(`Updating Country ID ${id} with Payload:`, JSON.stringify(data, null, 2));
    const response = await api.patch(`/v1/countries/${id}`, data);
    return response.data;
};

export const deleteCountry = async (id: string) => {
  const response = await api.delete(`/v1/countries/${id}`);
  return response.data;
};

