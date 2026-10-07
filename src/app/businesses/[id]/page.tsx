"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Loader2, MessageSquare, Mic, Send, X, ArrowLeft, Mail, Phone,
  Square, Trash2, Play
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl" />
});

export default function PublicBusinessDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  // --- Inquiry multilingual fields -> mapped directly to DB columns ---
  const [titleAr, setTitleAr] = useState("");
  const [titleFr, setTitleFr] = useState("");
  const [textAr, setTextAr] = useState("");
  const [textFr, setTextFr] = useState("");
  const [textEn, setTextEn] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [sending, setSending] = useState(false);

  // --- Audio recording states ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioFilePath, setAudioFilePath] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(tr => tr.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [audioPreviewUrl]);

  const uploadAudioBlob = async (blob: Blob) => {
    try {
      setIsUploadingAudio(true);
      const baseEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3001/api")
        .replace(/\/$/, "")
        .replace(/\/v1$/, "");
      const formData = new FormData();
      const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm';
      const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || 'audio/webm' });
      formData.append('file', file);

      // Try to attach auth token if exists (for logged-in users), but upload is now @Public so token optional
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.post(`${baseEndpoint}/v1/files/upload`, formData, {
        headers,
      });

      // Response shape: { file: { id, path, ... } }  (FilesLocalService.create)
      const fileObj = (res.data as any)?.file || (res.data as any)?.data?.file || res.data;
      const path = fileObj?.path || fileObj?.file?.path || null;
      // Keep the stored path as returned by backend (e.g. "/api/v1/files/xxx.webm")
      // For messages table audio:string, we store this path string
      if (path) {
        setAudioFilePath(path);
      } else if (fileObj?.id) {
        // fallback: store id
        setAudioFilePath(fileObj.id);
      } else {
        console.warn('Upload response without path:', res.data);
        setAudioFilePath(null);
      }
    } catch (err: any) {
      console.error('❌ Upload audio error:', err);
      Swal.fire(t("details_ads.message_error") || "Upload failed", err?.response?.data?.message || err?.message, "error");
      // keep preview but clear path so user can retry
      setAudioFilePath(null);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const startRecording = async () => {
    try {
      // clear previous
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
        setAudioPreviewUrl(null);
      }
      setAudioBlob(null);
      setAudioFilePath(null);
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mr = new MediaRecorder(stream, { mimeType } as any);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        cleanupRecording();
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (blob.size === 0) return;
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        // auto upload
        await uploadAudioBlob(blob);
      };

      mr.start(100);
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err: any) {
      console.error('Mic permission error:', err);
      Swal.fire("Microphone access denied", err?.message || "Please allow microphone permission and try again.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // timer & stream will be cleaned in onstop
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const removeAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setAudioBlob(null);
    setAudioFilePath(null);
    setRecordingTime(0);
  };

  useEffect(() => {
    if (!id) return;

    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3001/api")
          .replace(/\/$/, "")
          .replace(/\/v1$/, "");
        const response = await axios.get(`${baseUrl}/v1/businesses/${id}`);
        setBusiness(response.data);
      } catch (error: any) {
        console.error("❌ Fetch Error:", error);
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
  const serviceName =
    business?.service?.[`nameServ${langSuffix}`] ||
    business?.service?.nameServFr ||
    business?.service?.[`name${langSuffix}`] ||
    business?.service?.nameFr ||
    "Service";
  const phoneNumber = business?.contact?.tel || business?.tel || "";

  const baseEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3001/api")
    .replace(/\/$/, "")
    .replace(/\/v1$/, "");

  const flyerUrl = business?.flyer?.url || business?.flyer?.path;
  const img = flyerUrl
    ? (flyerUrl.startsWith("http") ? flyerUrl : `${baseEndpoint}/v1/files/${flyerUrl.replace(/\\/g, '/').split('/').pop()}`)
    : "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500";

  const currentAudio =
    i18n.language === 'ar' ? business?.audioAr :
      i18n.language === 'fr' ? business?.audioFr :
        business?.audioEn;

  const audioUrl = currentAudio?.path
    ? (() => {
      let cleanPath = currentAudio.path.replace(/\\/g, '/');
      cleanPath = cleanPath.replace(/\/api\/v1\/files/gi, '');
      cleanPath = cleanPath.replace(/^\/+/, '');
      return `${baseEndpoint}/v1/files/${cleanPath}`;
    })()
    : null;

  const handleSendMessage = async () => {
    const hasText = titleAr.trim() || titleFr.trim() || textAr.trim() || textFr.trim() || textEn.trim();
    if (!hasText && !audioFilePath) {
      Swal.fire(t("details_ads.empty_message") || "Please write a message or record audio first.", "", "warning");
      return;
    }
    if (isUploadingAudio) {
      Swal.fire(t("details_ads.please_wait") || "Please wait", t("details_ads.uploading_audio") || "Audio is still uploading...", "info");
      return;
    }

    setSending(true);
    try {
      const payload: Record<string, any> = {
        business: { id: business?.id },
        emailContact: senderEmail.trim() || null,
        phoneContact: senderPhone.trim() ? Number(senderPhone.replace(/\D/g, "")) : null,
        audio: audioFilePath || null,
        // Explicit multilingual columns -> stored 1:1 in DB Message entity
        titleAr: titleAr.trim() || null,
        titleFr: titleFr.trim() || null,
        textAr: textAr.trim() || null,
        textFr: textFr.trim() || null,
        textEn: textEn.trim() || null,
      };

      await axios.post(`${baseEndpoint}/v1/messages`, payload);

      Swal.fire({
        icon: "success",
        title: t("details_ads.message_sent") || "Message Sent!",
        text: t("details_ads.message_sent_desc") || "Your message was delivered to the business.",
        timer: 2000,
        showConfirmButton: false,
      });
      setTitleAr("");
      setTitleFr("");
      setTextAr("");
      setTextFr("");
      setTextEn("");
      setSenderEmail("");
      setSenderPhone("");
      removeAudio();
      setIsModalOpen(false);
      setIsRecordModalOpen(false);
    } catch (error: any) {
      console.error("❌ Send Message Error:", error);
      Swal.fire(
        t("details_ads.message_error") || "Failed to send",
        error?.response?.data?.message || error?.message || "Something went wrong.",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

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
            <div className="h-100 w-full rounded-[2.5rem] overflow-hidden shadow-lg"><img src={img} className="w-full h-full object-cover" alt={title} /></div>
            <div onClick={() => setIsMapModalOpen(true)} className="cursor-pointer bg-white p-3 rounded-[2.5rem] h-60 border overflow-hidden">
              <MapComponent center={[business.localisation?.latitude || 33.57, business.localisation?.longitude || -7.58]} />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border h-full">
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">{serviceName}</span>
              <h1 className="text-4xl font-black mt-2 mb-4">{title}</h1>
              <p className="text-gray-700 mb-6">{desc}</p>

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

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => window.location.href = `tel:${phoneNumber}`} className="bg-gray-900 text-white py-4 rounded-3xl font-bold">Call</button>
                <button onClick={() => setIsWhatsAppModalOpen(true)} className="bg-[#25D366] text-white py-4 rounded-3xl font-bold">WhatsApp</button>
                <button onClick={() => setIsModalOpen(true)} className="bg-white border-2 py-4 rounded-3xl font-bold">Message</button>
                <button onClick={() => setIsRecordModalOpen(true)} className="flex items-center justify-center gap-2 bg-white border-2 py-4 rounded-3xl font-bold">
                  <Mic size={18} /> Record
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] overflow-hidden flex flex-col">
            <div className="p-6 flex justify-between items-center border-b"><h3 className="font-bold">{title}</h3><X className="cursor-pointer" onClick={() => setIsMapModalOpen(false)} /></div>
            <div className="flex-1"><MapComponent center={[business.localisation?.latitude || 33.57, business.localisation?.longitude || -7.58]} /></div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3"><div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><MessageSquare size={20} /></div><h3 className="font-bold text-lg">Inquire Profile</h3></div>
              <button onClick={() => { removeAudio(); setIsModalOpen(false); }} className="p-2 hover:bg-white rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border-2 border-gray-100 px-4 focus-within:border-indigo-500 transition-colors">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder={t("details_ads.your_email") || "Your email (optional)"}
                    className="w-full py-3 bg-transparent outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border-2 border-gray-100 px-4 focus-within:border-indigo-500 transition-colors">
                  <Phone size={18} className="text-gray-400" />
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder={t("details_ads.your_phone") || "Your phone (optional)"}
                    className="w-full py-3 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {/* AUDIO RECORDER */}
              <div className="text-center p-5 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30 space-y-3">
                {!isRecording && !audioPreviewUrl && (
                  <>
                    <button onClick={startRecording} className="mx-auto w-16 h-16 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
                      <Mic size={28} />
                    </button>
                    <p className="text-sm font-semibold">Tap to record audio</p>
                    <p className="text-xs text-gray-400">Voice message will be sent with your inquiry</p>
                  </>
                )}

                {isRecording && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      Recording {formatTime(recordingTime)}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={stopRecording} className="w-14 h-14 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                        <Square size={20} fill="white" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Tap stop when finished</p>
                  </div>
                )}

                {!isRecording && audioPreviewUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-semibold">
                      {isUploadingAudio ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Play size={16} /> Ready to send • {formatTime(recordingTime)}</>}
                    </div>
                    <audio controls src={audioPreviewUrl} className="w-full h-10 accent-indigo-600" />
                    <div className="flex gap-2 justify-center">
                      <button onClick={removeAudio} className="flex items-center gap-1.5 px-4 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
                        <Trash2 size={16} /> Remove
                      </button>
                      <button onClick={startRecording} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100">
                        <Mic size={16} /> Re-record
                      </button>
                    </div>
                    {audioFilePath && !isUploadingAudio && (
                      <p className="text-xs text-green-600">✓ Audio saved</p>
                    )}
                  </div>
                )}
              </div>

              {/* === MULTILINGUAL FIELDS -> titleAr, titleFr, textAr, textFr, textEn === */}
              <div className="space-y-4">
                <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Titles — titleAr / titleFr</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">titleAr <span className="text-gray-400 font-normal">(العربية)</span></label>
                    <input
                      dir="rtl"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="العنوان بالعربية"
                      className="w-full p-3.5 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 transition-colors text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">titleFr <span className="text-gray-400 font-normal">(Français)</span></label>
                    <input
                      value={titleFr}
                      onChange={(e) => setTitleFr(e.target.value)}
                      placeholder="Titre en français"
                      className="w-full p-3.5 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 transition-colors text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase pt-2">Messages — textAr / textFr / textEn</p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">textAr <span className="text-gray-400 font-normal">(العربية)</span></label>
                  <textarea
                    dir="rtl"
                    rows={3}
                    value={textAr}
                    onChange={(e) => setTextAr(e.target.value)}
                    placeholder="اكتب رسالتك بالعربية..."
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 transition-colors text-sm bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">textFr <span className="text-gray-400 font-normal">(Français)</span></label>
                  <textarea
                    rows={3}
                    value={textFr}
                    onChange={(e) => setTextFr(e.target.value)}
                    placeholder="Votre message en français..."
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 transition-colors text-sm bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">textEn <span className="text-gray-400 font-normal">(English)</span></label>
                  <textarea
                    rows={2}
                    value={textEn}
                    onChange={(e) => setTextEn(e.target.value)}
                    placeholder="Your message in English..."
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 transition-colors text-sm bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={sending || isUploadingAudio}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {sending ? (t("details_ads.sending") || "Sending...") : (t("details_ads.send_message") || "Send Inquiry")}
                </button>

                <p className="text-xs text-gray-400 text-center">Each field is stored 1:1 → <code>titleAr, titleFr, textAr, textFr, textEn</code> + <code>audio</code><br />You can fill any language or send voice only.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRecordModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Mic size={20} /></div>
                <h3 className="font-bold text-lg">Record Audio</h3>
              </div>
              <button
                onClick={() => { if (!isRecording) removeAudio(); setIsRecordModalOpen(false); }}
                className="p-2 hover:bg-white rounded-full"
              ><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5 text-center">
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  {formatTime(recordingTime)}
                </div>
              )}

              {audioPreviewUrl ? (
                <>
                  <audio controls src={audioPreviewUrl} className="w-full h-10 accent-indigo-600" />
                  {isUploadingAudio ? (
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </p>
                  ) : audioFilePath ? (
                    <p className="text-xs text-green-600">✓ Audio saved</p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-gray-500">Record a voice message and send it to this business.</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isRecording ? <><Square size={18} fill="white" /> Stop</> : <><Mic size={18} /> Record</>}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!audioFilePath || sending || isUploadingAudio}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Send
                </button>
              </div>

              {audioPreviewUrl && (
                <button
                  onClick={removeAudio}
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-white border rounded-2xl text-sm font-semibold hover:bg-gray-50"
                >
                  <Trash2 size={16} /> Remove
                </button>
              )}
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
