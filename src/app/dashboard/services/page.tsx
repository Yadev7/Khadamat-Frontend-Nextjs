'use client';

import { useState, useEffect, Fragment, useMemo } from 'react';
import { getServices, createService, deleteService, uploadFile, updateService } from '@/api/services-api';
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1) : 'Ar';
  const isRtl = i18n.language === 'ar';

  const [services, setServices] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // --- Search & Pagination States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // --- Filter & Pagination Calculations ---
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const query = searchQuery.toLowerCase();
    return services.filter((s) => 
      (s.nameServAr && s.nameServAr.toLowerCase().includes(query)) ||
      (s.nameServFr && s.nameServFr.toLowerCase().includes(query)) ||
      (s.nameServEn && s.nameServEn.toLowerCase().includes(query)) ||
      (s.descrAr && s.descrAr.toLowerCase().includes(query)) ||
      (s.descrFr && s.descrFr.toLowerCase().includes(query)) ||
      (s.descrEn && s.descrEn.toLowerCase().includes(query))
    );
  }, [services, searchQuery]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [filteredServices.length, totalPages, currentPage]);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

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

      Toast.fire({ icon: 'success', title: t('services_page.success_msg', 'تمت الإضافة بنجاح') });

      setAddFormData({ nameServAr: '', nameServFr: '', nameServEn: '', descrAr: '', descrFr: '', descrEn: '' });
      setAddImage(null);
      setAddImagePreview(null);
      setAddVideoFile(null);
      setAddVideoPreview(null);

      fetchServices();
      setCurrentPage(1);
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
      setEditImagePreview(null);
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
      title: t('common.confirm_delete_title', 'هل أنت متأكد من الحذف؟'),
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: t('common.cancel'),
      confirmButtonText: t('common.yes_delete'),
      confirmButtonColor: '#ef4444',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteService(id);
        fetchServices();
        Toast.fire({ icon: 'success', title: t('common.deleted', 'تم الحذف بنجاح') });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans dark:bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ADD FORM SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <PlusIcon className="w-6 h-6" /> {t('services_page.title', 'إدارة الخدمات')}
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
                  required={l === 'Ar' || l === 'Fr'}
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
                  required={l === 'Ar' || l === 'Fr'}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300">
                <CloudArrowUpIcon className="w-5 h-5" />
                {t('dashboard.infos-general.common.upload_image', 'رفع صورة')}
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
                {t('dashboard.infos-general.common.upload_video', 'رفع فيديو')}
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
                {isUploading ? t('dashboard.infos-general.common.loading', 'جاري التحميل...') : t('dashboard.infos-general.common.add_new', 'إضافة خدمة جديدة')}
              </button>
            </div>
          </form>
        </section>

        {/* LIST SECTION WITH SEARCH FILTER & CARD GRID */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {t('dashboard.infos-general.tabs.service_tab', 'قائمة الخدمات')} ({filteredServices.length} {services.length !== totalPages ? `/ ${services.length}` : ''})
            </h3>

            {/* --- LIVE SEARCH FILTER BAR --- */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder={t('common.search_placeholder', 'بحث عن خدمة...')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedServices.map((s) => {
              const displayName = s[`nameServ${currentLang}`] || s.nameServAr || s.nameServFr;
              const displayDesc = s[`descr${currentLang}`] || s.descrAr || s.descrFr;

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between dark:bg-gray-900 dark:border-gray-800 transition hover:shadow-md"
                >
                  <div>
                    {/* Header: Image & Actions */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm shrink-0 dark:bg-gray-800 dark:border-gray-700">
                        {s.image?.path ? (
                          <img
                            src={getImageUrl(s.image.path)}
                            className="w-full h-full object-cover transition-transform hover:scale-105 cursor-pointer"
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
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 text-blue-600 hover:bg-blue-100/50 rounded-lg transition dark:text-blue-400 dark:hover:bg-blue-900/40"
                          title="تعديل"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-red-500 hover:bg-red-100/50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900/40"
                          title="حذف"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1 line-clamp-1">
                      {displayName}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                      {displayDesc || '-'}
                    </p>
                  </div>

                  {/* Footer tags for available translations */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex gap-1.5 font-medium">
                      <span className={s.nameServAr ? 'text-blue-600 dark:text-blue-400' : 'opacity-40'}>AR</span>
                      <span>/</span>
                      <span className={s.nameServFr ? 'text-blue-600 dark:text-blue-400' : 'opacity-40'}>FR</span>
                      <span>/</span>
                      <span className={s.nameServEn ? 'text-blue-600 dark:text-blue-400' : 'opacity-40'}>EN</span>
                    </span>
                    <span>ID: {s.id.slice(0, 6)}...</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800 text-gray-400 dark:text-gray-500">
              {searchQuery ? t('common.no_search_results', 'لا توجد نتائج تطابق بحثك') : t('dashboard.infos-general.not_found', 'لا توجد خدمات متاحة حالياً')}
            </div>
          )}

          {/* --- PAGINATION CONTROLS: 1 2 3 4 5 STYLE --- */}
          {filteredServices.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800 mt-6 space-y-4">
              
              {/* Top row: Per-page selector & item counts */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span>{t('common.show', 'عرض')}</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>{t('common.per_page', 'لكل صفحة')}</span>
                </div>

                <span>
                  {t('common.showing', 'عرض')} {Math.min((currentPage - 1) * itemsPerPage + 1, filteredServices.length)} - {Math.min(currentPage * itemsPerPage, filteredServices.length)} {t('common.of', 'من')} {filteredServices.length} {t('common.items', 'عنصر')}
                </span>
              </div>

              {/* Bottom row: Clickable numbers 1 2 3 4 5 ... */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  {isRtl ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                  <span>{t('common.prev', 'السابق')}</span>
                </button>

                {/* Numbered Page List */}
                <div className="flex items-center gap-1.5 overflow-x-auto px-1">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNum = index + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center shadow-sm ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-blue-500/25 scale-105'
                            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
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
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  <span>{t('common.next', 'التالي')}</span>
                  {isRtl ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                </button>
              </div>

            </div>
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
                        {t('dashboard.infos-general.tabs.service_tab', 'تعديل الخدمة')}
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
                              {t('dashboard.infos-general.common.name', 'الاسم')} ({l})
                            </label>
                            <input
                              className="w-full border p-3 rounded-xl mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                              value={(editFormData as any)[`nameServ${l}`]}
                              onChange={(e) => setEditFormData({ ...editFormData, [`nameServ${l}`]: e.target.value })}
                              required={l === 'Ar' || l === 'Fr'}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Ar', 'Fr', 'En'].map((l) => (
                          <div key={l}>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                              {t('dashboard.infos-general.common.description', 'الوصف')} ({l})
                            </label>
                            <textarea
                              className="w-full border p-3 rounded-xl mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                              value={(editFormData as any)[`descr${l}`]}
                              onChange={(e) => setEditFormData({ ...editFormData, [`descr${l}`]: e.target.value })}
                              required={l === 'Ar' || l === 'Fr'}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 py-4">
                        <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer font-medium dark:bg-blue-950 dark:text-blue-400">
                           {t('dashboard.infos-general.common.change_image', 'تغيير الصورة')}
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
                          {t('dashboard.infos-general.common.cancel', 'إلغاء')}
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="px-8 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
                        >
                          {isUploading ? t('dashboard.infos-general.common.update_loading', 'جاري التحديث...') : t('dashboard.infos-general.common.update_now', 'تحديث الآن')}
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
          <Dialog as="div" className="relative z-[100]" onClose={() => setIsPreviewModalOpen(false)}>
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
                      <img
                        src={previewImageSrc}
                        alt="Preview"
                        className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                        }}
                      />
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