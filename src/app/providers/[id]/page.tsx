"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Phone, MapPin, Music,
  Star, ShieldCheck, Loader2,
  MessageSquare, Mic, Send, X
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslation } from "react-i18next";



const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl" />
});

interface Provider {
  id: string;
  name: string;
  email: string;
  tel: string;
  category: string;
  rating: number;
  reviews: number;
  coords: [number, number];
  images: string[];
  skills: string[];
  audioUrl: string;
  experience: string;
  locationName: string;
}

export default function ProviderDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockDb: Provider[] = [
          {
            id: "1",
            name: 'Carlos Rodriguez',
            email: 'carlos@example.com',
            tel: '+212 600-111111',
            category: 'Professional Plumber',
            rating: 4.8,
            reviews: 124,
            coords: [33.5731, -7.5898],
            images: ['/PlumbingCarlos.png'],
            skills: ["Leak Detection", "Pipe Repair", "Solar Heaters"],
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            experience: "8 Years",
            locationName: "Maarif, Casablanca"
          },
          {
            id: "2",
            name: 'Linda Nguyen',
            email: 'linda@example.com',
            tel: '+212 600-222222',
            category: 'Expert Handyman',
            rating: 4.6,
            reviews: 98,
            coords: [33.5889, -7.6111],
            images: ['/HandymanPatricia.png'],
            skills: ["Furniture Assembly", "Painting", "Electrical"],
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            experience: "5 Years",
            locationName: "Gauthier, Casablanca"
          },
          {
            id: "3",
            name: 'Ahmed Hassan',
            email: 'ahmed@example.com',
            tel: '+212 600-333333',
            category: 'Specialist Electrician',
            rating: 4.9,
            reviews: 150,
            coords: [33.5958, -7.6100],
            images: ['/PlumbingCarlos.png'],
            skills: ["Wiring", "Circuit Breakers", "Lighting"],
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            experience: "12 Years",
            locationName: "Bourgogne, Casablanca"
          }
        ];

        const data = mockDb.find(p => p.id === String(id));
        setProvider(data || null);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProviderData();
  }, [id]);

  const handleAudioRecord = () => {
    // Placeholder for audio recording logic
    alert("Audio recording feature coming soon!");
  };

  const handleMessage = () => {
    // Placeholder for message sending logic
    alert("Message sending feature coming soon!");
  }

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-medium tracking-tight">{t("details_ads.loading")}</p>
    </div>
  );

  if (!provider) return (
    <div className="pt-40 text-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{t("details_ads.profile_not_found")}</h2>
      <button onClick={() => router.push('/')} className="text-indigo-600 font-semibold hover:underline">
        {t('details_ads.back_to_search')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* --- NAVIGATION --- */}
      {/* <nav className="sticky top-16 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 text-gray-600 transition-all">
            <ArrowLeft size={20} />
            <span className="font-medium">{t("details_ads.back_to_search")}</span>
          </button>
        </div>
      </nav> */}

      <main className="max-w-7xl mx-auto px-4 pt-24 space-y-8">
        {/* --- TOP SECTION: IMAGES & INFO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: IMAGES & AUDIO */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {provider.images.map((img, index) => (
                <div key={index} className="relative h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white">
                  <Image src={img} alt={provider.name} fill className="object-cover" priority />
                </div>
              ))}
            </div>

            {/* --- FULL WIDTH MAP SECTION --- */}
            {/* <div className="w-130 space-y-4 px-2">
              <div className="flex items-center gap-2 px-2">
                <MapPin size={18} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Service Area</h3>
              </div>
              <div className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-gray-100 h-[250px] relative overflow-hidden group">
                <div className="w-full h-full pointer-events-none select-none rounded-[2rem] overflow-hidden">
                  <MapComponent center={provider.coords} />
                </div>
                <div className="absolute inset-0 z-10 cursor-default" title="Location Preview Only" />
              </div>
            </div> */}

            {/* --- FULL WIDTH MAP SECTION --- */}
            <div className="w-full space-y-4 px-2">
              <div className="flex items-center gap-2 px-2">
                <MapPin size={18} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Service Area</h3>
              </div>
              <div
                onClick={() => setIsMapModalOpen(true)} // Open modal on click
                className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-gray-100 h-[250px] relative overflow-hidden group cursor-pointer hover:border-indigo-200 transition-all"
              >
                <div className="w-full h-full pointer-events-none select-none rounded-[2rem] overflow-hidden">
                  <MapComponent center={provider.coords} />
                </div>
                {/* Overlay now acts as a button trigger */}
                {/* <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all">
                  <span className="opacity-0 group-hover:opacity-100 bg-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                    Click to Expand
                  </span>
                </div> */}
              </div>
            </div>

            {/* --- FULL SCREEN MAP MODAL --- */}
            {isMapModalOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md">
                <div className="bg-white w-full max-w-5xl h-full sm:h-[80vh] rounded-none sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">

                  {/* Header */}
                  <div className="p-6 flex justify-between items-center border-b border-gray-100">
                    <div>
                      <h3 className="font-black text-xl text-gray-900">Service Location</h3>
                      <p className="text-sm text-gray-500">{provider.locationName}</p>
                    </div>
                    <button
                      onClick={() => setIsMapModalOpen(false)}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X size={24} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Interactive Map Container */}
                  <div className="flex-1 relative">
                    <MapComponent center={provider.coords} />

                    {/* Help Badge */}
                    <div className="absolute bottom-6 left-6 z-[120] bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-white">
                      <p className="text-xs font-bold text-indigo-600">Interactive View: Drag & Zoom enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS & ACTIONS */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full flex flex-col">

              {/* 1. NAME & CATEGORY + VERIFIED BADGE */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] px-1">
                    {provider.category}
                  </span>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold border border-green-100 shadow-sm">
                    <ShieldCheck size={14} /> Verified Professional
                  </div>
                </div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                  {provider.name}
                </h1>
              </div>

                           {/* 3. EXPERIENCE & SKILLS */}
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Professional Background</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Highly skilled with <span className="font-bold text-indigo-600 px-1 bg-indigo-50 rounded-md">{provider.experience}</span> of hands-on experience specializing in {provider.category.toLowerCase()} and modern maintenance techniques.
                  </p>
                </div>

                {/* Dynamic Skills Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {provider.skills.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. VOICE INTRO (AUDIO) */}
              <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                    <Music size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{t('details_ads.voice_intro')}</h4>
                    <p className="text-xs text-indigo-100 opacity-80">Hear from {provider.name.split(' ')[0]} directly</p>
                  </div>
                </div>
                <audio controls className="w-full h-10 accent-indigo-300">
                  <source src={provider.audioUrl} type="audio/mpeg" />
                </audio>
              </div>

            {/* 2. STATS & ZONE QUICK VIEW */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50/80 p-5 rounded-3xl flex items-center gap-4 border border-gray-100">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-yellow-500">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-black text-2xl text-gray-900 leading-none">{provider.rating}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-wider">{t('details_ads.rating')}</p>
                  </div>
                </div>
                <div className="bg-gray-50/80 p-5 rounded-3xl flex items-center gap-4 border border-gray-100 overflow-hidden">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-red-500">
                    <MapPin size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-xl text-gray-900 leading-none truncate">{provider.locationName.split(',')[0]}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-wider">Service Zone</p>
                  </div>
                </div>
              </div>

              {/* 5. ACTION BUTTONS */}
              <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => window.location.href = `tel:${provider.tel}`}
                  className="flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-[1.5rem] font-bold shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  <Phone size={20} /> {t('details_ads.phone')}
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-900 py-5 rounded-[1.5rem] font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                  <MessageSquare size={20} /> {t('details_ads.message')}
                </button>

                <button
                  onClick={() => window.open(`https://wa.me/${provider.tel.replace(/[^0-9]/g, '')}`, '_blank')}
                  className="sm:col-span-2 lg:col-span-1 flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-[1.5rem] font-bold hover:bg-[#22c35e] transition-all active:scale-[0.98] shadow-lg shadow-green-100"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {t('details_ads.whatsapp')}
                </button>
              </div>
            </div>
          </div>


        </div>


      </main>

      {/* --- MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 slide-in-from-bottom-10">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Contact {provider.name.split(' ')[0]}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Audio Recording Section */}
              <div className="text-center p-8 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
                <button onClick={handleAudioRecord} className="mx-auto w-16 h-16 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all active:scale-90 mb-3">
                  <Mic size={28} />
                </button>
                <p className="text-sm font-semibold text-gray-600">Tap to record audio</p>
                <p className="text-xs text-gray-400 mt-1">Send a voice note to explain your needs</p>
              </div>

              {/* Text Input Section */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all resize-none text-gray-700"
                />
                <button onClick={handleMessage} className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}