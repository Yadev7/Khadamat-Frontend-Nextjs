"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Loader2,
  MessageSquare,
  Mic,
  Send,
  X,
  ArrowLeft,
  Mail,
  Phone,
  Square,
  Trash2,
  Play,
  MapPin,
  Volume2,
  ExternalLink,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl" />
  ),
});

function getApiBaseEndpoint(): string {
  return (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:3001/api")
    .replace(/\/$/, "")
    .replace(/\/v1$/, "");
}

function resolveFileUrl(baseEndpoint: string, rawPath?: string | null): string | null {
  if (!rawPath) return null;
  if (rawPath.startsWith("http")) return rawPath;
  const normalized = rawPath.replace(/\\/g, "/");
  const withoutApiPrefix = normalized.replace(/\/?api\/v1\/files/gi, "");
  const cleanFile = withoutApiPrefix.replace(/^\/+/, "");
  return `${baseEndpoint}/v1/files/${cleanFile}`;
}

export default function PublicBusinessDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const baseEndpoint = useMemo(() => getApiBaseEndpoint(), []);

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Inquiry multilingual fields -> mapped directly to DB columns
  const [titleAr, setTitleAr] = useState("");
  const [titleFr, setTitleFr] = useState("");
  const [textAr, setTextAr] = useState("");
  const [textFr, setTextFr] = useState("");
  const [textEn, setTextEn] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [sending, setSending] = useState(false);

  // Audio recording states
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
  const previewUrlRef = useRef<string | null>(null);

  previewUrlRef.current = audioPreviewUrl;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const cleanupRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  }, []);

  const removeAudio = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    setAudioPreviewUrl(null);
    setAudioBlob(null);
    setAudioFilePath(null);
    setRecordingTime(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecording();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [cleanupRecording]);

  const uploadAudioBlob = async (blob: Blob) => {
    try {
      setIsUploadingAudio(true);
      const formData = new FormData();
      const ext = blob.type.includes("mp4")
        ? "mp4"
        : blob.type.includes("ogg")
          ? "ogg"
          : "webm";
      const file = new File([blob], `voice-${Date.now()}.${ext}`, {
        type: blob.type || "audio/webm",
      });
      formData.append("file", file);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("token")
          : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.post(`${baseEndpoint}/v1/files/upload`, formData, {
        headers,
      });

      const fileObj =
        (res.data as any)?.file || (res.data as any)?.data?.file || res.data;
      const path = fileObj?.path || fileObj?.file?.path || null;

      if (path) {
        setAudioFilePath(path);
      } else if (fileObj?.id) {
        setAudioFilePath(fileObj.id);
      } else {
        console.warn("Upload response without path:", res.data);
        setAudioFilePath(null);
      }
    } catch (err: any) {
      console.error("❌ Upload audio error:", err);
      Swal.fire(
        t("details_ads.message_error") || "Upload failed",
        err?.response?.data?.message || err?.message,
        "error"
      );
      setAudioFilePath(null);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const startRecording = async () => {
    try {
      removeAudio();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        cleanupRecording();
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });
        if (blob.size === 0) return;
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        await uploadAudioBlob(blob);
      };

      mr.start(100);
      setIsRecording(true);
      timerRef.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
    } catch (err: any) {
      console.error("Mic permission error:", err);
      Swal.fire(
        "Microphone access denied",
        err?.message || "Please allow microphone permission and try again.",
        "error"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseEndpoint}/v1/businesses/${id}`);
        if (!cancelled) setBusiness(response.data);
      } catch (error) {
        console.error("❌ Fetch Error:", error);
        if (!cancelled) setBusiness(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBusinessData();
    return () => {
      cancelled = true;
    };
  }, [id, baseEndpoint]);

  const langSuffix =
    i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);
  const title = business?.[`name${langSuffix}`] || business?.nameFr || "Business";
  const desc =
    business?.[`descr${langSuffix}`] || business?.descrFr || "No description";
  const serviceName =
    business?.service?.[`nameServ${langSuffix}`] ||
    business?.service?.nameServFr ||
    business?.service?.[`name${langSuffix}`] ||
    business?.service?.nameFr ||
    "Service";
  const phoneNumber = business?.contact?.tel || business?.tel || "";
  const cityLabel =
    business?.localisation?.city ||
    business?.localisation?.ville ||
    business?.city ||
    "";

  const fallbackImg =
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=800";
  const flyerRaw = business?.flyer?.url || business?.flyer?.path;
  const mainImg = flyerRaw
    ? resolveFileUrl(baseEndpoint, flyerRaw) || fallbackImg
    : fallbackImg;

  const extraImages: string[] = useMemo(() => {
    const gallery = Array.isArray(business?.gallery) ? business.gallery : [];
    return gallery
      .map((item: any) =>
        resolveFileUrl(baseEndpoint, typeof item === "string" ? item : item?.url || item?.path)
      )
      .filter((u: string | null): u is string => Boolean(u))
      .slice(0, 3);
  }, [business, baseEndpoint]);

  const currentAudio =
    i18n.language === "ar"
      ? business?.audioAr
      : i18n.language === "fr"
        ? business?.audioFr
        : business?.audioEn;

  const audioUrl = resolveFileUrl(baseEndpoint, currentAudio?.path);
  const mapCenter: [number, number] = [
    business?.localisation?.latitude || 33.57,
    business?.localisation?.longitude || -7.58,
  ];

  const handleSendMessage = async () => {
    const hasText =
      titleAr.trim() ||
      titleFr.trim() ||
      textAr.trim() ||
      textFr.trim() ||
      textEn.trim();

    if (!hasText && !audioFilePath) {
      Swal.fire(
        t("details_ads.empty_message") ||
          "Please write a message or record audio first.",
        "",
        "warning"
      );
      return;
    }

    if (isUploadingAudio) {
      Swal.fire(
        t("details_ads.please_wait") || "Please wait",
        t("details_ads.uploading_audio") || "Audio is still uploading...",
        "info"
      );
      return;
    }

    setSending(true);
    try {
      const payload: Record<string, any> = {
        business: { id: business?.id },
        emailContact: senderEmail.trim() || null,
        phoneContact: senderPhone.trim()
          ? Number(senderPhone.replace(/\D/g, ""))
          : null,
        audio: audioFilePath || null,
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
        text:
          t("details_ads.message_sent_desc") ||
          "Your message was delivered to the business.",
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
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  const renderAudioRecorderBox = () => (
    <div className="text-center p-5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/60 space-y-3">
      {!isRecording && !audioPreviewUrl && (
        <>
          <button
            type="button"
            onClick={startRecording}
            className="mx-auto w-14 h-14 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
          >
            <Mic size={24} />
          </button>
          <p className="text-sm font-semibold text-gray-800">
            {t("details_ads.tab_to_record")}
          </p>
          <p className="text-xs text-gray-400">
            {t("details_ads.message_audio")}
          </p>
        </>
      )}

      {isRecording && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            Recording {formatTime(recordingTime)}
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="mx-auto w-12 h-12 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
          >
            <Square size={18} fill="white" />
          </button>
          <p className="text-xs text-gray-500">{t("details_ads.stop_record")}</p>
        </div>
      )}

      {!isRecording && audioPreviewUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-semibold">
            {isUploadingAudio ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Play size={15} /> {t("details_ads.ready_send")} •{" "}
                {formatTime(recordingTime)}
              </>
            )}
          </div>
          <audio
            controls
            src={audioPreviewUrl}
            className="w-full h-10 accent-emerald-600"
          />
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={removeAudio}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50"
            >
              <Trash2 size={14} /> {t("details_ads.remove")}
            </button>
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100"
            >
              <Mic size={14} /> {t("details_ads.re_record")}
            </button>
          </div>
          {audioFilePath && !isUploadingAudio && (
            <p className="text-xs text-emerald-600 font-medium">
              {t("details_ads.audio_saved")}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={38} />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("details_ads.profile_not_found") || "Profile not found"}
        </h2>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>{t("details_ads.back_to_search") || "Back"}</span>
          </button>

          <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            {serviceName}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Visual Gallery Block (Inspired by screenshot multi-photo header) */}
        <section className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 h-72 sm:h-88 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={mainImg}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-3">
              {/* Interactive Map Tile */}
              <div
                onClick={() => setIsMapModalOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setIsMapModalOpen(true)}
                className="relative h-36 sm:h-42 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group bg-gray-100"
              >
                <div className="w-full h-full pointer-events-none">
                  <MapComponent center={mapCenter} />
                </div>
                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200/80 text-xs font-semibold text-gray-800 shadow-xs">
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin size={14} className="text-emerald-600 shrink-0" />
                    {cityLabel || "Map"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 shrink-0">
                    Expand <ExternalLink size={12} />
                  </span>
                </div>
              </div>

              {/* Secondary Visual / Audio Preview Card */}
              <div className="h-36 sm:h-42 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col justify-between p-4">
                {extraImages[0] ? (
                  <img
                    src={extraImages[0]}
                    alt={title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <Volume2 size={15} className="text-emerald-600" />
                      <span>Audio Presentation</span>
                    </div>

                    {audioUrl ? (
                      <audio
                        controls
                        preload="metadata"
                        key={audioUrl}
                        className="w-full h-9 accent-emerald-600"
                      >
                        <source src={audioUrl} type="audio/mpeg" />
                        <source src={audioUrl} type="audio/mp3" />
                      </audio>
                    ) : (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {serviceName}
                        {cityLabel ? ` • ${cityLabel}` : ""}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content + Sticky Action Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Summary Header Card */}
            <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/60">
                  {serviceName}
                </span>
                {cityLabel && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                    <MapPin size={13} className="text-gray-500" />
                    {cityLabel}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {title}
              </h1>

              {audioUrl && extraImages[0] && (
                <div className="pt-1">
                  <audio
                    controls
                    preload="metadata"
                    key={audioUrl}
                    className="w-full h-10 accent-emerald-600"
                  >
                    <source src={audioUrl} type="audio/mpeg" />
                    <source src={audioUrl} type="audio/mp3" />
                  </audio>
                </div>
              )}
            </section>

            {/* About Section */}
            <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                {t("details_ads.about") || "About"}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {desc}
              </p>
            </section>
          </div>

          {/* Right / Action Panel (Sticky on Desktop) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {t("details_ads.contact_provider") || "Contact"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {title}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => (window.location.href = `tel:${phoneNumber}`)}
                  className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold transition-colors"
                >
                  {t("details_ads.call")}
                </button>

                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:brightness-95 text-white text-sm font-bold transition-all"
                >
                  {t("details_ads.whatsapp")}
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
                >
                  {t("details_ads.message")}
                </button>

                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Mic size={17} className="text-emerald-600" />
                  <span>{t("details_ads.record_audio")}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* MAP MODAL */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 flex justify-between items-center border-b">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1">
              <MapComponent center={mapCenter} />
            </div>
          </div>
        </div>
      )}

      {/* FULL INQUIRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MessageSquare size={18} />
                </div>
                <h3 className="font-bold text-base text-gray-900">
                  {t("details_ads.inquire_profile")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeAudio();
                  setIsModalOpen(false);
                }}
                className="p-1.5 hover:bg-white rounded-lg text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3.5 focus-within:border-emerald-600">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder={t("details_ads.your_email") || "Your email (optional)"}
                    className="w-full py-2.5 bg-transparent outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3.5 focus-within:border-emerald-600">
                  <Phone size={16} className="text-gray-400" />
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder={t("details_ads.your_phone") || "Your phone (optional)"}
                    className="w-full py-2.5 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {renderAudioRecorderBox()}

              {/* Multilingual Fields -> titleAr, titleFr, textAr, textFr, textEn */}
              <div className="space-y-4">
                <p className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
                  {t("details_ads.titleFr")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">
                      {t("details_ads.titleAr")}
                    </label>
                    <input
                      dir="rtl"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="العنوان بالعربية"
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">
                      {t("details_ads.titleFr")}
                    </label>
                    <input
                      value={titleFr}
                      onChange={(e) => setTitleFr(e.target.value)}
                      placeholder="Titre en français"
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <p className="text-xs font-bold tracking-wider text-emerald-700 uppercase pt-1">
                  Messages — textAr / textFr / textEn
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">
                    {t("details_ads.textAr")}
                  </label>
                  <textarea
                    dir="rtl"
                    rows={3}
                    value={textAr}
                    onChange={(e) => setTextAr(e.target.value)}
                    placeholder="اكتب رسالتك بالعربية..."
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 text-sm bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">
                    {t("details_ads.textFr")}
                  </label>
                  <textarea
                    rows={3}
                    value={textFr}
                    onChange={(e) => setTextFr(e.target.value)}
                    placeholder="Votre message en français..."
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 text-sm bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">
                    {t("details_ads.textEn")}
                  </label>
                  <textarea
                    rows={2}
                    value={textEn}
                    onChange={(e) => setTextEn(e.target.value)}
                    placeholder="Your message in English..."
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 text-sm bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sending || isUploadingAudio}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {sending
                    ? t("details_ads.sending") || "Sending..."
                    : t("details_ads.send_message") || "Send Inquiry"}
                </button>

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  Each field is stored 1:1 →{" "}
                  <code>titleAr, titleFr, textAr, textFr, textEn</code> +{" "}
                  <code>audio</code>
                  <br />
                  You can fill any language or send voice only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK AUDIO RECORD MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Mic size={18} />
                </div>
                <h3 className="font-bold text-base text-gray-900">
                  {t("details_ads.record_audio")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isRecording) removeAudio();
                  setIsRecordModalOpen(false);
                }}
                className="p-1.5 hover:bg-white rounded-lg text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-center">
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  {formatTime(recordingTime)}
                </div>
              )}

              {audioPreviewUrl ? (
                <>
                  <audio
                    controls
                    src={audioPreviewUrl}
                    className="w-full h-10 accent-emerald-600"
                  />
                  {isUploadingAudio ? (
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </p>
                  ) : audioFilePath ? (
                    <p className="text-xs text-emerald-600 font-medium">
                      ✓ Audio saved
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-gray-500">{t("details_ads.subtitle")}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square size={16} fill="white" /> Stop
                    </>
                  ) : (
                    <>
                      <Mic size={16} /> {t("details_ads.record")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!audioFilePath || sending || isUploadingAudio}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}{" "}
                  {t("details_ads.send")}
                </button>
              </div>

              {audioPreviewUrl && (
                <button
                  type="button"
                  onClick={removeAudio}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  <Trash2 size={14} /> {t("details_ads.remove")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP MODAL */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-gray-900">
              {t("details_ads.start_whatsapp_chat")}
            </h3>
            <button
              type="button"
              onClick={() => {
                const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
                const msg = encodeURIComponent(
                  t("details_ads.whatsapp_default_msg") ||
                    "Hello, I found your profile."
                );
                window.open(
                  `https://wa.me/${cleanPhone}?text=${msg}`,
                  "_blank"
                );
                setIsWhatsAppModalOpen(false);
              }}
              className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold hover:brightness-95 transition-all"
            >
              {t("details_ads.continue_to_chat")}
            </button>
            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              {t("details_ads.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}