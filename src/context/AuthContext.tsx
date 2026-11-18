"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { loginUser } from '@/api/auth-api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photo?: { path: string };
  member?: any;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 🟢 Use Axios `api` so that 401 errors automatically trigger the refresh token interceptor
  const checkAuth = useCallback(async () => {
    const token = Cookies.get('auth_token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/v1/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error("🌐 Session hydration failed or server unreachable:", err);
      // If Axios interceptor fails to refresh, tokens are already wiped by api.ts interceptor
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run auth check on initial app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
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

      if (response?.user) {
        setUser(response.user);
        setIsLoading(false);
        router.push('/');
        return;
      }

      await checkAuth();
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/v1/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      Cookies.remove('auth_token', { path: '/' });
      Cookies.remove('auth_refresh_token', { path: '/' });
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
      refreshUser: checkAuth 
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