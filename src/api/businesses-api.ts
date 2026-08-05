import api from './auth-api';
export { api };


export const getServicesList = async () => {
  const response = await api.get('/v1/services');
  console.log("services", response.data);
  return response.data;
};


export const getMembersList = async () => {
  const response = await api.get('/v1/members', {
    params: {
      relations: 'contact',
      populate: 'contact',
      join: 'contact'
    }
  });
  return response.data;
};


export const getContactsList = async () => {
  const response = await api.get('/v1/contacts', {
    params: {
      relations: 'address'
    }
  });
  return response.data;
};


// export const getBusinesses = async (
//   page: number = 1,
//   limit: number = 20,
//   filters: {
//     cityId?: string | null;
//     serviceId?: string | null;
//     zoneId?: string | null;
//   } = {},
//   relations: string = 'service,flyer,contact.address.localisation,owner'
// ) => {
//   const response = await api.get('/v1/businesses', {
//     params: {
//       page,
//       limit,
//       serviceId: filters.serviceId || undefined,
//       cityId: filters.cityId || undefined,
//       zoneId: filters.zoneId || undefined,
//       relations,
//     },
//   });
//   return response.data;
// };


// export const getBusinessById = async (id: string, relations: string = 'service,flyer,contact.address.localisation,owner') => {
//   const response = await api.get(`/v1/businesses/${id}`, {
//     params: {
//       relations,
//     },
//   });
//   return response.data;
// };



// export const getBusinesses = async (
//   page: number = 1,
//   limit: number = 10,
//   filters?: { cityId?: string; zoneId?: string; service?: string },
//   relations?: string
// ) => {
//   // بناء الـ Query Parameters بشكل مسطح وصريح
//   const params = new URLSearchParams();
//   params.append("page", String(page));
//   params.append("limit", String(limit));
  
//   if (relations) params.append("relations", relations);
  
//   // تفكيك الفلاتر وإضافتها مباشرة للرابط
//   if (filters?.cityId) params.append("cityId", filters.cityId);
//   if (filters?.zoneId) params.append("zoneId", filters.zoneId);
//   if (filters?.service) params.append("service", filters.service);

//   // استبدل '/businesses' بالمسار الصحيح الخاص بالـ API لديك
//   const response = await api.get(`/v1/businesses?${params.toString()}`);
//   return response.data;
// };



// @/api/businesses-api.ts
// export const getBusinesses = async (
//   page: number = 1,
//   limit: number = 10,
//   filters?: { id?: string; cityId?: string; zoneId?: string; service?: string },
//   relations?: string
// ) => {
//   const params = new URLSearchParams();
//   params.append("page", String(page));
//   params.append("limit", String(limit));
  
//   if (relations) params.append("relations", relations);
  
//   if (filters?.id) params.append("id", filters.id); // Added id support for detail fetching
//   if (filters?.cityId) params.append("cityId", filters.cityId);
//   if (filters?.zoneId) params.append("zoneId", filters.zoneId);
//   if (filters?.service) params.append("service", filters.service);

//   const response = await api.get(`/v1/businesses?${params.toString()}`);
//   return response.data;
// };


// 1. For fetching a list (with filters and pagination)
export const getBusinesses = async (
  page: number = 1,
  limit: number = 10,
  filters?: { cityId?: string; zoneId?: string; service?: string },
  relations?: string
) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (relations) params.append("relations", relations);
  if (filters?.cityId) params.append("cityId", filters.cityId);
  if (filters?.zoneId) params.append("zoneId", filters.zoneId);
  if (filters?.service) params.append("service", filters.service);

  const response = await api.get(`/v1/businesses?${params.toString()}`);
  return response.data;
};

// 2. For fetching a specific detail (Path Parametaer)
export const getBusinessById = async (id: string) => {
  const response = await api.get(`/v1/businesses/${id}`);
  return response.data;
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


export interface CreateBusinessData {
  nameFr: string;
  nameAr: string;
  nameEn?: string;
  descrFr?: string;
  descrAr?: string;
  descrEn?: string;
  socialMedia?: string;
  businessUrlSite?: string;
  owner: { id: string };
  manager: { id: string };
  service?: { id: string } | null;
  contact: { id: string };
  localisation?: {
    latitude: number;
    longitude: number;
  } | null;
  flyer?: { id: string } | null;
  audioAr?: { id: string } | null;
  audioFr?: { id: string } | null;
  audioEn?: { id: string } | null;
  videoAr?: { id: string } | null;
  videoFr?: { id: string } | null;
  videoEn?: { id: string } | null;
}

export const createBusiness = async (data: CreateBusinessData) => {
  const response = await api.post('/v1/businesses', data);
  return response.data;
}

export const deleteBusiness = async (id: string) => {
  const response = await api.delete(`/v1/businesses/${id}`);
  return response.data;
};

export const updateBusiness = async (id: string, payload: any) => {
  const response = await api.patch(`/v1/businesses/${id}`, payload);
  return response.data;
};