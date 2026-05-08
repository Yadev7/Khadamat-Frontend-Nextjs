// src/components/steps/Step2Contact.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getContactsList } from "@/api/businesses-api";
import { Phone, Mail, MapPin, Search, Languages, Map as MapIcon, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";


// استيراد الخريطة بشكل ديناميكي
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-[350px] bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center text-slate-400">Loading Map...</div>
});

export function Step2Contact() {
    const { register, watch, setValue } = useFormContext();
    const selectedContactId = watch("contactId");

    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    

    useEffect(() => {
        const loadContacts = async () => {
            try {
                setLoading(true);
                const response = await getContactsList();
                const data = response?.data || response || [];
                setContacts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error loading contacts:", err);
            } finally {
                setLoading(false);
            }
        };
        loadContacts();
    }, []);

    const currentContact = contacts.find((c) => String(c.id) === String(selectedContactId));

    // تحديث الإحداثيات عند النقر على الخريطة
    // const handleLocationSelect = (lat: number, lng: number) => {
    //     setValue("manualLatitude", lat.toFixed(6));
    //     setValue("manualLongitude", lng.toFixed(6));
    // };

    const handleLocationSelect = (lat: number, lng: number) => {
    // تحديث القيم في الفورم لتظهر في الـ inputs الـ readOnly
    setValue("manualLatitude", lat.toFixed(6));
    setValue("manualLongitude", lng.toFixed(6));
};

    // مزامنة الإحداثيات الحقيقية مع الحقول عند اختيار جهة اتصال
    useEffect(() => {
        if (currentContact?.address?.localisation) {
            setValue("manualLatitude", currentContact.address.localisation.latitude);
            setValue("manualLongitude", currentContact.address.localisation.longitude);
        } else {
            setValue("manualLatitude", "");
            setValue("manualLongitude", "");
        }
    }, [selectedContactId, currentContact, setValue]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Selection Dropdown */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Search size={16} className="text-indigo-500" /> Choose Existing Contact
                </label>
                <select
                    {...register("contactId", { required: true })}
                    className="border-2 border-indigo-100 p-4 w-full rounded-2xl bg-indigo-50/50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                    <option value="">{loading ? "Loading..." : "Select Existing Contact"}</option>
                    {contacts.map((c: any) => (
                        <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} — {c.phoneCell || c.email}
                        </option>
                    ))}
                </select>
            </div>

            {selectedContactId && currentContact && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-in zoom-in-95 duration-300">

                    {/* Identity Section */}
                    <div className="col-span-full border-b border-slate-200 pb-3 flex items-center gap-2">
                        <Languages size={14} className="text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Details</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">
                            {currentContact.firstName} {currentContact.lastName}
                        </div>
                    </div>

                    <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الاسم الكامل</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">
                            {currentContact.firstNameAr} {currentContact.lastNameAr}
                        </div>
                    </div>

                    {/* Geographic Location Selection Section */}
                    <div className="col-span-full border-b border-slate-200 pb-3 mt-4 flex items-center gap-2">
                        <MapIcon size={14} className="text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Geographic Location (Click Map to Update)</p>
                    </div>

                    <div className="col-span-full">
                        <div className="h-[350px] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-lg relative">
                            <MapComponent
                                isPicker={true}
                                onLocationSelect={handleLocationSelect}
                                center={
                                    currentContact.address?.localisation?.latitude
                                        ? [parseFloat(currentContact.address.localisation.latitude), parseFloat(currentContact.address.localisation.longitude)]
                                        : undefined
                                }
                            />
                        </div>

                        {/* الإحداثيات المستخرجة */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                <label className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">Latitude</label>
                                <input
                                    {...register("manualLatitude")}
                                    readOnly
                                    className="w-full text-sm font-mono font-bold text-slate-700 outline-none"
                                    placeholder="Click on map..."
                                />
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                <label className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">Longitude</label>
                                <input
                                    {...register("manualLongitude")}
                                    readOnly
                                    className="w-full text-sm font-mono font-bold text-slate-700 outline-none"
                                    placeholder="Click on map..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Physical Address Info */}
                    <div className="col-span-full space-y-1 mt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Street / Address Line</label>
                        <div className="p-4 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2">
                            <MapPin size={14} className="text-rose-500" />
                            {currentContact.address?.lineAddressFr || "No specific address provided"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}