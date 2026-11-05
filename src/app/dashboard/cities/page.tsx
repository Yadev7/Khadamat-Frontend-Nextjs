"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2, Plus, Map as MapIcon, Pencil, Loader2, X, Navigation
} from "lucide-react";
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';

// استيراد مكون الخريطة بشكل ديناميكي لمنع أخطاء الـ SSR في Next.js
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 dark:bg-gray-800 dark:text-gray-500">Loading Map...</div>
});

import { getCities, createCity, updateCity, deleteCity } from "@/api/cities-api";
import { getCountries } from "@/api/countries-api";

interface City {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  localisation?: { id: string; latitude: number; longitude: number };
  country?: { id: string; nameAr: string; nameFr: string; nameEn: string };
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [formData, setFormData] = useState({
    nameAr: '',
    nameFr: '',
    nameEn: '',
    countryId: '',
    latitude: 34.0331, // Fes الافتراضي
    longitude: -5.0003
  });

  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isEn = i18n.language === 'en';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [citiesData, countriesData] = await Promise.all([getCities(), getCountries()]);
      setCities(citiesData);
      setCountries(countriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (city: City | null = null) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        nameAr: city.nameAr,
        nameFr: city.nameFr,
        nameEn: city.nameEn,
        countryId: city.country?.id || '',
        latitude: Number(city.localisation?.latitude) || 34.0331,
        longitude: Number(city.localisation?.longitude) || -5.0003
      });
    } else {
      setEditingCity(null);
      setFormData({ nameAr: '', nameFr: '', nameEn: '', countryId: '', latitude: 34.0331, longitude: -5.0003 });
    }
    setIsModalOpen(true);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    const payload = {
      nameAr: formData.nameAr,
      nameFr: formData.nameFr,
      nameEn: formData.nameEn,
      country: { id: formData.countryId },
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    try {
      if (editingCity) await updateCity(editingCity.id, payload);
      else await createCity(payload);
      setIsModalOpen(false);
      fetchData();
      Swal.fire({ icon: 'success', title: t('common.success_msg'), timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ title: t('common.confirm_delete_title'), icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await deleteCity(id);
        setCities(prev => prev.filter(c => c.id !== id));
        Swal.fire(t('common.deleted'), '', 'success');
      } catch (err) {
        Swal.fire('Error', '', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
      <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Loading Cities...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 md:px-8 dark:bg-gray-950" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4 mt-6 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-gray-100">{t("dashboard.infos-general.tabs.city_tab")}</h1>
          <p className="text-slate-400 text-sm font-medium dark:text-gray-500">Urban & Localisation Network</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all w-full md:w-auto justify-center">
          <Plus className="w-5 h-5" />
          <span>{t("dashboard.infos-general.common.add_new")}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => (
          <div key={city.id} className="bg-white rounded-2rem p-6 border border-slate-200 hover:shadow-xl transition-all group relative dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-slate-800 dark:text-indigo-400">
                <MapIcon className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(city)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition dark:text-indigo-400 dark:hover:bg-indigo-950"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => handleDelete(city.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition dark:text-red-400 dark:hover:bg-red-950"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1 dark:text-gray-100">{isAr ? city.nameAr : city.nameFr}</h3>
            <div className="flex items-center gap-2 text-slate-400 mt-2 dark:text-gray-500">
              <Navigation className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] font-mono">
                {city.localisation ? `${city.localisation.latitude}, ${city.localisation.longitude}` : "No GPS data"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
{/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[95vh] dark:bg-gray-900">
      
      {/* Modal Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100">{editingCity ? 'Edit City' : 'Add New City'}</h2>
        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition dark:text-gray-400 dark:hover:bg-gray-800"><X className="w-6 h-6" /></button>
      </div>

      {/* Main Grid Wrapper with explicit layout heights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Section (Forces left side on desktop, top on mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-5 space-y-5 w-full">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1 dark:text-gray-500">Country</label>
            <select
              required
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all dark:bg-gray-800 dark:text-gray-100"
              value={formData.countryId}
              onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
            >
              <option value="">-- Select Country --</option>
              {countries.map(country => {
                let countryName = country.nameFr;
                if (isAr) countryName = country.nameAr;
                else if (isEn) countryName = country.nameEn;

                return (
                  <option key={country.id} value={country.id}>
                    {countryName}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-4">
            <input placeholder="Name (Arabic)" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
            <input placeholder="Name (French)" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} />
            <input placeholder="Name (English)" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 dark:bg-indigo-950 dark:border-indigo-900">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-2 dark:text-indigo-300">Coordinates (GPS)</h4>
            <div className="flex justify-between font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <span>LAT: {formData.latitude.toFixed(6)}</span>
              <span>LNG: {formData.longitude.toFixed(6)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all"
          >
            {editingCity ? 'Save Changes' : 'Create City'}
          </button>
        </div>

        {/* Map Section (Forces right side on desktop, bottom on mobile, sandboxed via relative z-0) */}
        <div className="order-1 lg:order-2 lg:col-span-7 h-87.5 lg:h-500px w-full rounded-2rem overflow-hidden border-4 border-slate-50 shadow-inner relative z-0 dark:border-gray-800">
          <MapComponent
            center={[formData.latitude, formData.longitude]}
            displayLabel={isAr ? formData.nameAr : formData.nameEn}
            isPicker={true}
            onLocationSelect={handleLocationChange}
          />
        </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
}