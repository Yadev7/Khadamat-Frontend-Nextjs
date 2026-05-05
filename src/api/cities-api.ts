import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to handle JWT tokens
// api.interceptors.request.use((config) => {
//   const token = Cookies.get('auth_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//     return config;
// });

api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token'); // Ensure this cookie name is exactly correct
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


// 1. Get All Cities
// export const getCities = async () => {
//   const response = await api.get('/v1/cities');
//   // Return the inner 'data' array from the response object
//   return response.data?.data || [];
// };

// Example for cities-api.ts
export const getCities = async () => {
  // Ensure you are requesting the 'localisation' relation
  const response = await api.get('/v1/cities', {
    params: { relations: 'localisation' }
  });
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const getCityById = async (id: string) => {
  const response = await api.get(`/v1/cities/${id}`);
  return response.data;
};

// export const createCity = async (data: any) => {
//   console.log("Sending Payload:", JSON.stringify(data, null, 2));
//   const response = await api.post('/v1/cities', data);
//   return response.data;
// };

// src/api/cities-api.ts (أو المكان الذي ترسل منه الطلب)

// export const createCity = async (cityData: { name: string, countryId: string | number }) => {
//   const payload = {
//     name: cityData.name,
//     country: {
//       id: cityData.countryId // هنا يكمن الحل: وضع المعرف داخل كائن country
//     }
//   };

//   const response = await api.post('/v1/cities', payload);
//   return response.data;
// };


export const createCity = async (data: any) => {
  const response = await api.post('/v1/cities', data);
  return response.data;
};

export const updateCity = async (id: string, data: any) => {
  console.log(`Updating City ID ${id} with Payload:`, JSON.stringify(data, null, 2));
  const response = await api.patch(`/v1/cities/${id}`, data);
  return response.data;
};

export const deleteCity = async (id: string) => {
  const response = await api.delete(`/v1/cities/${id}`);
  return response.data;
};
