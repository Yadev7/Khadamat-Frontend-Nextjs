"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2, Plus, Trash2, Globe, FileText,
  Loader2, Music, Video, ArrowLeft,
  Phone, Mail, MapPin, Map, Tag,
  Edit2
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
  const { i18n, t } = useTranslation();

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
      const response = await getBusinesses(1, 50, {}, 'service,flyer,contact.address.localisation,owner,audioAr,audioFr,audioEn,videoAr,videoFr,videoEn');
      const dataArray = response?.data || (Array.isArray(response) ? response : []);
      setBusinesses(dataArray);
    } catch (err: any) {
      console.error("❌ API Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const steps = [
    { step: 1, label: "Service", content: Step1Service },
    { step: 2, label: "Contact", content: Step2Contact },
    { step: 3, label: "Management", content: Step3Manager },
    { step: 4, label: "Media", content: Step4Upload },
    { step: 5, label: "Recap", content: Step5Recap },
  ];

  /**
   * Safe helper to construct complete image URLs
   */
  const resolveFlyerUrl = (flyerRaw?: string | null): string | null => {
    if (!flyerRaw) return null;
    if (flyerRaw.startsWith("http://") || flyerRaw.startsWith("https://")) {
      return flyerRaw;
    }

    // Extract only the raw filename (e.g. "a95e7951544c3af4b48c7.png")
    // Handles backslashes, slashes, and leading path segments safely
    const cleanFilename = flyerRaw
      .replace(/\\/g, "/")
      .split("/")
      .pop();

    if (!cleanFilename) return null;

    // Use absolute backend host or environment variable
    const baseEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000")
      .replace(/\/$/, "")
      .replace(/\/v1$/, ""); // Prevents duplicated /v1 in path

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
      title: 'Edit Business',
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
      confirmButtonText: 'Save Changes',
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
      confirmButtonText: 'Yes, delete it!'
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
    <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen dark:bg-gray-950">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-gray-100">
            {view === "list" ? t('dashboard.business.business_directory') : t('dashboard.business.create_new_business')}
          </h1>
          <p className="text-slate-500 text-sm mt-1 dark:text-gray-400">
            {view === "list"
              ? `${t('dashboard.business.managing')} ${businesses.length} ${t('dashboard.business.records')}`
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

      {view === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
              <Building2 size={48} className="mb-4 text-slate-300 dark:text-gray-600" />
              <p className="text-lg font-medium">No businesses found</p>
              <p className="text-sm">Click "Add New Business" to get started.</p>
            </div>
          ) : (
            businesses.map((business) => {
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

              return (
                <div key={business.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                  {/* Image Banner */}
                  <div className="relative h-40 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {flyerUrl ? (
                      <img
                        src={flyerUrl}
                        alt={business.nameEn || "Business"}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Building2 size={48} className="text-white/60" />
                    )}
                    {(business.service?.nameServEn ||
                      business.service?.nameServFr ||
                      business.service?.nameEn ||
                      business.service?.nameFr) && (
                      <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <Tag size={11} />
                        {business.service?.nameServEn ||
                          business.service?.nameServFr ||
                          business.service?.nameEn ||
                          business.service?.nameFr}
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(business)}
                      className="absolute top-3 right-12 bg-white/20 backdrop-blur-sm hover:bg-indigo-500 text-white p-2 rounded-full transition-colors"
                      title="Edit Business"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                      title="Delete Business"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col grow">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-1 dark:text-gray-100" title={business.nameEn || business.nameFr || business.nameAr}>
                      {business.nameEn || business.nameFr || business.nameAr || "Unnamed Business"}
                    </h3>

                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 dark:text-gray-400">
                      {business.descrEn || business.descrFr || business.descrAr || "No description provided."}
                    </p>

                    {(phone || email) && (
                      <div className="space-y-1.5 mb-4">
                        {phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
                            <Phone size={13} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{phone}</span>
                          </div>
                        )}
                        {email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
                            <Mail size={13} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {(fullAddress || city || cityZone) && (
                      <div className="border-t border-slate-50 pt-3 mt-auto space-y-1.5 dark:border-gray-800">
                        {fullAddress && (
                          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-gray-300">
                            <MapPin size={13} className="text-rose-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{fullAddress}</span>
                          </div>
                        )}
                        {(city || cityZone) && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Map size={13} className="text-rose-400 shrink-0" />
                            {city && (
                              <span className="bg-rose-50 text-rose-600 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-rose-950 dark:text-rose-400">
                                {city}
                              </span>
                            )}
                            {cityZone && (
                              <span className="bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-orange-950 dark:text-orange-400">
                                {cityZone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {(business.businessUrlSite || business.audioEn || business.audioFr || business.audioAr || business.videoEn || business.videoFr || business.videoAr) && (
                      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-50 dark:border-gray-800">
                        {business.businessUrlSite && (
                          <a href={business.businessUrlSite} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors dark:bg-gray-800 dark:hover:text-indigo-400 dark:hover:bg-indigo-950" title="Website">
                            <Globe size={14} />
                          </a>
                        )}
                        {(business.audioEn || business.audioFr || business.audioAr) && (
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-gray-800" title="Has Audio">
                            <Music size={14} />
                          </div>
                        )}
                        {(business.videoEn || business.videoFr || business.videoAr) && (
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-gray-800" title="Has Video">
                            <Video size={14} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
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