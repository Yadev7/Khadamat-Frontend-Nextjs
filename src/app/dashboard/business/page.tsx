"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2, Plus, Trash2, Globe, FileText,
  Loader2, Music, Video, ArrowLeft,
  Phone, Mail, MapPin, Map, Tag,
  Edit2, ChevronLeft, ChevronRight
} from "lucide-react";
import { getBusinesses, deleteBusiness, createBusiness, uploadFile, updateBusiness, api } from "@/api/businesses-api";
import { createMember } from "@/api/members-api";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Import your Stepper Components
import Stepper from "@/components/Stepper";
import { Step1Service } from "./add/steps/Step1Service";
import { Step2Contact } from "./add/steps/Step2Contact";
import { Step3Manager } from "./add/steps/Step3Manager";
import { Step4Upload } from "./add/steps/Step4Upload";
import { Step5Recap } from "./add/steps/Step5Recap";

import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSchema } from "./add/schema";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "add">("list");
  
  // --- Pagination & Search States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { i18n, t } = useTranslation();
  const currentLang = i18n.language ? i18n.language.toLowerCase() : "fr";
  const isRtl = currentLang === "ar";

  const methods = useForm({
    resolver: zodResolver(BusinessSchema),
    mode: "onChange",
    defaultValues: {
      managementType: "ownerId",
      nameEn: "", nameFr: "", nameAr: "",
      descrEn: "", descrFr: "", descrAr: "",
      serviceId: "", ownerId: "",
    }
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBusinesses(1, 100, {}, 'service,flyer,contact.address.localisation,owner,audioAr,audioFr,audioEn,videoAr,videoFr,videoEn');
      const dataArray = response?.data || (Array.isArray(response) ? response : []);
      setBusinesses(dataArray);
    } catch (err: any) {
      console.error("❌ API Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Filter & Pagination Calculations ---
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase();
    return businesses.filter((b) =>
      (b.nameEn && b.nameEn.toLowerCase().includes(q)) ||
      (b.nameFr && b.nameFr.toLowerCase().includes(q)) ||
      (b.nameAr && b.nameAr.toLowerCase().includes(q)) ||
      (b.descrEn && b.descrEn.toLowerCase().includes(q)) ||
      (b.descrFr && b.descrFr.toLowerCase().includes(q)) ||
      (b.descrAr && b.descrAr.toLowerCase().includes(q))
    );
  }, [businesses, searchQuery]);

  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [filteredBusinesses.length, totalPages, currentPage]);

  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBusinesses.slice(start, start + itemsPerPage);
  }, [filteredBusinesses, currentPage, itemsPerPage]);

  const steps = [
    { step: 1, label: t("dashboard.business.step1.service"), content: Step1Service },
    { step: 2, label: t("dashboard.business.step1.contact"), content: Step2Contact },
    { step: 3, label: t("dashboard.business.step1.management"), content: Step3Manager },
    { step: 4, label: t("dashboard.business.step1.media"), content: Step4Upload },
    { step: 5, label: t("dashboard.business.step1.recap"), content: Step5Recap },
  ];

  const resolveFlyerUrl = (flyerRaw?: string | null): string | null => {
    if (!flyerRaw) return null;
    if (flyerRaw.startsWith("http://") || flyerRaw.startsWith("https://")) {
      return flyerRaw;
    }
    const cleanFilename = flyerRaw
      .replace(/\\/g, "/")
      .split("/")
      .pop();
    if (!cleanFilename) return null;
    const baseEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000")
      .replace(/\/$/, "")
      .replace(/\/v1$/, "");
    return `${baseEndpoint}/v1/files/${cleanFilename}`;
  };

  const handleFinalSubmit = async (data: any) => {
    const MySwal = withReactContent(Swal);
    try {
      MySwal.fire({
        title: 'جاري الحفظ...',
        text: 'يتم الآن معالجة البيانات ورفع الملفات، يرجى الانتظار.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const upload = async (fileList: any) => {
        if (fileList && fileList.length > 0) {
          const res = await uploadFile(fileList[0]);
          const finalId = res?.id || res?.data?.id || res?.file?.id;
          return finalId ? { id: String(finalId) } : null;
        }
        return null;
      };

      const flyerData = await upload(data.flyer);
      const audioArData = await upload(data.audioAr);
      const audioEnData = await upload(data.audioEn);
      const audioFrData = await upload(data.audioFr);
      const videoArData = await upload(data.videoAr);
      const videoEnData = await upload(data.videoEn);
      const videoFrData = await upload(data.videoFr);

      let localisationPayload = null;
      if (data.manualLatitude && data.manualLongitude) {
        localisationPayload = {
          latitude: parseFloat(data.manualLatitude),
          longitude: parseFloat(data.manualLongitude)
        };
      }

      const payload = {
        nameFr: data.nameFr,
        nameAr: data.nameAr,
        nameEn: data.nameEn || "",
        descrFr: data.descrFr || "",
        descrAr: data.descrAr || "",
        descrEn: data.descrEn || "",
        businessUrlSite: data.siteUrl || "",
        socialMedia: data.socialMedia || "",
        service: data.serviceId ? { id: data.serviceId } : null,
        owner: { id: data.ownerId },
        contact: { id: data.contactId },
        manager: { id: data.ownerId }, 
        localisation: localisationPayload,
        flyer: flyerData,
        audioAr: audioArData,
        audioEn: audioEnData,
        audioFr: audioFrData,
        videoAr: videoArData,
        videoEn: videoEnData,
        videoFr: videoFrData,
      };

      if (!payload.flyer) {
        throw new Error("يجب اختيار صورة (Flyer) للنشاط التجاري.");
      }

      await createBusiness(payload as any);

      await MySwal.fire({
        icon: 'success',
        title: 'تم بنجاح!',
        text: 'تم إضافة النشاط التجاري وحفظ موقعه الجغرافي الجديد.',
        timer: 2000,
        showConfirmButton: false
      });

      methods.reset();
      fetchData();
      setView("list");
    } catch (error: any) {
      console.error("❌ Submission Error:", error);
      const msg = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
      MySwal.fire({
        icon: 'error',
        title: 'فشلت العملية',
        text: Array.isArray(msg) ? msg.join(', ') : msg
      });
    }
  };

  const handleEdit = async (business: any) => {
    const MySwal = withReactContent(Swal);
    const { value: formValues } = await MySwal.fire({
      title: t("dashboard.business.edit_business_title"),
      html: `
        <div style="text-align:left;display:flex;flex-direction:column;gap:10px;">
          <label style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Name (EN)</label>
          <input id="swal-nameEn" class="swal2-input" style="margin:0" placeholder="Name in English" value="${business.nameEn || ''}">
          <label style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Name (FR)</label>
          <input id="swal-nameFr" class="swal2-input" style="margin:0" placeholder="Nom en Français" value="${business.nameFr || ''}">
          <label style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Name (AR)</label>
          <input id="swal-nameAr" class="swal2-input" style="margin:0;direction:rtl" placeholder="الاسم بالعربية" value="${business.nameAr || ''}">
          <label style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Description (EN)</label>
          <textarea id="swal-descrEn" class="swal2-textarea" style="margin:0;height:80px" placeholder="Description in English">${business.descrEn || ''}</textarea>
          <label style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Description (FR)</label>
          <textarea id="swal-descrFr" class="swal2-textarea" style="margin:0;height:80px" placeholder="Description en Français">${business.descrFr || ''}</textarea>
          <label style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Description (AR)</label>
          <textarea id="swal-descrAr" class="swal2-textarea" style="margin:0;height:80px;direction:rtl" placeholder="الوصف بالعربية">${business.descrAr || ''}</textarea>
          <label style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Website URL</label>
          <input id="swal-url" class="swal2-input" style="margin:0" placeholder="https://..." value="${business.businessUrlSite || ''}">
        </div>
      `,
      width: 560,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#94a3b8',
      cancelButtonText: t('dashboard.business.cancel_button_text'),
      confirmButtonText: t('dashboard.business.confirm_update'),
      preConfirm: () => ({
        nameEn: (document.getElementById('swal-nameEn') as HTMLInputElement)?.value,
        nameFr: (document.getElementById('swal-nameFr') as HTMLInputElement)?.value,
        nameAr: (document.getElementById('swal-nameAr') as HTMLInputElement)?.value,
        descrEn: (document.getElementById('swal-descrEn') as HTMLTextAreaElement)?.value,
        descrFr: (document.getElementById('swal-descrFr') as HTMLTextAreaElement)?.value,
        descrAr: (document.getElementById('swal-descrAr') as HTMLTextAreaElement)?.value,
        businessUrlSite: (document.getElementById('swal-url') as HTMLInputElement)?.value,
      }),
    });

    if (!formValues) return;

    try {
      await updateBusiness(business.id, formValues);
      await MySwal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Business has been updated successfully.',
        timer: 1800,
        showConfirmButton: false,
      });
      fetchData();
    } catch (error: any) {
      console.error('Update Error:', error);
      MySwal.fire('Error', error.response?.data?.message || 'Failed to update business.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const MySwal = withReactContent(Swal);
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      cancelButtonText: t('dashboard.business.cancel_button_text'),
      confirmButtonText: t('')
    });

    if (result.isConfirmed) {
      try {
        await deleteBusiness(id);
        MySwal.fire('Deleted!', 'The business has been deleted.', 'success');
        fetchData();
      } catch (error) {
        console.error("Delete Error:", error);
        MySwal.fire('Error', 'Failed to delete business.', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 dark:bg-gray-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-500 font-medium dark:text-gray-400">Loading database...</p>
    </div>
  );

  return (
    <div className={`p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen dark:bg-gray-950 ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-gray-100">
            {view === "list" ? t('dashboard.business.business_directory') : t('dashboard.business.create_new_business')}
          </h1>
          <p className="text-slate-500 text-sm mt-1 dark:text-gray-400">
            {view === "list"
              ? `${t('dashboard.business.managing')} ${filteredBusinesses.length} ${t('dashboard.business.records')}`
              : "Complete the 5 steps to add a new entry to the database"}
          </p>
        </div>
         <button
          onClick={() => setView(view === "list" ? "add" : "list")}
          className={`${view === "list" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
            } px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-sm`}
        >
          {view === "list" ? (
            <><Plus size={20} /> {t('dashboard.business.add_business')}  </>
          ) : (
            <><ArrowLeft size={20} /> {t('dashboard.business.back_to_directory')}</>
          )}
        </button>
      </div>

      {view === "list" && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
        </div>
      )}

      {view === "list" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {paginatedBusinesses.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
                <Building2 size={40} className="mb-3 text-slate-300 dark:text-gray-600" />
                <p className="text-base font-medium">No businesses found</p>
                <p className="text-xs">Click &quot;Add New Business&quot; to get started.</p>
              </div>
            ) : (
              paginatedBusinesses.map((business) => {
                // --- Dynamic Language Resolution for Name & Description ---
                const displayName = 
                  currentLang === "ar" ? (business.nameAr || business.nameFr || business.nameEn) :
                  currentLang === "en" ? (business.nameEn || business.nameFr || business.nameAr) :
                  (business.nameFr || business.nameEn || business.nameAr);

                const displayDescription = 
                  currentLang === "ar" ? (business.descrAr || business.descrFr || business.descrEn) :
                  currentLang === "en" ? (business.descrEn || business.descrFr || business.descrAr) :
                  (business.descrFr || business.descrEn || business.descrAr);

                const contact = business.contact;
                const address = contact?.address;
                const localisation = address?.localisation;
                const city = localisation?.city || localisation?.cityName;
                const cityZone = localisation?.zone || localisation?.zoneName || localisation?.areaZone?.nameEn || localisation?.areaZone?.nameFr;
                const fullAddress = address?.street || address?.addressLine || address?.fullAddress;
                const phone = contact?.phoneCell || contact?.phone;
                const email = contact?.email;

                const flyerRaw = business.flyer?.path || business.flyer?.url;
                const flyerUrl = resolveFlyerUrl(flyerRaw);

                const serviceName = 
                  currentLang === "ar" ? (business.service?.nameServAr || business.service?.nameServFr || business.service?.nameServEn || business.service?.nameEn || business.service?.nameFr) :
                  currentLang === "en" ? (business.service?.nameServEn || business.service?.nameServFr || business.service?.nameServAr || business.service?.nameEn || business.service?.nameFr) :
                  (business.service?.nameServFr || business.service?.nameServEn || business.service?.nameServAr || business.service?.nameEn || business.service?.nameFr);

                return (
                  <div key={business.id} className="bg-white rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden dark:bg-gray-900 dark:border-gray-800 text-xs">
                    {/* Image Banner - Compact Size */}
                    <div className="relative h-28 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
                      {flyerUrl ? (
                        <img
                          src={flyerUrl}
                          alt={displayName || "Business"}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Building2 size={32} className="text-white/60" />
                      )}
                      {serviceName && (
                        <span className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag size={9} />
                          {serviceName}
                        </span>
                      )}
                      <button
                        onClick={() => handleEdit(business)}
                        className="absolute top-2 right-9 bg-white/20 backdrop-blur-sm hover:bg-indigo-500 text-white p-1.5 rounded-full transition-colors"
                        title="Edit Business"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(business.id)}
                        className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                        title="Delete Business"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Card Body - Compact */}
                    <div className="p-3 flex flex-col grow justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 line-clamp-1 mb-1 text-sm dark:text-gray-100" title={displayName}>
                          {displayName || "Unnamed Business"}
                        </h3>

                        <p className="text-slate-500 line-clamp-2 mb-2 text-[11px] dark:text-gray-400">
                          {displayDescription || "No description provided."}
                        </p>

                        {(phone || email) && (
                          <div className="space-y-1 mb-2">
                            {phone && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-300">
                                <Phone size={11} className="text-indigo-400 shrink-0" />
                                <span className="truncate">{phone}</span>
                              </div>
                            )}
                            {email && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-300">
                                <Mail size={11} className="text-indigo-400 shrink-0" />
                                <span className="truncate">{email}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        {(fullAddress || city || cityZone) && (
                          <div className="border-t border-slate-50 pt-2 space-y-1 dark:border-gray-800">
                            {fullAddress && (
                              <div className="flex items-start gap-1.5 text-slate-600 dark:text-gray-300">
                                <MapPin size={11} className="text-rose-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{fullAddress}</span>
                              </div>
                            )}
                            {(city || cityZone) && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {city && (
                                  <span className="bg-rose-50 text-rose-600 text-[10px] font-medium px-2 py-0.2 rounded-full dark:bg-rose-950 dark:text-rose-400">
                                    {city}
                                  </span>
                                )}
                                {cityZone && (
                                  <span className="bg-orange-50 text-orange-600 text-[10px] font-medium px-2 py-0.2 rounded-full dark:bg-orange-950 dark:text-orange-400">
                                    {cityZone}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {(business.businessUrlSite || business.audioEn || business.audioFr || business.audioAr || business.videoEn || business.videoFr || business.videoAr) && (
                          <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-50 dark:border-gray-800">
                            {business.businessUrlSite && (
                              <a href={business.businessUrlSite} target="_blank" rel="noreferrer" className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors dark:bg-gray-800 dark:hover:text-indigo-400 dark:hover:bg-indigo-950" title="Website">
                                <Globe size={11} />
                              </a>
                            )}
                            {(business.audioEn || business.audioFr || business.audioAr) && (
                              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-gray-800" title="Has Audio">
                                <Music size={11} />
                              </div>
                            )}
                            {(business.videoEn || business.videoFr || business.videoAr) && (
                              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-gray-800" title="Has Video">
                                <Video size={11} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* --- PAGINATION CONTROLS --- */}
          {filteredBusinesses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-xs dark:bg-gray-900 dark:border-gray-800 mt-6 gap-4">
              <div className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBusinesses.length)} - {Math.min(currentPage * itemsPerPage, filteredBusinesses.length)} of {filteredBusinesses.length} records
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1 overflow-x-auto px-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center shadow-xs ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-indigo-500/25 scale-105'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span>Next</span>
                    {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-4 sm:p-8 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 dark:bg-gray-900 dark:border-gray-800">
          <FormProvider {...methods}>
            <Stepper
              steps={steps}
              onSubmit={async () => methods.handleSubmit(handleFinalSubmit)()}
            />
          </FormProvider>
        </div>
      )}
    </div>
  );
}