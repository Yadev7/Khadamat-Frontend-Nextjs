"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Trash2, Globe, Phone, FileText, Loader2, AlertCircle } from "lucide-react";
import { getBusinesses, deleteBusiness } from "@/api/businesses-api";
import AddBusinessModal from "@/components/AddBusinessModal";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { i18n, t } = useTranslation();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBusinesses(1, 20); // Fetches first 20 items

      /** * BACKEND FIX: Handle different response structures
       * NestJS with TypeORM usually returns:
       * 1. { data: [...], meta: {...} } OR 
       * 2. Direct array [...]
       */
      const dataArray = response?.data || (Array.isArray(response) ? response : []);
      setBusinesses(dataArray);

    } catch (err: any) {
      console.error("❌ API Error:", err);
      // Optional: use a toast notification here instead of alert
      if (!err.response) {
        console.error("Connection Refused: Check if Backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // const handleDelete = async (id: string) => {
  //   if (!window.confirm(t("common.confirm_delete") || "Are you sure?")) return;
  //   try {
  //     await deleteBusiness(id);
  //     setBusinesses(prev => prev.filter(b => b.id !== id));
  //   } catch (err) {
  //     alert("Failed to delete business. It might be linked to other records.");
  //   }
  // };


  const handleDelete = (id: string) => {
    const MySwal = withReactContent(Swal);
    const Toast = MySwal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    MySwal.fire({
      title: t('common.confirm_delete_title') || "Are you sure?",
      text: t('common.confirm_delete_text') || "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('common.yes_delete') || "Yes, delete it!",
      cancelButtonText: t('common.cancel') || "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBusiness(id);
          // Optimistic update: remove from state immediately
          setBusinesses(prev => prev.filter(b => b.id !== id));

          Toast.fire({
            icon: 'success',
            title: t('common.deleted') || "Deleted successfully"
          });
        } catch (err) {
          MySwal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to delete business. It might be linked to other records.',
          });
        }
      }
    });
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-500 font-medium animate-pulse">Loading businesses...</p>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Businesses</h1>
          <p className="text-slate-500 text-sm">Create and manage your business profiles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus size={20} /> Add Business
        </button>
      </div>

      {businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <Building2 size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500">No businesses found. Start by adding one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => {
            // Helper for dynamic language selection
            const isAr = i18n.language === 'ar';
            const bizName = isAr ? (biz.nameAr || biz.nameFr) : (biz.nameEn || biz.nameAr);

            // Safe Access for deeply nested relations
            // const serviceName = isAr
            //   ? (biz.service?.nameServAr || biz.service?.nameServFr)
            //   : (biz.service?.nameServFr || biz.service?.nameServAr)
            //   || (biz.service?.nameServEN || biz.service?.nameServAr);

            const serviceName = isAr
              ? (biz.service?.nameServAr || biz.service?.nameServFr || "خدمة غير محددة")
              : (biz.service?.nameServFr || biz.service?.nameServEn || "Unknown Service");

            const ownerName = biz.owner
              ? (biz.owner.contact
                ? `${biz.owner.contact.firstName || ""} ${biz.owner.contact.lastName || ""}`.trim()
                : biz.owner.email || "No Name")
              : "No Owner Assigned";

            return (
              <div key={biz.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 relative group hover:shadow-md transition-shadow">
                {/* <button
                  onClick={() => handleDelete(biz.id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button> */}

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(biz.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("common.delete") || "Delete"}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-4 text-slate-800 truncate pr-8">
                  {bizName || 'Unnamed Business'}
                </h3>

                <div className="space-y-3 text-sm text-slate-600">
                  {/* Service Specialty */}
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <FileText size={14} className="text-indigo-500" />
                    </div>
                    <span className="font-medium truncate">{serviceName || 'No Service Category'}</span>
                  </div>

                  {/* Website URL */}
                  <div className="flex items-center gap-3">
                    <Globe size={14} className="text-slate-400 shrink-0" />
                    {biz.businessUrlSite ? (
                      <a href={biz.businessUrlSite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                        {biz.businessUrlSite.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No website link</span>
                    )}
                  </div>

                  {/* Owner Info */}
                  <div className="flex items-center gap-3">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      <span className="text-slate-400">Owner:</span> {ownerName}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  <span>ID: {String(biz.id).slice(0, 8)}...</span>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddBusinessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}