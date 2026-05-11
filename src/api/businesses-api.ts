import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


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

export const getBusinesses = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    cityId?: string | null;
    service?: string | null;
    zoneId?: string | null;
  } = {},
  relations: string = 'service,flyer,contact.address.localisation,owner'
) => {
  const response = await api.get('/v1/businesses', {
    params: {
      page,
      limit,
      ...filters,
      relations
    }
  });
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