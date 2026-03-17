"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image  from "next/image";

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
  const [currentSlide, setCurrentSlide] = useState(0);

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
<div className="relative min-h-[85vh] w-full flex items-start justify-center overflow-hidden  px-4 md:px-12 lg:px-20">
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
        <div className="text-start space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium animate-fade-in">
            <CheckCircle2 size={14} />
            {t('hero.verified_pro')}
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl">
            {t('hero.title')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 italic">
              {t(`hero.services.title.${slides[currentSlide].key}`)}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed font-light">
            {t('hero.subtitle')}
          </p>


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
              <div className="h-56 overflow-hidden">
                  <Image
                    src={slides[currentSlide].image}
                    alt={t(`hero.services.title.${slides[currentSlide].key}`)}
                    className="w-full h-full object-cover"
                    width={380}
                    height={224}
                  />
              </div>

              <div className="p-8">
                {/* <div className="flex items-center gap-1.5 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold ms-2">4.9</span>
                </div> */}

                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                  {t(`hero.services.title.${slides[currentSlide].key}`)}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {t(`hero.services.description.${slides[currentSlide].key}`)}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs">
                    {t('hero.verified_pro')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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