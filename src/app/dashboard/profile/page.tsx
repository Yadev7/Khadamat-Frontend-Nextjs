"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { updateMe } from "@/api/auth-api"; // تأكد من استيراد الدالة من الـ service ديالك
import { User, Mail, Calendar, Check, Loader2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // State ديال الفورم
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  // تعبئة البيانات ملي كيتسالي التحميل ديال المستخدم
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateMe(formData);
      
      // ضروري تعيط لـ refreshUser باش الـ Context يجيب البيانات الجديدة من السيرفر
      if (refreshUser) await refreshUser();
      
      setMessage({ type: 'success', text: "تم تحديث البيانات بنجاح!" });
      setIsEditing(false);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || "فشل في تحديث البيانات" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الملف الشخصي</h1>
        {message && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm animate-in fade-in slide-in-from-top-1 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
          <div className="absolute -bottom-12 right-8">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-800 bg-white flex items-center justify-center text-3xl font-black text-blue-600 shadow-2xl overflow-hidden">
              {user?.photo?.path ? (
                <img src={user.photo.path} alt="profile" className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="pt-16 pb-8 px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 mt-2 uppercase tracking-wider">
                {/* @ts-ignore */}
                {user?.role?.name || "مستخدم"}
              </span>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    حفظ التغييرات
                  </button>
                </>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded-xl text-sm font-bold border border-gray-100 transition-all"
                >
                  تعديل الملف
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> الإسم الشخصي
              </label>
              {isEditing ? (
                <input 
                  className="w-full border-b-2 border-blue-100 focus:border-blue-600 outline-none py-2 font-medium transition-colors bg-blue-50/30 px-2 rounded-t-md"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              ) : (
                <p className="font-bold text-gray-700 dark:text-gray-200 border-b pb-2 border-gray-50">{user?.firstName || "---"}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> الإسم العائلي
              </label>
              {isEditing ? (
                <input 
                  className="w-full border-b-2 border-blue-100 focus:border-blue-600 outline-none py-2 font-medium transition-colors bg-blue-50/30 px-2 rounded-t-md"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              ) : (
                <p className="font-bold text-gray-700 dark:text-gray-200 border-b pb-2 border-gray-50">{user?.lastName || "---"}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> البريد الإلكتروني
              </label>
              <p className="font-bold text-gray-400 border-b pb-2 border-gray-50 flex items-center justify-between">
                {user?.email}
                <span className="text-[8px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">للقراءة فقط</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> تاريخ الإنضمام
              </label>
              <p className="font-bold text-gray-700 dark:text-gray-200 border-b pb-2 border-gray-50">
                {/* @ts-ignore */}
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : "---"}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}