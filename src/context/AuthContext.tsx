"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { loginUser } from '@/api/auth-api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photo?: { path: string };
  member?: any; // أضفنا هذا لأننا نحتاجه في Khadamat
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // 🚀 إضافة مهمة لتحديث البيانات يدوياً
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3001/api").replace(/\/$/, "");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // دالة جلب بيانات المستخدم (استخدمت useCallback لمنع الـ Re-renders اللانهائية)
  const checkAuth = useCallback(async () => {
    const token = Cookies.get('auth_token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/me`, { 
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        if (res.status === 401) {
          Cookies.remove('auth_token');
          setUser(null);
        }
      }
    } catch (err) {
      console.error("🌐 Server is unreachable. Check if NestJS is running.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تنفيذ الفحص عند أول تحميل للتطبيق
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // دالة تسجيل الدخول
  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      
      if (response?.token) {
        // ✅ تحديد 7 أيام يحل مشكلة الـ 15 دقيقة في المتصفح
        Cookies.set('auth_token', response.token, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' 
        });
      }

      // بعد وضع الكوكي، نجلب بيانات المستخدم كاملة
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  // دالة تسجيل الخروج
  const logout = async () => {
    try {
      const token = Cookies.get('auth_token');
      await fetch(`${API_BASE_URL}/v1/auth/logout`, { 
        method: 'POST', 
        credentials: "include",
        headers: {
           ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        }
      });
    } finally {
      Cookies.remove('auth_token');
      setUser(null);
      window.location.href = "/sign-in";
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      refreshUser: checkAuth // 🚀 ربط refreshUser بدالة checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};