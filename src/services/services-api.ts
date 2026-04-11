import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


// api.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get('auth_token');
    
//     if (token) {
//       // Use the specific header assignment to ensure it's set
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log("Token attached to request");
//     } 
//     return config;
//   },
//   (error) => Promise.reject(error)
// );


api.interceptors.request.use((config) => {
  const token = Cookies?.get('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// Interceptor للاستجابات الواردة (لمعالجة الـ 401 تلقائياً)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.error("Unauthorized! Redirecting to login...");
//       // يمكنك هنا إضافة logic لتوجيه المستخدم لصفحة تسجيل الدخول
//     }
//     return Promise.reject(error);
//   }
// );

// export const getServices = async () => {
//   const token = Cookies?.get('auth_token');
//   if(token) {
//     console.log("Token found in getServices:", token);
//      const response = await api.get('/v1/services');
//    return response.data.data || response.data;
//   }else{
//     return []; // أو يمكنك رمي خطأ أو إعادة قيمة افتراضية حسب حاجتك
//   }
  
// };


export const getServices = async () => {
  const token = Cookies?.get('auth_token');

  if (token) {
    console.log("Token found in getServices:", token);

    const response = await api.get('/v1/services', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data || response.data;
  } else {
    return [];
  }
};

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

export const createService = async (data: { 
  nameServAr: string; 
  nameServFr: string; 
  nameServEn?: string;
  descrAr?: string;
  descrFr?: string;
  descrEn?: string;
  image?: { id: string | number }; 
}) => {
  const response = await api.post('/v1/services', data);
  return response.data;
};

// استخدام id: any أو string | number لتفادي تعارض الأنواع مع UUID
export const deleteService = async (id: string) => {
  const response = await api.delete(`/v1/services/${id}`);
  return response.data;
};

export const updateService = async (id: string, data: any) => {
  const response = await api.patch(`/v1/services/${id}`, data);
  return response.data;
};