"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, LayoutGrid, HandPlatter, ChevronDown, Search, ArrowRight, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// API Imports
import { getCities } from "@/api/cities-api";
import { getCityAreas } from "@/api/city-areas-api";
import { getServices } from "@/api/services-api";
import { getBusinesses } from "@/api/businesses-api";

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-[2rem]" />
});

// --- REUSABLE SELECT COMPONENT ---
interface Option {
  id: string | number;
  name: string;
}

interface CompactSelectProps {
  label: string;
  icon: React.ReactNode;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const CompactSelect = ({ label, icon, options, value, onChange, placeholder, disabled }: CompactSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative flex-1 min-w-0 ${disabled ? 'opacity-40' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left overflow-hidden"
      >
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <div className="text-indigo-600 shrink-0">{icon}</div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-[9px] uppercase font-bold text-gray-400 leading-none truncate">{label}</span>
            <span className="text-gray-800 font-semibold truncate text-sm whitespace-nowrap">
              {value || placeholder}
            </span>
          </div>
        </div>
        <ChevronDown size={12} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[110] mt-2 w-64 left-0 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto py-2">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(String(option.id));
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 ${value === option.name ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-gray-600'}`}
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-gray-400 italic text-center">No data found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [allZones, setAllZones] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);

  // Local state for the inputs
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // 1. Sync local input state with URL
  useEffect(() => {
    setSelectedCityId(searchParams.get("cityId") || "");
    setSelectedZoneId(searchParams.get("zoneId") || "");
    setSelectedServiceId(searchParams.get("service") || "");
  }, [searchParams]);

  // 2. Load Filter Metadata
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [citiesData, zonesData, servicesData] = await Promise.all([
          getCities(),
          getCityAreas(),
          getServices()
        ]);

        const langSuffix = i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);
        const getData = (res: any) => (Array.isArray(res) ? res : res?.data || []);

        setCities(getData(citiesData).map((c: any) => ({
          ...c,
          displayName: c[`name${langSuffix}`] || c.nameFr || c.nameEn || "City"
        })));

        setAllZones(getData(zonesData).map((z: any) => ({
          ...z,
          displayName: z[`name${langSuffix}`] || z.nameFr || "Area",
          normalizedCityId: z.city?.id || z.cityId
        })));

        setServices(getData(servicesData).map((s: any) => ({
          ...s,
          displayName: s[`nameServ${langSuffix}`] || s.nameServFr || "Service"
        })));
      } catch (error) {
        console.error("❌ Fetch Filters Error:", error);
      }
    };
    loadFilters();
  }, [i18n.language]);

  // 3. Main Data Fetching (Triggered ONLY when service is in URL)
  useEffect(() => {
    const fetchBusinesses = async () => {
      const serviceId = searchParams.get("service");

      // Stop if no service is selected in the URL
      if (!serviceId) {
        setBusinesses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getBusinesses(1, 20, {
          service: serviceId,
        });

        const data = response?.data || response || [];
        setBusinesses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Fetch Error:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [searchParams]);

  const filteredZones = useMemo(() => {
    if (!selectedCityId) return [];
    return allZones.filter(zone => String(zone.normalizedCityId) === String(selectedCityId));
  }, [selectedCityId, allZones]);

  // 4. Update the URL
  const handleSearchUpdate = () => {
    if (!selectedServiceId) {
      alert(t("search.please_select_service") || "Please select a service first");
      return;
    }

    const params = new URLSearchParams();
    if (selectedCityId) params.set("cityId", selectedCityId);
    if (selectedServiceId) params.set("service", selectedServiceId);
    if (selectedZoneId) params.set("zoneId", selectedZoneId);

    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const mapMarkers = useMemo(() => {
    return businesses.map((biz: any) => {
      const loc = biz.contact?.address?.localisation;
      if (loc?.latitude && loc?.longitude) {
        const langSuffix = i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);
        return {
          position: [parseFloat(loc.latitude), parseFloat(loc.longitude)] as [number, number],
          label: biz[`name${langSuffix}`] || biz.nameFr
        };
      }
      return null;
    }).filter(Boolean);
  }, [businesses, i18n.language]);

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* HEADER / SEARCH BAR */}
      <div className="fixed top-15 left-0 right-0 z-[100] px-2 py-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white border border-slate-200 shadow-xl rounded-full p-1.5 flex flex-row items-center gap-1">
            <CompactSelect
              label={t("search.city")}
              icon={<MapPin size={16} />}
              options={cities.map(c => ({ id: c.id, name: c.displayName }))}
              value={cities.find(c => String(c.id) === String(selectedCityId))?.displayName || ""}
              onChange={(id) => { setSelectedCityId(id); setSelectedZoneId(""); }}
              placeholder={t("search.select_city")}
            />

            <div className="w-px h-8 bg-slate-100 shrink-0" />

            <CompactSelect
              label={t("search.zone")}
              icon={<LayoutGrid size={16} />}
              options={filteredZones.map(z => ({ id: z.id, name: z.displayName }))}
              value={filteredZones.find(z => String(z.id) === String(selectedZoneId))?.displayName || ""}
              disabled={!selectedCityId}
              onChange={(id) => setSelectedZoneId(id)}
              placeholder={selectedCityId ? (filteredZones.length === 0 ? "No Areas" : t("search.select_zone")) : t("search.select_zone")}
            />

            <div className="w-px h-8 bg-slate-100 shrink-0" />

            <div className="flex-[1.2] flex flex-row items-center min-w-0">
              <CompactSelect
                label={t("search.service")}
                icon={<HandPlatter size={16} />}
                options={services.map(s => ({ id: s.id, name: s.displayName }))}
                value={services.find(s => String(s.id) === String(selectedServiceId))?.displayName || ""}
                onChange={(id) => setSelectedServiceId(id)}
                placeholder={t("search.select_service")}
              />

              <button
                onClick={handleSearchUpdate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 md:px-6 rounded-full active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                <span className="hidden lg:inline font-bold text-sm uppercase tracking-wider">
                  {t("search.button")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col lg:flex-row h-screen pt-36">
        {/* LEFT: RESULTS CARDS */}
        <div className="w-full lg:w-1/2 overflow-y-auto px-4 md:px-8 pb-20 custom-scrollbar">
          {!loading && searchParams.get("service") && (
            <div className="max-w-2xl mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {`${businesses.length} ${t("search.results_found")}`}
              </h2>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* STATE 1: NO SEARCH PERFORMED YET */}
              {!searchParams.get("service") && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center px-6">
                  <div className="p-6 bg-indigo-50 rounded-full mb-6">
                    <HandPlatter size={48} className="text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{t("search.welcome_title") || "Ready to search?"}</h3>
                  <p className="text-slate-400 max-w-sm">
                    {t("search.welcome_text") || "Please select a service from the bar above to discover businesses in your area."}
                  </p>
                </div>
              )}

              {/* STATE 2: SEARCH PERFORMED, RESULTS FOUND */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businesses.map((biz: any) => {
                  const langSuffix = i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);
                  const title = biz[`name${langSuffix}`] || biz.nameFr || biz.nameEn;
                  const desc = biz[`descr${langSuffix}`] || biz.descrFr || biz.descrEn;
                  const img = biz.flyer?.path
                    ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/files/${biz.flyer.path}`
                    : "/placeholder.png";

                  return (
                    <div
                      key={biz.id}
                      onClick={() => router.push(`/businesses/${biz.id}`)}
                      className="group flex flex-col bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 cursor-pointer border border-slate-100"
                    >
                      <div className="relative h-52 w-full overflow-hidden">
                        <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                          <span className="text-[10px] font-black text-indigo-600 uppercase">
                            {biz.service?.[`nameServ${langSuffix}`] || biz.service?.nameServFr}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{title}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 mb-3">
                          <MapPin size={14} />
                          <span className="text-xs font-bold truncate">{biz.contact?.address?.lineAddressFr || "Address not provided"}</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{desc}</p>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-indigo-600 font-bold text-sm">
                          <span>{t("search.view_details")}</span>
                          <ArrowRight size={16} className={isRtl ? "rotate-180" : ""} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STATE 3: SEARCHED BUT NOTHING FOUND */}
              {searchParams.get("service") && businesses.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <Search size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold">{t("search.no_results")}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: MAP */}
        <div className="hidden lg:block lg:w-1/2 h-full p-4">
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white">
            <MapComponent markers={mapMarkers as any} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}