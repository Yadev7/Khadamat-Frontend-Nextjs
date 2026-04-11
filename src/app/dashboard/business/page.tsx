"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Trash2, Globe, Phone, FileText, Loader2 } from "lucide-react";
import { getBusinesses, deleteBusiness } from "@/services/businesses-api";
import AddBusinessModal from "@/components/AddBusinessModal";
import { useTranslation } from "react-i18next";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { i18n, t } = useTranslation();



const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const response = await getBusinesses(1, 10);
    
    // Check if response is the array directly or the paginated object
    // NestJS Starter returns { data: [...], hasNextPage: ... }
    const dataArray = response?.data || (Array.isArray(response) ? response : []);
    setBusinesses(dataArray);

  } catch (err: any) {
    // If this logs "Network Error", your backend is down or CORS is blocking you
    console.error("Full Error Object:", err); 
    
    if (!err.response) {
      alert("No response from server. Check if the NestJS backend is running on port 3001.");
    }
  } finally {
    setLoading(false);
  }
}, []);

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await getBusinesses();
//       setBusinesses(response.data || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteBusiness(id);
    setBusinesses(prev => prev.filter(b => b.id !== id));
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manage Businesses</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> Add Business
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {businesses.map((biz) => (
          <div key={biz.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 relative group">
            <button 
              onClick={() => handleDelete(biz.id)}
              className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
            <h3 className="text-xl font-bold mb-2">{biz.nameFr || biz.nameAr}</h3>
            <div className="space-y-2 text-sm text-slate-600">

              {/* داخل حلقة الـ map في صفحة الـ Business */}

{/* عرض اسم الخدمة */}
<p className="flex items-center gap-2">
  <FileText size={14} /> 
  {biz.service?.nameFr || biz.service?.nameAr || 'No Service Name'}
</p>

{/* عرض رابط الموقع */}
<p className="flex items-center gap-2">
  <Globe size={14} /> 
  {biz.businessUrlSite || 'No Website'}
</p>

{/* عرض اسم المالك (الآن سيظهر لأننا أضفنا owner.contact في الـ relations) */}
<p className="flex items-center gap-2">
  <Building2 size={14} /> 
  Owner: {biz.owner?.contact?.firstName || biz.owner?.user?.email || 'Unknown'}
</p>
              {/* <p className="flex items-center gap-2"><Globe size={14} /> {biz.businessUrlSite || 'No Website'}</p>
              <p className="flex items-center gap-2"><FileText size={14} /> {biz.service?.nameFr || 'No Service'}</p>
              <p className="flex items-center gap-2"><Building2 size={14} /> Owner: {biz.owner?.contact?.firstName}</p> */}
            </div>
          </div>
        ))}
      </div>

      <AddBusinessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}