'use client';

import { useState, useEffect, Fragment } from 'react';
import { getServices, createService, deleteService, uploadFile, updateService } from '@/services/services-api';
import { PlusIcon, TrashIcon, PhotoIcon, CloudArrowUpIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, Transition } from '@headlessui/react'; // تأكد من تثبيت @headlessui/react

const MySwal = withReactContent(Swal);
const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // States for Add Form
  const [addFormData, setAddFormData] = useState({ nameServAr: '', nameServFr: '', nameServEn: '', descrAr: '', descrFr: '', descrEn: '' });
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

  const [addVideoFile, setAddVideoFile] = useState<File | null>(null);
  const [addVideoPreview, setAddVideoPreview] = useState<string | null>(null);

  // States for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ nameServAr: '', nameServFr: '', nameServEn: '', descrAr: '', descrFr: '', descrEn: '' });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(Array.isArray(response) ? response : response.data || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchServices(); }, []);

  // --- Logic for Adding ---
  // const handleAddSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsUploading(true);
  //   try {
  //     let imageId = null;
  //     if (addImage) {
  //       const res = await uploadFile(addImage);
  //       imageId = res.id;
  //     }
  //     await createService({ ...addFormData, ...(imageId && { image: { id: imageId } }) });
  //     console.log(addFormData);
  //     Toast.fire({ icon: 'success', title: t('services_page.success_msg') });
  //     setAddFormData({ nameServAr: '', nameServFr: '', nameServEn: '', descrAr: '', descrFr: '', descrEn: '' });
  //     setAddImage(null); setAddImagePreview(null);
  //     fetchServices();
  //   } catch (error) { MySwal.fire('Error', 'فشلت الإضافة', 'error'); }
  //   finally { setIsUploading(false); }
  // };


  // Inside handleAddSubmit
  // const handleAddSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsUploading(true);
  //   try {
  //     let imageObject: { id: string | number } | undefined = undefined;
  //     if (addImage) {
  //       const res = await uploadFile(addImage);
  //       // VALIDATE: If your API returns { data: { id: ... } }, use res.data.id
  //       const uploadedId = res.file?.id || res.id || res.data?.id;
  //       if (uploadedId) {
  //         imageObject = { id: uploadedId };
  //       }
  //     }

  //     const payload = {
  //       ...addFormData,
  //       ...(imageObject && { image: imageObject }),
  //     };

  //     console.log("SENDING TO BACKEND:", JSON.stringify(payload, null, 2));
  //     await createService(payload);

  //     // const payload: any = {
  //     //   ...addFormData,
  //     //   ...(imageObject && { image: imageObject }), // Only include image if it exists
  //     // };

  //     // await createService(payload);

  //     Toast.fire({ icon: 'success', title: t('services_page.success_msg') });
  //     // Reset form...
  //     fetchServices();
  //   } catch (error) {
  //     console.error("Add Error:", error);
  //     MySwal.fire('Error', 'فشلت الإضافة - تحقق من البيانات المرفوعة', 'error');
  //   } finally { setIsUploading(false); }
  // };




  // const handleAddSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsUploading(true);
  //   try {
  //     let imageObject: { id: string | number } | undefined = undefined;
  //     if (addImage) {
  //       const res = await uploadFile(addImage);
  //       const uploadedId = res.file?.id || res.id || res.data?.id;
  //       if (uploadedId) {
  //         imageObject = { id: uploadedId };
  //       }
  //     }

  //     const payload = {
  //       ...addFormData,
  //       ...(imageObject && { image: imageObject }),
  //     };

  //     await createService(payload);

  //     // --- 1. Show Success Message ---
  //     Toast.fire({ icon: 'success', title: t('services_page.success_msg') });

  //     // --- 2. RESET EVERYTHING ---
  //     // Reset text inputs
  //     setAddFormData({
  //       nameServAr: '', nameServFr: '', nameServEn: '',
  //       descrAr: '', descrFr: '', descrEn: ''
  //     });
  //     // Reset file and preview
  //     setAddImage(null);
  //     setAddImagePreview(null);

  //     // Clear the file input HTML element (optional but recommended)
  //     const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  //     if (fileInput) fileInput.value = "";

  //     // --- 3. Refresh List ---
  //     fetchServices();

  //   } catch (error) {
  //     console.error("Add Error:", error);
  //     MySwal.fire('Error', 'فشلت الإضافة - تحقق من البيانات المرفوعة', 'error');
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageObject = undefined;
      let videoObject = undefined;

      // رفع الصورة إذا وجدت
      if (addImage) {
        const res = await uploadFile(addImage);
        const id = res.file?.id || res.id;
        if (id) imageObject = { id };
      }

      // رفع الفيديو إذا وجد (نفس منطق الصورة)
      if (addVideoFile) {
        const res = await uploadFile(addVideoFile);
        const id = res.file?.id || res.id;
        if (id) videoObject = { id };
      }

      const payload = {
        ...addFormData,
        ...(imageObject && { image: imageObject }),
        ...(videoObject && { video: videoObject }), // إضافة الفيديو للـ payload
      };

      await createService(payload);

      Toast.fire({ icon: 'success', title: t('services_page.success_msg') });

      // إعادة تعيين النموذج (Reset)
      setAddFormData({ nameServAr: '', nameServFr: '', nameServEn: '', descrAr: '', descrFr: '', descrEn: '' });
      setAddImage(null); setAddImagePreview(null);
      setAddVideoFile(null); setAddVideoPreview(null);

      fetchServices();
    } catch (error) {
      console.error("Add Error:", error);
      MySwal.fire('Error', 'فشلت الإضافة', 'error');
    } finally {
      setIsUploading(false);
    }
  };


  // --- Logic for Editing ---
  const openEditModal = (service: any) => {
    setEditingId(service.id);
    setEditFormData({
      nameServAr: service.nameServAr, nameServFr: service.nameServFr, nameServEn: service.nameServEn || '',
      descrAr: service.descrAr || '', descrFr: service.descrFr || '', descrEn: service.descrEn || ''
    });
    setEditImagePreview(service.image?.path ? (service.image.path.startsWith('http') ? service.image.path : `${process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '')}/${service.image.path}`) : null);
    setIsEditModalOpen(true);
  };



  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setIsUploading(true);

    try {
      let finalImage = undefined; // 'undefined' usually tells NestJS/TypeORM to "ignore" this field (keep old value)

      if (editImage) {
        // Scenario 1: User uploaded a new file
        const res = await uploadFile(editImage);
        const uploadedId = res.file?.id || res.id || res.data?.id;
        if (uploadedId) {
          finalImage = { id: uploadedId };
        }
      } else {
        // Scenario 2: No new file uploaded. 
        // We find the current service in our 'services' state to see its existing image
        const currentService = services.find(s => s.id === editingId);
        if (currentService?.image?.id) {
          finalImage = { id: currentService.image.id };
        }
      }

      const payload = {
        ...editFormData,
        image: finalImage,
      };

      await updateService(editingId, payload);

      Toast.fire({ icon: 'success', title: 'تم التحديث بنجاح' });
      setIsEditModalOpen(false);
      setEditImage(null); // Clear the file state
      fetchServices();
    } catch (error) {
      console.error("Update Error:", error);
      MySwal.fire('Error', 'فشل التحديث - تأكد من الاتصال بالسيرفر', 'error');
    } finally {
      setIsUploading(false);
    }
  };



  // const handleEditSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!editingId) return;
  //   setIsUploading(true);
  //   try {
  //     let imageId = null;
  //     if (editImage) {
  //       const res = await uploadFile(editImage);
  //       imageId = res.id;
  //     }
  //     await updateService(editingId, { ...editFormData, ...(imageId && { image: { id: imageId } }) });
  //     Toast.fire({ icon: 'success', title: 'تم التحديث بنجاح' });
  //     setIsEditModalOpen(false);
  //     fetchServices();
  //   } catch (error) { MySwal.fire('Error', 'فشل التحديث', 'error'); }
  //   finally { setIsUploading(false); }
  // };

  const handleDelete = (id: string) => {
    MySwal.fire({ title: t('common.confirm_delete_title'), icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
      .then(async (result) => {
        if (result.isConfirmed) {
          await deleteService(id);
          fetchServices();
          Toast.fire({ icon: 'success', title: t('common.deleted') });
        }
      });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ADD FORM SECTION (Always for Adding) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600">
            <PlusIcon className="w-6 h-6" /> {t('services_page.title')}
          </h2>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Ar', 'Fr', 'En'].map(l => (
                <input key={l} placeholder={`Name (${l})`} className="border p-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                  value={(addFormData as any)[`nameServ${l}`]} onChange={e => setAddFormData({ ...addFormData, [`nameServ${l}`]: e.target.value })} required />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Ar', 'Fr', 'En'].map(l => (
                <textarea key={l} placeholder={`Description (${l})`} className="border p-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                  value={(addFormData as any)[`descr${l}`]} onChange={e => setAddFormData({ ...addFormData, [`descr${l}`]: e.target.value })} required />
              ))}
            </div>
            {/* <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <CloudArrowUpIcon className="w-5 h-5" /> رفع صورة
                <input type="file" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) { setAddImage(file); setAddImagePreview(URL.createObjectURL(file)); }
                }} />
              </label>
              {addImagePreview && <img src={addImagePreview} className="w-12 h-12 rounded-lg object-cover border" />}
              <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 ml-auto">
                {isUploading ? 'جاري الإضافة...' : 'إضافة خدمة جديدة'}
              </button>
            </div> */}

            <div className="flex flex-wrap items-center gap-4">
              {/* رفع صورة */}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <CloudArrowUpIcon className="w-5 h-5" /> رفع صورة
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) { setAddImage(file); setAddImagePreview(URL.createObjectURL(file)); }
                }} />
              </label>
              {addImagePreview && <img src={addImagePreview} className="w-12 h-12 rounded-lg object-cover border" />}

              {/* رفع فيديو */}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <CloudArrowUpIcon className="w-5 h-5" /> رفع فيديو
                <input type="file" accept="video/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAddVideoFile(file);
                    setAddVideoPreview(URL.createObjectURL(file));
                  }
                }} />
              </label>
              {addVideoPreview && (
                <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center border overflow-hidden">
                  <video src={addVideoPreview} className="w-full h-full object-cover" />
                </div>
              )}

              <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 md:ml-auto w-full md:w-auto">
                {isUploading ? 'جاري الإضافة...' : 'إضافة خدمة جديدة'}
              </button>
            </div>


          </form>
        </section>


        {/* LIST SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4 border-b">أيقونة</th>
                <th className="px-6 py-4 border-b">الاسم (AR)</th>
                <th className="px-6 py-4 border-b">الاسم (FR)</th>
                <th className="px-6 py-4 border-b">الاسم (EN)</th>
                <th className="px-6 py-4 border-b">الوصف (AR)</th>
                <th className="px-6 py-4 border-b">الوصف (FR)</th>
                <th className="px-6 py-4 border-b">الوصف (EN)</th>
                <th className="px-6 py-4 border-b text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  {/* 1. الأيقونة */}
                  {/* <td className="px-6 py-4">
                    <img
                      src={
                        s.image?.path?.startsWith('http')
                          ? s.image.path
                          : process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '') + '/' + s.image?.path
                      }
                      className="w-10 h-10 rounded-lg object-cover border shadow-sm"
                      alt={s.nameServAr}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  </td> */}
                  {/*}
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border">
                      {s.image?.path ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '')}/${s.image.path}`}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </td> */}

                  {/* <td className="px-6 py-4">
  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border">
    {s.image?.path ? (
      <img
        src={s.image.path.startsWith('http') 
             ? s.image.path 
             : `${process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '')}${s.image.path}`}
        className="w-full h-full object-cover"
        alt={s.nameServAr}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
        }}
      />
    ) : (
      <PhotoIcon className="w-6 h-6 text-gray-400" />
    )}
  </div>
</td> */}

                  {/* <td className="px-6 py-4">
  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
    {s.image?.path ? (
      <img
        // Logic: If path is absolute (http), use it. 
        // Otherwise, combine Backend URL + Path.
        src={s.image.path.startsWith('http') 
          ? s.image.path 
          : `${process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '')}${s.image.path}`}
        className="w-full h-full object-cover transition-transform hover:scale-110"
        alt={s.nameServAr}
        // Fallback if the file is deleted from the server but exists in DB
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
        }}
      />
    ) : (
      <PhotoIcon className="w-6 h-6 text-gray-400" />
    )}
  </div>
</td> */}


                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                      {s.image?.path ? (
                        <img
                          src={
                            s.image.path.startsWith('http')
                              ? s.image.path
                              : `${process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '')}${s.image.path}`
                          }
                          className="w-full h-full object-cover transition-transform hover:scale-110"
                          alt={s.nameServAr}
                          onError={(e) => {
                            // If the image fails to load, we show a placeholder
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </td>

                  {/* 2. الأسماء بجميع اللغات */}
                  <td className="px-6 py-4 font-medium text-gray-900">{s.nameServAr}</td>
                  <td className="px-6 py-4 text-gray-600">{s.nameServFr}</td>
                  <td className="px-6 py-4 text-gray-600">{s.nameServEn || '-'}</td>

                  {/* 3. الأوصاف بجميع اللغات (مع قص النص الطويل) */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{s.descrAr}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{s.descrFr}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{s.descrEn || '-'}</td>

                  {/* 4. أزرار العمليات */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="تعديل"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* رسالة في حال عدم وجود بيانات */}
          {services.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              لا توجد خدمات مضافة حالياً
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        <Transition appear show={isEditModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsEditModalOpen(false)}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <Dialog.Title className="text-xl font-bold">تعديل الخدمة</Dialog.Title>
                      <button onClick={() => setIsEditModalOpen(false)}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Ar', 'Fr', 'En'].map(l => (
                          <div key={l}>
                            <label className="text-xs font-bold text-gray-500">الاسم ({l})</label>
                            <input className="w-full border p-3 rounded-xl mt-1" value={(editFormData as any)[`nameServ${l}`]} onChange={e => setEditFormData({ ...editFormData, [`nameServ${l}`]: e.target.value })} required />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Ar', 'Fr', 'En'].map(l => (
                          <div key={l}>
                            <label className="text-xs font-bold text-gray-500">الوصف ({l})</label>
                            <textarea className="w-full border p-3 rounded-xl mt-1" value={(editFormData as any)[`descr${l}`]} onChange={e => setEditFormData({ ...editFormData, [`descr${l}`]: e.target.value })} required />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 py-4">
                        <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer font-medium">
                          تغيير الصورة
                          <input type="file" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) { setEditImage(file); setEditImagePreview(URL.createObjectURL(file)); }
                          }} />
                        </label>
                        {editImagePreview && <img src={editImagePreview} className="w-16 h-16 rounded-xl object-cover border-2 border-blue-100" />}
                      </div>
                      <div className="flex gap-3 justify-end mt-6">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 text-gray-500 font-medium">إلغاء</button>
                        <button type="submit" disabled={isUploading} className="px-8 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 disabled:opacity-50">
                          {isUploading ? 'جاري الحفظ...' : 'تحديث الآن'}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}