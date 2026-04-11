"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// التعديل هنا: يكفي وضع المسار الأب '/dashboard' 
// وسوف يشمل تلقائياً /dashboard/members و /dashboard/services
const PROTECTED_ROUTES = ['/dashboard', '/profile']; 
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
    if (isLoading || !isMounted) return;

    // التأكد من أن المسار الحالي يبدأ بأحد المسارات المحمية
    const isAuthPage = AUTH_ROUTES.includes(pathname);
    const isProtectedPage = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    // 1. إذا كان المستخدم مسجل دخول ويحاول دخول صفحة Sign-in
    if (user && isAuthPage) {
      router.replace('/dashboard');
    } 
    // 2. إذا كان المستخدم غير مسجل دخول ويحاول دخول صفحة محمية (أو أي شيء داخل /dashboard)
    else if (!user && isProtectedPage) {
      router.replace('/sign-in');
    }
  }, [user, isLoading, isMounted, pathname, router]);

  // حالة التحميل (Loading Spinner)
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

  return <>{children}</>;
}