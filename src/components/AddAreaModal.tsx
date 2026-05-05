"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Building2, Navigation, Loader2 } from "lucide-react";
import { createCityArea } from "@/api/city-areas-api";
import { getCities } from "@/api/cities-api";

interface AddAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddAreaModal({ isOpen, onClose, onSuccess }: AddAreaModalProps) {
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        nameAr: "",
        nameFr: "",
        cityId: "",
        latitude: "",
        longitude: "",
    });

    // Load cities list for the dropdown
    useEffect(() => {
        if (isOpen) {
            const loadCities = async () => {
                try {
                    const response = await getCities();
                    const data = response?.data || (Array.isArray(response) ? response : []);
                    setCities(data);
                } catch (error) {
                    console.error("Failed to load cities", error);
                }
            };
            loadCities();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            /**
             * Backend Adaptation:
             * We send the names, the linked cityId, and the localisation coordinates.
             */
            await createCityArea({
                nameAr: formData.nameAr,
                nameFr: formData.nameFr,
                cityId: formData.cityId,
                localisation: {
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                }
            });

            onSuccess();
            onClose();
            setFormData({ nameAr: "", nameFr: "", cityId: "", latitude: "", longitude: "" });
        } catch (error) {
            alert("Failed to create area. Ensure all fields are filled.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Add New Area</h2>
                        <p className="text-slate-500 text-sm">Create a zone with map coordinates</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* City Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Building2 size={14} /> Target City
                        </label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.cityId}
                            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                        >
                            <option value="">Select a city...</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.nameFr || city.nameAr}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Area Names */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Name (FR)</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ex: Gueliz"
                                value={formData.nameFr}
                                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest text-right block">الاسم (العربية)</label>
                            <input
                                required
                                type="text"
                                dir="rtl"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="مثال: جيليز"
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Localisation Coordinates */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Navigation size={14} /> Map Coordinates
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Latitude"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            />
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Longitude"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
                        Save Area
                    </button>
                </form>
            </div>
        </div>
    );
}