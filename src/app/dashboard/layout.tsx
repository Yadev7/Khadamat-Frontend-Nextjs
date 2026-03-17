'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard  from '@/components/AuthGuard';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Briefcase, 
  LogOut,
  Bell
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'الرئيسية', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: 'الخدمات (Services)', icon: <Briefcase size={20} />, href: '/dashboard/services' },
    { name: 'الأعضاء (Members)', icon: <Users size={20} />, href: '/dashboard/members' },
    { name: 'الإعدادات', icon: <Settings size={20} />, href: '/dashboard/settings' },
  ];

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-blue-600">خدمات</h2>
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

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Navbar */}
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8">
            <div className="md:hidden text-xl font-bold text-blue-600">خدمات</div>
            <div className="hidden md:block text-gray-500">لوحة التحكم</div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              </button>
              
              <div className="flex items-center gap-3 ps-4 border-s border-gray-200 dark:border-gray-800 text-right">
                <div className="hidden sm:block">
                  <p className="text-sm font-bold">{String(user?.firstName || 'User')}</p>
                  <p className="text-xs text-gray-500 uppercase">{String((user?.role as { name: string })?.name || 'User')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold">
                  {(user?.firstName as string)?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-8 overflow-y-auto flex-1">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}