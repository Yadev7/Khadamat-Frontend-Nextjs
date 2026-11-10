'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import Link from 'next/link';
import { Building2, ExternalLink, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoading, router]);

  if (isLoading && !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // التحقق هل المستخدم Admin أم Member عادى
  const role = user?.role as { id?: number } | string | undefined;
  const isAdmin = (typeof role === 'object' && role !== null && role.id === 1) || role === 'ADMIN';
  
  const memberType = typeof user?.typeMember === 'string'
    ? user.typeMember
    : (user?.typeMember && typeof user.typeMember === 'object' && 'name' in user.typeMember
        ? String((user.typeMember as { name?: string }).name)
        : 'Member');

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden p-4 sm:p-6">
        
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('dashboard.welcome')} ({isAdmin ? 'Admin Portal' : 'Member Workspace'})
            </h1>
          </div>
        </div>

        {/* 1. ADMIN ONLY SECTIONS: Professional & General Informations (Hidden for Members) */}
        {isAdmin && (
          <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-4">
              🛠️ لوحة تحكم المسؤول (Admin Controls)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Professional Overview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">إدارة الجوانب المهنية والخدمات العامة للنظام.</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">General Informations</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">معلومات عامة وإحصائيات المنصة الشاملة.</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. CARDS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.cards.role_title')}</h3>
            <p className="text-xl font-bold">{isAdmin ? 'Administrator' : (memberType || 'Member')}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <h3 className="text-green-700 dark:text-green-400 font-semibold mb-2">{t('dashboard.cards.email_title')}</h3>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
            <h3 className="text-purple-700 dark:text-purple-400 font-semibold mb-2">{t('dashboard.cards.status_title')}</h3>
            <p className="text-xl font-bold text-green-600">{t('dashboard.cards.status_subtitle')}</p>
          </div>
        </div>

        {/* 3. OPERATIONS & BUSINESS SECTION */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">
            {isAdmin ? 'System Operations' : 'My Business Hub (إدارة أعمالي)'}
          </h2>
          
          {!isAdmin ? (
            <div className="space-y-4">
              <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">إدارة أعمالي وشركاتي</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">استعرض وقم بتعديل تفاصيل عملك التجاري، الخدمات، والبيانات الخاصة بك.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/business"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-blue-500/25 whitespace-nowrap"
                >
                  <span>الذهاب إلى أعمالي</span>
                  <ExternalLink size={18} />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link
                  href="/dashboard/business/create"
                  className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition w-full sm:w-auto"
                >
                  <PlusCircle size={18} />
                  <span>إضافة عمل تجاري جديد</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition shadow-lg w-full sm:w-auto">
                إدارة كافة المستخدمين والشركات
              </button>
              <button className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-200 transition w-full sm:w-auto">
                إعدادات النظام العامة
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}