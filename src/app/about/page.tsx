"use client";
import React from 'react';
import { ShieldCheck, Zap, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AboutUs() {
  // Replace this with your actual translation hook
     const { t } = useTranslation();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('about.hero.title')}
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {t('about.mission.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('about.mission.p1')}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {t('about.mission.p2')}
            </p>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-6 rounded-2xl text-center">
              <span className="text-3xl font-bold text-blue-600">100+</span>
              <p className="text-gray-700 text-sm">{t('about.mission.stats.services')}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl text-center">
              <span className="text-3xl font-bold text-green-600">
                {t('about.mission.stats.originValue')}
              </span>
              <p className="text-gray-700 text-sm">{t('about.mission.stats.origin')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            {t('about.features.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
              title={t('about.features.trust.title')}
              description={t('about.features.trust.description')}
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-blue-600" />}
              title={t('about.features.speed.title')}
              description={t('about.features.speed.description')}
            />
            <FeatureCard 
              icon={<MapPin className="w-8 h-8 text-blue-600" />}
              title={t('about.features.proximity.title')}
              description={t('about.features.proximity.description')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 italic">
            {t('about.cta.title')}
          </h2>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
              {t('about.cta.findBtn')}
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
              {t('about.cta.becomeBtn')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}