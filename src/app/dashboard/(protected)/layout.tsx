import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClientLayout from '../DashboardClientLayout';

export default async function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/sign-in');
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}