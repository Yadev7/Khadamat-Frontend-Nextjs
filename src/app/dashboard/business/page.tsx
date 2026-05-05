"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2, Plus, Trash2, Globe, FileText,
  Loader2, Music, Video, ArrowLeft,
  Phone, Mail, MapPin, Map, Tag,
  Edit2
} from "lucide-react";
import { getBusinesses, deleteBusiness, createBusiness, uploadFile, updateBusiness } from "@/api/businesses-api";
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
  const [view, setView] = useState<"list" | "add">("list"); // View Toggle
  const { i18n, t } = useTranslation();

  const methods = useForm({
    resolver: zodResolver(BusinessSchema), // <--- CRITICAL
    mode: "onChange",                      // <--- Optional: validates as they type
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


  // AddBusinessPage.tsx (الجزء المتعلق بالرفع والـ Payload)

const handleFinalSubmit = async (data: any) => {
    const MySwal = withReactContent(Swal);
    try {
        MySwal.fire({
            title: 'Saving...',
            text: 'Processing files...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // دالة الرفع المحسنة
        const upload = async (fileList: any) => {
            if (fileList && fileList.length > 0) {
                const res = await uploadFile(fileList[0]);
                // استخراج الـ ID مهما كان هيكل الرد (res.id أو res.file.id)
                const finalId = res?.id || res?.data?.id || res?.file?.id;
                
                if (!finalId) throw new Error("Failed to get file ID from server");
                
                return { id: String(finalId) }; // نرجعه ككائن يحتوي على ID نصي
            }
            return null;
        };

        // رفع كافة الملفات
        const flyerData = await upload(data.flyer);
        const audioArData = await upload(data.audioAr);
        const audioEnData = await upload(data.audioEn);
        const audioFrData = await upload(data.audioFr);
        const videoArData = await upload(data.videoAr);
        const videoEnData = await upload(data.videoEn);
        const videoFrData = await upload(data.videoFr);

        // صياغة الـ Payload النهائي بدقة
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
            manager: { id: data.ownerId }, // تبسيط حالياً

            // إرسال الكائنات المعرفة فقط
            flyer: flyerData, // سيكون { id: "..." }
            audioAr: audioArData,
            audioEn: audioEnData,
            audioFr: audioFrData,
            videoAr: videoArData,
            videoEn: videoEnData,
            videoFr: videoFrData,
        };

        // التأكد من الحقول الإجبارية قبل الإرسال
        if (!payload.flyer) {
            throw new Error("Flyer is required");
        }

        await createBusiness(payload as any);

        MySwal.fire({ icon: 'success', title: 'Done!', timer: 2000, showConfirmButton: false });
        methods.reset();

    } catch (error: any) {
        console.error("API Error:", error);
        MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || error.response?.data?.message || "Submission failed"
        });
    }
};

  // const handleFinalSubmit = async (data: any) => {
  //   const MySwal = withReactContent(Swal);

  //   try {
  //     // 1. Show Loading
  //     MySwal.fire({
  //       title: 'Saving...',
  //       text: 'Uploading media files and preparing payload',
  //       allowOutsideClick: false,
  //       didOpen: () => { Swal.showLoading(); }
  //     });

  //     // Helper to upload a file from FileList
  //     const upload = async (fileList: any) => {
  //       if (fileList && fileList.length > 0) {
  //         const res = await uploadFile(fileList[0]);
  //         return { id: res.id || res.data?.id };
  //       }
  //       return null;
  //     };

  //     const flyerId = await upload(data.flyer);
  //     const audioArId = await upload(data.audioAr);
  //     const audioEnId = await upload(data.audioEn);
  //     const audioFrId = await upload(data.audioFr);
  //     const videoArId = await upload(data.videoAr);
  //     const videoEnId = await upload(data.videoEn);
  //     const videoFrId = await upload(data.videoFr);

  //     let managerId = data.ownerId;
  //     if (data.managementType === "newManagedId") {
  //       const memberPayload = {
  //         typeMember: 'INDIVIDUAL',
  //         user: { email: data.newManagerEmail },
  //         contact: {
  //           firstName: data.newManagerFirstName,
  //           lastName: data.newManagerLastName,
  //           firstNameAr: data.newManagerFirstNameAr,
  //           lastNameAr: data.newManagerLastNameAr,
  //           email: data.newManagerEmail,
  //           phoneCell: String(data.newManagerPhone),
  //         }
  //       };
  //       const newMemberRes = await createMember(memberPayload);
  //       managerId = newMemberRes.id || newMemberRes.data?.id;
  //     }

  //     // 2. Format Payload
  //     const payload = {
  //       nameFr: data.nameFr,
  //       nameAr: data.nameAr,
  //       nameEn: data.nameEn,
  //       descrFr: data.descrFr,
  //       descrAr: data.descrAr,
  //       descrEn: data.descrEn,
  //       businessUrlSite: data.siteUrl || data.businessUrlSite || "",
  //       socialMedia: data.socialMedia || "",

  //       // Relations (Ensuring objects with IDs)
  //       service: data.serviceId ? { id: data.serviceId } : null,
  //       owner: { id: data.ownerId },
  //       contact: { id: data.contactId },

  //       manager: { id: managerId },

  //       flyer: flyerId,
  //       audioAr: audioArId,
  //       audioEn: audioEnId,
  //       audioFr: audioFrId,
  //       videoAr: videoArId,
  //       videoEn: videoEnId,
  //       videoFr: videoFrId,
  //     };

  //     // 3. Client-side Validation Check
  //     if (!payload.contact.id || !payload.owner.id) {
  //       MySwal.fire({
  //         icon: 'warning',
  //         title: 'Missing Selection',
  //         text: 'Please ensure you selected a Contact and an Owner.'
  //       });
  //       return;
  //     }

  //     // 4. API Call
  //     await createBusiness(payload as any);

  //     // 5. Success UI
  //     await MySwal.fire({
  //       icon: 'success',
  //       title: 'Created!',
  //       text: 'Business added successfully with media files.',
  //       timer: 2000,
  //       showConfirmButton: false
  //     });

  //     // 6. Cleanup
  //     methods.reset(); // Clear the form
  //     setView("list");
  //     fetchData(); // Refresh list

  //   } catch (error: any) {
  //     console.error("API Error:", error);
  //     const errorMessage = error.response?.data?.message || "An unexpected error occurred.";

  //     MySwal.fire({
  //       icon: 'error',
  //       title: 'Database Error',
  //       text: errorMessage
  //     });
  //   }
  // };

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
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-500 font-medium">Loading database...</p>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header logic changes based on view */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {view === "list" ? t('dashboard.business.business_directory') : t('dashboard.business.create_new_business')}
          </h1>
          <p className="text-slate-500 text-sm">
            {view === "list"
              ? `${t('dashboard.business.managing')} ${businesses.length} ${t('dashboard.business.records')}`
              : "Complete the 5 steps to add a new entry to the database"}
          </p>
        </div>
        <button
          onClick={() => setView(view === "list" ? "add" : "list")}
          className={`${view === "list" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            } px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-sm`}
        >
          {view === "list" ? (
            <><Plus size={20} /> {t('dashboard.business.add_business')}  </>
          ) : (
            <><ArrowLeft size={20} /> {t('dashboard.business.back_to_directory')}</>
          )}
        </button>
      </div>

      {view === "list" ? (
        /* GRID LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed">
              <Building2 size={48} className="mb-4 text-slate-300" />
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
              const flyerUrl = business.flyer?.url || business.flyer?.path;

              return (
                <div key={business.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden">
                  {/* Image Banner */}
                  <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
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
                    {/* Service badge */}
                    {(business.service?.nameEn || business.service?.nameFr) && (
                      <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <Tag size={11} />
                        {business.service?.nameEn || business.service?.nameFr}
                      </span>
                    )}
                    {/* Edit button */}
                    <button
                      onClick={() => handleEdit(business)}
                      className="absolute top-3 right-12 bg-white/20 backdrop-blur-sm hover:bg-indigo-500 text-white p-2 rounded-full transition-colors"
                      title="Edit Business"
                    >
                      <Edit2 size={14} />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                      title="Delete Business"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Name */}
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-1" title={business.nameEn || business.nameFr || business.nameAr}>
                      {business.nameEn || business.nameFr || business.nameAr || "Unnamed Business"}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                      {business.descrEn || business.descrFr || business.descrAr || "No description provided."}
                    </p>

                    {/* Contact Info */}
                    {(phone || email) && (
                      <div className="space-y-1.5 mb-4">
                        {phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={13} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{phone}</span>
                          </div>
                        )}
                        {email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={13} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Location */}
                    {(fullAddress || city || cityZone) && (
                      <div className="border-t border-slate-50 pt-3 mt-auto space-y-1.5">
                        {fullAddress && (
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin size={13} className="text-rose-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{fullAddress}</span>
                          </div>
                        )}
                        {(city || cityZone) && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Map size={13} className="text-rose-400 shrink-0" />
                            {city && (
                              <span className="bg-rose-50 text-rose-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {city}
                              </span>
                            )}
                            {cityZone && (
                              <span className="bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {cityZone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Media & Website Footer */}
                    {(business.businessUrlSite || business.audioEn || business.audioFr || business.audioAr || business.videoEn || business.videoFr || business.videoAr) && (
                      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-50">
                        {business.businessUrlSite && (
                          <a href={business.businessUrlSite} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Website">
                            <Globe size={14} />
                          </a>
                        )}
                        {(business.audioEn || business.audioFr || business.audioAr) && (
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400" title="Has Audio">
                            <Music size={14} />
                          </div>
                        )}
                        {(business.videoEn || business.videoFr || business.videoAr) && (
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400" title="Has Video">
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
        /* STEPPER VIEW */
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
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