"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Trash2, UserPlus, MapPin, Phone,
  Mail, Lock, Unlock, Building2, User as UserIcon,
  Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import Swal from 'sweetalert2';

import { getMembers, deleteMember, updateMember } from "@/api/members-api";
import AddMemberModal from "@/components/AddMemberModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

interface Member {
  id: string;
  typeMember: 'INDIVIDUAL' | 'ENTERPRISE' | 'ENTREPRISE';
  status: 'ACTIVE' | 'BLOCKED';
  contact?: {
    firstName: string; lastName: string;
    firstNameAr: string; lastNameAr: string;
    email: string; phoneCell: string;
    phoneGround: string;
    address?: {
      city?: { nameAr: string; nameFr: string; };
    };
  };
  entreprise?: { nameFr: string; nameAr: string; };
  user?: {
    id: string;
    email: string;
    photo?: { path: string };
  };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // --- Pagination & Search States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language ? i18n.language.toLowerCase() : "fr";
  const isRtl = currentLang === "ar";

  const fetchMembersData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.response?.status === 401) return router.push("/sign-in");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMembersData();
  }, [fetchMembersData]);

  // --- Filter & Pagination Calculations ---
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m) => {
      const isEnterprise = m.typeMember === 'ENTERPRISE' || m.typeMember === 'ENTREPRISE';
      const name = isEnterprise 
        ? (m.entreprise?.nameFr || m.entreprise?.nameAr || "")
        : `${m.contact?.firstName || ""} ${m.contact?.lastName || ""} ${m.contact?.firstNameAr || ""} ${m.contact?.lastNameAr || ""}`;
      const email = m.contact?.email || m.user?.email || "";
      const phone = m.contact?.phoneCell || "";

      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || phone.toLowerCase().includes(q);
    });
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [filteredMembers.length, totalPages, currentPage]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const handleToggleStatus = async (member: Member) => {
    const isCurrentlyActive = (member.status || 'ACTIVE') === 'ACTIVE';
    const newStatus: 'ACTIVE' | 'BLOCKED' = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';
    try {
      await updateMember(member.id, { status: newStatus });
      setMembers(prev =>
        prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m)
      );
    } catch (err: any) {
      console.error("Toggle status error:", err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error updating status' });
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    try {
      await deleteMember(selectedMember.id);
      setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
      setIsDeleteModalOpen(false);
      Swal.fire({ icon: 'success', title: t('common.deleted') || 'Deleted successfully', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      console.error("Delete structural error context:", err);
      setIsDeleteModalOpen(false);
      
      const errorMessage = isRtl
        ? "لا يمكن حذف هذا العضو نظراً لوجود أعمال أو خدمات مرتبطة بحسابه حالياً."
        : "Cannot delete this member because they are linked to existing business items.";

      Swal.fire({
        icon: 'error',
        title: isRtl ? 'خطأ في الحذف' : 'Delete Failed',
        text: errorMessage,
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-950">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
      <p className="font-bold text-indigo-600 text-lg uppercase tracking-widest">Loading Professionals...</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#F8FAFC] pb-20 dark:bg-gray-950 ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-br from-indigo-600 to-violet-700 -z-10 clip-path-slant" />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-end mb-8">
          <div className="text-black dark:text-gray-100">
            <h1 className="text-3xl font-black drop-shadow-md">{t("members.pros")}</h1>
            <p className="text-slate-100 mt-1 font-medium text-sm">{t("members.short_description")}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 text-sm">
            <UserPlus size={18} />
            <span>{t("members.add_member")}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={isRtl ? "بحث عن أعضاء..." : "Search members..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-80 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {paginatedMembers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
              <UserIcon size={40} className="mb-3 text-slate-300 dark:text-gray-600" />
              <p className="text-base font-medium">No members found</p>
              <p className="text-xs">Click &quot;Add Member&quot; to get started.</p>
            </div>
          ) : (
            paginatedMembers.map((member) => {
              const isEnterprise = member.typeMember === 'ENTERPRISE' || member.typeMember === 'ENTREPRISE';

              let displayName: string = "";
              if (isEnterprise) {
                const enterpriseName = currentLang === "ar"
                  ? (member.entreprise?.nameAr ?? member.entreprise?.nameFr ?? "Enterprise")
                  : (member.entreprise?.nameFr ?? member.entreprise?.nameAr ?? "Enterprise");
                displayName = enterpriseName || "Enterprise";
              } else {
                const fName = currentLang === "ar"
                  ? (member.contact?.firstNameAr ?? member.contact?.firstName ?? "")
                  : (member.contact?.firstName ?? member.contact?.firstNameAr ?? "");
                const lName = currentLang === "ar"
                  ? (member.contact?.lastNameAr ?? member.contact?.lastName ?? "")
                  : (member.contact?.lastName ?? member.contact?.lastNameAr ?? "");

                displayName = [fName, lName].filter(Boolean).join(" ") ||
                  (member.user?.email ? member.user.email.split('@')[0] : "Member");
              }

              const cityName = member.contact?.address?.city ? member.contact.address.city[isRtl ? 'nameAr' : 'nameFr'] : "---";
              const displayEmail = member.contact?.email || member.user?.email || "---";
              const profilePic = member.user?.photo?.path ? `${API_URL}${member.user.photo.path}` : null;

              return (
                <div key={member.id} className={`bg-white rounded-2xl p-2 shadow-xs border border-slate-200/60 group transition-all duration-300 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800 text-xs flex flex-col justify-between ${member.status === 'BLOCKED' ? 'grayscale opacity-75' : ''}`}>
                  <div>
                    <div className="relative h-28 w-full rounded-xl bg-linear-to-br from-indigo-600 to-violet-700 mb-3 p-3 flex items-center justify-between">
                      <div className="relative">
                        {profilePic ? (
                          <div className="relative w-16 h-16 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white">
                            <Image src={profilePic} alt="Profile" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-white border-2 border-white flex items-center justify-center text-indigo-600 text-xl font-black shadow-sm">
                            {isEnterprise ? <Building2 size={24} /> : displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>

                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleToggleStatus(member)} className={`p-1.5 rounded-lg text-white transition-colors ${(member.status || 'ACTIVE') === 'ACTIVE' ? 'bg-white/20 hover:bg-orange-500' : 'bg-red-500 hover:bg-emerald-500'}`}>
                          {(member.status || 'ACTIVE') === 'ACTIVE' ? <Unlock size={12} /> : <Lock size={12} />}
                        </button>
                        <button onClick={() => { setSelectedMember(member); setIsDeleteModalOpen(true); }} className="p-1.5 bg-white/20 hover:bg-red-600 text-white rounded-lg">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1 dark:text-gray-100 mb-0.5" title={displayName}>{displayName}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide dark:bg-indigo-950 dark:text-indigo-400 mb-2">
                        {isEnterprise ? <Building2 size={9} /> : <UserIcon size={9} />}
                        {member.typeMember}
                      </span>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                          <Mail size={11} className="shrink-0 text-indigo-400" />
                          <span className="text-[11px] truncate font-medium">{displayEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                          <Phone size={11} className="shrink-0 text-indigo-400" />
                          <span className="text-[11px] font-medium">{member.contact?.phoneCell || "---"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl dark:bg-gray-800 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase dark:text-gray-500">{isRtl ? 'المدينة' : 'City'}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-gray-200">{cityName}</p>
                      </div>
                    </div>
                    <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${(member.status || 'ACTIVE') === 'ACTIVE' ? 'bg-white text-indigo-600' : 'bg-red-600 text-white'}`}>
                      {member.status || 'ACTIVE'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- NUMBERED PAGINATION CONTROLS: 1 2 3 4 --- */}
        {filteredMembers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs dark:bg-gray-900 dark:border-gray-800 mt-6 space-y-4">
            
            {/* Items Per Page Selector & Counter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-gray-400 pb-3 border-b border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span>{isRtl ? "عرض" : "Show"}</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>{isRtl ? "لكل صفحة" : "per page"}</span>
              </div>

              <span>
                {isRtl ? "عرض" : "Showing"} {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMembers.length)} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} {isRtl ? "من" : "of"} {filteredMembers.length} {isRtl ? "عنصر" : "records"}
              </span>
            </div>

            {/* Clickable 1 2 3 4 Number Sequence */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                <span>{isRtl ? "السابق" : "Prev"}</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto px-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center shadow-xs ${
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
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <span>{isRtl ? "التالي" : "Next"}</span>
                {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>

          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={selectedMember?.typeMember === 'INDIVIDUAL'
          ? `${selectedMember.contact?.firstName || ''} ${selectedMember.contact?.lastName || ''}`
          : selectedMember?.entreprise?.nameFr || "Member"}
      />
      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMembersData} />
      <style jsx>{`.clip-path-slant { clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%); }`}</style>
    </div>
  );
}