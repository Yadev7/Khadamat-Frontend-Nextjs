"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { UserCheck, UserPlus, ShieldCheck, Mail, Phone, User } from "lucide-react";
import { getMembersList } from "@/api/businesses-api";

export function Step3Manager() {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const [members, setMembers] = useState<any[]>([]);

    const ownerId = watch("ownerId");
    const managementType = watch("managementType");

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const response = await getMembersList();
                const data = response?.data || response || [];
                setMembers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error loading members:", err);
            }
        };
        loadMembers();
    }, []);

    const selectedOwner = members.find((m) => String(m.id) === String(ownerId));

    // --- CRITICAL FIX: Synchronize Owner Data into Hook Form State ---
    useEffect(() => {
        if (managementType === 'ownerId' && selectedOwner) {
            setValue("newManagerFirstName", selectedOwner.contact?.firstName || "");
            setValue("newManagerFirstNameAr", selectedOwner.contact?.firstNameAr || "");
            setValue("newManagerLastName", selectedOwner.contact?.lastName || "");
            setValue("newManagerLastNameAr", selectedOwner.contact?.lastNameAr || "");
            setValue("newManagerEmail", selectedOwner.email || selectedOwner.contact?.email || "");
            setValue("newManagerPhone", selectedOwner.contact?.phoneCell || "");
        } else if (managementType === 'newManagedId') {
            // Optional: Reset fields when switching to "New Manager" 
            // so they start empty
            setValue("newManagerFirstName", "");
            setValue("newManagerFirstNameAr", "");
            setValue("newManagerLastName", "");
            setValue("newManagerLastNameAr", "");
            setValue("newManagerEmail", "");
            setValue("newManagerPhone", "");
        }
    }, [managementType, selectedOwner, setValue]);

    const inputClass = (fieldName: string, isReadOnly: boolean) => `
        w-full p-3 border rounded-xl outline-none transition-all text-sm
        ${isReadOnly ? "bg-slate-50 border-slate-200 text-slate-500 font-semibold cursor-not-allowed" :
            errors[fieldName] ? "border-red-500 bg-red-50" : "border-slate-200 focus:border-indigo-500"}
    `;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Selection Grid */}
            <div className="grid grid-cols-2 gap-4">
                <label className={`p-6 border-2 rounded-3xl cursor-pointer transition-all flex flex-col items-center gap-3 ${managementType === 'ownerId' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100 opacity-60'}`}>
                    <input type="radio" value="ownerId" {...register("managementType")} className="hidden" />
                    <UserCheck size={32} className={managementType === 'ownerId' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="font-bold text-slate-800 text-sm">Owner is Manager</span>
                </label>

                <label className={`p-6 border-2 rounded-3xl cursor-pointer transition-all flex flex-col items-center gap-3 ${managementType === 'newManagedId' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100 opacity-60'}`}>
                    <input type="radio" value="newManagedId" {...register("managementType")} className="hidden" />
                    <UserPlus size={32} className={managementType === 'newManagedId' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="font-bold text-slate-800 text-sm">New Manager</span>
                </label>
            </div>

            {managementType && (
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 space-y-6 ${managementType === 'ownerId' ? 'bg-slate-50/50 border-dashed border-slate-200' : 'bg-white border-indigo-100 shadow-xl shadow-indigo-100/20'}`}>
                    <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
                        {managementType === 'ownerId' ? <ShieldCheck size={18} className="text-emerald-500" /> : <User size={18} className="text-indigo-500" />}
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {managementType === 'ownerId' ? "Owner Profile (Read Only)" : "New Manager Details"}
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">First Name (EN)</label>
                            <input
                                {...register("newManagerFirstName")}
                                readOnly={managementType === 'ownerId'}
                                placeholder="First Name"
                                className={inputClass("newManagerFirstName", managementType === 'ownerId')}
                            />
                        </div>

                        <div className="space-y-1 text-right" dir="rtl">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الاسم الشخصي</label>
                            <input
                                {...register("newManagerFirstNameAr")}
                                readOnly={managementType === 'ownerId'}
                                placeholder="الاسم"
                                className={`${inputClass("newManagerFirstNameAr", managementType === 'ownerId')} text-right`}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Last Name (EN)</label>
                            <input
                                {...register("newManagerLastName")}
                                readOnly={managementType === 'ownerId'}
                                placeholder="Last Name"
                                className={inputClass("newManagerLastName", managementType === 'ownerId')}
                            />
                        </div>

                        <div className="space-y-1 text-right" dir="rtl">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الاسم العائلي</label>
                            <input
                                {...register("newManagerLastNameAr")}
                                readOnly={managementType === 'ownerId'}
                                placeholder="النسب"
                                className={`${inputClass("newManagerLastNameAr", managementType === 'ownerId')} text-right`}
                            />
                        </div>

                        <div className="col-span-full space-y-1 pt-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                                <Mail size={10} /> Contact Email
                            </label>
                            <input
                                {...register("newManagerEmail")}
                                readOnly={managementType === 'ownerId'}
                                type="email"
                                placeholder="email@example.com"
                                className={inputClass("newManagerEmail", managementType === 'ownerId')}
                            />
                        </div>

                        <div className="col-span-full space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                                <Phone size={10} /> Mobile Phone
                            </label>
                            <input
                                {...register("newManagerPhone")}
                                readOnly={managementType === 'ownerId'}
                                placeholder="+212 ..."
                                className={inputClass("newManagerPhone", managementType === 'ownerId')}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}