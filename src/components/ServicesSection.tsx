"use client";

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const ServicesSection = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  
  // Determine if the current language is Arabic
  const isRtl = i18n.language === 'ar';

  const services = [
    {
      id: "plumbing",
      title: t("services_section.categories.plumbing"),
      description: t("services_section.categories.plumbing_description"),
      image: "/PlumbingCarlos.png"
    },
    {
      id: "cleaning",
      title: t("services_section.categories.cleaning"),
      description: t("services_section.categories.cleaning_description") || "Professional deep cleaning for homes and offices.",
      image: "/HouseCleaningMaria.png"
    },
    {
      id: "handyman",
      title: t("services_section.categories.handyman"),
      description: t("services_section.categories.handyman_description") || "Versatile experts for furniture assembly and mounting.",
      image: "/HandymanPatricia.png"
    },
    {
      id: "gardening",
      title: t("services_section.categories.gardening"),
      description: t("services_section.categories.gardening_description") || "Complete lawn care and outdoor maintenance.",
      image: "/GardeningJames.png"
    }
  ];

  const handleNavigate = (serviceId: string) => {
    router.push(`/search?service=${serviceId}`);
  };

  return (
    <section 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="relative z-10 py-20 md:py-28 bg-white"
    >
      <div className="container mx-auto px-6">

        {/* Header - md:text-start handles both left (LTR) and right (RTL) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl text-center md:text-start">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              {t("services_section.title")}
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium">
              {t("services_section.description")}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {services.map((service, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(service.id)}
              className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>

              {/* Content Section */}
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight transition-colors group-hover:text-blue-600">
                  {service.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                {/* Arrow icon flips 180 degrees for Arabic */}
                <div className="mt-6 flex items-center text-blue-600 font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  {t("services_section.book_expert")} 
                  <ArrowRight size={16} className={isRtl ? "rotate-180" : ""} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-12 md:hidden flex justify-center">
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-2 text-blue-600 font-bold"
          >
            {t("services_section.view_all") || "View All Services"}
            <ArrowRight size={18} className={isRtl ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;