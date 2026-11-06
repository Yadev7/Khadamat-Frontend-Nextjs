"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, LayoutGrid, HandPlatter, ChevronDown, Search, ArrowRight, Loader2, Map as MapIcon, Grid, PlusCircle } from "lucide-react";
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
  readLocalisation(biz?.localisation) ||
  readLocalisation(biz?.Address?.localisation) ||
  readLocalisation(biz?.contact?.address?.localisation);

const businessAddress = (biz: any, langSuffix: string): string =>
  biz?.contact?.address?.[`lineAddress${langSuffix}`] ||
  biz?.contact?.address?.lineAddressFr ||
  biz?.contact?.address?.lineAddressAr ||
  biz?.Address?.[`lineAddress${langSuffix}`] ||
  biz?.Address?.lineAddressFr ||
  biz?.Address?.lineAddressAr ||
  "";

const calculateDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const BusinessCardSkeleton = () => (
  <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 p-3 animate-pulse">
    <div className="h-32 w-full bg-slate-200 rounded-xl mb-2.5" />
    <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-2" />
    <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-2.5" />
    <div className="h-3 bg-slate-100 rounded-md w-full mb-1" />
    <div className="pt-2.5 border-t border-slate-50 flex items-center justify-between">
      <div className="h-7 bg-slate-200 rounded-lg w-1/3" />
      <div className="h-3.5 bg-slate-200 rounded-md w-1/4" />
    </div>
  </div>
);

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [allZones, setAllZones] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);

  // Pagination State (10 per page)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [hoveredBizId, setHoveredBizId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");

  const langSuffix = i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);

  useEffect(() => {
    setSelectedCityId(searchParams.get("cityId") || "");
    setSelectedZoneId(searchParams.get("zoneId") || "");
    setSelectedServiceId(searchParams.get("service") || "");
    setPage(1);
  }, [searchParams]);

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

  useEffect(() => {
    let cancelled = false;
    const fetchBusinesses = async () => {
      const { cityId, zoneId, serviceId } = activeFilters;

      if (!cityId && !zoneId && !serviceId) {
        setBusinesses([]);
        setLoading(false);
        return;
      }

      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const relations = 'service,flyer,contact.address.localisation,localisation,Address,Address.localisation';
        const response = await getBusinesses(page, pageSize, {
          service: serviceId || undefined,
          cityId: cityId || undefined,
          zoneId: zoneId || undefined
        }, relations);

        if (cancelled) return;

        const extractedData = response?.data || response?.results || [];

        if (extractedData.length < pageSize) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setBusinesses(prev => {
          if (page === 1) return Array.isArray(extractedData) ? extractedData : [];
          const existingIds = new Set(prev.map((b: any) => b.id));
          const newItems = (Array.isArray(extractedData) ? extractedData : []).filter((b: any) => !existingIds.has(b.id));
          return [...prev, ...newItems];
        });
      } catch (error) {
        console.error("❌ Fetch Businesses Error:", error);
        if (cancelled) return;
        if (page === 1) setBusinesses([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchBusinesses();

    return () => {
      cancelled = true;
    };
  }, [activeFilters, page]);

  const filteredZones = useMemo(() => {
    if (!selectedCityId) return [];
    return allZones.filter(zone => String(zone.normalizedCityId) === String(selectedCityId));
  }, [selectedCityId, allZones]);

  const activeMapCenter = useMemo((): [number, number] | undefined => {
    if (selectedZoneId) {
      const zone = allZones.find(z => String(z.id) === String(selectedZoneId));
      if (zone?.lat != null && zone?.lng != null) return [zone.lat, zone.lng];
    }
    if (selectedCityId) {
      const city = cities.find(c => String(c.id) === String(selectedCityId));
      if (city?.lat != null && city?.lng != null) return [city.lat, city.lng];
    }

    const located = (Array.isArray(businesses) ? businesses : [])
      .map((biz: any) => businessPosition(biz))
      .filter((position): position is [number, number] => position !== null);

    if (located.length === 0) return undefined;

    const totalLat = located.reduce((sum, position) => sum + position[0], 0);
    const totalLng = located.reduce((sum, position) => sum + position[1], 0);

    return [totalLat / located.length, totalLng / located.length];
  }, [selectedCityId, selectedZoneId, cities, allZones, businesses]);

  const activeCircleBoundary = useMemo(() => {
    if (selectedZoneId) {
      const zone = allZones.find(z => String(z.id) === String(selectedZoneId));
      if (zone?.lat != null && zone?.lng != null) {
        return { center: [zone.lat, zone.lng] as [number, number], radius: 4500, color: '#8b5cf6' };
      }
    }
    if (selectedCityId) {
      const city = cities.find(c => String(c.id) === String(selectedCityId));
      if (city?.lat != null && city?.lng != null) {
        return { center: [city.lat, city.lng] as [number, number], radius: 12000, color: '#6366f1' };
      }
    }
    return null;
  }, [selectedCityId, selectedZoneId, allZones, cities]);

  const filteredBusinessesWithinRadius = useMemo(() => {
    if (!Array.isArray(businesses)) return [];
    if (!activeCircleBoundary) return businesses;

    const [centerLat, centerLng] = activeCircleBoundary.center;
    const radiusMeters = activeCircleBoundary.radius;

    return businesses.filter((biz: any) => {
      const bizZoneId =
        biz?.zoneId ||
        biz?.areaId ||
        biz?.Address?.zoneId ||
        biz?.Address?.cityAreaId ||
        biz?.contact?.address?.zoneId;

      if (selectedZoneId && bizZoneId) {
        return String(bizZoneId) === String(selectedZoneId);
      }

      const bizPos = businessPosition(biz);
      if (!bizPos) return true;
      const distance = calculateDistanceInMeters(centerLat, centerLng, bizPos[0], bizPos[1]);
      return distance <= radiusMeters;
    });
  }, [businesses, activeCircleBoundary, selectedZoneId]);

  const totalResults = filteredBusinessesWithinRadius.length;

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
    setPage(1);
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

    const baseEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000").replace(/\/$/, "").replace(/\/v1$/, "");
    return `${baseEndpoint}/v1/files/${cleanFilename}`;
  };

  const mapMarkers = useMemo(() => {
    if (!Array.isArray(filteredBusinessesWithinRadius)) return [];

    return filteredBusinessesWithinRadius.map((biz: any) => {
      if (!biz) return null;
      const position = businessPosition(biz);
      if (!position) return null;
      return {
        id: biz.id,
        position,
        label: biz[`name${langSuffix}`] || biz.nameFr || biz.nameEn || "Business",
        address: businessAddress(biz, langSuffix),
        flyerUrl: resolveFlyerUrl(biz.flyer?.path || biz.flyer?.url),
        phone: biz.phoneGround || biz.contact?.phoneGround || "",
        whatsapp: biz.phoneCell || biz.contact?.phoneCell  || "",
        active: hoveredBizId === biz.id
      };
    }).filter((m): m is NonNullable<typeof m> => m !== null);
  }, [filteredBusinessesWithinRadius, langSuffix, hoveredBizId]);

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden pb-16" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Sticky Search & Toggle Header */}
      <div className="sticky top-0 left-0 right-0 z-40 px-3 py-3 md:px-6 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="container mx-auto max-w-7xl space-y-3">

          {/* Search Inputs Bar with Integrated Desktop/Web Toggle Switch */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row items-center gap-1 transition-all">
            <CompactSelect
              label={t("search.city")}
              icon={<MapPin size={18} />}
              options={cities.map(c => ({ id: c.id, name: c.displayName }))}
              value={cities.find(c => String(c.id) === String(selectedCityId))?.displayName || ""}
              selectedValueId={selectedCityId}
              onChange={(id) => { setSelectedCityId(id); setSelectedZoneId(""); }}
              placeholder={t("search.select_city")}
            />
            <div className="hidden md:block w-px h-8 bg-slate-100 shrink-0 mx-1" />
            <div className="block md:hidden w-full h-px bg-slate-100 my-1" />
            <CompactSelect
              label={t("search.zone")}
              icon={<LayoutGrid size={18} />}
              options={filteredZones.map(z => ({ id: z.id, name: z.displayName }))}
              value={filteredZones.find(z => String(z.id) === String(selectedZoneId))?.displayName || ""}
              selectedValueId={selectedZoneId}
              disabled={!selectedCityId}
              onChange={(id) => setSelectedZoneId(id)}
              placeholder={selectedCityId ? (filteredZones.length === 0 ? "No Areas" : t("search.select_zone")) : t("search.select_zone")}
            />
            <div className="hidden md:block w-px h-8 bg-slate-100 shrink-0 mx-1" />
            <div className="block md:hidden w-full h-px bg-slate-100 my-1" />

            <div className="flex-[1.4] flex flex-col md:flex-row items-center min-w-0 w-full gap-2 md:gap-0">
              <CompactSelect
                label={t("search.service")}
                icon={<HandPlatter size={18} />}
                options={services.map(s => ({ id: s.id, name: s.displayName }))}
                value={services.find(s => String(s.id) === String(selectedServiceId))?.displayName || ""}
                selectedValueId={selectedServiceId}
                onChange={(id) => setSelectedServiceId(id)}
                placeholder={t("search.select_service")}
              />

              <button
                type="button"
                onClick={handleSearchUpdate}
                disabled={loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white p-3 md:px-8 rounded-2xl md:rounded-full active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100 disabled:opacity-50 md:ml-1"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                <span className="font-black text-xs uppercase tracking-widest">{t("search.button")}</span>
              </button>

              {/* Desktop/Web Cards & Map Viewport Toggle Switch Integrated In-Line */}
              <div className="hidden md:flex bg-slate-900/90 backdrop-blur-md p-1 rounded-full shadow-inner border border-slate-700 items-center gap-1 mx-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setViewMode("cards")} 
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${viewMode === "cards" ? "bg-indigo-600 text-white shadow-md scale-105" : "text-slate-300 hover:text-white"}`}
                >
                  <Grid size={13} /><span>{t("search.cards")}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode("map")} 
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${viewMode === "map" ? "bg-indigo-600 text-white shadow-md scale-105" : "text-slate-300 hover:text-white"}`}
                >
                  <MapIcon size={13} /><span>{t("search.map")}</span>
                </button>
              </div>


            </div>
          </div>

          {/* Sub-bar / Mobile Toggle Switch Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-500">
              {!loading && hasActiveFilter && `${totalResults} ${t("search.results_found")}`}
            </div>

            {/* Mobile-only view toggle switch */}
            <div className="flex md:hidden bg-slate-900/90 backdrop-blur-md p-1 rounded-full shadow-md border border-slate-700 items-center gap-1 mx-auto">
              <button 
                type="button"
                onClick={() => setViewMode("cards")} 
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "cards" ? "bg-indigo-600 text-white shadow-md scale-105" : "text-slate-300 hover:text-white"}`}
              >
                <Grid size={13} /><span>{t("search.cards")}</span>
              </button>
              <button 
                type="button"
                onClick={() => setViewMode("map")} 
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "map" ? "bg-indigo-600 text-white shadow-md scale-105" : "text-slate-300 hover:text-white"}`}
              >
                <MapIcon size={13} /><span>{t("search.map")}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Viewports Container */}
      <div className="flex flex-col min-h-[calc(100vh-10rem)] relative mt-2">

        {/* Cards Viewport (Optimized Compact Grid) */}
        <div className={`w-full flex-1 px-3 md:px-8 pb-32 transition-all duration-300 ${
          viewMode === "map" ? "hidden" : "block"
        }`}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <BusinessCardSkeleton /><BusinessCardSkeleton /><BusinessCardSkeleton /><BusinessCardSkeleton />
            </div>
          ) : (
            <>
              {!hasActiveFilter && (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center px-6 mt-4">
                  <div className="p-5 bg-indigo-50 rounded-full mb-4">
                    <HandPlatter size={40} className="text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{t("search.welcome_title")}</h3>
                </div>
              )}

              {/* Compact Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4.5 mt-2">
                {filteredBusinessesWithinRadius.map((biz: any) => {
                  const title = biz[`name${langSuffix}`] || biz.nameFr || biz.nameEn || "Business";
                  const desc = biz[`descr${langSuffix}`] || biz.descrFr || biz.descrEn;
                  const flyerUrl = biz.flyer?.path || biz.flyer?.url;
                  const img = resolveFlyerUrl(flyerUrl);

                  return (
                    <div
                      key={biz.id}
                      onMouseEnter={() => setHoveredBizId(biz.id)}
                      onMouseLeave={() => setHoveredBizId(null)}
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-50/50 hover:-translate-y-0.5 border border-slate-100/80 p-2.5"
                    >
                      {/* Image Thumbnail */}
                      <div onClick={() => router.push(`/businesses/${biz.id}`)} className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-100 cursor-pointer">
                        <img 
                          src={img} 
                          alt={title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          onError={(e) => { 
                            const target = e.target as HTMLImageElement; 
                            if (target.src !== "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500") {
                              target.src = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500"; 
                            }
                          }} 
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                          <span className="text-[9px] font-black text-white uppercase tracking-wider">
                            {biz.service?.[`nameServ${langSuffix}`] || biz.service?.[`name${langSuffix}`] || biz.service?.nameServFr || biz.service?.nameFr}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-2 flex flex-col grow">
                        <h3 onClick={() => router.push(`/businesses/${biz.id}`)} className="text-xs font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer tracking-tight">
                          {title}
                        </h3>

                        <div className="flex items-center gap-1 text-slate-400 mb-1.5">
                          <MapPin size={10} className="shrink-0 text-indigo-500" />
                          <span className="text-[10px] font-medium truncate">{businessAddress(biz, langSuffix) || "Address not provided"}</span>
                        </div>

                        <p className="text-slate-700 text-[14px] leading-relaxed line-clamp-2 mb-3">{desc}</p>

                        {/* Actions Footer */}
                        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between gap-1.5">
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); router.push(`/rating-report?businessId=${biz.id}`); }} 
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 py-1.5 px-2.5 rounded-xl font-bold text-[10px] transition-colors flex items-center gap-1"
                          >
                            <span>⭐ Rate</span>
                          </button>

                          <div 
                            onClick={() => router.push(`/businesses/${biz.id}`)} 
                            className="flex items-center gap-0.5 text-indigo-600 font-extrabold text-[10px] cursor-pointer hover:underline"
                          >
                            <span>{t("search.view_details") || "Details"}</span>
                            <ArrowRight size={11} className={isRtl ? "rotate-180" : ""} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Pagination */}
              {hasActiveFilter && hasMore && filteredBusinessesWithinRadius.length > 0 && (
                <div className="mt-8 text-center pb-12">
                  <button
                    type="button"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loadingMore}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-8 py-3 rounded-2xl font-bold text-sm transition-all inline-flex items-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loadingMore ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                    <span>Load More Results</span>
                  </button>
                </div>
              )}

              {hasActiveFilter && filteredBusinessesWithinRadius.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2rem border border-dashed border-slate-200 mt-4">
                  <Search size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold">{t("search.no_results")}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Map Viewport */}
        <div className={`w-full h-[calc(100vh-14rem)] p-3 relative transition-all duration-300 ${
          viewMode === "cards" ? "hidden" : "block"
        }`}>
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-inner border-2 border-white relative">
            <MapComponent
              key={`map-view-${selectedCityId}-${selectedZoneId}-${viewMode}`}
              center={activeMapCenter}
              displayLabel={activeMapLabel}
              markers={mapMarkers}
              circleBoundary={activeCircleBoundary}
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