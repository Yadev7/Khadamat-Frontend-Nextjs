// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import DashboardClientLayout from './DashboardClientLayout';

// // Notice the 'async' keyword here
// export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const cookieStore = await cookies();
//   const token = cookieStore.get('auth_token')?.value;

//   // Server-side redirect stops the "flash" before rendering
//   if (!token) {
//     redirect('/sign-in');
//   }

//   return <DashboardClientLayout>{children}</DashboardClientLayout>;
// }


// import { cookies, headers } from 'next/headers';
// import { redirect } from 'next/navigation';
// import DashboardClientLayout from './DashboardClientLayout';

// export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const cookieStore = await cookies();
//   const token = cookieStore.get('auth_token')?.value;

//   // جلب الـ headers للتحقق من المسار المطلوب
//   const headersList = await headers();
//   const pathname = headersList.get('x-invoke-path') || headersList.get('referer') || '';

//   // إلا كان المسار خاص بتفاصيل محل تجاري داخل الدواشبورد
//   const isPublicBusinessPage = pathname.includes('/dashboard/business/');

//   // كيدير Redirect فقط إلا ما كانش توكن وما كانش في صفحة الـ Business العامة
//   if (!token && !isPublicBusinessPage) {
//     redirect('/sign-in');
//   }

//   return <DashboardClientLayout>{children}</DashboardClientLayout>;
// }


import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const headersList = await headers();
  const currentPath = headersList.get('x-current-path') || '';

  const isPublicBusinessPage = currentPath.startsWith('/dashboard/business/');

  if (!token && !isPublicBusinessPage) {
    redirect('/sign-in');
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}