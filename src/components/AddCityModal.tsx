"use client";

import React, { useState } from "react";
import { X, MapPin, Navigation, Loader2, Check } from "lucide-react";
import { createCity } from "@/api/cities-api";

interface AddCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddCityModal({ isOpen, onClose, onSuccess }: AddCityModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nameAr: "",
        nameFr: "",
        latitude: "",
        longitude: "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            /**
             * We send the city names and the nested localisation object
             * which contains the coordinates for the map.
             */
            await createCity({
                nameAr: formData.nameAr,
                nameFr: formData.nameFr,
                localisation: {
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                }
            });

            onSuccess(); // Refresh the list on the parent page
            onClose();   // Close the modal
            setFormData({ nameAr: "", nameFr: "", latitude: "", longitude: "" });
        } catch (error) {
            console.error("Error creating city:", error);
            alert("Failed to create city. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Add New City</h2>
                        <p className="text-slate-500 text-sm">Define a new geographical location</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="grid grid-cols-2 gap-4">
                        {/* French Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">
                                City Name (FR)
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Ex: Casablanca"
                                value={formData.nameFr}
                                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                            />
                        </div>

                        {/* Arabic Name */}
                        {/* <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest text-right block">
                                الاسم (بالعربية)
                            </label>
                            <input
                                required
                                type="text"
                                dir="rtl"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="مثال: الدار البيضاء"
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            />
                        </div> */}
                    </div>

                    {/* Map Coordinates Section */}
                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Navigation size={14} className="text-blue-500" /> Map Pin Coordinates
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Latitude"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Longitude"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic italic">
                            * These coordinates will be used to center the map when this city is selected.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Check size={20} />
                                <span>Save City</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}