import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClientLayout from './DashboardClientLayout';

// Notice the 'async' keyword here
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // Server-side redirect stops the "flash" before rendering
  if (!token) {
    redirect('/sign-in');
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}