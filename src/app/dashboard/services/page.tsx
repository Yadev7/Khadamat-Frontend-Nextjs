'use client';

import { useState, useEffect, Fragment } from 'react';
import { getServices, createService, deleteService, uploadFile, updateService } from '@/api/services-api';
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, Transition } from '@headlessui/react';

const MySwal = withReactContent(Swal);
const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  if (path.includes('/v1/files/')) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const domain = process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '') || 'http://localhost:3001';
    return `${domain}${cleanPath}`;
  }

  if (path.startsWith('files/') || path.startsWith('/files/')) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const domain = process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '') || 'http://localhost:3001';
    return `${domain}${cleanPath}`;
  }

  return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/files/${path}`;
};

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslatingAdd, setIsTranslatingAdd] = useState(false);
  const [isTranslatingEdit, setIsTranslatingEdit] = useState(false);

  // States for Add Form
  const [addFormData, setAddFormData] = useState({
    nameServAr: '',
    nameServFr: '',
    nameServEn: '',
    descrAr: '',
    descrFr: '',
    descrEn: '',
  });
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

  const [addVideoFile, setAddVideoFile] = useState<File | null>(null);
  const [addVideoPreview, setAddVideoPreview] = useState<string | null>(null);

  // States for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    nameServAr: '',
    nameServFr: '',
    nameServEn: '',
    descrAr: '',
    descrFr: '',
    descrEn: '',
  });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // States for Image Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageObject = undefined;
      let videoObject = undefined;

      if (addImage) {
        const res = await uploadFile(addImage);
        const id = res.file?.id || res.id;
        if (id) imageObject = { id };
      }

      if (addVideoFile) {
        const res = await uploadFile(addVideoFile);
        const id = res.file?.id || res.id;
        if (id) videoObject = { id };
      }

      const payload = {
        ...addFormData,
        ...(imageObject && { image: imageObject }),
        ...(videoObject && { video: videoObject }),
      };

      await createService(payload);

      Toast.fire({ icon: 'success', title: t('services_page.success_msg') });

      setAddFormData({ nameServAr: '', nameServFr: '', nameServEn: '', descrAr: '', descrFr: '', descrEn: '' });
      setAddImage(null);
      setAddImagePreview(null);
      setAddVideoFile(null);
      setAddVideoPreview(null);

      fetchServices();
    } catch (error) {
      console.error('Add Error:', error);
      MySwal.fire('Error', 'فشلت الإضافة', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const openEditModal = (service: any) => {
    setEditingId(service.id);
    setEditFormData({
      nameServAr: service.nameServAr,
      nameServFr: service.nameServFr,
      nameServEn: service.nameServEn || '',
      descrAr: service.descrAr || '',
      descrFr: service.descrFr || '',
      descrEn: service.descrEn || '',
    });
    setEditImagePreview(service.image?.path ? getImageUrl(service.image.path) : null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setIsUploading(true);

    try {
      let finalImage = undefined;

      if (editImage) {
        const res = await uploadFile(editImage);
        const uploadedId = res.file?.id || res.id || res.data?.id;
        if (uploadedId) {
          finalImage = { id: uploadedId };
        }
      } else {
        const currentService = services.find((s) => s.id === editingId);
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
      setEditImage(null);
      fetchServices();
    } catch (error) {
      console.error('Update Error:', error);
      MySwal.fire('Error', 'فشل التحديث - تأكد من الاتصال بالسيرفر', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    MySwal.fire({
      title: t('common.confirm_delete_title'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteService(id);
        fetchServices();
        Toast.fire({ icon: 'success', title: t('common.deleted') });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans dark:bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ADD FORM SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <PlusIcon className="w-6 h-6" /> {t('services_page.title')}
          </h2>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Ar', 'Fr', 'En'].map((l) => (
                <input
                  key={l}
                  placeholder={`Name (${l})`}
                  className="border p-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  value={(addFormData as any)[`nameServ${l}`]}
                  onChange={(e) => setAddFormData({ ...addFormData, [`nameServ${l}`]: e.target.value })}
                  required
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Ar', 'Fr', 'En'].map((l) => (
                <textarea
                  key={l}
                  placeholder={`Description (${l})`}
                  className="border p-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  value={(addFormData as any)[`descr${l}`]}
                  onChange={(e) => setAddFormData({ ...addFormData, [`descr${l}`]: e.target.value })}
                  required
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300">
                <CloudArrowUpIcon className="w-5 h-5" />
                {t('dashboard.infos-general.common.upload_image')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAddImage(file);
                      setAddImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              {addImagePreview && <img src={addImagePreview} className="w-12 h-12 rounded-lg object-cover border" alt="Preview" />}

              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300">
                <CloudArrowUpIcon className="w-5 h-5" />
                {t('dashboard.infos-general.common.upload_video')}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAddVideoFile(file);
                      setAddVideoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              {addVideoPreview && (
                <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center border overflow-hidden">
                  <video src={addVideoPreview} className="w-full h-full object-cover" />
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 md:ml-auto w-full md:w-auto"
              >
                {isUploading ? t('dashboard.infos-general.common.loading') : t('dashboard.infos-general.common.add_new')}
              </button>
            </div>
          </form>
        </section>

        {/* LIST SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-900 dark:border-gray-800">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 border-b dark:border-gray-700">{t('dashboard.infos-general.common.icon')}</th>
                <th className="px-6 py-4 border-b dark:border-gray-700">{t('dashboard.infos-general.common.name')} (AR)</th>
                <th className="px-6 py-4 border-b dark:border-gray-700">{t('dashboard.infos-general.common.name')} (FR)</th>
                <th className="px-6 py-4 border-b dark:border-gray-700">{t('dashboard.infos-general.common.name')} (EN)</th>
                <th className="px-6 py-4 border-b dark:border-gray-700">{t('dashboard.infos-general.common.description')} (AR)</th>
                <th className="px-6 py-4 border-b dark:border-gray-700">{t('dashboard.infos-general.common.description')} (FR)</th>
                <th className="px-6 py-4 border-b dark:border-gray-700">{t('dashboard.infos-general.common.description')} (EN)</th>
                <th className="px-6 py-4 border-b text-center dark:border-gray-700">{t('dashboard.infos-general.common.operations')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                      {s.image?.path ? (
                        <img
                          src={getImageUrl(s.image.path)}
                          className="w-full h-full object-cover transition-transform hover:scale-110 cursor-pointer"
                          alt={s.nameServAr}
                          onClick={() => {
                            setPreviewImageSrc(getImageUrl(s.image.path));
                            setIsPreviewModalOpen(true);
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{s.nameServAr}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{s.nameServFr}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{s.nameServEn || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate dark:text-gray-400">{s.descrAr}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate dark:text-gray-300">{s.descrFr}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate dark:text-gray-300">{s.descrEn || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition dark:text-blue-400 dark:hover:bg-blue-950"
                        title="تعديل"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-950"
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

          {services.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">{t('dashboard.infos-general.not_found')}</div>
          )}
        </div>

        {/* EDIT MODAL */}
        <Transition appear show={isEditModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsEditModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-gray-900 dark:border dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                      <Dialog.Title className="text-xl font-bold dark:text-gray-100">
                        {t('dashboard.infos-general.tabs.service_tab')}
                      </Dialog.Title>
                      <button onClick={() => setIsEditModalOpen(false)}>
                        <XMarkIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Ar', 'Fr', 'En'].map((l) => (
                          <div key={l}>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                              {t('dashboard.infos-general.common.name')} ({l})
                            </label>
                            <input
                              className="w-full border p-3 rounded-xl mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                              value={(editFormData as any)[`nameServ${l}`]}
                              onChange={(e) => setEditFormData({ ...editFormData, [`nameServ${l}`]: e.target.value })}
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Ar', 'Fr', 'En'].map((l) => (
                          <div key={l}>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                              {t('dashboard.infos-general.common.description')} ({l})
                            </label>
                            <textarea
                              className="w-full border p-3 rounded-xl mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                              value={(editFormData as any)[`descr${l}`]}
                              onChange={(e) => setEditFormData({ ...editFormData, [`descr${l}`]: e.target.value })}
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 py-4">
                        <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer font-medium dark:bg-blue-950 dark:text-blue-400">
                          تغيير الصورة
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEditImage(file);
                                setEditImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                        {editImagePreview && (
                          <img
                            src={editImagePreview}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-blue-100 dark:border-blue-900"
                            alt="Preview"
                          />
                        )}
                      </div>
                      <div className="flex gap-3 justify-end mt-6">
                        <button
                          type="button"
                          onClick={() => setIsEditModalOpen(false)}
                          className="px-6 py-2 text-gray-500 font-medium dark:text-gray-400"
                        >
                          {t('dashboard.infos-general.common.cancel')}
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="px-8 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
                        >
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

        {/* PREVIEW MODAL */}
        <Transition appear show={isPreviewModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-100" onClose={() => setIsPreviewModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all p-2 relative dark:bg-gray-900">
                    <button
                      onClick={() => setIsPreviewModalOpen(false)}
                      className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white rounded-full p-2 backdrop-blur-md transition-all shadow-md dark:bg-gray-800/50 dark:hover:bg-gray-800"
                    >
                      <XMarkIcon className="w-6 h-6 text-gray-800 dark:text-gray-300" />
                    </button>
                    {previewImageSrc && (
                      <img src={previewImageSrc} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
                    )}
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