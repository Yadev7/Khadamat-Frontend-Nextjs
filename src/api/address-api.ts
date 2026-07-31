import api from './auth-api';

export const getAddresses = async (page = 1, limit = 10) => {
  const response = await api.get('/v1/addresses', {
    params: { page, limit }
    });

    return response.data;
};


