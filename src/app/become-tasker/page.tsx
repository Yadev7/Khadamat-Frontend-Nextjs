"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Wrench, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function BecomeTaskerPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
  });

  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  // Shared Focus Classes for inputs
  const inputClasses = `
    w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl 
    outline-none transition-all duration-300 text-sm
    focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 
    focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] focus:-translate-y-0.5
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8 overflow-hidden">

      {/* Main Container with Slide Up and Deep Shadow */}
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row animate-slide-up border border-white/20">

        {/* Left Section: Visual Sidebar */}
        <div className="hidden md:flex md:w-2/5 relative overflow-hidden flex-col justify-between text-white p-12">

          <Image
            src="/become_tasker.png"
            alt="Service provider working"
            fill
            priority
            className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
          />

          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/40 via-blue-900/60 to-gray-950/90" />
          {/* <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black leading-tight drop-shadow-md">
              {t('become_tasker_page.sidebar_title', 'Build Your Professional Future')}
            </h2>
            <p className="mt-4 text-blue-50/90 text-sm leading-relaxed font-medium max-w-xs">
              {t('become_tasker_page.sidebar_description', 'Join the top network of service providers and grow your business today.')}
            </p>
          </div> */}
          {/* <div className="relative z-10 text-xs font-bold tracking-widest opacity-60 uppercase">
            Khadamat Platform © 2026
          </div> */}
        </div>

        {/* Right Section: The Form */}
        <div className="w-full md:w-3/5 p-8 sm:p-12 md:p-16">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {t('become_tasker_page.title')}
            </h1>
            <p className="text-gray-500 mt-3 text-sm sm:text-base font-medium">
              {t('become_tasker_page.description')}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-1.5 group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                  {t('become_tasker_page.form.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="name"
                    type="text"
                    required
                    className={inputClasses}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('become_tasker_page.form.name_placeholder')}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                  {t('become_tasker_page.form.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    className={inputClasses}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('become_tasker_page.form.email_placeholder')}
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                {t('become_tasker_page.form.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="phone"
                  type="tel"
                  required
                  className={inputClasses}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('become_tasker_page.form.phone_placeholder')}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                {t('become_tasker_page.form.skills')}
              </label>
              <div className="relative">
                <Wrench className="absolute left-3.5 top-4 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  id="skills"
                  required
                  className={`${inputClasses} min-h-[140px] pt-4 resize-none`}
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder={t('become_tasker_page.form.skills_placeholder')}
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] hover:shadow-blue-500/50 mt-4 cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span className="text-lg">{t("become_tasker_page.submit")}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Global Animation Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slow-zoom {
          animation: slowZoom 30s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}