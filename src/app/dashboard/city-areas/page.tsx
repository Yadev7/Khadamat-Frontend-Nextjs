"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// 💡 Comprehensive pre-defined map of areas per major Moroccan cities
const CITY_AREAS_DICTIONARY: Record<string, { ar: string; fr: string; lat?: number; lng?: number }[]> = {
  "fes": [
    { ar: "المدينة القديمة", fr: "Ancienne Médina", lat: 34.0625, lng: -4.9829 },
    { ar: "حطاطين", fr: "Hattatine", lat: 34.0331, lng: -5.0003 },
    { ar: "بنسودة", fr: "Bensouda", lat: 34.0112, lng: -5.0321 },
    { ar: "السايس", fr: "Saiss", lat: 33.9912, lng: -4.9822 },
    { ar: "طريق صفرو", fr: "Route de Sefrou", lat: 34.0150, lng: -4.9850 },
    { ar: "حي الازهر", fr: "Hay El Azhar", lat: 34.0520, lng: -5.0110 },
    { ar: "النرجس", fr: "Narjiss", lat: 34.0080, lng: -4.9950 }
  ],
  "casablanca": [
    { ar: "المعارف", fr: "Maarif", lat: 33.5883, lng: -7.6311 },
    { ar: "أنفا", fr: "Anfa", lat: 33.5951, lng: -7.6522 },
    { ar: "سيدي البرنوصي", fr: "Sidi Bernoussi", lat: 33.6011, lng: -7.5312 },
    { ar: "عين الشق", fr: "Ain Chock", lat: 33.5431, lng: -7.6111 },
    { ar: "سيدي مومن", fr: "Sidi Moumen", lat: 33.5821, lng: -7.5322 },
    { ar: "المستفى", fr: "CIL", lat: 33.5781, lng: -7.6582 },
    { ar: "المعاريف المركز", fr: "Maarif Extension", lat: 33.5812, lng: -7.6391 }
  ],
  "marrakech": [
    { ar: "المدينة", fr: "Medina", lat: 31.6295, lng: -7.9811 },
    { ar: "حي جليز", fr: "Gueliz", lat: 31.6342, lng: -8.0089 },
    { ar: "حي المنارة", fr: "Menara", lat: 31.6116, lng: -8.0164 },
    { ar: "الداوديات", fr: "Daoudiate", lat: 31.6512, lng: -8.0051 },
    { ar: "المحاميد", fr: "Mhamid", lat: 31.5811, lng: -8.0521 },
    { ar: "تاريخ", fr: "Targa", lat: 31.6391, lng: -8.0452 }
  ],
  "rabat": [
    { ar: "المدينة القديمة", fr: "Old Medina", lat: 34.0209, lng: -6.8416 },
    { ar: "حي السويسي", fr: "Souissi", lat: 34.0201, lng: -6.8283 },
    { ar: "حي أكدال", fr: "Agdal", lat: 34.0215, lng: -6.8352 },
    { ar: "يعقوب المنصور", fr: "Yacoub El Mansour", lat: 34.0251, lng: -6.8712 },
    { ar: "حي الرياض", fr: "Hay Riad", lat: 33.9591, lng: -6.8521 }
  ],
  "tangier": [
    { ar: "المدينة القديمة", fr: "Medina", lat: 35.7891, lng: -5.8131 },
    { ar: "مرشان", fr: "Marshan", lat: 35.7862, lng: -5.8211 },
    { ar: "اباضة", fr: "Boubana", lat: 35.7681, lng: -5.8112 },
    { ar: "الاصفار", fr: "Malabata", lat: 35.7511, lng: -5.7812 }
  ],
  "agadir": [
    { ar: "انزا", fr: "Anza", lat: 30.4512, lng: -9.6112 },
    { ar: "حي السلام", fr: "Hay Salam", lat: 30.4121, lng: -9.5512 },
    { ar: "الهدى", fr: "Al Houda", lat: 30.4012, lng: -9.5312 },
    { ar: "فال فلوري", fr: "Val Flori", lat: 30.4181, lng: -9.5812 }
  ],
  "meknes": [
    { ar: "المدينة القديمة", fr: "Ancienne Médina", lat: 33.8951, lng: -5.5541 },
    { ar: "حمرية", fr: "Hamria", lat: 33.8821, lng: -5.5412 },
    { ar: "سيدي بوجكا", fr: "Sidi Bouzekri", lat: 33.8612, lng: -5.5112 }
  ],
  "oujda": [
    { ar: "المدينة", fr: "Medina", lat: 34.6812, lng: -1.9081 },
    { ar: "القدس", fr: "El Qods", lat: 34.6612, lng: -1.9221 },
    { ar: "سيدي إدريس", fr: "Sidi Driss", lat: 34.6912, lng: -1.8912 }
  ],
  "guercif": [
    { ar: "المركز البلدي", fr: "Centre Ville", lat: 34.2291, lng: -3.3531 },
    { ar: "حاسي مسعود", fr: "Hassi Messaoud", lat: 34.2151, lng: -3.3611 },
    { ar: "النجاح", fr: "An Najah", lat: 34.2381, lng: -3.3421 }
  ]
};

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
      
      const cleanAreas = Array.isArray(areasData) ? areasData : (areasData as any)?.data || [];
      const cleanCities = Array.isArray(citiesData) ? citiesData : (citiesData as any)?.data || [];

      setAreas(cleanAreas);
      setCities(cleanCities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Compute available preset areas based on the currently selected city with fallback matching
  const availableSubAreas = useMemo(() => {
    if (!formData.cityId) return [];
    const selectedCity = cities.find(c => c.id === formData.cityId);
    if (!selectedCity) return [];
    
    const lookupKeyFr = selectedCity.nameFr?.toLowerCase().trim() || '';
    const lookupKeyAr = selectedCity.nameAr?.toLowerCase().trim() || '';

    for (const key of Object.keys(CITY_AREAS_DICTIONARY)) {
      if (lookupKeyFr.includes(key) || lookupKeyAr.includes(key) || key.includes(lookupKeyFr)) {
        return CITY_AREAS_DICTIONARY[key];
      }
    }
    
    // Generic default fallback sectors if specific city dictionary mapping isn't found
    return [
      { ar: "المركز", fr: "Centre-Ville", lat: selectedCity.localisation?.latitude || 34.0331, lng: selectedCity.localisation?.longitude || -5.0003 },
      { ar: "حي الإداري", fr: "Quartier Administratif", lat: selectedCity.localisation?.latitude || 34.0331, lng: selectedCity.localisation?.longitude || -5.0003 }
    ];
  }, [formData.cityId, cities]);

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

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCityId = e.target.value;
    const selectedCity = cities.find(c => c.id === selectedCityId);

    if (selectedCity && selectedCity.localisation) {
      setFormData(prev => ({
        ...prev,
        cityId: selectedCityId,
        nameAr: '',
        nameFr: '',
        latitude: Number(selectedCity.localisation.latitude || selectedCity.localisation.lat),
        longitude: Number(selectedCity.localisation.longitude || selectedCity.localisation.lng)
      }));
    } else {
      setFormData(prev => ({ ...prev, cityId: selectedCityId, nameAr: '', nameFr: '' }));
    }
  };

  const handleSubAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFrName = e.target.value;
    const matchedArea = availableSubAreas.find(a => a.fr === selectedFrName);

    if (matchedArea) {
      setFormData(prev => ({
        ...prev,
        nameAr: matchedArea.ar,
        nameFr: matchedArea.fr,
        latitude: matchedArea.lat ?? prev.latitude,
        longitude: matchedArea.lng ?? prev.longitude
      }));
    } else {
      setFormData(prev => ({ ...prev, nameAr: '', nameFr: '' }));
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
      Swal.fire({ icon: 'success', title: t('common.success_msg') || 'Success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ title: t('common.confirm_delete_title') || 'Are you sure?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await deleteCityArea(id);
        setAreas(prev => prev.filter(a => a.id !== id));
        Swal.fire(t('common.deleted') || 'Deleted', '', 'success');
      } catch (err) {
        Swal.fire('Error', '', 'error');
      }
    }
  };

  // const activePickerMarker = useMemo(() => {
  //   if (formData.latitude && formData.longitude) {
  //     return [{
  //       id: editingArea?.id || "new-zone-picker",
  //       position: [formData.latitude, formData.longitude] as [number, number],
  //       label: (isAr ? formData.nameAr : formData.nameFr) || "Selected Target Position",
  //       address: "Zone Coordinates Set",
  //       active: true
  //     }];
  //   }
  //   return [];
  // }, [formData.latitude, formData.longitude, formData.nameAr, formData.nameFr, editingArea, isAr]);

  // 💡 Update activePickerMarker to act as a stable controllable entity during picking
  // const activePickerMarker = useMemo(() => {
  //   if (formData.latitude && formData.longitude) {
  //     return [{
  //       id: editingArea?.id || "new-zone-picker",
  //       position: [formData.latitude, formData.longitude] as [number, number],
  //       label: (isAr ? formData.nameAr : formData.nameFr) || "Selected Target Position",
  //       address: "Zone Coordinates Set",
  //       active: true
  //     }];
  //   }
  //   return [];
  // }, [formData.latitude, formData.longitude, formData.nameAr, formData.nameFr, editingArea, isAr]);

  const activePickerMarker = useMemo(() => {
    if (formData.latitude && formData.longitude) {
      const selectedCityObj = cities.find(c => c.id === formData.cityId);
      const cityName = selectedCityObj ? (isAr ? selectedCityObj.nameAr : selectedCityObj.nameFr) : "";
      const areaName = (isAr ? formData.nameAr : formData.nameFr);
      
      const labelText = areaName && cityName 
        ? `${areaName}, ${cityName}` 
        : cityName || areaName || "Selected Target Position";

      return [{
        id: editingArea?.id || "new-zone-picker",
        position: [formData.latitude, formData.longitude] as [number, number],
        label: labelText,
        address: "Zone Coordinates Set",
        active: true
      }];
    }
    return [];
  }, [formData.latitude, formData.longitude, formData.nameAr, formData.nameFr, formData.cityId, cities, editingArea, isAr]);

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
          <h1 className="text-2xl font-black text-slate-800">{t("dashboard.infos-general.tabs.city_area_tab") || "City Areas"}</h1>
          <p className="text-slate-400 text-sm font-medium">Zone and sector management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg w-full md:w-auto justify-center">
          <Plus className="w-5 h-5" />
          <span>{t("dashboard.infos-general.common.add_new") || "Add New"}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => (
          <div key={area.id} className="bg-white rounded-2rem p-6 border border-slate-200 hover:shadow-xl transition-all group relative">
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
              <span className="text-xs font-mono">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Fields Column */}
              <form onSubmit={handleSubmit} className="order-2 lg:order-1 lg:col-span-5 space-y-5 w-full">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1">City</label>
                  <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none ring-2 ring-transparent focus:ring-violet-500/20 transition-all" value={formData.cityId} onChange={handleCityChange}>
                    <option value="">-- Select City --</option>
                    {cities.map(c => (<option key={c.id} value={c.id}>{isAr ? c.nameAr : c.nameFr}</option>))}
                  </select>
                </div>
                
                {/* Dynamic Area Select Dropdown mapping Arabic and French pairs automatically */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1">City Area / Sector</label>
                  <select 
                    required 
                    disabled={!formData.cityId}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold outline-none disabled:opacity-50" 
                    value={formData.nameFr} 
                    onChange={handleSubAreaChange}
                  >
                    <option value="">-- Select Area --</option>
                    {availableSubAreas.map((sub, idx) => (
                      <option key={idx} value={sub.fr}>
                        {isAr ? `${sub.ar} (${sub.fr})` : `${sub.fr} - ${sub.ar}`}
                      </option>
                    ))}
                  </select>
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
              </form>

              {/* Map Column */}
              {/* <div className="order-1 lg:order-2 lg:col-span-7 h-[350px] lg:h-[500px] w-full rounded-2rem overflow-hidden border-4 border-slate-50 shadow-inner relative z-0">
                <MapComponent
                  key={`${editingArea?.id || 'new'}-${formData.cityId}`}
                  center={[formData.latitude, formData.longitude]}
                  displayLabel={isAr ? formData.nameAr : formData.nameFr}
                  isPicker={true}
                  onLocationSelect={handleLocationChange}
                  markers={activePickerMarker}
                />
              </div> */}

              {/* Map Column */}
              <div className="order-1 lg:order-2 lg:col-span-7 h-350px lg:h-500px w-full rounded-2rem overflow-hidden border-4 border-slate-50 shadow-inner relative z-0">
                <MapComponent
                  key={`${editingArea?.id || 'new'}-${formData.cityId}-${formData.nameFr}`}
                  center={[formData.latitude, formData.longitude]}
                  displayLabel={isAr ? formData.nameAr : formData.nameFr}
                  isPicker={false} // 🌟 Changed from true to false to disable random click repositioning
                  onLocationSelect={handleLocationChange}
                  markers={activePickerMarker}
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}