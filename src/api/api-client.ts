import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://127.0.0.1:3001/api').replace(/\/$/, ''),
});

// Automatically attach the Bearer token to requests if available.
// Auth tokens are stored in cookies (see context/AuthContext) rather than
// localStorage so that middleware/server code can read them too.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;