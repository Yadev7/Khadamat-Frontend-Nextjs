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

// GET all addresses with pagination
export const getAddresses = async (page = 1, limit = 10) => {
  const response = await api.get('/v1/addresses', {
    params: { page, limit }
    });

    return response.data;
};


