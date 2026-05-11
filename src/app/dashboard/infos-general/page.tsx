'use client';

import { useState, Fragment, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GlobeAltIcon,
  MapIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  Squares2X2Icon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

// Import your existing Services sub-page
import ServicesPage from "../services/page";
import CountriesPage from '../countries/page';
import CitiesPage from '../cities/page';
import CityAreas from '../city-areas/page'

import router from 'next/router';
import { getCountries } from '@/api/countries-api';
import { getCities } from '@/api/cities-api';
import { getCityAreas } from '@/api/city-areas-api';

type TabType = 'Country' | 'City' | 'CityArea' | 'Service' | 'Zone';

export default function GeneraleInfos() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('Country');
  const isRTL = i18n.language === 'ar';

  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ nameAr: '', nameFr: '', nameEn: '' });

  // --- Mock Data (Replace with API calls later) ---
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const fetchCountiresData = useCallback(async () => {
    try {
      const data = await getCountries();
      setCountries(data);
    } catch (error: any) {
      console.error("Error fetching countries:", error);
      if (error.response?.status === 401) {
        console.error("الجلسة انتهت! يتم التوجيه لصفحة تسجيل الدخول...");
        router.push('/sign-in');
      }
    }
  }, [router]);

  const fetchCitiesData = useCallback(async () => {
    try {
      // Placeholder for fetching cities data
      const data = await getCities();
      setCities(data);
    } catch (error: any) {
      console.error("Error fetching cities:", error);
      if (error.response?.status === 401) {
        console.error("الجلسة انتهت! يتم التوجيه لصفحة تسجيل الدخول...");
        router.push('/sign-in');
      }
    }
  }, [router]);

  const fetchAreasData = useCallback(async () => {
    try {
      const data = await getCityAreas();
      // Placeholder for fetching city areas data
      setAreas(data);
    } catch (error: any) {
      console.error("Error fetching city areas:", error);
      if (error.response?.status === 401) {
        console.error("الجلسة انتهت! يتم التوجيه لصفحة تسجيل الدخول...");
        router.push('/sign-in');
      }
    }
  }, [router]);


  const tabs = [
    { id: 'Country', label: t('dashboard.infos-general.tabs.country_tab'), icon: GlobeAltIcon },
    { id: 'City', label: t('dashboard.infos-general.tabs.city_tab'), icon: MapIcon },
    { id: 'CityArea', label: t('dashboard.infos-general.tabs.city_area_tab'), icon: MapPinIcon },
    { id: 'Service', label: t('dashboard.infos-general.tabs.service_tab'), icon: WrenchScrewdriverIcon },
  ];

  // --- Handlers ---
  const openModal = (item: any = null) => {
    setEditingItem(item);
    setFormData(item ? { nameAr: item.nameAr, nameFr: item.nameFr, nameEn: item.nameEn } : { nameAr: '', nameFr: '', nameEn: '' });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save (Update or Create) would go here (API call)
    console.log("Saving Data:", formData, "for tab:", activeTab);
    setIsModalOpen(false);
  };


  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 text-start">{t('dashboard.infos-general.title')}</h1>
          <p className="text-gray-500 text-sm mt-1 text-start">{t('dashboard.infos-general.description')}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="mt-4">
          {activeTab === 'Service' && <ServicesPage />}
          {activeTab === 'Country' && <CountriesPage />}
          {activeTab === 'City' && <CitiesPage />}
          {activeTab === 'CityArea' && <CityAreas />}

          {activeTab === 'Zone' && (
            <div className="bg-white p-20 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400">
              {t('dashboard.infos-general.loading')}
            </div>
          )}
        </div>
      </div>

      {/* --- Add/Edit Modal --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {activeTab === 'Country' && editingItem ? t('dashboard.infos-general.common.edit') : t('dashboard.infos-general.common.add_new')}
                  </Dialog.Title>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (العربية)</label>
                    <input
                      type="text" required className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name (French/English)</label>
                    <input
                      type="text" required className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                      {t('dashboard.infos-general.common.save')}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                      {t('dashboard.infos-general.common.cancel')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}