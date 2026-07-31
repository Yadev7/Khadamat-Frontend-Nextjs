import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const publicApi = axios.create({ baseURL: API_URL });
