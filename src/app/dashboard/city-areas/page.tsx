"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2, Plus, Pencil, Loader2, X,
  MapPin, Building2, Navigation
} from "lucide-react";
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
});

import { getCityAreas, createCityArea, updateCityArea, deleteCityArea } from "@/api/city-areas-api";
import { getCities } from "@/api/cities-api";

interface CityArea {
  id: string;
  nameAr: string;
  nameFr: string;
  city?: { id: string; nameAr: string; nameFr: string; };
  localisation?: { id: string; latitude: number; longitude: number };
}

export default function CityAreasPage() {
  const [areas, setAreas] = useState<CityArea[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<CityArea | null>(null);
  const [formData, setFormData] = useState({ nameAr: '', nameFr: '', cityId: '', latitude: 34.0331, longitude: -5.0003 });

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
      setFormData({
        nameAr: area.nameAr,
        nameFr: area.nameFr,
        cityId: area.city?.id || '',
        latitude: Number(area.localisation?.latitude) || 34.0331,
        longitude: Number(area.localisation?.longitude) || -5.0003
      });
    } else {
      setEditingArea(null);
      setFormData({ nameAr: '', nameFr: '', cityId: '', latitude: 34.0331, longitude: -5.0003 });
    }
    setIsModalOpen(true);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCityId = e.target.value;
    const selectedCity = cities.find(c => c.id === selectedCityId);

    if (selectedCity && selectedCity.localisation) {
      setFormData(prev => ({
        ...prev,
        cityId: selectedCityId,
        latitude: Number(selectedCity.localisation.latitude),
        longitude: Number(selectedCity.localisation.longitude)
      }));
    } else {
      setFormData(prev => ({ ...prev, cityId: selectedCityId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameAr: formData.nameAr,
      nameFr: formData.nameFr,
      city: { id: formData.cityId },
      latitude: formData.latitude,
      longitude: formData.longitude
    };
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
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 md:px-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4 mt-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{t("dashboard.infos-general.tabs.city_area_tab")}</h1>
          <p className="text-slate-400 text-sm font-medium">Zone and sector management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg w-full md:w-auto justify-center">
          <Plus className="w-5 h-5" />
          <span>{t("dashboard.infos-general.common.add_new")}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => (
          <div key={area.id} className="bg-white rounded-4xl p-6 border border-slate-200 hover:shadow-xl transition-all group relative">
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
            <div className="flex items-center gap-2 text-slate-400 mt-2">
              <Navigation className="w-3 h-3 text-violet-500" />
              <span className="text-[10px] font-mono">
                {area.localisation ? `${area.localisation.latitude}, ${area.localisation.longitude}` : "No GPS data"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">{editingArea ? 'Edit Area' : 'New Area'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-6 h-6" /></button>
            </div>

            {/* Semantic Layout Grid form configuration wrapper */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Input fields container */}
              <div className="order-2 lg:order-1 lg:col-span-5 space-y-5 w-full">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1">City</label>
                  <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none ring-2 ring-transparent focus:ring-violet-500/20 transition-all" value={formData.cityId} onChange={handleCityChange}>
                    <option value="">-- Select City --</option>
                    {cities.map(c => (<option key={c.id} value={c.id}>{isAr ? c.nameAr : c.nameFr}</option>))}
                  </select>
                </div>
                
                <div className="space-y-4">
                  <input placeholder="Name (Arabic)" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                  <input placeholder="Name (French)" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} />
                </div>
                
                <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
                  <h4 className="text-[10px] font-black text-violet-400 uppercase mb-2">Coordinates (GPS)</h4>
                  <div className="flex justify-between font-mono text-xs font-bold text-violet-700">
                    <span>LAT: {formData.latitude.toFixed(6)}</span>
                    <span>LNG: {formData.longitude.toFixed(6)}</span>
                  </div>
                </div>

                <button type="submit" className="w-full bg-violet-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-violet-700 transition-all">
                  {editingArea ? 'Save Changes' : 'Create Area'}
                </button>
              </div>

              {/* Map rendering layer block container */}
              <div className="order-1 lg:order-2 lg:col-span-7 h-87.5 lg:h-125 w-full rounded-4xl overflow-hidden border-4 border-slate-50 shadow-inner relative z-0">
                <MapComponent
                  center={[formData.latitude, formData.longitude]}
                  displayLabel={isAr ? formData.nameAr : formData.nameFr}
                  isPicker={true}
                  onLocationSelect={handleLocationChange}
                />
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}