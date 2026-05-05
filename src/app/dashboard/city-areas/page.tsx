"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2, Plus, Pencil, Loader2, X,
  MapPin, Building2
} from "lucide-react";
import Swal from 'sweetalert2';

import { getCityAreas, createCityArea, updateCityArea, deleteCityArea } from "@/api/city-areas-api";
import { getCities } from "@/api/cities-api";

interface CityArea {
  id: string;
  nameAr: string;
  nameFr: string;
  city?: { id: string; nameAr: string; nameFr: string; };
}

export default function CityAreasPage() {
  const [areas, setAreas] = useState<CityArea[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<CityArea | null>(null);
  const [formData, setFormData] = useState({ nameAr: '', nameFr: '', cityId: '' });

  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [areasData, citiesData] = await Promise.all([getCityAreas(), getCities()]);
      setAreas(areasData);
      setCities(citiesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (area: CityArea | null = null) => {
    if (area) {
      setEditingArea(area);
      setFormData({ nameAr: area.nameAr, nameFr: area.nameFr, cityId: area.city?.id || '' });
    } else {
      setEditingArea(null);
      setFormData({ nameAr: '', nameFr: '', cityId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nameAr: formData.nameAr, nameFr: formData.nameFr, city: { id: formData.cityId } };
    try {
      if (editingArea) await updateCityArea(editingArea.id, payload);
      else await createCityArea(payload);
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
        await deleteCityArea(id);
        setAreas(prev => prev.filter(a => a.id !== id));
        Swal.fire(t('common.deleted'), '', 'success');
      } catch (err) {
        Swal.fire('Error', '', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-2" />
      <p className="text-violet-600 font-bold text-xs uppercase tracking-widest">Loading Areas...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{t("dashboard.infos-general.tabs.city_area_tab")}</h1>
          <p className="text-slate-400 text-sm font-medium">Zone and sector management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
          <Plus className="w-5 h-5" />
          <span>{t("common.add_new")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => (
          <div key={area.id} className="bg-white rounded-2rem p-6 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-violet-50 rounded-2xl text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(area)} className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => handleDelete(area.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">{isAr ? area.nameAr : area.nameFr}</h3>
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{area.city ? (isAr ? area.city.nameAr : area.city.nameFr) : "---"}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">{editingArea ? 'Edit Area' : 'New Area'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">City</label>
                <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.cityId} onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}>
                  <option value="">-- Select City --</option>
                  {cities.map(c => (<option key={c.id} value={c.id}>{isAr ? c.nameAr : c.nameFr}</option>))}
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
              <button type="submit" className="w-full bg-violet-600 text-white py-4 rounded-2xl font-black shadow-lg mt-4">{editingArea ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}