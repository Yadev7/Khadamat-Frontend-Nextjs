import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

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

/** * Member Specific Operations 
 */

// 1. Get All Members
export const getMembers = async () => {
  const response = await api.get('/v1/members');
  // Return the inner 'data' array from the response object
  return response.data?.data || []; 
};

// 2. Get Single Member by ID
export const getMemberById = async (id: string) => {
  const response = await api.get(`/v1/members/${id}`);
  return response.data;
};

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


// export const updateUser = async (userId: number | string, data: any) => {
//   try {
//     const response = await api.patch(`/v1/users/${userId}`, data);
//     return response.data;
//   } catch (error: any) {
//     // طباعة الخطأ القادم من السيرفر لمعرفة السبب (404, 400, 500?)
//     console.error("Update User Error Details:", error.response?.data || error.message);
//     throw error; 
//   }
// };

// 5. Delete Member
export const deleteMember = async (id: string) => {
  const response = await api.delete(`/v1/members/${id}`);
  return response.data;
};


export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  // No need to manually get token here, the interceptor handles it!
  const response = await api.post('/v1/files/upload', formData); 

  return response.data;
};