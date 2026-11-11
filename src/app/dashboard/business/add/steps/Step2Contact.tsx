"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getContactsList } from "@/api/businesses-api";
import { Phone, Mail, MapPin, Search, Languages, Map as MapIcon, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-[350px] bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center text-slate-400 dark:bg-gray-800 dark:text-gray-500">Loading Map...</div>
});

export function Step2Contact() {
    const { register, watch, setValue } = useFormContext();
    const { t } = useTranslation();
    const selectedContactId = watch("contactId");
    const manualLat = watch("manualLatitude");
    const manualLng = watch("manualLongitude");

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

    const handleLocationSelect = (lat: number, lng: number) => {
        setValue("manualLatitude", lat.toFixed(6));
        setValue("manualLongitude", lng.toFixed(6));
    };

    useEffect(() => {
        if (currentContact?.address?.localisation) {
            setValue("manualLatitude", currentContact.address.localisation.latitude);
            setValue("manualLongitude", currentContact.address.localisation.longitude);
        } else {
            setValue("manualLatitude", "");
            setValue("manualLongitude", "");
        }
    }, [selectedContactId, currentContact, setValue]);

    const activeMarker = useMemo(() => {
        if (manualLat && manualLng) {
            return [{
                id: selectedContactId || "temporary-preview-id",
                position: [parseFloat(manualLat), parseFloat(manualLng)] as [number, number],
                label: currentContact ? `${currentContact.firstName} ${currentContact.lastName}` : "Selected Location",
                address: currentContact?.address?.lineAddressFr || "",
                active: true
            }];
        }
        return [];
    }, [manualLat, manualLng, currentContact, selectedContactId]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Selection Dropdown */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 dark:text-gray-200">
                    <Search size={16} className="text-indigo-500" /> {t("dashboard.business.step2.existing_manager")}
                </label>
                <select
                    {...register("contactId", { required: true })}
                    className="border-2 border-indigo-100 p-4 w-full rounded-2xl bg-indigo-50/50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-gray-100"
                >
                    <option value="">{loading ? "Loading..." : t("dashboard.business.step2.choose_existing_manager")}</option>
                    {contacts.map((c: any) => (
                        <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} — {c.phoneCell || c.email}
                        </option>
                    ))}
                </select>
            </div>

            {selectedContactId && currentContact && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-in zoom-in-95 duration-300 dark:bg-gray-900 dark:border-gray-700">

                    {/* Identity Section */}
                    <div className="col-span-full border-b border-slate-200 pb-3 flex items-center gap-2 dark:border-gray-700">
                        <Languages size={14} className="text-slate-400 dark:text-gray-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">{t("dashboard.business.step2.identity_details")}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-gray-500">{t("dashboard.business.step2.full_name")}</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                            {currentContact.firstName} {currentContact.lastName}
                        </div>
                    </div>

                    <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mr-1 dark:text-gray-500">{t("dashboard.business.step2.full_name_ar")}</label>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                            {currentContact.firstNameAr} {currentContact.lastNameAr}
                        </div>
                    </div>

                    <div className="col-span-full border-b border-slate-200 pb-3 mt-4 flex items-center gap-2 dark:border-gray-700">
                        <MapIcon size={14} className="text-slate-400 dark:text-gray-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">{t("dashboard.business.step2.geographic_location")}</p>
                    </div>

                    <div className="col-span-full">
                        <div className="h-[350px] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-lg relative dark:border-gray-700">
                            <MapComponent
                                isPicker={true}
                                onLocationSelect={handleLocationSelect}
                                center={
                                    manualLat && manualLng
                                        ? [parseFloat(manualLat), parseFloat(manualLng)]
                                        : undefined
                                }
                                markers={activeMarker}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <label className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">{t("dashboard.business.step2.latitude")}</label>
                                <input
                                    {...register("manualLatitude")}
                                    readOnly
                                    className="w-full text-sm font-mono font-bold text-slate-700 outline-none dark:text-gray-200 bg-transparent"
                                    placeholder={t("dashboard.business.step2.click_on_map")}
                                />
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <label className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">{t("dashboard.business.step2.longitude")}</label>
                                <input
                                    {...register("manualLongitude")}
                                    readOnly
                                    className="w-full text-sm font-mono font-bold text-slate-700 outline-none dark:text-gray-200 bg-transparent"
                                    placeholder={t("dashboard.business.step2.click_on_map")}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full space-y-1 mt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-gray-500">{t("dashboard.business.step2.street_address")}</label>
                        <div className="p-4 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                            <MapPin size={14} className="text-rose-500" />
                            {currentContact.address?.lineAddressFr || t("dashboard.business.step2.no_address_provided")}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}