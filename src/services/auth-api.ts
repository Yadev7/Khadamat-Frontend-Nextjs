import axios from 'axios';

// const API_URL = "http://localhost:3001/api";

// كنكرييو Instance ديال axios باش نطبقو عليها الإعدادات مرة وحدة
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // هادي هي الساروت باش الـ Cookie تدوز وتتخزن
});

// src/services/auth-api.ts

export const loginUser = async (email: string, password: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3001/api";
  
  const res = await fetch(`${API_URL}/v1/auth/email/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    // 🚀 هاد السطر هو اللي كيخلي المتصفح يشد الـ Set-Cookie من السيرفر ويخزنها
    credentials: 'include', 
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'AUTH_ERROR');
  }

  return data;
};