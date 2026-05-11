"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2, Plus, Globe, Pencil, Loader2, X
} from "lucide-react";
import Swal from 'sweetalert2';

import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry
} from "@/api/countries-api";

interface Country {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn?: string;
  countryCode?: string;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({ nameAr: '', nameFr: '', nameEn: '', countryCode: '' });

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
      setFormData({ nameAr: country.nameAr, nameFr: country.nameFr, nameEn: country.nameEn || '', countryCode: country.countryCode || '' });
    } else {
      setEditingCountry(null);
      setFormData({ nameAr: '', nameFr: '', nameEn: '', countryCode: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCountry) {
        await updateCountry(editingCountry.id, formData);
      } else {
        await createCountry(formData);
      }
      setIsModalOpen(false);
      fetchCountries();
      Swal.fire({ icon: 'success', title: t('common.success_msg', 'نجاح'), timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Operation failed' });
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
    <div className="min-h-screen bg-[#F8FAFC] pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{t("dashboard.infos-general.tabs.country_tab")}</h1>
          <p className="text-slate-400 text-sm font-medium">Global infrastructure management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg">
          <Plus className="w-5 h-5" />
          <span>{t("dashboard.infos-general.common.add_new")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div key={country.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(country)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                  <Pencil className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(country.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">{isAr ? country.nameAr : country.nameFr}</h3>
            <p className="text-sm text-slate-400 font-medium uppercase">{country.nameFr}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">{editingCountry ? 'Edit Country' : 'New Country'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">Arabic Name</label>
                <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">French Name</label>
                <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">English Name</label>
                <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 px-1">Country Code</label>
                <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none" value={formData.countryCode} onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}>
                  <option value="">-- Select Country Code --</option>
                  <option value="MA">MA</option>
                  <option value="FR">FR</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition mt-4">{editingCountry ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}