import api from './auth-api';

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