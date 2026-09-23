'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut, User, ChevronDown, Globe } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { user, logout } = useAuth();

  // Handle client hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update HTML direction and language attributes dynamically
  useEffect(() => {
    if (!mounted) return;
    const currentLang = i18n.language || 'ar';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language, mounted]);

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      closeAllMenus();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    i18n.changeLanguage(newLang);

    // Persist language preference
    localStorage.setItem('i18nextLng', newLang);
    document.cookie = `i18nextLng=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;

    // Immediately reflect dir/lang on document
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  // Safe locale value during SSR to avoid mismatch
  const activeLang = mounted ? (i18n.language?.substring(0, 2) || 'ar') : 'ar';

  return (
    <header className="sticky top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <div className="shrink-0">
            <Link href="/" onClick={closeAllMenus} className="flex items-center group gap-2">
              <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-blue-500/20 shadow-lg group-hover:rotate-6 transition-transform duration-300">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                {mounted ? t('header.title') : 'Service'}<span className="text-blue-600">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/about">
              {mounted ? (t('header.about_us') || 'About Us') : 'About Us'}
            </NavLink>
            <NavLink href="/contact">
              {mounted ? (t('header.contact_us') || 'Contact Us') : 'Contact Us'}
            </NavLink>
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-3 lg:gap-6">

            <ThemeToggle />

            {/* Desktop Language Switcher */}
            <div className="relative group hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Globe size={16} className="text-gray-500" />
              <select
                value={activeLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-sm font-bold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer"
              >
                <option value="en" className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">English</option>
                <option value="ar" className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">العربية</option>
                <option value="fr" className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">Français</option>
              </select>
            </div>

            {/* AUTH SECTION */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 pe-3 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-950 overflow-hidden flex items-center justify-center">
                      {(user.picture as string) || user.photo?.path ? (
                        <Image 
                          src={(user.picture as string) || (user.photo?.path ? `${process.env.NEXT_PUBLIC_API_ENDPOINT?.replace(/\/api$/, '') || 'http://127.0.0.1:3001'}/api/v1/files/${user.photo.path}` : '')} 
                          alt="Profile" 
                          width={36} 
                          height={36} 
                          className="object-cover" 
                        />
                      ) : (
                        <User size={18} className="text-blue-500" />
                      )}
                    </div>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none mb-1">
                      {user?.firstName || user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email?.split('@')[0]}
                    </p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800 mb-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.email}</p>
                    </div>

                    <DropdownItem 
                      href="/dashboard" 
                      onClick={closeAllMenus} 
                      icon={<User size={18} />} 
                      label={mounted ? (t('header.dashboard') || 'Dashboard') : 'Dashboard'} 
                    />

                    <DropdownItem 
                      href="/dashboard/profile" 
                      onClick={closeAllMenus} 
                      icon={<User size={18} />} 
                      label={mounted ? (t('header.profile') || 'My Profile') : 'My Profile'} 
                    />

                    <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors text-left"
                      >
                        <LogOut size={18} />
                        <span>{mounted ? (t('header.logout') || 'Logout') : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold text-white transition-all duration-300 bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
              >
                <span className="relative text-sm">{mounted ? t("header.sign_in") : 'Sign In'}</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-4 space-y-2">

            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</span>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <select
                  value={activeLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-sm font-bold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="en" className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">English</option>
                  <option value="ar" className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">العربية</option>
                  <option value="fr" className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">Français</option>
                </select>
              </div>
            </div>

            <Link 
              href="/about" 
              onClick={closeAllMenus} 
              className="px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors"
            >
              {mounted ? t('header.about_us') : 'About Us'}
            </Link>

            <Link 
              href="/contact" 
              onClick={closeAllMenus} 
              className="px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors"
            >
              {mounted ? t('header.contact_us') : 'Contact Us'}
            </Link>

            {user && (
              <>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
                <Link 
                  href="/dashboard" 
                  onClick={closeAllMenus} 
                  className="px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors"
                >
                  {mounted ? t('header.dashboard') : 'Dashboard'}
                </Link>
                <Link 
                  href="/dashboard/profile" 
                  onClick={closeAllMenus} 
                  className="px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors"
                >
                  {mounted ? t('header.profile') : 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-left rtl:text-right rounded-xl text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full"
                >
                  {mounted ? t('header.logout') : 'Logout'}
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

// --- Helper Components ---

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="relative text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
  >
    {children}
    <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full group-hover:left-0" />
  </Link>
);

const DropdownItem = ({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Header;