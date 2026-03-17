"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { loginUser } from '@/services/auth-api'; // الدالة لي صاوبنا

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    console.log("1. checkAuth started"); // 🔥 تتبع
    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3001/api";
      console.log("2. Fetching from:", `${API_URL}/v1/auth/me`);

      const res = await fetch(`${API_URL}/v1/auth/me`, { credentials: "include" });
      console.log("3. Response received, status:", res.status);

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("4. Error in checkAuth:", err);
      setUser(null);
    } finally {
      console.log("5. Setting isLoading to false"); // 🔥 هادي أهم وحدة
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // دالة تسجيل الدخول لي غنخدمو بيها فـ صفحة Login
  const login = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
      // نعيطو لـ checkAuth باش نجيبو البيانات الفريش من السيرفر ونحدثو isLoading و user
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3001/api";
      // كنعلمو السيرفر يمسح الكوكي
      await fetch(`${API_URL}/v1/auth/logout`, { method: 'POST', credentials: "include" });
    } finally {
      setUser(null);
      window.location.href = "/sign-in";
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};