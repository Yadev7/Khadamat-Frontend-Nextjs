// auth-api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// إرفاق الـ Token في كل طلب
api.interceptors.request.use((config) => {
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
      // Check if we are on a page that actually REQUIRES login
      // If it's a public data fetch, maybe just return the error instead of redirecting
      const publicEndpoints = ['/v1/cities', '/v1/services', '/v1/city-areas'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url.includes(endpoint));

      if (isPublicEndpoint) {
        return Promise.reject(error); // Just fail the call, don't redirect
      }

      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/v1/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('auth_token');
        // Only redirect if NOT on the home page or public pages
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // التحقق من أن الخطأ 401 وأن الطلب ليس موجهاً لمسار تسجيل الدخول أصلاً
//     if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/email/login')) {
//       originalRequest._retry = true;

//       try {
//         // محاولة تحديث الـ Token
//         await axios.post(`${API_URL}/v1/auth/refresh`, {}, { withCredentials: true });

//         // جلب الـ Token الجديد (تأكد أن NestJS يضعه في الكوكيز)
//         const newToken = Cookies.get('auth_token');

//         if (newToken) {
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           return api(originalRequest); // إعادة محاولة الطلب الأصلي
//         }
//       } catch (refreshError) {
//         // إذا فشل الـ Refresh أيضاً، هنا فقط نحذف الكوكي ونوجه المستخدم
//         console.error("فشلت عملية تحديث الجلسة، يجب تسجيل الدخول مجدداً");
//         Cookies.remove('auth_token');
//         if (typeof window !== 'undefined') {
//           window.location.href = '/sign-in';
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/v1/auth/email/login', { email, password });
  return response.data;
};

export const updateMe = async (data: any) => {
  const response = await api.patch('/v1/auth/me', data);
  return response.data;
};

export default api;