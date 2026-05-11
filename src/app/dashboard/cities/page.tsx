"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2, Plus, Map, Pencil, Loader2, X, Building2
} from "lucide-react";
import Swal from 'sweetalert2';

import { getCities, createCity, updateCity, deleteCity } from "@/api/cities-api";
import { getCountries } from "@/api/countries-api";

interface City {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  country?: { id: string; nameAr: string; nameFr: string; nameEn: string };
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ nameAr: '', nameFr: '', nameEn: '', countryId: '' });

  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';

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
      setFormData({ nameAr: city.nameAr, nameFr: city.nameFr, nameEn: city.nameEn, countryId: city.country?.id || '' });
    } else {
      setEditingCity(null);
      setFormData({ nameAr: '', nameFr: '', nameEn: '', countryId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nameAr: formData.nameAr, nameFr: formData.nameFr, nameEn: formData.nameEn, country: { id: formData.countryId } };
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
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
      <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Loading Cities...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{t("dashboard.infos-general.tabs.city_tab")}</h1>
          <p className="text-slate-400 text-sm font-medium">Urban network management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
          <Plus className="w-5 h-5" />
          <span>{t("dashboard.infos-general.common.add_new")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => (
          <div key={city.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Map className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(city)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => handleDelete(city.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">{isAr ? city.nameAr : city.nameFr}</h3>
            {/* <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{city.country ? (isAr ? city.country.nameAr : city.country.nameFr) : "---"}</span>
            </div> */}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">{editingCity ? 'Edit City' : 'New City'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">Country</label>
                <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.countryId} onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}>
                  <option value="">-- Select Country --</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{isAr ? country.nameAr : country.nameFr && country.nameEn}</option>
                  ))}
                </select>
              </div> */}

              {/* تم تصحيح المفتاح من cityId إلى countryId ليطابق الـ State */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">
                  {t("dashboard.infos-general.tabs.country_tab")}
                </label>
                <select
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none"
                  value={formData.countryId} // تم التغيير هنا
                  onChange={(e) => setFormData({ ...formData, countryId: e.target.value })} // تم التغيير هنا
                >
                  <option value="">-- Select Country --</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {isAr ? country.nameAr : country.nameFr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">Name (Arabic)</label>
                <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">Name (French)</label>
                <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">Name (English)</label>
                <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg mt-4">{editingCity ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}