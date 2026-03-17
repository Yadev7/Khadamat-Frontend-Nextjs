"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/services'];
const AUTH_ROUTES = ['/sign-in', '/login'];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 1. كنتسناو التحميل يسالي والـ Component يتركب
    if (isLoading || !isMounted) return;

    const isAuthPage = AUTH_ROUTES.includes(pathname);
    const isProtectedPage = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    // 2. إذا كان المستخدم داخل وهو ف صفحة Login، صيفطو للداشبورد
    if (user && isAuthPage) {
      router.replace('/dashboard');
    } 
    // 3. إذا كان المستخدم برا وهو ف صفحة محمية، صيفطو لـ Login
    else if (!user && isProtectedPage) {
      router.replace('/sign-in');
    }
  }, [user, isLoading, isMounted, pathname, router]);

  // 🚀 هاد السطر هو اللي كان حابسك ف الـ Loading
  // خاصنا نتأكدو أنه غير كيسالي isLoading، كيبين الـ children (لي هي صفحة Login)
  if (!isMounted || isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black text-blue-600">
        <div className="flex flex-col items-center gap-2">
           <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
           <span className="text-sm font-medium">جاري التحقق...</span>
        </div>
      </div>
    );
  }

  // ✅ إذا وصلنا هنا، يعني isLoading ولات false
  // والـ pathname هو /sign-in (ماشي protected route)
  // إذن خاصو يرجع الـ children دبا!
  return <>{children}</>;
}