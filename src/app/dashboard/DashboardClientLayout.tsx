// 'use client';

// import React, { ReactNode } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import AuthGuard from '@/components/AuthGuard';
// import Link from 'next/link';
// import {
//   LayoutDashboard,
//   Settings,
//   Users,
//   Briefcase,
//   LogOut
// } from 'lucide-react';

// import { useTranslation } from "react-i18next";

// export default function DashboardClientLayout({ children }: { children: ReactNode }) {
//   const { logout } = useAuth();
//   const { t, i18n } = useTranslation();

//   // Dynamic direction based on active language
//   const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

//   const menuItems = [
//     {
//       name: t('dashboard.sidebar.home'),
//       icon: <LayoutDashboard size={20} />,
//       href: '/dashboard'
//     },

//     {
//       name: t('dashboard.sidebar.infos-general'),
//       icon: <LayoutDashboard size={20} />,
//       href: '/dashboard/infos-general'
//     },

//     // { 
//     //   name: t('dashboard.sidebar.services'), 
//     //   icon: <Briefcase size={20} />, 
//     //   href: '/dashboard/services' 
//     // },
//     {
//       name: t('dashboard.sidebar.members'),
//       icon: <Users size={20} />,
//       href: '/dashboard/members'
//     },
//     {
//       name: t('dashboard.sidebar.business'),
//       icon: <Briefcase size={20} />,
//       href: '/dashboard/business'
//     },
//     {
//       name: t('dashboard.sidebar.settings'),
//       icon: <Settings size={20} />,
//       href: '/dashboard/settings'
//     },
//   ];

//   return (
//     <AuthGuard>
//       {/* Set the direction dynamically here */}
//       <div
//         dir={currentDir}
//         className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white"
//       >

//         {/* Sidebar */}
//         <aside className="w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
//           <div className="p-6">
//             <h2 className="text-2xl font-bold text-blue-600">
//               {t('dashboard.sidebar.name')}
//             </h2>
//           </div>

//           <nav className="flex-1 px-4 space-y-2">
//             {menuItems.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
//               >
//                 {/* Icons will automatically flip placement if you use gap-3 and flex-row */}
//                 {item.icon}
//                 <span className="font-medium">{item.name}</span>
//               </Link>
//             ))}
//           </nav>

//           {/* <div className="p-4 border-t border-gray-200 dark:border-gray-800">
//             <button 
//               onClick={() => logout()}
//               className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
//             >
//               <LogOut size={20} />
//               <span className="font-medium">{t('sidebar_dashboard.logout')}</span>
//             </button>
//           </div> */}
//         </aside>

//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <main className="p-8 overflow-y-auto flex-1">
//             {children}
//           </main>
//         </div>
//       </div>
//     </AuthGuard>
//   );
// }

// 'use client';

// import React, { ReactNode } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import AuthGuard from '@/components/AuthGuard';
// import Link from 'next/link';
// import {
//   LayoutDashboard,
//   Settings,
//   Users,
//   Briefcase,
// } from 'lucide-react';
// import { useTranslation } from "react-i18next";

// export default function DashboardClientLayout({ children }: { children: ReactNode }) {
//   const { t, i18n } = useTranslation();
//   const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

//   const menuItems = [
//     { name: t('dashboard.sidebar.home'), icon: <LayoutDashboard size={20} />, href: '/dashboard' },
//     { name: t('dashboard.sidebar.infos-general'), icon: <LayoutDashboard size={20} />, href: '/dashboard/infos-general' },
//     { name: t('dashboard.sidebar.members'), icon: <Users size={20} />, href: '/dashboard/members' },
//     { name: t('dashboard.sidebar.business'), icon: <Briefcase size={20} />, href: '/dashboard/business' },
//     { name: t('dashboard.sidebar.settings'), icon: <Settings size={20} />, href: '/dashboard/settings' },
//   ];

//   return (
//     <AuthGuard>
//       <div dir={currentDir} className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
//         <aside className="w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
//           <div className="p-6">
//             <h2 className="text-2xl font-bold text-blue-600">{t('dashboard.sidebar.name')}</h2>
//           </div>
//           <nav className="flex-1 px-4 space-y-2">
//             {menuItems.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
//               >
//                 {item.icon}
//                 <span className="font-medium">{item.name}</span>
//               </Link>
//             ))}
//           </nav>
//         </aside>

//         <div className="flex-1 flex flex-col overflow-hidden">
//           <main className="p-8 overflow-y-auto flex-1">
//             {children}
//           </main>
//         </div>
//       </div>
//     </AuthGuard>
//   );
// }



// 'use client';

// import React, { ReactNode } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import AuthGuard from '@/components/AuthGuard';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard,
//   Settings,
//   Users,
//   Briefcase,
//   Inbox,
// } from 'lucide-react';
// import { useTranslation } from "react-i18next";

// export default function DashboardClientLayout({ children }: { children: ReactNode }) {
//   const { t, i18n } = useTranslation();
//   const pathname = usePathname();

//   const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

//   // هل نحن في صفحة تفاصيل محل تجاري؟
//   const isPublicBusinessPage = pathname ? /^\/dashboard\/business\/[^\/]+$/.test(pathname) : false;

//   const menuItems = [
//     { name: t('dashboard.sidebar.home'), icon: <LayoutDashboard size={20} />, href: '/dashboard' },
//     { name: t('dashboard.sidebar.infos-general'), icon: <LayoutDashboard size={20} />, href: '/dashboard/infos-general' },
//     { name: t('dashboard.sidebar.members'), icon: <Users size={20} />, href: '/dashboard/members' },
//     { name: t('dashboard.sidebar.business'), icon: <Briefcase size={20} />, href: '/dashboard/business' },
//     { name: t('dashboard.sidebar.messages'), icon: <Inbox size={20} />, href: '/dashboard/messages' },
//     { name: t('dashboard.sidebar.settings'), icon: <Settings size={20} />, href: '/dashboard/settings' },
//   ];

//   const layoutContent = (
//     <div
//       dir={currentDir}
//       className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white"
//     >
//       {!isPublicBusinessPage && (
//         <aside className="w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
//           <div className="p-6">
//             <h2 className="text-2xl font-bold text-blue-600">{t('dashboard.sidebar.name')}</h2>
//           </div>
//           <nav className="flex-1 px-4 space-y-2">
//             {menuItems.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
//               >
//                 {item.icon}
//                 <span className="font-medium">{item.name}</span>
//               </Link>
//             ))}
//           </nav>
//         </aside>
//       )}

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <main className={isPublicBusinessPage ? "p-0" : "p-8 overflow-y-auto flex-1"}>
//           {children}
//         </main>
//       </div>
//     </div>
//   );

//   if (isPublicBusinessPage) {
//     return layoutContent;
//   }

//   return <AuthGuard>{layoutContent}</AuthGuard>;
// }



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
  const { t, i18n } = useTranslation();
  const pathname = usePathname();

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  // فحص ما إذا كنا في صفحة تفاصيل محل
  const isPublicBusinessPage = Boolean(
    pathname && pathname.includes('/dashboard/business/') && pathname.split('/dashboard/business/')[1]?.length > 0
  );

  const menuItems = [
    { name: t('dashboard.sidebar.home'), icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: t('dashboard.sidebar.infos-general'), icon: <LayoutDashboard size={20} />, href: '/dashboard/infos-general' },
    { name: t('dashboard.sidebar.members'), icon: <Users size={20} />, href: '/dashboard/members' },
    { name: t('dashboard.sidebar.business'), icon: <Briefcase size={20} />, href: '/dashboard/business' },
    { name: t('dashboard.sidebar.settings'), icon: <Settings size={20} />, href: '/dashboard/settings' },
  ];

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
        <main className={isPublicBusinessPage ? "p-0" : "p-8 overflow-y-auto flex-1"}>
          {children}
        </main>
      </div>
    </div>
  );

  // إذا كنا في صفحة التفاصيل، نعرض الصفحة مباشرة بدون تغليف AuthGuard
  if (isPublicBusinessPage) {
    return layoutContent;
  }

  return <AuthGuard>{layoutContent}</AuthGuard>;
}