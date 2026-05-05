"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getServicesList, getMembersList } from "@/api/businesses-api";
import { Building2, AlignLeft, Globe, Share2, User, Languages } from "lucide-react";

export function Step1Service() {
    const { register, formState: { errors } } = useFormContext();
    const [services, setServices] = useState([]);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sData, mData] = await Promise.all([
                    getServicesList(),
                    getMembersList()
                ]);
                setServices(sData.data || sData);
                setMembers(mData.data || mData);
            } catch (err) {
                console.error("Error loading data in Step1Service:", err);
            }
        };
        loadData();
    }, []);

    // Helper to render consistent input styles
    const inputClass = (fieldName: string) => `
        w-full p-3 border rounded-xl outline-none transition-all
        ${errors[fieldName] ? "border-red-500 bg-red-50 shadow-sm" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"}
    `;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* --- SECTION: BUSINESS NAMES --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <Languages size={12}/> Name (EN)
                    </label>
                    <input {...register("nameEn")} placeholder="e.g. Atlas Tech" className={inputClass("nameEn")} />
                    {errors.nameEn && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.nameEn.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <Languages size={12}/> Nom (FR)
                    </label>
                    <input {...register("nameFr")} placeholder="ex: Atlas Tech" className={inputClass("nameFr")} />
                    {errors.nameFr && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.nameFr.message)}</p>}
                </div>
                <div className="space-y-1 text-right" dir="rtl">
                    <label className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center justify-end gap-1">
                        الاسم (AR) <Languages size={12}/>
                    </label>
                    <input {...register("nameAr")} placeholder="مثال: أطلس للتقنية" className={`${inputClass("nameAr")} text-right`} />
                    {errors.nameAr && <p className="text-[10px] text-red-500 font-bold mt-1 mr-1">{String(errors.nameAr.message)}</p>}
                </div>
            </div>

            {/* --- SECTION: DESCRIPTIONS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <AlignLeft size={12}/> Description (EN)
                    </label>
                    <textarea {...register("descrEn")} rows={3} className={inputClass("descrEn")} placeholder="Business details..." />
                    {errors.descrEn && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.descrEn.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <AlignLeft size={12}/> Description (FR)
                    </label>
                    <textarea {...register("descrFr")} rows={3} className={inputClass("descrFr")} placeholder="Détails de l'entreprise..." />
                    {errors.descrFr && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.descrFr.message)}</p>}
                </div>
                <div className="space-y-1 text-right" dir="rtl">
                    <label className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center justify-end gap-1">
                        الوصف (AR) <AlignLeft size={12}/>
                    </label>
                    <textarea {...register("descrAr")} rows={3} className={`${inputClass("descrAr")} text-right`} placeholder="تفاصيل العمل..." />
                    {errors.descrAr && <p className="text-[10px] text-red-500 font-bold mt-1 mr-1">{String(errors.descrAr.message)}</p>}
                </div>
            </div>

            {/* --- SECTION: CLASSIFICATION & OWNER --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <Building2 size={12} /> Service Type
                    </label>
                    <select {...register("serviceId")} className={inputClass("serviceId")}>
                        <option value="">Select Service</option>
                        {services.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.nameServEn || s.nameServAr}</option>
                        ))}
                    </select>
                    {errors.serviceId && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.serviceId.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <User size={12} /> Business Owner
                    </label>
                    <select {...register("ownerId")} className={inputClass("ownerId")}>
                        <option value="">Select Owner</option>
                        {members.map((member: any) => (
                            <option key={member.id} value={member.id}>
                                {member.contact?.firstName || member.email}
                            </option>
                        ))}
                    </select>
                    {errors.ownerId && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.ownerId.message)}</p>}
                </div>
            </div>

            {/* --- SECTION: LINKS & SOCIAL --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-2">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <Globe size={12}/> Website URL
                    </label>
                    <input {...register("siteUrl")} placeholder="https://www.example.com" className={inputClass("siteUrl")} />
                    {errors.siteUrl && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.siteUrl.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <Share2 size={12}/> Social Media
                    </label>
                    <input {...register("socialMedia")} placeholder="@username or link" className={inputClass("socialMedia")} />
                </div>
            </div>
        </div>
    );
}