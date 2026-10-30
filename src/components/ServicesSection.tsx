"use client";

import { useEffect, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getServices } from '@/api/services-api';

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
}

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) {
    const domain = process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '') || 'http://localhost:3001';
    return `${domain}${path}`;
  }
  if (path.startsWith('files/')) {
    const domain = process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '') || 'http://localhost:3001';
    return `${domain}/${path}`;
  }
  return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/files/${path}`;
};

const ServicesSection = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if the current language is Arabic
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await getServices();

        // Map API data to our Service interface
        const mappedServices = data.map((s: any) => {
          // Determine title and description based on current language
          let title = s.nameServEn || s.nameServFr; // default fallback
          let description = s.descrEn || s.descrFr;

          if (i18n.language === 'ar') {
            title = s.nameServAr || title;
            description = s.descrAr || description;
          } else if (i18n.language === 'fr') {
            title = s.nameServFr || title;
            description = s.descrFr || description;
          }

          return {
            id: s.id,
            title: title || t("services_section.categories.default_title"),
            description: description || t("services_section.categories.default_description"),
            image: s.image?.path ? getImageUrl(s.image.path) : "/PlumbingCarlos.png"
          };
        });

        setServices(mappedServices);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Could not load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [i18n.language, t]);

  const handleNavigate = (serviceId: string) => {
    router.push(`/search?service=${serviceId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-400px">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-medium min-h-400px">
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

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
              className="group relative flex flex-col bg-white rounded-2rem overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/PlumbingCarlos.png';
                  }}
                />
              </div>

              {/* Content Section */}
              <div className="p-8 flex flex-col grow">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight transition-colors group-hover:text-blue-600">
                  {service.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                {/* Arrow icon flips 180 degrees for Arabic */}
                {/* <div className="mt-6 flex items-center text-blue-600 font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  {t("services_section.book_expert")} 
                  <ArrowRight size={16} className={isRtl ? "rotate-180" : ""} />
                </div> */}
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