import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Endpoints that strictly never use a Bearer token
  const authRoutes = ['/v1/auth/email/login', '/v1/auth/refresh'];
  const isAuthRoute = authRoutes.some(endpoint => config.url?.includes(endpoint));

  // Public GET endpoints (only skip token if it's a GET request)
  const publicGetEndpoints = ['/v1/cities', '/v1/services', '/v1/city-areas'];
  const isPublicGet = config.method?.toLowerCase() === 'get' && 
                      publicGetEndpoints.some(endpoint => config.url?.includes(endpoint));

  if (isAuthRoute) return config;

  // Attach token if present (especially critical for POST / PATCH / DELETE)
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const publicEndpoints = ['/v1/cities', '/v1/services', '/v1/city-areas'];
      const isPublicGet = originalRequest.method?.toLowerCase() === 'get' &&
                          publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

      // Don't attempt refresh for public GET endpoints
      if (isPublicGet) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(`${API_URL}/v1/auth/refresh`, {}, { withCredentials: true });
        const newToken = refreshRes.data?.token || refreshRes.data?.accessToken;
        
        if (newToken) {
          Cookies.set('auth_token', newToken, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('auth_token');
        if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/v1/auth/email/login', { email, password });
  return response.data;
};

export const updateMe = async (data: any) => {
  const response = await api.patch('/v1/auth/me', data);
  return response.data;
};

export default api;