import api from './auth-api';
export { api };

/** * Member Specific Operations 
 */

// 1. Get All Members
export const getMembers = async () => {
  const response = await api.get('/v1/members');
  return response.data?.data || response.data || []; 
};

// 2. Get Single Member by ID
export const getMemberById = async (id: string) => {
  const response = await api.get(`/v1/members/${id}`);
  return response.data;
};

// 3. Create Member
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

// 5. Delete Member
// export const deleteMember = async (id: string) => {
//   const response = await api.delete(`/v1/members/${id}`);
//   return response.data;
// };



export const deleteMember = async (id: string) => {
  try {
    const response = await api.delete(`/v1/members/${id}`);
    return response.data;
  } catch (error: any) {
    // Re-throw the error with a clean message so your UI component can catch and display it
    const message = error.response?.data?.errors?.database || error.message || 'Failed to delete member';
    throw new Error(message);
  }
};

// 6. Upload File
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