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

// GET all contacts with pagination
export const getContacts = async (page = 1, limit = 10) => {
    // Add /v1/ if it's not in your env variable
    const response = await api.get('/v1/contacts', {
        params: { page, limit }
    });
    return response.data;
};

// CREATE a new contact
export const createContact = async (payload: any) => {
    const response = await api.post('/v1/contacts', payload);
    return response.data;
};

// DELETE a contact
export const deleteContact = async (id: string) => {
    const response = await api.delete(`/v1/contacts/${id}`);
    return response.data;
};

// UPDATE a contact
export const updateContact = async (id: string, payload: any) => {
    const response = await api.patch(`/v1/contacts/${id}`, payload);
    return response.data;
};