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
// export const getBusinesses = async (page = 1, limit = 10) => {
//   // Add /v1/ if it's not in your env variable
//   const response = await api.get('/v1/businesses', { 
//     params: { page, limit }
//   });
//   return response.data;
// };


// export const getBusinesses = async (p0: number, p1: number, p2: { cityId: string | null; serviceId: string | null; zoneId: string | null; }, params: { cityId?: string; service?: string; zoneId?: string; page?: number; limit?: number; }) => {
//   const response = await api.get('/v1/businesses', {
//     params: {
//       ...params,
//       // We ensure the backend knows we need the full nested relation chain
//       relations: 'contact.address.localisation,service'
//     }
//   });
//   return response.data;
// };


// export const getBusinesses = async (page: number, limit: number, params: {
//   cityId?: string | null;
//   service?: string | null;
//   zoneId?: string | null;
// } = {}) => {
//   // إذا كنت تستخدم Strapi، يجب كتابة الفلتر بهذا الشكل:
//   const formattedParams: any = {
//     page,
//     limit,
//     relations: 'contact.address.localisation,service,flyer'
//   };

//   // تعديل المفاتيح لتناسب نظام الفلترة في السيرفر
//   if (params.service) formattedParams['filters[service][id]'] = params.service;
//   if (params.cityId) formattedParams['filters[city][id]'] = params.cityId;
//   if (params.zoneId) formattedParams['filters[zone][id]'] = params.zoneId;

//   const response = await api.get('/v1/businesses', { params: formattedParams });
//   return response.data;
// };


// export const getBusinesses = async (
//   page: number = 1,
//   limit: number = 10,
//   params: {
//     cityId?: string | null;
//     service?: string | null;
//     zoneId?: string | null;
//   } = {}
// ) => {
//   // We construct the query object
//   // If your backend uses the 'boilerplate' style, it might expect 'filters'
//   // But let's try the direct approach first with exact key matches.
//   const response = await api.get('/v1/businesses', {
//     params: {
//       page,
//       limit,
//       // Ensure these keys match what your NestJS Controller @Query() expects
//       cityId: params.cityId || undefined,
//       serviceId: params.service || undefined, // Changed 'service' to 'serviceId' common in Nest
//       zoneId: params.zoneId || undefined,
//       // Load necessary data for the UI cards
//       relations: 'service,flyer,contact.address.localisation'
//     }
//   });
//   return response.data;
// };



export const getBusinesses = async (
  page: number = 1,
  limit: number = 10,
  params: {
    cityId?: string | null;
    service?: string | null;
    zoneId?: string | null;
  } = {}
) => {
  const response = await api.get('/v1/businesses', {
    params: {
      page,
      limit,
      // We only send the service if it exists. 
      // Note: check if your backend expects 'serviceId' or 'service'
      service: params.service || undefined,
      
      // Explicitly loading relations so the UI cards don't look empty
      relations: 'service,flyer' 
    }
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

// UPDATE a business
export const updateBusiness = async (id: string, payload: any) => {
  const response = await api.patch(`/v1/businesses/${id}`, payload);
  return response.data;
};