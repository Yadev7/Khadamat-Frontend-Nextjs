'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // حماية إضافية: إذا طفأ المستخدم المتصفح ورجع دخل ديريكت للـ Dashboard وهو ماشي Logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in'); // تأكد من المسار الصحيح لصفحة الدخول
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('dashboard.welcome')} 
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: الدور (Role) */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.cards.role_title')}</h3>
            <p className="text-xl font-bold">{t('dashboard.cards.role_subtitle')}</p>
          </div>

          {/* Card 2: البريد الإلكتروني */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <h3 className="text-green-700 dark:text-green-400 font-semibold mb-2">{t('dashboard.cards.email_title')}</h3>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>

          {/* Card 3: الحالة */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
            <h3 className="text-purple-700 dark:text-purple-400 font-semibold mb-2">{t('dashboard.cards.status_title')} </h3>
            <p className="text-xl font-bold text-green-600">{t('dashboard.cards.status_subtitle')}  </p>
          </div>
        </div>

        {/* بلاصة فين غنزيدو الـ CRUD Services لاحقاً */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.operations.title')} </h2>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
              {t('dashboard.operations.manage_services')}
            </button>
            <button className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-200 transition">
              {t('dashboard.operations.edit_profile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}