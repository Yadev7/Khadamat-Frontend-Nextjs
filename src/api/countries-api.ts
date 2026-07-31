import api from './auth-api';
export { api };


// 1. Get All Members
export const getCountries = async () => {
  const response = await api.get('/v1/countries', {
    params: { relations: 'localisation' }
  });
  // Return the inner 'data' array from the response object
  return response.data?.data || [];
};

export const getCountryById = async (id: string) => {
  const response = await api.get(`/v1/countries/${id}`);
  return response.data;
};

export const createCountry = async (data: any) => {
  console.log("Sending Payload:", JSON.stringify(data, null, 2));
  const response = await api.post('/v1/countries', data);
  return response.data;
};

export const updateCountry = async (id: string, data: any) => {
  console.log(`Updating Country ID ${id} with Payload:`, JSON.stringify(data, null, 2));
  const response = await api.patch(`/v1/countries/${id}`, data);
  return response.data;
};

export const deleteCountry = async (id: string) => {
  const response = await api.delete(`/v1/countries/${id}`);
  return response.data;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/v1/files/upload', formData);
  return response.data;
};

