'use client';

import './globals.css'
import Header from '../components/Header'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ReduxProvider } from '../store/redux-provider'
import { AuthProvider } from '../context/AuthContext';
// 🚀 استورد الـ AuthGuard
import AuthGuard from '../components/AuthGuard'; 
import { ThemeProvider } from 'next-themes'
import '../i18n/index'

export default function RootLayout({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const isAr = i18n.language === 'ar';

  return (
    <html suppressHydrationWarning className="hide-scrollbar">
      <body className={`
        hide-scrollbar min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300
        ${isAr ? 'font-arabic' : 'font-sans'}
      `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {/* 🛡️ حط الـ AuthGuard هنا باش يتحكم ف كاع الصفحات */}
            <AuthGuard>
              <ReduxProvider>
                <Header /> 
                <main dir={isAr ? 'rtl' : 'ltr'}>
                  {children}
                </main>
              </ReduxProvider>
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

