"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2, Plus, Globe, Pencil, Loader2, X, Navigation
} from "lucide-react";
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 dark:bg-gray-800 dark:text-gray-500">Loading Map...</div>
});

import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  uploadFile
} from "@/api/countries-api";

interface Country {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn?: string;
  countryCode?: string;
  localisation?: { id: string; latitude: number; longitude: number };
  flagImg?: any;
}

interface CountryFormData {
  nameAr: string;
  nameFr: string;
  nameEn: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  flagImg: any | null;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<CountryFormData>({ nameAr: '', nameFr: '', nameEn: '', countryCode: '', latitude: 34.0331, longitude: -5.0003, flagImg: null });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCountries();
      setCountries(data);
    } catch (err) {
      console.error("Failed to fetch countries", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleOpenModal = (country: Country | null = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        nameAr: country.nameAr,
        nameFr: country.nameFr,
        nameEn: country.nameEn || '',
        countryCode: country.countryCode || '',
        latitude: Number(country.localisation?.latitude) || 34.0331,
        longitude: Number(country.localisation?.longitude) || -5.0003,
        flagImg: country.flagImg || null
      });
      setSelectedFile(null);
    } else {
      setEditingCountry(null);
      setFormData({ nameAr: '', nameFr: '', nameEn: '', countryCode: '', latitude: 34.0331, longitude: -5.0003, flagImg: null });
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPayload = { ...formData };
      
      if (selectedFile) {
        const uploadedFileResponse = await uploadFile(selectedFile);
        const fileId = uploadedFileResponse?.file?.id || uploadedFileResponse?.id || uploadedFileResponse;
        finalPayload.flagImg = { id: fileId };
      }

      if (editingCountry) {
        await updateCountry(editingCountry.id, finalPayload);
      } else {
        await createCountry(finalPayload);
      }
      setIsModalOpen(false);
      fetchCountries();
      Swal.fire({ icon: 'success', title: t('common.success_msg', 'نجاح'), timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Operation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t('common.confirm_delete_title'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: t('common.yes_delete')
    });

    if (result.isConfirmed) {
      try {
        await deleteCountry(id);
        setCountries(prev => prev.filter(c => c.id !== id));
        Swal.fire(t('common.deleted'), '', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
      <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">Loading Countries...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 md:px-8 dark:bg-gray-950" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4 mt-6 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-gray-100">{t("dashboard.infos-general.tabs.country_tab")}</h1>
          <p className="text-slate-400 text-sm font-medium dark:text-gray-500">Global infrastructure management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg w-full md:w-auto justify-center">
          <Plus className="w-5 h-5" />
          <span>{t("dashboard.infos-general.common.add_new")}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div key={country.id} className="bg-white rounded-4xl p-6 border border-slate-200 hover:shadow-xl transition-all group relative dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden relative w-14 h-14 flex items-center justify-center dark:bg-blue-950 dark:text-blue-400">
                {country.flagImg?.path ? (
                  <img src={country.flagImg.path} alt="flag" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Globe className="w-6 h-6" />
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(country)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition dark:text-blue-400 dark:hover:bg-blue-950">
                  <Pencil className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(country.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition dark:text-red-400 dark:hover:bg-red-950">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1 dark:text-gray-100">{isAr ? country.nameAr : country.nameFr}</h3>
            <p className="text-sm text-slate-400 font-medium uppercase dark:text-gray-500">{country.nameFr}</p>
            <div className="flex items-center gap-2 text-slate-400 mt-3 pt-3 border-t border-slate-50 dark:text-gray-500 dark:border-gray-800">
              <Navigation className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] font-mono">
                {country.localisation ? `${country.localisation.latitude}, ${country.localisation.longitude}` : "No GPS data"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl scale-in-center overflow-y-auto max-h-[95vh] dark:bg-gray-900">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100">{editingCountry ? 'Edit Country' : 'New Country'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition dark:text-gray-400 dark:hover:bg-gray-800"><X className="w-6 h-6" /></button>
            </div>

            {/* Main Outer structural container changed to a simple DIV to avoid nesting forms */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Input fields container - Form is isolated safely here */}
              <form onSubmit={handleSubmit} className="order-2 lg:order-1 lg:col-span-5 space-y-5 w-full">
                <div className="space-y-4">
                  <input placeholder="Arabic Name" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                  <input placeholder="French Name" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} />
                  <input placeholder="English Name" type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
                </div>
                
                <div>
                  <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all dark:bg-gray-800 dark:text-gray-100" value={formData.countryCode} onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}>
                    <option value="">-- Select Country Code --</option>
                    <option value="MA">Morocco (MA)</option>
                    <option value="FR">France (FR)</option>
                  </select>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 dark:bg-blue-950 dark:border-blue-900">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase mb-2 dark:text-blue-300">Coordinates (GPS)</h4>
                  <div className="flex justify-between font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                    <span>LAT: {formData.latitude.toFixed(6)}</span>
                    <span>LNG: {formData.longitude.toFixed(6)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-slate-400 px-1 dark:text-gray-500">Country Flag</label>
                  <div className="flex items-center gap-4">
                    {formData.flagImg?.path && !selectedFile && (
                      <img src={formData.flagImg.path} alt="flag" className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200 dark:border-gray-700" />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer dark:text-gray-400 dark:file:bg-blue-950 dark:file:text-blue-300 dark:hover:file:bg-blue-900" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition mt-4 disabled:opacity-50 flex justify-center items-center gap-2">
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingCountry ? 'Save Changes' : 'Create Country'}
                </button>
              </form>

              {/* Map rendering layer container - Safe completely outside of input form */}
              <div className="order-1 lg:order-2 lg:col-span-7 h-87.5 lg:h-500px w-full rounded-2rem overflow-hidden border-4 border-slate-50 shadow-inner relative z-0 dark:border-gray-800">
                <MapComponent
                  center={[formData.latitude, formData.longitude]}
                  displayLabel={isAr ? formData.nameAr : formData.nameFr}
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