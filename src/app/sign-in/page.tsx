"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const { login, user } = useAuth();

  const getBannerImage = () => {
    switch (i18n.language) {
      case 'ar': return "/signIn-ar.png";
      case 'fr': return "/signIn-fr.png";
      default: return "/signIn-en.png";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // لا نقوم بـ Redirect هنا، الـ AuthGuard سيتكفل بالأمر فور تغير حالة user
      console.log("Login success, Guard will handle redirect...");
    } catch (err: any) {
      setLoading(false);
      console.error("Login Error:", err);

      // استخراج رسالة الخطأ بدقة سواء من Axios أو Fetch
      const serverMessage = err?.response?.data?.message || err?.message;
      const status = err?.response?.status;

      if (serverMessage === 'ACCOUNT_INACTIVE') {
        setError("عذراً، حسابك غير نشط حالياً. يرجى الاتصال بالدعم الفني.");
      } else if (status === 401 || serverMessage === 'INVALID_CREDENTIALS' || serverMessage === 'Unauthorized') {
        setError("الإيميل أو كلمة المرور غير صحيحة.");
      } else {
        // عرض الخطأ الفعلي للتصحيح بدلاً من افتراض أنه خطأ كلمة مرور
        setError(`خطأ في الاتصال أو الخادم: ${serverMessage || "يرجى المحاولة لاحقاً."}`);
      }
    }
  };

  // إذا كان المستخدم مسجلاً بالفعل، تجنب وميض الصفحة أثناء التوجيه
  if (user) return null;

  return (
    <div className="min-h-screen bg-white text-gray-800 flex font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-3">{t('sign_in.title')}</h2>
          <p className="text-gray-600 mb-8">{t('sign_in.description')}</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">{t('sign_in.email')}</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500/20" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('sign_in.password')}</label>
              <div className="relative">
                <input 
                  type={passwordVisible ? "text" : "password"} 
                  value={password} 
                  onChange={(e5) => setPassword(e5.target.value)} 
                  className="w-full border rounded-lg p-3 outline-none" 
                  required 
                />
                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-3 top-3 text-sm text-gray-500">
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold disabled:bg-blue-400"
            >
              {loading ? t('sign_in.loading') : t('sign_in.sign_in_button')}
            </button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 relative bg-gray-50">
        <Image src={getBannerImage()} alt="Sign In" fill priority className="object-cover" />
      </div>
    </div>
  );
}