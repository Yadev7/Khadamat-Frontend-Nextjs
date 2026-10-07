"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, MapPin, Building2, Navigation, Loader2, Search, Check, ChevronDown } from "lucide-react";
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
                        <CityPicker
                            cities={cities}
                            value={formData.cityId}
                            onChange={(id) => setFormData({ ...formData, cityId: id })}
                        />
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

interface CityPickerProps {
    cities: any[];
    value: string;
    onChange: (id: string) => void;
}

function CityPicker({ cities, value, onChange }: CityPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close the picker when clicking outside of it.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCity = cities.find((c) => String(c.id) === String(value));

    const filteredCities = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return cities;
        return cities.filter((city) =>
            (city.nameFr || "").toLowerCase().includes(q) ||
            (city.nameAr || "").toLowerCase().includes(q),
        );
    }, [cities, search]);

    return (
        <div ref={containerRef} className="relative">
            <input type="hidden" required value={value} />
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-start outline-none transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 flex items-center justify-between gap-2 cursor-pointer"
            >
                <span className={`truncate ${selectedCity ? "text-slate-800" : "text-slate-400"}`}>
                    {selectedCity ? (selectedCity.nameFr || selectedCity.nameAr) : "Search & select a city..."}
                </span>
                <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-indigo-500" : ""}`} />
            </button>

            {open && (
                <div className="absolute z-10 top-[110%] left-0 right-0 bg-white border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search city..."
                            className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto p-2">
                        {cities.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-slate-400 italic text-center font-medium">
                                No cities loaded
                            </div>
                        ) : filteredCities.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-slate-400 italic text-center font-medium">
                                No cities match &quot;{search}&quot;
                            </div>
                        ) : (
                            filteredCities.map((city) => {
                                const isSelected = String(city.id) === String(value);
                                return (
                                    <div
                                        key={city.id}
                                        onClick={() => {
                                            onChange(String(city.id));
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={`flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl cursor-pointer mb-1 last:mb-0 transition-all ${isSelected
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                            }`}
                                    >
                                        {city.nameFr || city.nameAr}
                                        {isSelected && <Check size={16} />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}