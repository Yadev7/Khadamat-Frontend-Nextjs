"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";



const slides = [
  // { image: "/bckgHero.png", key: "general" },
  { image: "/GardeningJames.png", key: "gardening" },
  { image: "/HandymanPatricia.png", key: "handyman" },
  { image: "/HouseCleaningMaria.png", key: "cleaning" },
  { image: "/PlumbingCarlos.png", key: "plumber" },
];

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

   const initialCity = searchParams.get("city");
   const initialService = searchParams.get("service");
   const initialZone = searchParams.get("zone");
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[70vh] w-full flex items-start justify-center overflow-hidden  px-4 md:px-12 lg:px-20">
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
          {/* Enhanced Multi-layer Overlay */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Side: Content */}
        <div className="text-start space-y-5">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium animate-fade-in">
            <CheckCircle2 size={14} />
            {t('hero.verified_pro')}
          </div> */}

          <h1 className="text-5xl md:text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl whitespace-nowrap">
            {t('hero.title')}{' '}
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 italic">
              {t(`hero.services.title.${slides[currentSlide].key}`)}
            </span> */}
          </h1>
          {/* <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed font-light">
            {t('hero.subtitle')}
          </p> */}


          {/* Subtitle Section */}
          <div className="relative max-w-xl space-y-4 animate-fade-in [animation-delay:200ms]">
            {/* <div className="flex items-center gap-3">
              <div className="h-[1px] w-12 bg-gradient-to-r from-indigo-500 to-transparent" />
              <span className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold">
                {t('hero.featured_tagline') || "Premium Services"}
              </span>
            </div> */}

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light italic">
              {t('hero.subtitle').split('.').map((sentence, i) => (
                <span key={i} className="block mb-2 last:mb-0">
                  {sentence}{sentence ? '.' : ''}
                </span>
              ))}
            </p>

            {/* <div className="flex items-center gap-6 text-gray-400 text-sm font-medium pt-2">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                {t('hero.stats.pros') || "1k+ Experts"}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                {t('hero.stats.rating') || "4.9/5 Rating"}
              </span>
            </div> */}
          </div>


          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <button
              onClick={() => router.push('/search')}
              className="group px-10 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 cursor-pointer"
            >
              {t("hero.get_started")}
              {/* The arrow will flip its direction if the language is Arabic */}
              <ArrowRight
                size={22}
                className={`transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
              />
            </button>

            <button
              onClick={() => router.push('/become-tasker')}
              className="group px-10 h-16 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer"
            >
              {t("hero.become_tasker")}
              <ArrowRight
                size={22}
                className={`transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
              />
            </button>
          </div>

        </div>

        {/* Right Side: Floating UI Card */}
<div className="hidden lg:flex justify-end pr-8">
  <div className="relative group w-[380px] animate-float">
    {/* Glow Effect */}
    <div className="absolute -inset-4 bg-indigo-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

    <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
      <div className="h-52 overflow-hidden"> {/* Reduced height slightly from h-56 */}
        <Image
          src={slides[currentSlide].image}
          alt={t(`hero.services.title.${slides[currentSlide].key}`)}
          className="w-full h-full object-cover"
          width={380}
          height={208}
        />
      </div>

      {/* Reduced padding from p-8 to p-5 */}
      <div className="p-5">
        {/* Reduced margin-bottom from mb-3 to mb-1 */}
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
          {t(`hero.services.title.${slides[currentSlide].key}`)}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-snug line-clamp-2">
          {t(`hero.services.description.${slides[currentSlide].key}`)}
        </p>

        {/* Reduced margin-top and padding-top from mt-6 pt-6 to mt-4 pt-4 */}
        {/* <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-[10px]">
            {t('hero.verified_pro')}
          </div>
        </div> */}
      </div>
    </div>
  </div>
</div>
<h1>
  here add search bar with auto complete and location input and date picker and time picker and a button to search for taskers
</h1>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(1deg); }
        }
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}