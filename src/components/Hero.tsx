"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  LayoutGrid,
  Loader2,
  MapPin,
  Search,
  HandPlatter,
  ChevronDown,
  Check
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { getCities } from "@/api/cities-api";
import { getCityAreas } from "@/api/city-areas-api";
import { getServices } from "@/api/services-api";

const slides = [
  { image: "/GardeningJames.png", key: "gardening" },
  { image: "/HandymanPatricia.png", key: "handyman" },
  { image: "/HouseCleaningMaria.png", key: "cleaning" },
  { image: "/PlumbingCarlos.png", key: "plumber" },
];

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // States لادارة البحث
  const [selectedCityId, setSelectedCityId] = useState(searchParams.get("cityId") || "");
  const [selectedZoneId, setSelectedZoneId] = useState(searchParams.get("zoneId") || "");
  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get("service") || "");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const isRtl = i18n.language === 'ar';

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

        setZones(getData(zonesData).map((z: any) => ({
          ...z,
          displayName: z[`name${langSuffix}`] || z.nameFr || "Area",
          cityId: z.city?.id || z.cityId
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

  const filteredZones = useMemo(() => {
    if (!selectedCityId) return [];
    return zones.filter(z => String(z.cityId) === String(selectedCityId));
  }, [selectedCityId, zones]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchUpdate = () => {
    setLoading(true);
    const params = new URLSearchParams();
    // The /search page reads cityId / zoneId / service - keep the names identical.
    if (selectedCityId) params.set("cityId", selectedCityId);
    if (selectedZoneId) params.set("zoneId", selectedZoneId);
    if (selectedServiceId) params.set("service", selectedServiceId);

    router.push(`/search?${params.toString()}`);
    // Safety net: the page normally unmounts on navigation, but never leave the
    // button stuck in a disabled spinner if the route does not change.
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="relative min-h-[90vh] w-full flex flex-col items-center justify-start overflow-visible px-4 md:px-12 lg:px-20">
      {/* Background Slideshow */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 scale-110" : "opacity-0 scale-100"
            }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-transparent to-black/40" />
          <div className="absolute inset-0 bg-linear-to-r from-gray-950/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-24 pb-16 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Content */}
        <div className="text-start space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
            {t('hero.title')}
          </h1>

          <div className="relative max-w-xl space-y-4 animate-fade-in [animation-delay:200ms]">
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light italic opacity-90">
              {t('hero.subtitle').split('.').map((sentence, i) => (
                <span key={i} className="block mb-1 last:mb-0">
                  {sentence}{sentence ? '.' : ''}
                </span>
              ))}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 pt-6">
            <button
              onClick={() => router.push('/search')}
              className="group px-10 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-95 cursor-pointer"
            >
              {t("hero.get_started")}
              <ArrowRight size={22} className={`transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
            </button>

            <button
              onClick={() => router.push('/become-tasker')}
              className="group px-10 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer"
            >
              {t("hero.become_tasker")}
              <ArrowRight size={22} className={isRtl ? "rotate-180" : ""} />
            </button>
          </div>
        </div>

        {/* Right Side: Floating UI Card */}
        <div className="hidden lg:flex justify-end pr-8">
          <div className="relative group w-400px animate-float">
            <div className="absolute -inset-4 bg-indigo-500 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
              <div className="h-60 overflow-hidden">
                <Image
                  src={slides[currentSlide].image}
                  alt={t(`hero.services.title.${slides[currentSlide].key}`)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width={400}
                  height={240}
                />
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  {t(`hero.services.title.${slides[currentSlide].key}`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed line-clamp-2 italic">
                  {t(`hero.services.description.${slides[currentSlide].key}`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Compact Search Bar with High Z-Index & Visible Overflow */}
      <div className="relative z-50 w-full pb-24 animate-fade-in [animation-delay:400ms] overflow-visible">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row items-center gap-1 transition-all hover:border-indigo-200">

            <CompactSelect
              label={t("search.city")}
              icon={<MapPin size={20} className="text-indigo-600" />}
              options={cities.map(c => ({ id: c.id, name: c.displayName }))}
              value={cities.find(c => String(c.id) === String(selectedCityId))?.displayName || ""}
              onChange={(id) => { setSelectedCityId(id); setSelectedZoneId(""); }}
              placeholder={t("search.select_city")}
            />

            <div className="hidden md:block w-px h-10 bg-slate-100 shrink-0 mx-1" />
            <div className="block md:hidden w-full h-px bg-slate-100 my-1" />

            <CompactSelect
              label={t("search.zone")}
              icon={<LayoutGrid size={20} className="text-indigo-600" />}
              options={filteredZones.map(z => ({ id: z.id, name: z.displayName }))}
              value={filteredZones.find(z => String(z.id) === String(selectedZoneId))?.displayName || ""}
              disabled={!selectedCityId}
              onChange={(id) => setSelectedZoneId(id)}
              placeholder={selectedCityId ? (filteredZones.length === 0 ? "No Areas" : t("search.select_zone")) : t("search.select_zone")}
            />

            <div className="hidden md:block w-px h-10 bg-slate-100 shrink-0 mx-1" />
            <div className="block md:hidden w-full h-px bg-slate-100 my-1" />

            <div className="flex-[1.5] flex flex-col md:flex-row items-center min-w-0 w-full gap-3 md:gap-0">
              <CompactSelect
                label={t("search.service")}
                icon={<HandPlatter size={20} className="text-indigo-600" />}
                options={services.map(s => ({ id: s.id, name: s.displayName }))}
                value={services.find(s => String(s.id) === String(selectedServiceId))?.displayName || ""}
                onChange={(id) => setSelectedServiceId(id)}
                placeholder={t("search.select_service")}
              />

              <button
                onClick={handleSearchUpdate}
                disabled={loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 md:px-10 rounded-2xl md:rounded-full active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 disabled:opacity-50 md:ml-2 cursor-pointer"
              >
                {loading ? <Loader2 size={22} className="animate-spin" /> : <Search size={22} />}
                <span className="font-extrabold text-sm uppercase tracking-widest">
                  {t("search.button")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(1.5deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

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

function CompactSelect({ label, icon, options, value, onChange, placeholder, disabled = false }: CompactSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`flex-1 relative min-w-0 w-full ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3 cursor-pointer rounded-2xl md:rounded-full hover:bg-slate-50 transition-all duration-200 group"
      >
        <div className="shrink-0 p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
          {icon}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{label}</span>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>
              {value || placeholder}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ml-1 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 md:min-w-240px bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden z-100 animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-100">
            {options.length > 0 ? (
              options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(String(opt.id));
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-bold rounded-2xl cursor-pointer mb-1 last:mb-0 transition-all ${value === opt.name
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                >
                  {opt.name}
                  {value === opt.name && <Check size={16} />}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-slate-400 italic text-center font-medium">
                {placeholder}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}