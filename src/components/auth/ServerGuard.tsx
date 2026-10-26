import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface ServerGuardProps {
  children: ReactNode;
}

export default async function ServerGuard({ children }: ServerGuardProps) {
  const cookieStore = await cookies();
  
  // Get both tokens
  const accessToken = cookieStore.get('auth_token')?.value;
  const refreshToken = cookieStore.get('auth_refresh_token')?.value;

  // The "Hard Stop": If no tokens exist, redirect immediately.
  // This happens on the server before ANY HTML is sent to the browser.
  if (!accessToken && !refreshToken) {
    redirect('/sign-in');
  }

  // If authenticated, render the protected content (children)
  return <>{children}</>;
}