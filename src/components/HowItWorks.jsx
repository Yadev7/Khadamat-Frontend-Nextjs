import React, { useState } from 'react';
import { Search, CalendarCheck, MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  
  // Tab state: 'client' or 'provider'
  const [activeTab, setActiveTab] = useState('client');

  // Check if current language is Arabic (RTL)
  const isRTL = i18n.language === 'ar';

  // Client Steps 
  const clientSteps = [
    {
      number: '01',
      title: t("how_it_works.client_steps.1.title"),
      description: t("how_it_works.client_steps.1.description"),
      icon: <Search className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      number: '02',
      title: t("how_it_works.client_steps.2.title"),
      description: t("how_it_works.client_steps.2.description"),
      icon: <CalendarCheck className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-100"
    },
    {
      number: '03',
      title: t("how_it_works.client_steps.3.title"),
      description: t("how_it_works.client_steps.3.description"),
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      color: "bg-purple-100"
    }
  ];

  // Provider Steps
  const providerSteps = [
    {
      number: '01',
      title: t("how_it_works.provider_steps.1.title"),
      description: t("how_it_works.provider_steps.1.description"),
      icon: <Search className="w-8 h-8 text-blue-600" />, 
      color: "bg-blue-100"
    },
    {
      number: '02',
      title: t("how_it_works.provider_steps.2.title"),
      description: t("how_it_works.provider_steps.2.description"),
      icon: <CalendarCheck className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-100"
    },
    {
      number: '03',
      title: t("how_it_works.provider_steps.3.title"),
      description: t("how_it_works.provider_steps.3.description"),
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      color: "bg-purple-100"
    }
  ];

  const currentSteps = activeTab === 'client' ? clientSteps : providerSteps;

  // طريقة نظيفة وديناميكية لنقل الخلفية البيضاء بدون التسبب في ظهور مساحات زائدة
  const getSlidingClass = () => {
    if (activeTab === 'provider') {
      return isRTL ? 'translate-x-[-100%]' : 'translate-x-full';
    }
    return 'translate-x-0';
  };

  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
            {t("how_it_works.process")}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              {t("how_it_works.title")}
            </span>
          </h2>
          <p className="text-lg text-slate-600">
            {t("how_it_works.description")}
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex justify-center mb-16">
          {/* تم استبدال الحواف المطلقة بخصائص منطقية تلائم الاتجاهين */}
          <div className="relative p-1.5 bg-slate-200/70 backdrop-blur-sm rounded-2xl flex items-center w-full max-w-md shadow-inner">
            
            {/* استخدام start-1.5 بدلاً من left-1.5 لمنع تكرار أو انزياح التبويب في الـ RTL */}
            <div 
              className={`absolute top-1.5 bottom-1.5 inset-s-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md transition-transform duration-300 ease-out z-0 ${getSlidingClass()}`}
            />
            
            <button
              onClick={() => setActiveTab('client')}
              className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-200 text-center ${
                activeTab === 'client' ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              {t("how_it_works.tabs.client", "Client")}
            </button>
            
            <button
              onClick={() => setActiveTab('provider')}
              className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-200 text-center ${
                activeTab === 'provider' ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              {t("how_it_works.tabs.provider", "Provider")}
            </button>
          </div>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[25%] left-0 w-full h-0.5 border-t-2 border-dashed border-slate-200 z-0" />

          <div key={activeTab} className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 cursor-pointer">
            {currentSteps.map((step, index) => (
              <div key={index} className="group flex flex-col items-center">
                
                {/* Icon Hub */}
                <div className="relative mb-8">
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center z-20">
                    <span className="text-sm font-bold text-slate-900">{step.number}</span>
                  </div>

                  {/* Main Icon Circle */}
                  <div className={`w-20 h-20 md:w-24 md:h-24 ${step.color} rounded-3xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-xl group-hover:shadow-2xl`}>
                    {step.icon}
                  </div>
                </div>

                {/* Content Card */}
                <div className="text-center bg-white p-8 rounded-2rem shadow-sm group-hover:shadow-xl transition-all duration-500 border border-slate-100 group-hover:-translate-y-2 w-full">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;