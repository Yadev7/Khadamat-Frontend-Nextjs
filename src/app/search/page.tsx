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
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-4xl" />
});

interface Option {
  id: string | number;
  name: string;
}

const toCoordinate = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
};

const readLocalisation = (source: any): [number, number] | null => {
  const lat = toCoordinate(source?.latitude ?? source?.lat);
  const lng = toCoordinate(source?.longitude ?? source?.lng);
  return lat === null || lng === null ? null : [lat, lng];
};

const businessPosition = (biz: any): [number, number] | null =>
  readLocalisation(biz?.contact?.address?.localisation);

const businessAddress = (biz: any, langSuffix: string): string =>
  biz?.contact?.address?.[`lineAddress${langSuffix}`] ||
  biz?.contact?.address?.lineAddressFr ||
  biz?.contact?.address?.lineAddressAr ||
  biz?.Address?.[`lineAddress${langSuffix}`] ||
  biz?.Address?.lineAddressFr ||
  biz?.Address?.lineAddressAr ||
  "";

interface CompactSelectProps {
  label: string;
  icon: React.ReactNode;
  options: Option[];
  value: string;
  selectedValueId: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const CompactSelect = ({ label, icon, options, value, selectedValueId, onChange, placeholder, disabled }: CompactSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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
        className="w-full flex items-center justify-between gap-3 px-4 py-2 rounded-2xl hover:bg-slate-50 transition-all text-left overflow-hidden group"
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="text-indigo-600 shrink-0 p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
            {icon}
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-[10px] uppercase font-black text-indigo-400 leading-none truncate tracking-widest mb-1">
              {label}
            </span>
            <span className={`font-bold truncate text-sm whitespace-nowrap ${value ? 'text-slate-900' : 'text-slate-400'}`}>
              {value || placeholder}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-110 mt-3 w-64 left-0 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-h-64 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(String(option.id));
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm rounded-2xl transition-all mb-1 last:mb-0 font-bold ${
                  String(selectedValueId) === String(option.id)
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-xs text-slate-400 italic text-center font-medium">
              {t("search.no_data") || "No data found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [allZones, setAllZones] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [hoveredBizId, setHoveredBizId] = useState<string | null>(null);

  const langSuffix = i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);

  // Sync state with URL Search Parameters
  useEffect(() => {
    setSelectedCityId(searchParams.get("cityId") || "");
    setSelectedZoneId(searchParams.get("zoneId") || "");
    setSelectedServiceId(searchParams.get("service") || "");
  }, [searchParams]);

  // Load lookup data for filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [citiesData, zonesData, servicesData] = await Promise.all([
          getCities(),
          getCityAreas(),
          getServices()
        ]);

        const getData = (res: any) => (Array.isArray(res) ? res : res?.data || []);

        setCities(getData(citiesData).map((c: any) => ({
          id: c.id,
          displayName: c[`name${langSuffix}`] || c.nameFr || c.nameEn || "City",
          lat: toCoordinate(c.localisation?.latitude ?? c.localisation?.lat),
          lng: toCoordinate(c.localisation?.longitude ?? c.localisation?.lng)
        })));

        setAllZones(getData(zonesData).map((z: any) => ({
          ...z,
          id: z.id,
          displayName: z[`name${langSuffix}`] || z.nameFr || "Area",
          normalizedCityId: z.cityId || z.city?.id,
          lat: toCoordinate(z.localisation?.latitude ?? z.localisation?.lat),
          lng: toCoordinate(z.localisation?.longitude ?? z.localisation?.lng)
        })));

        setServices(getData(servicesData).map((s: any) => ({
          ...s,
          id: s.id,
          displayName: s[`nameServ${langSuffix}`] || s.nameServFr || s[`name${langSuffix}`] || s.nameFr || "Service"
        })));
      } catch (error) {
        console.error("❌ Fetch Filters Error:", error);
      }
    };
    loadFilters();
  }, [langSuffix]);

  const activeFilters = useMemo(() => ({
    cityId: searchParams.get("cityId") || "",
    zoneId: searchParams.get("zoneId") || "",
    serviceId: searchParams.get("service") || "",
  }), [searchParams]);

  const hasActiveFilter = Boolean(activeFilters.cityId || activeFilters.zoneId || activeFilters.serviceId);

  // Fetch businesses when URL filter parameters change
  useEffect(() => {
    let cancelled = false;
    const fetchBusinesses = async () => {
      const { cityId, zoneId, serviceId } = activeFilters;

      if (!cityId && !zoneId && !serviceId) {
        setBusinesses([]);
        setTotalResults(0);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const relations = 'service,flyer,contact.address.localisation,localisation,Address,Address.localisation';
        const response = await getBusinesses(1, 20, {
          service: serviceId || undefined,
          cityId: cityId || undefined,
          zoneId: zoneId || undefined
        }, relations);

        if (cancelled) return;

        const extractedData = response?.data || response?.results || [];

        setBusinesses(Array.isArray(extractedData) ? extractedData : []);
        setTotalResults(typeof response?.meta?.total === 'number' ? response.meta.total : (Array.isArray(extractedData) ? extractedData.length : 0));
      } catch (error) {
        console.error("❌ Fetch Businesses Error:", error);
        if (cancelled) return;
        setBusinesses([]);
        setTotalResults(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBusinesses();

    return () => {
      cancelled = true;
    };
  }, [activeFilters]);

  // Filter available zones by the selected city
  const filteredZones = useMemo(() => {
    if (!selectedCityId) return [];
    return allZones.filter(zone => String(zone.normalizedCityId) === String(selectedCityId));
  }, [selectedCityId, allZones]);

  // Priority center for the map view: Selected Zone > Selected City > Average of business positions
  const activeMapCenter = useMemo((): [number, number] | undefined => {
    if (selectedZoneId) {
      const zone = allZones.find(z => String(z.id) === String(selectedZoneId));
      if (zone?.lat !== null && zone?.lat !== undefined && zone?.lng !== null && zone?.lng !== undefined) {
        return [zone.lat, zone.lng];
      }
    }

    if (selectedCityId) {
      const city = cities.find(c => String(c.id) === String(selectedCityId));
      if (city?.lat !== null && city?.lat !== undefined && city?.lng !== null && city?.lng !== undefined) {
        return [city.lat, city.lng];
      }
    }

    const located = (Array.isArray(businesses) ? businesses : [])
      .map((biz: any) => businessPosition(biz))
      .filter((position): position is [number, number] => position !== null);

    if (located.length === 0) return undefined;

    const totalLat = located.reduce((sum, position) => sum + position[0], 0);
    const totalLng = located.reduce((sum, position) => sum + position[1], 0);

    return [totalLat / located.length, totalLng / located.length];
  }, [selectedCityId, selectedZoneId, cities, allZones, businesses]);

  const activeMapLabel = useMemo(() => {
    if (selectedZoneId) {
      const zone = allZones.find(z => String(z.id) === String(selectedZoneId));
      return zone?.displayName || "Selected Area";
    }
    if (selectedCityId) {
      const city = cities.find(c => String(c.id) === String(selectedCityId));
      return city?.displayName || "Selected City";
    }
    return undefined;
  }, [selectedCityId, selectedZoneId, cities, allZones]);

  const handleSearchUpdate = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCityId) params.set("cityId", selectedCityId);
    if (selectedZoneId) params.set("zoneId", selectedZoneId);
    if (selectedServiceId) params.set("service", selectedServiceId);

    const nextUrl = `/search?${params.toString()}`;
    if (nextUrl !== `${window.location.pathname}?${window.location.search}`) {
      router.push(nextUrl);
    } else {
      setLoading(false);
    }
  };

  const resolveFlyerUrl = (flyerRaw?: string | null): string => {
    const fallbackImage = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500";
    if (!flyerRaw) return fallbackImage;
    if (flyerRaw.startsWith("http://") || flyerRaw.startsWith("https://")) return flyerRaw;

    const cleanFilename = flyerRaw.replace(/\\/g, "/").split("/").pop();
    if (!cleanFilename) return fallbackImage;

    const baseEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000")
      .replace(/\/$/, "")
      .replace(/\/v1$/, "");

    return `${baseEndpoint}/v1/files/${cleanFilename}`;
  };

  const mapMarkers = useMemo(() => {
    if (!Array.isArray(businesses)) return [];

    return businesses.map((biz: any) => {
      if (!biz) return null;
      const position = businessPosition(biz);
      if (!position) return null;
      return {
        id: biz.id,
        position,
        label: biz[`name${langSuffix}`] || biz.nameFr || biz.nameEn || "Business",
        address: businessAddress(biz, langSuffix),
        active: hoveredBizId === biz.id
      };
    }).filter((m): m is NonNullable<typeof m> => m !== null);
  }, [businesses, langSuffix, hoveredBizId]);

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* --- SEARCH BAR LAYOUT --- */}
      <div className="fixed top-15 left-0 right-0 z-30 px-2 py-6 md:px-6 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row items-center gap-1 transition-all hover:border-indigo-200">

            <CompactSelect
              label={t("search.city")}
              icon={<MapPin size={20} />}
              options={cities.map(c => ({ id: c.id, name: c.displayName }))}
              value={cities.find(c => String(c.id) === String(selectedCityId))?.displayName || ""}
              selectedValueId={selectedCityId}
              onChange={(id) => {
                setSelectedCityId(id);
                setSelectedZoneId("");
              }}
              placeholder={t("search.select_city")}
            />

            <div className="hidden md:block w-px h-10 bg-slate-100 shrink-0 mx-1" />
            <div className="block md:hidden w-full h-px bg-slate-100 my-1" />

            <CompactSelect
              label={t("search.zone")}
              icon={<LayoutGrid size={20} />}
              options={filteredZones.map(z => ({ id: z.id, name: z.displayName }))}
              value={filteredZones.find(z => String(z.id) === String(selectedZoneId))?.displayName || ""}
              selectedValueId={selectedZoneId}
              disabled={!selectedCityId}
              onChange={(id) => setSelectedZoneId(id)}
              placeholder={selectedCityId ? (filteredZones.length === 0 ? "No Areas" : t("search.select_zone")) : t("search.select_zone")}
            />

            <div className="hidden md:block w-px h-10 bg-slate-100 shrink-0 mx-1" />
            <div className="block md:hidden w-full h-px bg-slate-100 my-1" />

            <div className="flex-[1.4] flex flex-col md:flex-row items-center min-w-0 w-full gap-3 md:gap-0">
              <CompactSelect
                label={t("search.service")}
                icon={<HandPlatter size={20} />}
                options={services.map(s => ({ id: s.id, name: s.displayName }))}
                value={services.find(s => String(s.id) === String(selectedServiceId))?.displayName || ""}
                selectedValueId={selectedServiceId}
                onChange={(id) => setSelectedServiceId(id)}
                placeholder={t("search.select_service")}
              />

              <button
                onClick={handleSearchUpdate}
                disabled={loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 md:px-10 rounded-2xl md:rounded-full active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 disabled:opacity-50 md:ml-2"
              >
                {loading ? <Loader2 size={22} className="animate-spin" /> : <Search size={22} />}
                <span className="font-black text-sm uppercase tracking-widest">
                  {t("search.button")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- BUSINESS CARDS AND MAP VIEWPORTS --- */}
      <div className="flex flex-col lg:flex-row h-screen pt-36">
        <div className="w-full lg:w-1/2 overflow-y-auto px-4 md:px-8 pb-20 custom-scrollbar">
          {!loading && hasActiveFilter && (
            <div className="max-w-2xl mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {`${totalResults} ${t("search.results_found")}`}
              </h2>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {!hasActiveFilter && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center px-6">
                  <div className="p-6 bg-indigo-50 rounded-full mb-6">
                    <HandPlatter size={48} className="text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{t("search.welcome_title") || "Ready to search?"}</h3>
                  <p className="text-slate-400 max-w-sm">
                    {t("search.welcome_text") || "Please select a service or region from the bar above to discover businesses."}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businesses.map((biz: any) => {
                  const title = biz[`name${langSuffix}`] || biz.nameFr || biz.nameEn || "Business";
                  const desc = biz[`descr${langSuffix}`] || biz.descrFr || biz.descrEn;
                  const flyerUrl = biz.flyer?.path || biz.flyer?.url;
                  const img = resolveFlyerUrl(flyerUrl);

                  return (
                    <div
                      key={biz.id}
                      onMouseEnter={() => setHoveredBizId(biz.id)}
                      onMouseLeave={() => setHoveredBizId(null)}
                      className="group flex flex-col bg-white rounded-4xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 border border-slate-100"
                    >
                      <div 
                        onClick={() => router.push(`/businesses/${biz.id}`)}
                        className="relative h-52 w-full overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500") {
                              target.src = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500";
                            }
                          }}
                        />

                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                          <span className="text-[10px] font-black text-indigo-600 uppercase">
                            {biz.service?.[`nameServ${langSuffix}`] || biz.service?.[`name${langSuffix}`] || biz.service?.nameServFr || biz.service?.nameFr}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col grow">
                        <h3 
                          onClick={() => router.push(`/businesses/${biz.id}`)}
                          className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-400 mb-3">
                          <MapPin size={14} />
                          <span className="text-xs font-bold truncate">{businessAddress(biz, langSuffix) || "Address not provided"}</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{desc}</p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/rating-report?businessId=${biz.id}`);
                            }}
                            className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 px-4 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>⭐ Rate & Review</span>
                          </button>

                          <div 
                            onClick={() => router.push(`/businesses/${biz.id}`)}
                            className="flex items-center gap-1 text-indigo-600 font-bold text-sm cursor-pointer hover:underline"
                          >
                            <span>{t("search.view_details")}</span>
                            <ArrowRight size={16} className={isRtl ? "rotate-180" : ""} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasActiveFilter && businesses.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2rem border border-dashed border-slate-200">
                  <Search size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold">{t("search.no_results")}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- MAP PANELS GRAPHIC INTERFACE --- */}
        <div className="hidden lg:block lg:w-1/2 h-full p-4 relative">
          <div className="w-full h-full rounded-4xl overflow-hidden shadow-inner border-4 border-white relative">
            <MapComponent
              key={`map-layer-trigger-${selectedCityId}-${selectedZoneId}`}
              center={activeMapCenter}
              displayLabel={activeMapLabel}
              markers={mapMarkers}
            />
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