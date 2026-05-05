"use client";

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getContactsList } from "@/api/businesses-api";
import { Phone, Mail, MapPin, Search, User, Languages } from "lucide-react";

export function Step2Contact() {
    const { register, watch } = useFormContext();
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Selection Dropdown */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Search size={16} className="text-indigo-500" /> Choose Existing Contact
                </label>
                {/* <select {...register("contactId", { required: true })} className="border-2 border-indigo-100 p-4 w-full rounded-2xl bg-indigo-50/50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                > */}
                <select {...register("contactId", { required: true })} className="border-2 border-indigo-100 p-4 w-full rounded-2xl bg-indigo-50/50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"   >
                    <option value="">{loading ? "Loading..." : "Select Existing Contact"}</option>
                    {contacts.map((c: any) => (
                        <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} — {c.phoneCell || c.email}
                        </option>
                    ))}
                </select>
            </div>

            {/* Read-Only Data Display */}
            {selectedContactId && currentContact && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-in zoom-in-95 duration-300">

                    {/* Multilingual Names Section */}
                    <div className="col-span-full border-b border-slate-200 pb-3 flex items-center gap-2">
                        <Languages size={14} className="text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Details</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">First Name (Latin)</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">{currentContact.firstName}</div>
                    </div>

                    <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الاسم الشخصي (Ar)</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">{currentContact.firstNameAr}</div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Last Name (Latin)</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">{currentContact.lastName}</div>
                    </div>

                    <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الاسم العائلي (Ar)</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">{currentContact.lastNameAr}</div>
                    </div>

                    {/* Communication Section */}
                    <div className="col-span-full border-b border-slate-200 pb-3 mt-4 flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Channels</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mobile Phone</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">{currentContact.phoneCell || "N/A"}</div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm truncate">{currentContact.email}</div>
                    </div>

                    {/* Address Relation Section */}
                    <div className="col-span-full border-b border-slate-200 pb-3 mt-4 flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linked Address</p>
                    </div>

                    <div className="col-span-full space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Physical Address</label>
                        <div className="p-4 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">
                            {currentContact.address?.lineAddressFr || currentContact.address?.lineAddressAr || "No address details found in record"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}