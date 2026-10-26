import axios from 'axios';
import Cookies from 'js-cookie';
import { setTokens } from './auth-tokens';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Shared in-flight refresh request. The backend rotates the session hash on
// every refresh, so parallel refreshes invalidate each other. All concurrent
// 401s must await the same promise.
let refreshPromise: Promise<string> | null = null;

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
    const originalRequest: any = error.config;

    // No request to retry (network error, CORS, etc.)
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never try to refresh for the auth endpoints themselves, otherwise a
    // failed refresh would trigger another refresh attempt.
    const failedUrl: string = originalRequest.url || '';
    const isAuthFailure =
      failedUrl.includes('/v1/auth/refresh') ||
      failedUrl.includes('/v1/auth/email/login');
    if (isAuthFailure) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const publicEndpoints = ['/v1/cities', '/v1/services', '/v1/city-areas'];
      const isPublicGet = originalRequest.method?.toLowerCase() === 'get' &&
                          publicEndpoints.some(endpoint => failedUrl.includes(endpoint));

      // Don't attempt refresh for public GET endpoints
      if (isPublicGet) {
        return Promise.reject(error);
      }

      const refreshToken = Cookies.get('auth_refresh_token');

      // No refresh token -> nothing to renew, force logout once.
      if (!refreshToken) {
        Cookies.remove('auth_token', { path: '/' });
        Cookies.remove('auth_refresh_token', { path: '/' });
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
          window.location.href = new URL('/sign-in', window.location.origin).href;
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Single-flight: concurrent 401s share the same refresh call.
        // The backend rotates the session hash on every refresh, so two
        // parallel refreshes would invalidate each other (second gets 401
        // and wipes valid tokens).
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshRes = await axios.post(
              `${API_URL}/v1/auth/refresh`,
              {},
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${Cookies.get('auth_refresh_token')}` },
              },
            );

            const newToken = refreshRes.data?.token || refreshRes.data?.accessToken;
            const newRefreshToken = refreshRes.data?.refreshToken;

            if (!newToken) {
              throw new Error('No token in refresh response');
            }

            if (newToken) {
              Cookies.set('auth_token', newToken, {
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              });
            }

            if (newRefreshToken) {
              Cookies.set('auth_refresh_token', newRefreshToken, {
                expires: 30,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              });
            }

            return newToken as string;
          })().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        Cookies.remove('auth_token', { path: '/' });
        Cookies.remove('auth_refresh_token', { path: '/' });

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
          window.location.href = new URL('/sign-in', window.location.origin).href;
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/v1/auth/email/login', { email, password });
  
  const token = response.data?.token || response.data?.accessToken;
  const refreshToken = response.data?.refreshToken;

  if (token || refreshToken) {
    setTokens({ token, refreshToken });
  }

  return response.data;
};

export const updateMe = async (data: any) => {
  const response = await api.patch('/v1/auth/me', data);
  return response.data;
};

export default api;