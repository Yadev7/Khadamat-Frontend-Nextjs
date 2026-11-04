"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getServicesList, getMembersList } from "@/api/businesses-api";
import { Building2, AlignLeft, Globe, Share2, User, Languages } from "lucide-react";

export function Step1Service() {
    const { register, formState: { errors } } = useFormContext();
    const { t, i18n } = useTranslation(); // <-- Correctly extracted from useTranslation hook
    const [services, setServices] = useState([]);
    const [members, setMembers] = useState([]);
    console.log("Current Language:", i18n.language);
console.log("Translated Test:", t("business.step1.name_english"));
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

    const langSuffix = i18n.language ? i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1) : 'En';

    const inputClass = (fieldName: string) => `
        w-full p-3 border rounded-xl outline-none transition-all
        ${errors[fieldName] ? "border-red-500 bg-red-50 shadow-sm dark:bg-red-950 dark:border-red-700" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-indigo-900"}
    `;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* --- SECTION: BUSINESS NAMES --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <Languages size={12}/> {t("dashboard.business.step1.name_english")}
                    </label>
                    <input {...register("nameEn")} placeholder="e.g. Atlas Tech" className={inputClass("nameEn")} />
                    {errors.nameEn && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.nameEn.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <Languages size={12}/> {t("dashboard.business.step1.name_french")}
                    </label>
                    <input {...register("nameFr")} placeholder="ex: Atlas Tech" className={inputClass("nameFr")} />
                    {errors.nameFr && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.nameFr.message)}</p>}
                </div>
                <div className="space-y-1 text-right" dir="rtl">
                    <label className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center justify-end gap-1 dark:text-gray-400">
                        {t("dashboard.business.step1.name_arabic")} <Languages size={12}/>
                    </label>
                    <input {...register("nameAr")} placeholder="مثال: أطلس للتقنية" className={`${inputClass("nameAr")} text-right`} />
                    {errors.nameAr && <p className="text-[10px] text-red-500 font-bold mt-1 mr-1">{String(errors.nameAr.message)}</p>}
                </div>
            </div>

            {/* --- SECTION: DESCRIPTIONS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <AlignLeft size={12}/> {t("dashboard.business.step1.description_english")}
                    </label>
                    <textarea {...register("descrEn")} rows={3} className={inputClass("descrEn")} placeholder="Business details..." />
                    {errors.descrEn && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.descrEn.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <AlignLeft size={12}/> {t("dashboard.business.step1.description_french")}
                    </label>
                    <textarea {...register("descrFr")} rows={3} className={inputClass("descrFr")} placeholder="Détails de l'entreprise..." />
                    {errors.descrFr && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.descrFr.message)}</p>}
                </div>
                <div className="space-y-1 text-right" dir="rtl">
                    <label className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center justify-end gap-1 dark:text-gray-400">
                        {t("dashboard.business.step1.description_arabic")} <AlignLeft size={12}/>
                    </label>
                    <textarea {...register("descrAr")} rows={3} className={`${inputClass("descrAr")} text-right`} placeholder="تفاصيل العمل..." />
                    {errors.descrAr && <p className="text-[10px] text-red-500 font-bold mt-1 mr-1">{String(errors.descrAr.message)}</p>}
                </div>
            </div>

            {/* --- SECTION: CLASSIFICATION & OWNER --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <Building2 size={12} /> {t("dashboard.business.step1.service_type")}
                    </label>
                    <select {...register("serviceId")} className={inputClass("serviceId")}>
                        <option value="">{t("dashboard.business.step1.select_service")}</option>
                        {services.map((s: any) => {
                            const serviceName = s[`nameServ${langSuffix}`] || s.nameServEn || s.nameServAr || "Service";
                            return (
                                <option key={s.id} value={s.id}>
                                    {serviceName}
                                </option>
                            );
                        })}
                    </select>
                    {errors.serviceId && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.serviceId.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <User size={12} /> {t("dashboard.business.step1.business_owner")}
                    </label>
                    <select {...register("ownerId")} className={inputClass("ownerId")}>
                        <option value="">{t("dashboard.business.step1.select_owner")}</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-2 dark:border-gray-800">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <Globe size={12}/> {t("dashboard.business.step1.website_url")}
                    </label>
                    <input {...register("siteUrl")} placeholder="https://www.example.com" className={inputClass("siteUrl")} />
                    {errors.siteUrl && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{String(errors.siteUrl.message)}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 dark:text-gray-400">
                        <Share2 size={12}/> {t("dashboard.business.step1.social_media")}
                    </label>
                    <input {...register("socialMedia")} placeholder="@username or link" className={inputClass("socialMedia")} />
                </div>
            </div>
        </div>
    );
}