"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  
  // States باش نتحكمو ف التعديل (مستقبلاً)
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">الملف الشخصي</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header ديال الـ Profile */}
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute -bottom-12 right-8">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg">
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {/* @ts-ignore */}
                {user?.role?.name || "مستخدم"}
              </span>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
            >
              {isEditing ? "إلغاء" : "تعديل البيانات"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* الحقول */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">الإسم الشخصي</label>
              <p className="font-medium border-b pb-1 border-gray-100">{user?.firstName}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">الإسم العائلي</label>
              <p className="font-medium border-b pb-1 border-gray-100">{user?.lastName}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">البريد الإلكتروني</label>
              <p className="font-medium border-b pb-1 border-gray-100">{user?.email}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">تاريخ الانضمام</label>
              {/* @ts-ignore */}
              <p className="font-medium border-b pb-1 border-gray-100">{new Date(user?.createdAt).toLocaleDateString('ar-MA')}</p>
            </div>
          </div>

          {isEditing && (
            <div className="mt-10 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
              <p className="text-sm text-yellow-700">⚠️ خاصية التعديل (Update Profile API) غنصاوبوها ف الخطوة الجاية ف NestJS.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}