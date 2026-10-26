"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  // دالة جلب بيانات المستخدم (استخدمت useCallback لمنع الـ Re-renders اللانهائية)
  const checkAuth = useCallback(async () => {
    const token = Cookies.get('auth_token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Never let a hanging request leave the app stuck on the loading screen.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // The server rejected the token (expired/invalid): clear it so the
        // middleware and the client agree that the user is logged out.
        if (res.status === 401 || res.status === 403) {
          Cookies.remove('auth_token');
        }
        setUser(null);
      }
    } catch (err) {
      console.error("🌐 Server is unreachable. Check if NestJS is running.", err);
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  // تنفيذ الفحص عند أول تحميل للتطبيق
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);



  // دالة تسجيل الدخول المحدثة
  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      // استخراج التوكنات وتخزينها بأمان
      const token = response?.token || response?.accessToken;
      const refreshToken = response?.refreshToken;

      if (token) {
        Cookies.set('auth_token', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }

      if (refreshToken) {
        Cookies.set('auth_refresh_token', refreshToken, {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }

      // إذا كان السيرفر يعيد بيانات المستخدم مباشرة
      if (response?.user) {
        setUser(response.user);
        setIsLoading(false);
        router.push('/'); // أو لوحة التحكم الخاصة بك
        return;
      }

      // وإلا قم بجلب بيانات المستخدم من /me
      await checkAuth();
      router.push('/');
    } catch (error) {
      throw error; // إعادة رمي الخطأ ليتم التقاطه في صفحة تسجيل الدخول
    }
  };

  // // دالة تسجيل الدخول
  // const login = async (email: string, password: string) => {
  //   const response = await loginUser(email, password);

  //   if (response?.token) {
  //     // ✅ تحديد 7 أيام يحل مشكلة الـ 15 دقيقة في المتصفح
  //     Cookies.set('auth_token', response.token, {
  //       expires: 7,
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: 'strict',
  //     });
  //   }

  //   // Keep the refresh token so auth-api can silently renew an expired
  //   // access token (backend expects it as a Bearer token on /auth/refresh).
  //   if (response?.refreshToken) {
  //     Cookies.set('auth_refresh_token', response.refreshToken, {
  //       expires: 30,
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: 'strict',
  //     });
  //   }

  //   if (response?.user) {
  //     // Use the user returned by the login response so the UI can redirect
  //     // immediately instead of waiting on a second /me round-trip.
  //     setUser(response.user);
  //     setIsLoading(false);
  //     // Refresh the full profile in the background.
  //     void checkAuth();
  //     return;
  //   }

  //   // Fallback: some providers may not return the user in the login payload.
  //   await checkAuth();
  // };

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
      Cookies.remove('auth_refresh_token');
      setUser(null);
      router.push("/sign-in");
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