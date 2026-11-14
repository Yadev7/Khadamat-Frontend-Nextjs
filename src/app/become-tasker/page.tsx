"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, Wrench, Send, CheckCircle, AlertCircle, Loader2, Mic, Square, Trash2, Play, Upload, Building2, PenTool } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { createMessage } from "@/api/messages-api";
import { getServices } from "@/api/services-api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";

const MySwal = withReactContent(Swal);

export default function BecomeTaskerPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    serviceId: "",
    customService: "",
  });

  const [requestType, setRequestType] = useState<"registration" | "other">("registration");
  const [services, setServices] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ---- Audio states ----
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const langSuffix = currentLang.charAt(0).toUpperCase() + currentLang.slice(1); // En, Fr, Ar

  // Fetch services on mount
  useEffect(() => {
    const fetchServicesList = async () => {
      try {
        const data = await getServices({});
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur lors du chargement des services :", error);
      }
    };
    fetchServicesList();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
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
      const uploadFormData = new FormData();
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : blob.type.includes("mpeg") ? "mp3" : "webm";
      const file = new File([blob], `become-tasker-${Date.now()}.${ext}`, { type: blob.type || "audio/webm" });
      uploadFormData.append("file", file);

      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.post(`${baseEndpoint}/v1/files/upload`, uploadFormData, { headers });

      const fileObj = (res.data as any)?.file || (res.data as any)?.data?.file || res.data;
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
      console.error("Upload audio error:", err);
      Swal.fire(t("become_tasker_page.alert.error_title", "Upload failed"), err?.response?.data?.message || err?.message, "error");
      setAudioFilePath(null);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      Swal.fire("Invalid file", "Please select an audio file.", "warning");
      return;
    }
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioPreviewUrl(url);
    setRecordingTime(0);
    await uploadAudioBlob(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
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

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const mr = new MediaRecorder(stream, { mimeType } as any);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        cleanupRecording();
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size === 0) return;
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        await uploadAudioBlob(blob);
      };

      mr.start(100);
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err: any) {
      console.error("Mic permission error:", err);
      Swal.fire("Microphone access denied", err?.message || "Please allow microphone permission and try again.", "error");
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

  const removeAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setAudioBlob(null);
    setAudioFilePath(null);
    setRecordingTime(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name || e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingAudio) {
      Swal.fire(t("become_tasker_page.alert.error_title", "Please wait"), t("become_tasker_page.audio.uploading", "Audio is still uploading..."), "info");
      return;
    }
    setIsSubmitting(true);
    setAlert(null);

    try {
      const payload: Record<string, any> = {
        titleEn: formData.name,
        titleFr: formData.name,
        titleAr: formData.name,
        textEn: formData.skills,
        textFr: formData.skills,
        textAr: formData.skills,
        emailContact: formData.email,
        phoneContact: formData.phone,
        audio: audioFilePath || null,
        requestType: requestType,
        serviceId: requestType === "registration" ? formData.serviceId : null,
        customService: requestType === "registration" && formData.serviceId === "custom" ? formData.customService : null,
      };

      await createMessage(payload);

      const successTitle = t("become_tasker_page.alert.success_title", "Application Sent!");
      const successMsg = t(
        "become_tasker_page.alert.success_message",
        "Your application has been saved and sent successfully. We will contact you soon."
      );

      setAlert({ type: "success", message: successMsg });

      MySwal.fire({
        icon: "success",
        title: successTitle,
        text: successMsg,
        confirmButtonColor: "#2563eb",
        timer: 4000,
        showConfirmButton: true,
      });

      setFormData({ name: "", email: "", phone: "", skills: "", serviceId: "", customService: "" });
      removeAudio();

      setTimeout(() => setAlert(null), 6000);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        t("become_tasker_page.alert.error_message", "Failed to send your application. Please try again.");

      setAlert({ type: "error", message: Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg });

      MySwal.fire({
        icon: "error",
        title: t("become_tasker_page.alert.error_title", "Submission Failed"),
        text: Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = `
    w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl 
    outline-none transition-all duration-300 text-sm
    focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 
    focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] focus:-translate-y-0.5
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row animate-slide-up border border-white/20">

        <div className="hidden md:flex md:w-2/5 relative overflow-hidden flex-col justify-between text-white p-12">
          <Image
            src="/become_tasker.png"
            alt="Service provider working"
            fill
            priority
            className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-linear-to-b from-blue-600/40 via-blue-900/60 to-gray-950/90" />
        </div>

        <div className="w-full md:w-3/5 p-8 sm:p-12 md:p-16">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {t('become_tasker_page.title')}
            </h1>
            <p className="text-gray-500 mt-3 text-sm sm:text-base font-medium">
              {t('become_tasker_page.description')}
            </p>
          </header>

          {alert && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-2xl px-5 py-4 border text-sm font-medium animate-slide-up ${
                alert.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
              role="alert"
            >
              {alert.type === "success" ? (
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              )}
              <span className="flex-1 leading-relaxed">{alert.message}</span>
              <button
                onClick={() => setAlert(null)}
                className="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity font-bold"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                  {t('become_tasker_page.form.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    className={inputClasses}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('become_tasker_page.form.name_placeholder')}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                  {t('become_tasker_page.form.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    className={inputClasses}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('become_tasker_page.form.email_placeholder')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                {t('become_tasker_page.form.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  disabled={isSubmitting}
                  className={inputClasses}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('become_tasker_page.form.phone_placeholder')}
                />
              </div>
            </div>

            {/* BOUTONS RADIO : TYPE DE DEMANDE */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('contact.placeholder.type')} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="requestType"
                    value="registration"
                    checked={requestType === 'registration'}
                    onChange={() => setRequestType('registration')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                  />
                  <span>{t('contact.placeholder.demande_inscription')}</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="requestType"
                    value="other"
                    checked={requestType === 'other'}
                    onChange={() => setRequestType('other')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                  />
                  <span>{t('contact.placeholder.autre')}</span>
                </label>
              </div>
            </div>

            {/* SELECTION DU SERVICE (Affiché uniquement si Demande d'inscription est sélectionné) */}
            {requestType === 'registration' && (
              <div className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600 flex items-center gap-1">
                    <Building2 size={12} /> {t("dashboard.business.step1.service_type", "Service Type")}
                  </label>
                  <div className="relative">
                    <select
                      id="serviceId"
                      name="serviceId"
                      disabled={isSubmitting}
                      required={requestType === 'registration'}
                      className={`${inputClasses} appearance-none cursor-pointer`}
                      value={formData.serviceId}
                      onChange={handleChange}
                    >
                      <option value="">{t("dashboard.business.step1.select_service", "Select a service")}</option>
                      {services.map((s: any) => {
                        const serviceName = s[`nameServ${langSuffix}`] || s.nameServEn || s.nameServAr || s.nameServFr || "Service";
                        return (
                          <option key={s.id} value={s.id}>
                            {serviceName}
                          </option>
                        );
                      })}
                      <option value="custom">{t("contact.placeholder.other_service", "Other service")}</option>
                    </select>
                  </div>
                </div>

                {/* Champ de saisie personnalisée si 'Autre' est sélectionné */}
                {formData.serviceId === 'custom' && (
                  <div className="group animate-fadeIn">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1">
                      <PenTool size={12} /> {t("contact.placeholder.placeholder_service", "Specify service")}
                    </label>
                    <input
                      type="text"
                      name="customService"
                      required={formData.serviceId === 'custom'}
                      value={formData.customService}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder={t("contact.placeholder.placeholder_service", "Specify your service")}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                {t('become_tasker_page.form.skills')}
              </label>
              <div className="relative">
                <Wrench className="absolute left-3.5 top-4 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  id="skills"
                  name="skills"
                  required
                  disabled={isSubmitting}
                  className={`${inputClasses} min-h-140px pt-4 resize-none`}
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder={t('become_tasker_page.form.skills_placeholder')}
                ></textarea>
              </div>
            </div>

            {/* Audio - optional voice introduction */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mic className="w-3.5 h-3.5" />
                {t('become_tasker_page.form.audio', 'Voice Introduction (optional)')}
              </label>
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-5 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />

                {!isRecording && !audioPreviewUrl && (
                  <div className="text-center space-y-3">
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={isSubmitting || isUploadingAudio}
                        className="w-14 h-14 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                        title={t('become_tasker_page.audio.record', 'Record')}
                      >
                        <Mic size={24} />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting || isUploadingAudio}
                        className="w-14 h-14 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title={t('become_tasker_page.audio.upload', 'Upload audio file')}
                      >
                        <Upload size={22} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">{t('become_tasker_page.audio.tap_to_record', 'Tap to record or upload voice')}</p>
                    <p className="text-xs text-gray-400">{t('become_tasker_page.audio.hint', 'Saved to message.audio column • mp3 / webm / ogg • max 100 MB')}</p>
                  </div>
                )}

                {isRecording && (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      {t('become_tasker_page.audio.recording', 'Recording')} {formatTime(recordingTime)}
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="mx-auto w-14 h-14 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                    >
                      <Square size={18} fill="white" />
                    </button>
                    <p className="text-xs text-gray-500">{t('become_tasker_page.audio.tap_stop', 'Tap stop when finished')}</p>
                  </div>
                )}

                {!isRecording && audioPreviewUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                      {isUploadingAudio ? (
                        <span className="flex items-center gap-2 text-amber-600"><Loader2 size={16} className="animate-spin" /> {t('become_tasker_page.audio.uploading', 'Uploading...')}</span>
                      ) : audioFilePath ? (
                        <span className="flex items-center gap-1.5 text-green-600"><CheckCircle size={16} /> {t('become_tasker_page.audio.ready', 'Ready to send')} {formatTime(recordingTime)}</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-gray-600"><Play size={16} /> {formatTime(recordingTime)}</span>
                      )}
                    </div>
                    <audio controls src={audioPreviewUrl} className="w-full h-10 accent-blue-600" />
                    <div className="flex gap-2 justify-center">
                      <button type="button" onClick={removeAudio} className="flex items-center gap-1.5 px-4 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50">
                        <Trash2 size={16} /> {t('become_tasker_page.audio.remove', 'Remove')}
                      </button>
                      <button type="button" onClick={startRecording} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100">
                        <Mic size={16} /> {t('become_tasker_page.audio.rerecord', 'Re-record')}
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100">
                        <Upload size={16} /> {t('become_tasker_page.audio.change_file', 'Change file')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploadingAudio}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] hover:shadow-blue-500/50 mt-4 cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-lg">{t("become_tasker_page.sending", "Sending...")}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="text-lg">{t("become_tasker_page.submit")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slow-zoom {
          animation: slowZoom 30s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}