"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Trash2, UserPlus, MapPin, Phone,
  Mail, Lock, Unlock, Building2, User as UserIcon,
  Loader2
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

  const router = useRouter();
  const { i18n, t } = useTranslation();

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
      
      // Checking for the Database Foreign key structural lock patterns
      const errorMessage = i18n.language === 'ar'
        ? "لا يمكن حذف هذا العضو نظراً لوجود أعمال أو خدمات مرتبطة بحسابه حالياً."
        : "Cannot delete this member because they are linked to existing business items.";

      Swal.fire({
        icon: 'error',
        title: i18n.language === 'ar' ? 'خطأ في الحذف' : 'Delete Failed',
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
    <div className="min-h-screen bg-[#F8FAFC] pb-20 dark:bg-gray-950">
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-br from-indigo-600 to-violet-700 -z-10 clip-path-slant" />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-end mb-12">
          <div className="text-black dark:text-gray-100">
            <h1 className="text-4xl font-black drop-shadow-md">{t("members.pros")}</h1>
            <p className="text-grey-100 mt-2 font-medium">{t("members.short_description")}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
            <UserPlus size={20} />
            <span>{t("members.add_member")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member) => {
            const isAr = i18n.language === 'ar';
            const suffix = isAr ? 'Ar' : 'Fr';
            const isEnterprise = member.typeMember === 'ENTERPRISE' || member.typeMember === 'ENTREPRISE';

            // --- IMPROVED NAME FETCHING LOGIC ---
            let displayName = "";
            if (isEnterprise) {
              displayName = member.entreprise?.[`name${suffix}` as keyof typeof member.entreprise] ||
                member.entreprise?.nameFr || "Enterprise";
            } else {
              const fName = member.contact?.[`firstName${suffix}` as keyof typeof member.contact] || member.contact?.firstName || "";
              const lName = member.contact?.[`lastName${suffix}` as keyof typeof member.contact] || member.contact?.lastName || "";
              displayName = `${fName} ${lName}`.trim();

              if (!displayName) {
                displayName = member.user?.email ? member.user.email.split('@')[0] : "Member";
              }
            }
            // ------------------------------------

            const cityName = member.contact?.address?.city ? member.contact.address.city[isAr ? 'nameAr' : 'nameFr'] : "---";
            const displayEmail = member.contact?.email || member.user?.email || "---";
            const profilePic = member.user?.photo?.path ? `${API_URL}${member.user.photo.path}` : null;

            return (
              <div key={member.id} className={`bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-200/60 group transition-all duration-500 hover:shadow-2xl dark:bg-gray-900 dark:border-gray-800 ${member.status === 'BLOCKED' ? 'grayscale opacity-75' : ''}`}>
                <div className="relative h-36 w-full rounded-2rem bg-linear-to-br from-indigo-600 to-violet-700 mb-12 p-6">
                  <div className="flex justify-between items-center h-full">
                    <div className="relative">
                      {profilePic ? (
                        <div className="relative w-24 h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                          <Image src={profilePic} alt="Profile" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-3xl bg-white border-4 border-white flex items-center justify-center text-indigo-600 text-3xl font-black shadow-lg">
                          {isEnterprise ? <Building2 size={40} /> : displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>

                    <div className={`${isAr ? 'text-left' : 'text-right'} text-white max-w-180px`}>
                      <h3 className="text-lg font-black leading-tight truncate" title={displayName}>{displayName}</h3>
                      <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-lg bg-white/20 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                        {isEnterprise ? <Building2 size={10} /> : <UserIcon size={10} />}
                        {member.typeMember}
                      </span>
                    </div>
                  </div>

                  <div className="absolute -top-1 -right-1 flex gap-1 p-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleToggleStatus(member)} className={`p-2 rounded-xl backdrop-blur-md text-white transition-colors ${(member.status || 'ACTIVE') === 'ACTIVE' ? 'bg-white/10 hover:bg-orange-500' : 'bg-red-500 hover:bg-emerald-500'}`}>
                      {(member.status || 'ACTIVE') === 'ACTIVE' ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                    <button onClick={() => { setSelectedMember(member); setIsDeleteModalOpen(true); }} className="p-2 bg-white/10 backdrop-blur-md hover:bg-red-600 text-white rounded-xl">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="grid gap-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400">
                      <Mail size={16} className="shrink-0 text-indigo-400" />
                      <span className="text-sm truncate font-medium">{displayEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400">
                      <Phone size={16} className="shrink-0 text-indigo-400" />
                      <span className="text-sm font-medium">{member.contact?.phoneCell || "---"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors dark:bg-gray-800 dark:group-hover:bg-indigo-950">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase dark:text-gray-500">{isAr ? 'المدينة' : 'City'}</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-gray-200">{cityName}</p>
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm ${(member.status || 'ACTIVE') === 'ACTIVE' ? 'bg-white text-indigo-600' : 'bg-red-600 text-white'}`}>
                      {member.status || 'ACTIVE'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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