import axios from 'axios';
import Cookies from 'js-cookie';

// تأمين الـ Base URL مع Fallback محلي في حال لم يقرأ الـ env
const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ملقط الطلبات (Request Interceptor) لتمرير التوكن تلقائياً
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ملقط الاستجابات (Response Interceptor) المطور والمؤمن ضد ابتلاع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. معالجة انتهاء الجلسة الصريحة 401
    if (error.response?.status === 401) {
      console.error("الجلسة انتهت! يتم التوجيه لصفحة تسجيل الدخول...");
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      return Promise.reject(error);
    }

    // 2. معالجة أخطاء التحقق من البيانات (Validation Errors) والأخطاء الأخرى من الـ Backend
    // نقوم بتمرير الـ response.data المرفق بالخطأ بشكل مخصص لضمان عدم ضياعه ككائن فارغ {}
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }

    // fallback في حال لم تكن هناك استجابة من السيرفر اصلاً (Network Error)
    return Promise.reject({ message: error.message || "Network Error" });
  }
);

/** * Member Specific Operations 
 */

// 1. Get All Members
export const getMembers = async () => {
  const response = await api.get('/v1/members');
  return response.data?.data || response.data || []; 
};

// 2. Get Single Member by ID
export const getMemberById = async (id: string) => {
  const response = await api.get(`/v1/members/${id}`);
  return response.data;
};

// 3. Create Member
export const createMember = async (data: any) => {
  console.log("Sending Payload:", JSON.stringify(data, null, 2));
  const response = await api.post('/v1/members', data);
  return response.data;
};

// 4. Update Member
export const updateMember = async (id: string, data: any) => {
  const response = await api.patch(`/v1/members/${id}`, data);
  return response.data;
};

// 5. Delete Member
export const deleteMember = async (id: string) => {
  const response = await api.delete(`/v1/members/${id}`);
  return response.data;
};

// 6. Upload File
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/v1/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }); 

  return response.data;
};