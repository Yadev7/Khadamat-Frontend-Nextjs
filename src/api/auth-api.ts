import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://127.0.0.1:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 1. Request Interceptor: لإضافة التوكن لكل طلب
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: لمعالجة انتهاء الصلاحية (401)
api.interceptors.response.use(
  (response) => response, // إذا كانت الاستجابة ناجحة، مررها كما هي
  async (error) => {
    const originalRequest = error.config;

    // التحقق إذا كان الخطأ 401 (Unauthorized) ولم نقم بمحاولة التجديد مسبقاً لهذا الطلب
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // وسم الطلب لكي لا ندخل في حلقة لا نهائية

      try {
        console.log("🔄 تنبيه: الجلسة انتهت (15 دقيقة)، جاري التجديد تلقائياً...");
        
        // طلب توكن جديد من الـ Refresh Endpoint في NestJS
        // ملاحظة: credentials: true تضمن إرسال Refresh Cookie المخزن في المتصفح
        await axios.post(`${API_URL}/v1/auth/refresh`, {}, { withCredentials: true });

        // بعد نجاح التجديد، نجلب التوكن الجديد (الذي وضعه السيرفر في الكوكيز)
        const newToken = Cookies.get('auth_token');
        
        // تحديث الهيدر في الطلب الأصلي وإعادة تنفيذه
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); 
        
      } catch (refreshError) {
        // إذا فشل التجديد أيضاً (مثلاً الـ Refresh Token انتهى بعد 7 أيام)
        console.error("❌ انتهت صلاحية الجلسة بالكامل، يجب تسجيل الدخول.");
        Cookies.remove('auth_token');
        if (typeof window !== 'undefined') {
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