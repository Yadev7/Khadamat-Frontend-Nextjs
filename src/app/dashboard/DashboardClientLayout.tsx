'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  Users,
  Briefcase,
} from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function DashboardClientLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // استخراج بيانات المستخدم لمعرفة الدور (Role)
  const { t, i18n } = useTranslation();
  const pathname = usePathname();

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  // تحديد ما إذا كان المستخدم الحالي Admin
  const role = user?.role as { id?: number } | string | undefined;
  const isAdmin = (typeof role === 'object' && role !== null && role.id === 1) || role === 'ADMIN';

  // فحص ما إذا كنا في صفحة تفاصيل محل
  const isPublicBusinessPage = Boolean(
    pathname && pathname.includes('/dashboard/business/') && pathname.split('/dashboard/business/')[1]?.length > 0
  );

  // تعريف الروابط الأساسية التي تظهر للجميع (الأعضاء والمسؤولين)
  const baseMenuItems = [
    { name: t('dashboard.sidebar.home'), icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: t('dashboard.sidebar.business'), icon: <Briefcase size={20} />, href: '/dashboard/business' },
  ];

  // الروابط الخاصة بالـ Admin فقط (Members و Infos General)
  const adminMenuItems = [
    { name: t('dashboard.sidebar.infos-general'), icon: <LayoutDashboard size={20} />, href: '/dashboard/infos-general' },
    { name: t('dashboard.sidebar.members'), icon: <Users size={20} />, href: '/dashboard/members' },
  ];

  // دمج القائمة بناءً على صلاحية المستخدم: إذا كان Admin تظهر له كافة القائمة، وإلا تقتصر على الروابط المسموحة
  const menuItems = isAdmin 
    ? [
        { name: t('dashboard.sidebar.home'), icon: <LayoutDashboard size={20} />, href: '/dashboard' },
        ...adminMenuItems,
        { name: t('dashboard.sidebar.business'), icon: <Briefcase size={20} />, href: '/dashboard/business' },
      ]
    : baseMenuItems;

  const layoutContent = (
    <div
      dir={currentDir}
      className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white"
    >
      {!isPublicBusinessPage && (
        <aside className="w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-blue-600">{t('dashboard.sidebar.name')}</h2>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className={isPublicBusinessPage ? "p-0 pb-20 md:pb-0" : "p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto flex-1"}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 min-w-0 flex-1 text-[10px] font-bold transition-colors active:scale-95 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {item.icon}
              <span className="truncate max-w-20 text-center leading-none">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  if (isPublicBusinessPage) {
    return layoutContent;
  }

  return <AuthGuard>{layoutContent}</AuthGuard>;
}