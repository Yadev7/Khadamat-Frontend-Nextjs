'use client';

import { useState, useEffect } from 'react';
import { getServices, createService, deleteService } from '@/services/services-api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [nameAr, setNameAr] = useState('');
  const [nameFr, setNameFr] = useState('');

  // جلب الخدمات من السيرفر
  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services", error);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createService({ name_ar: nameAr, name_fr: nameFr });
    setNameAr(''); setNameFr('');
    fetchServices(); // تحديث القائمة
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">إدارة الخدمات (Services)</h1>

      {/* Form لزيادة خدمة جديدة */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">الاسم بالعربية</label>
          <input value={nameAr} onChange={(e)=>setNameAr(e.target.value)} className="w-full border p-2 rounded-lg outline-none" placeholder="مثلاً: حلاق" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">الاسم بالفرنسية</label>
          <input value={nameFr} onChange={(e)=>setNameFr(e.target.value)} className="w-full border p-2 rounded-lg outline-none" placeholder="مثلاً: Coiffeur" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">إضافة</button>
      </form>

      {/* جدول عرض الخدمات */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">الاسم (AR)</th>
              <th className="p-4">الاسم (FR)</th>
              <th className="p-4">العمليات</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s: any) => (
              <tr key={s.id} className="border-b">
                <td className="p-4">{s.name_ar}</td>
                <td className="p-4">{s.name_fr}</td>
                <td className="p-4">
                  <button onClick={() => { deleteService(s.id); fetchServices(); }} className="text-red-500 hover:underline">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}