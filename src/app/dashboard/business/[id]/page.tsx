"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Phone, MapPin, Music, Star, ShieldCheck,
  Loader2, MessageSquare, Mic, Send, X, ArrowLeft
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl" />
});

export default function BusinessDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    // const fetchBusinessData = async () => {
    //   setLoading(true);
    //   try {
    //     const baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3000";
    //     const response = await axios.get(`${baseUrl}/v1/businesses/${id}`);
    //     setBusiness(response.data);
    //   } catch (error) {
    //     console.error("❌ Fetch Error:", error);
    //     setBusiness(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3000";
        const response = await axios.get(`${baseUrl}/v1/businesses/${id}`);
        setBusiness(response.data);
      } catch (error: any) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Server responded with:", error.response.status);
          if (error.response.status === 401 || error.response.status === 403) {
            console.error("Access denied by backend guards");
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received from server");
        }
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessData();
  }, [id]);

  const langSuffix = i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);
  const title = business?.[`name${langSuffix}`] || business?.nameFr || "Business";
  const desc = business?.[`descr${langSuffix}`] || business?.descrFr || "No description";
  const serviceName = business?.service?.[`name${langSuffix}`] || business?.service?.nameFr || "Service";
  const addressLine = business?.contact?.address?.lineAddressFr || "Address not provided";
  const phoneNumber = business?.contact?.tel || business?.tel || "";

  const baseEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3000";
  const flyerUrl = business?.flyer?.url || business?.flyer?.path;
  const img = flyerUrl
    ? (flyerUrl.startsWith("http") ? flyerUrl : `${baseEndpoint}/api/v1/files/${flyerUrl.replace(/^\//, "")}`)
    : "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500";

  // const currentAudio = i18n.language === 'ar' ? business?.audioAr : i18n.language === 'fr' ? business?.audioFr : business?.audioEn;
  // const audioUrl = currentAudio?.path 
  //   ? (currentAudio.path.startsWith("http") ? currentAudio.path : `${baseEndpoint}/api/v1/files/${currentAudio.path.replace(/^\//, "")}`)
  //   : null;


  const currentAudio =
    i18n.language === 'ar' ? business?.audioAr :
      i18n.language === 'fr' ? business?.audioFr :
        business?.audioEn;

  const audioUrl = currentAudio?.path
    ? (() => {
      // 1. Convert backslashes to forward slashes
      let cleanPath = currentAudio.path.replace(/\\/g, '/');

      // 2. Remove any occurrence of '/api/v1/files' (with or without slashes)
      cleanPath = cleanPath.replace(/\/api\/v1\/files/gi, '');

      // 3. Remove leading slash (if any)
      cleanPath = cleanPath.replace(/^\/+/, '');

      // 4. Construct the final URL
      // Ensure baseEndpoint doesn't have a trailing slash, and cleanPath is joined correctly
      const finalUrl = `${baseEndpoint.replace(/\/$/, "")}/v1/files/${cleanPath}`;

      console.log("Final Cleaned Audio Path:", finalUrl);
      return finalUrl;
    })()
    : null;


  if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  if (!business) return (
    <div className="pt-40 text-center space-y-4">
      <h2 className="text-2xl font-bold">{t("details_ads.profile_not_found") || "Profile not found"}</h2>
      <button onClick={() => router.back()} className="text-indigo-600 underline">Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-sm text-gray-600">
            <ArrowLeft size={20} /> {t("details_ads.back_to_search") || "Back"}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-28 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="h-100 w-full rounded-[2.5rem] overflow-hidden shadow-lg"><img src={img} className="w-full h-full object-cover" /></div>
            <div onClick={() => setIsMapModalOpen(true)} className="cursor-pointer bg-white p-3 rounded-[2.5rem] h-60 border overflow-hidden">
              <MapComponent center={[business.localisation?.latitude || 33.57, business.localisation?.longitude || -7.58]} />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border h-full">
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">{serviceName}</span>
              <h1 className="text-4xl font-black mt-2 mb-4">{title}</h1>
              <p className="text-gray-700 mb-6">{desc}</p>

              {/* Integrated Modern Audio Player */}
              {/* {audioUrl && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Music size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Professional Introduction</h4>
                      <p className="text-xs text-gray-500">Tap play to listen</p>
                    </div>
                  </div>
                  <audio controls className="w-full h-10 accent-indigo-600" key={audioUrl}>
                    <source src={audioUrl || ""} type="audio/mpeg" />
                  </audio>
                </div>
              )} */}


              {audioUrl && (
                <audio
                  controls
                  preload="auto"
                  key={audioUrl}
                  className="w-full h-10 accent-indigo-600 mb-5"
                >
                  <source src={audioUrl} type="audio/mpeg" />
                  <source src={audioUrl} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => window.location.href = `tel:${phoneNumber}`} className="bg-gray-900 text-white py-4 rounded-3xl font-bold">Call</button>
                <button onClick={() => setIsModalOpen(true)} className="bg-white border-2 py-4 rounded-3xl font-bold">Message</button>
                <button onClick={() => setIsWhatsAppModalOpen(true)} className="sm:col-span-2 bg-[#25D366] text-white py-4 rounded-3xl font-bold">WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] overflow-hidden flex flex-col">
            <div className="p-6 flex justify-between items-center border-b"><h3 className="font-bold">{title}</h3><X className="cursor-pointer" onClick={() => setIsMapModalOpen(false)} /></div>
            <div className="flex-1"><MapComponent center={[business.localisation?.latitude || 33.57, business.localisation?.longitude || -7.58]} /></div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3"><div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><MessageSquare size={20} /></div><h3 className="font-bold text-lg">Inquire Profile</h3></div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center p-8 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <button onClick={() => alert("Audio recording feature coming soon!")} className="mx-auto w-16 h-16 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 mb-3"><Mic size={28} /></button>
                <p className="text-sm font-semibold">Tap to record audio</p>
              </div>
              <div className="relative">
                <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." className="w-full p-4 rounded-2xl border-2 border-gray-100 outline-none" />
                <button onClick={() => alert("Sent!")} className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-xl"><Send size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center space-y-6">
            <h3 className="text-xl font-black">Start WhatsApp Chat?</h3>
            <button onClick={() => { window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=Hello, I found your profile.`, '_blank'); setIsWhatsAppModalOpen(false); }} className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold">Continue to Chat</button>
            <button onClick={() => setIsWhatsAppModalOpen(false)} className="w-full bg-gray-100 py-4 rounded-2xl font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}