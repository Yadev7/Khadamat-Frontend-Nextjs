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


// GET all businesses with pagination
export const getBusinesses = async (page = 1, limit = 10) => {
  // Add /v1/ if it's not in your env variable
  const response = await api.get('/v1/businesses', { 
    params: { page, limit }
  });
  return response.data;
};

// CREATE a new business
// This is the missing function causing your error
export const createBusiness = async (payload: any) => {
  const response = await api.post('/v1/businesses', payload);
  return response.data;
};

// DELETE a business
export const deleteBusiness = async (id: string) => {
  const response = await api.delete(`/v1/businesses/${id}`);
  return response.data;
};