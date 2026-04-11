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

import { getMembers, deleteMember, updateMember, updateUser } from "@/services/members-api";
import AddMemberModal from "@/components/AddMemberModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

// جلب الرابط الأساسي من البيئة
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '') || 'http://127.0.0.1:3001';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';

interface Member {
  id: string;
  typeMember: 'INDIVIDUAL' | 'ENTERPRISE';
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
    email: string;
    photo?: { path: string }; // المسار الفعلي للصورة
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

  // const handleToggleStatus = async (memberId: string, currentStatus: string) => {
  //   const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
  //   try {
  //     await updateMember(memberId, { status: newStatus });
  //     setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: newStatus as 'ACTIVE' | 'BLOCKED' } : m));
  //   } catch (err) {
  //     alert("فشل تحديث الحالة");
  //   }
  // };

  // const handleToggleStatus = async (memberId: string, currentStatus: string | undefined) => {
  //   // If status is missing, we treat it as 'ACTIVE' by default
  //   const effectiveStatus = currentStatus || 'ACTIVE';

  //   // Now toggle based on that effective status
  //   const newStatus = effectiveStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

  //   try {
  //     await updateMember(memberId, { status: newStatus });

  //     setMembers(prev =>
  //       prev.map(m =>
  //         m.id === memberId
  //           ? { ...m, status: newStatus as 'ACTIVE' | 'BLOCKED' }
  //           : m
  //       )
  //     );
  //   } catch (err) {
  //     // Keeping your original error message
  //     alert("فشل تحديث الحالة");
  //   }
  // };


  //   const handleToggleStatus = async (memberId: string, currentStatus: string | undefined) => {
  //   const effectiveStatus = currentStatus || 'ACTIVE';

  //   // 1. Determine the new string and the corresponding Database ID
  //   const isCurrentlyActive = effectiveStatus === 'ACTIVE';
  //   const newStatusString = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';
  //   const newStatusId = isCurrentlyActive ? 2 : 1; // 1 for active, 2 for inactive/blocked

  //   try {
  //     // 2. Send the ID to the API (check if your API expects statusId)
  //     await updateMember(memberId, { statusId: newStatusId });

  //     // 3. Update the local UI state using the strings your component expects
  //     setMembers(prev =>
  //       prev.map(m =>
  //         m.id === memberId
  //           ? { ...m, status: newStatusString as 'ACTIVE' | 'BLOCKED' }
  //           : m
  //       )
  //     );
  //   } catch (err) {
  //     alert("فشل تحديث الحالة في قاعدة البيانات");
  //     console.error(err);
  //   }
  // };


  // const handleToggleStatus = async (member: Member) => {
  //   // 1. Get the User ID from the member object
  //   const userId = member.user?.id;

  //   if (!userId) {
  //     alert("This member has no associated user account.");
  //     return;
  //   }

  //   // 2. Determine the status (Default to ACTIVE if undefined)
  //   const isCurrentlyActive = (member.status || 'ACTIVE') === 'ACTIVE';

  //   // 3. Map to your DB IDs (1: active, 2: inactive)
  //   const newStatusId = isCurrentlyActive ? 2 : 1;
  //   const newStatusString = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';

  //   try {
  //     // 4. Call the USER update endpoint with the required DTO structure
  //     await updateUser(userId, {
  //       status: {
  //         id: newStatusId
  //       }
  //     });

  //     // 5. Update local UI state
  //     setMembers(prev =>
  //       prev.map(m =>
  //         m.id === member.id
  //           ? { ...m, status: newStatusString as 'ACTIVE' | 'BLOCKED' }
  //           : m
  //       )
  //     );
  //   } catch (err) {
  //     console.error("Update failed:", err);
  //     alert("فشل تحديث الحالة في قاعدة البيانات");
  //   }
  // };


//   const handleToggleStatus = async (member: Member) => {
//   // Check where the ID is stored. Is it member.user.id or member.user?
//   // Based on your UserEntity, it's a number.
//   const userId = member.user?.id;
  
//   console.log("Attempting to update User ID:", userId); // Debugging

//   if (!userId) {
//     alert("This member does not have a linked User ID.");
//     return;
//   }

//   const isCurrentlyActive = (member.status || 'ACTIVE') === 'ACTIVE';
//   const newStatusId = isCurrentlyActive ? 2 : 1; 
//   const newStatusString = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';

//   try {
//     await updateUser(userId, { 
//       status: { 
//         id: newStatusId 
//       } 
//     });

//     setMembers(prev =>
//       prev.map(m =>
//         m.id === member.id
//           ? { ...m, status: newStatusString as 'ACTIVE' | 'BLOCKED' }
//           : m
//       )
//     );
//   } catch (err: any) {
//     console.error("Update Error:", err.response?.data || err.message);
//     alert(err.response?.status === 403 ? "You don't have permission (Admin only)" : "فشل تحديث الحالة");
//   }
// };



// const handleToggleStatus = async (member: Member) => {
//   // 1. Ensure we have a valid User ID and convert it to a Number
//   const userId = member.user?.id ? Number(member.user.id) : null;

//   if (!userId || isNaN(userId)) {
//     console.error("Invalid or Missing User ID:", member.user?.id);
//     alert("لا يمكن العثور على معرف المستخدم المرتبط");
//     return;
//   }

//   // 2. Logic: Default to 'ACTIVE' (ID: 1). If ACTIVE, switch to 'BLOCKED' (ID: 2).
//   const isCurrentlyActive = (member.status || 'ACTIVE') === 'ACTIVE';
//   const newStatusId = isCurrentlyActive ? 2 : 1; 
//   const newStatusString = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';

//   try {
//     // 3. Call the specific User update endpoint
//     await updateUser(userId, { 
//       status: { 
//         id: newStatusId 
//       } 
//     });

//     // 4. Update local state for immediate UI feedback
//     setMembers(prev =>
//       prev.map(m =>
//         m.id === member.id
//           ? { ...m, status: newStatusString as 'ACTIVE' | 'BLOCKED' }
//           : m
//       )
//     );
//   } catch (err: any) {
//     // Log the EXACT error from the backend to the browser console
//     console.error("Backend Error Details:", err.response?.data);
    
//     const errorMessage = err.response?.data?.errors?.status || "فشل تحديث الحالة";
//     alert(errorMessage);
//   }
// };


// const handleToggleStatus = async (member: Member) => {
//   // 1. Check if the user object exists at all
//   if (!member.user) {
//     console.error("Member object is missing the user relation:", member);
//     alert("هذا العضو ليس لديه حساب مستخدم مرتبط");
//     return;
//   }

//   const userId = Number(member.user.id);

//   if (!userId || isNaN(userId)) {
//     console.error("User ID is invalid:", member.user.id);
//     alert("معرف المستخدم غير صالح");
//     return;
//   }

//   const isCurrentlyActive = (member.status || 'ACTIVE') === 'ACTIVE';
//   const newStatusId = isCurrentlyActive ? 2 : 1; 
//   const newStatusString = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';

//   try {
//     // 2. Perform the update
//     await updateUser(userId, { 
//       status: { id: newStatusId } 
//     });

//     // 3. Update UI
//     setMembers(prev =>
//       prev.map(m =>
//         m.id === member.id ? { ...m, status: newStatusString as 'ACTIVE' | 'BLOCKED' } : m
//       )
//     );
//   } catch (err: any) {
//     // This structure prevents the crash even if err.response is missing
//     const status = err.response?.status;
//     const errorData = err.response?.data;
    
//     console.error("Request Failed:", {
//       status,
//       data: errorData,
//       message: err.message
//     });

//     if (status === 401) alert("انتهت الجلسة، يرجى تسجيل الدخول");
//     else if (status === 403) alert("ليس لديك صلاحية المسؤول (Admin)");
//     else alert("فشل الاتصال بالخادم - تحقق من الكونسول");
//   }
// };

// const handleToggleStatus = async (member: Member) => {
//   // 1. Check if the user object exists at all
//   if (!member.user) {
//     console.error("Member object is missing the user relation:", member);
//     alert("هذا العضو ليس لديه حساب مستخدم مرتبط");
//     return;
//   }

//   const userId = Number(member.user.id);

//   if (!userId || isNaN(userId)) {
//     console.error("User ID is invalid:", member.user.id);
//     alert("معرف المستخدم غير صالح");
//     return;
//   }

//   const isCurrentlyActive = (member.status || 'ACTIVE') === 'ACTIVE';
//   const newStatusId = isCurrentlyActive ? 2 : 1; 
//   const newStatusString = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';

//   try {
//     // 2. Perform the update
//     await updateUser(userId, { 
//       status: { id: newStatusId } 
//     });

//     // 3. Update UI
//     setMembers(prev =>
//       prev.map(m =>
//         m.id === member.id ? { ...m, status: newStatusString as 'ACTIVE' | 'BLOCKED' } : m
//       )
//     );
//   } catch (err: any) {
//     // This structure prevents the crash even if err.response is missing
//     const status = err.response?.status;
//     const errorData = err.response?.data;
    
//     console.error("Request Failed:", {
//       status,
//       data: errorData,
//       message: err.message
//     });

//     if (status === 401) alert("انتهت الجلسة، يرجى تسجيل الدخول");
//     else if (status === 403) alert("ليس لديك صلاحية المسؤول (Admin)");
//     else alert("فشل الاتصال بالخادم - تحقق من الكونسول");
//   }
// };

const handleToggleStatus = async (member: Member) => {
  // 1. Validate User Presence
  if (!member.user?.id) {
    alert("This member has no associated user account ID.");
    return;
  }

  const userId = Number(member.user.id);
  const isCurrentlyActive = (member.status || 'ACTIVE') === 'ACTIVE';
  const newStatusId = isCurrentlyActive ? 2 : 1; 
  const newStatusString = isCurrentlyActive ? 'BLOCKED' : 'ACTIVE';

  try {
    // 2. The API Call
    await updateUser(userId, { 
      status: { id: newStatusId } 
    });

    // 3. Success: Update UI
    setMembers(prev =>
      prev.map(m =>
        m.id === member.id ? { ...m, status: newStatusString as 'ACTIVE' | 'BLOCKED' } : m
      )
    );
  } catch (err: any) {
    // 4. Safe Logging to prevent crashes
    console.error("Full Error Object:", err);

    if (err.response) {
      // The server responded with a status code outside the 2xx range
      console.log("Server Error Data:", err.response.data);
      console.log("Server Error Status:", err.response.status);
      alert(`Server Error: ${err.response.status}`);
    } else if (err.request) {
      // The request was made but no response was received (CORS or Network Down)
      console.log("No response received. Check CORS or Backend URL.");
      alert("No response from server. Is the backend running?");
    } else {
      // Something happened in setting up the request
      console.log("Request Setup Error:", err.message);
      alert(err.message);
    }
  }
};


  const handleDelete = async () => {
    if (!selectedMember) return;
    try {
      await deleteMember(selectedMember.id);
      setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
      <p className="font-bold text-indigo-600 text-lg uppercase tracking-widest">Loading Professionals...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600 to-violet-700 -z-10 clip-path-slant" />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-end mb-12">
          <div className="text-black">
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
            const suffix = isAr ? 'Ar' : '';

            // تحديد الاسم المعروض بناءً على النوع واللغة
            const displayName = member.typeMember === 'ENTERPRISE'
              ? (member.entreprise?.[`name${suffix}` as keyof typeof member.entreprise])
              : `${member.contact?.[`firstName${suffix}` as keyof typeof member.contact]} ${member.contact?.[`lastName${suffix}` as keyof typeof member.contact]}`;

            const cityName = member.contact?.address?.city ? member.contact.address.city[isAr ? 'nameAr' : 'nameFr'] : "---";
            const displayEmail = member.contact?.email || member.user?.email || "---";

            // رابط الصورة الشخصية من جدول User المرتبط
            const profilePic = member.user?.photo?.path ? `${API_BASE_URL}${member.user.photo.path}` : null;

            return (
              <div key={member.id} className={`bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-200/60 group transition-all duration-500 hover:shadow-2xl ${member.status === 'BLOCKED' ? 'grayscale opacity-75' : ''}`}>

                <div className="relative h-36 w-full rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 mb-12 p-6">
                  <div className="flex justify-between items-center h-full">
                    <div className="relative">
                      {profilePic ? (
                        <div className="relative w-24 h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                          <Image src={profilePic} alt="Profile" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-3xl bg-white border-4 border-white flex items-center justify-center text-indigo-600 text-3xl font-black shadow-lg">
                          {member.typeMember === 'ENTERPRISE' ? <Building2 size={40} /> : displayName?.toString().charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>

                    <div className={`${isAr ? 'text-left' : 'text-right'} text-white max-w-[180px]`}>
                      <h3 className="text-lg font-black leading-tight truncate">{displayName}</h3>
                      <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-lg bg-white/20 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                        {member.typeMember === 'ENTERPRISE' ? <Building2 size={10} /> : <UserIcon size={10} />}
                        {member.typeMember}
                      </span>
                    </div>
                  </div>

                  {/* <div className="absolute -top-1 -right-1 flex gap-1 p-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleToggleStatus(member.id, member.status)} className={`p-2 rounded-xl backdrop-blur-md text-white transition-colors ${member.status === 'ACTIVE' ? 'bg-white/10 hover:bg-orange-500' : 'bg-red-500 hover:bg-emerald-500'}`}>
                      {member.status === 'ACTIVE' ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                    <button onClick={() => { setSelectedMember(member); setIsDeleteModalOpen(true); }} className="p-2 bg-white/10 backdrop-blur-md hover:bg-red-600 text-white rounded-xl">
                      <Trash2 size={16} />
                    </button>
                  </div> */}
                  <div className="absolute -top-1 -right-1 flex gap-1 p-4 opacity-0 group-hover:opacity-100 transition-all">
                    {/* <button
                      onClick={() => handleToggleStatus(member.id, member.status)}
                      className={`p-2 rounded-xl backdrop-blur-md text-white transition-colors 
                      ${(member.status || 'ACTIVE') === 'ACTIVE'
                          ? 'bg-white/10 hover:bg-orange-500' // State: Active
                          : 'bg-red-500 hover:bg-emerald-500' // State: Blocked
                        }`}
                    >
                      {(member.status || 'ACTIVE') === 'ACTIVE' ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                    <button onClick={() => { setSelectedMember(member); setIsDeleteModalOpen(true); }} className="p-2 bg-white/10 backdrop-blur-md hover:bg-red-600 text-white rounded-xl">
                      <Trash2 size={16} />
                    </button> */}

                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`p-2 rounded-xl backdrop-blur-md text-white transition-colors 
                    ${(member.status || 'ACTIVE') === 'ACTIVE'
                          ? 'bg-white/10 hover:bg-orange-500'
                          : 'bg-red-500 hover:bg-emerald-500'}`}
                    >
                      {(member.status || 'ACTIVE') === 'ACTIVE' ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                     <button onClick={() => { setSelectedMember(member); setIsDeleteModalOpen(true); }} className="p-2 bg-white/10 backdrop-blur-md hover:bg-red-600 text-white rounded-xl">
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>

                <div className="px-6 pb-6">
                  <div className="grid gap-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Mail size={16} className="shrink-0 text-indigo-400" />
                      <span className="text-sm truncate font-medium">{displayEmail}</span>
                    </div>
                     <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={16} className="shrink-0 text-indigo-400" />
                      <span className="text-sm font-medium">{member.contact?.phoneCell || "---"}</span>
                    </div> 

                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={16} className="shrink-0 text-indigo-400" />
                      <span className="text-sm font-medium">{member.contact?.phoneGround || "---"}</span>
                    </div> 

                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'المدينة' : 'City'}</p>
                        <p className="text-sm font-bold text-slate-700">{cityName}</p>
                      </div>
                    </div>

                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm 
                      ${(member.status || 'ACTIVE') === 'ACTIVE'
                        ? 'bg-white text-indigo-600'
                        : 'bg-red-600 text-white'}`}>
                      {member.status || 'ACTIVE'}
                    </div>

                    {/* <div className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm 
                        *:${(member.status || 'ACTIVE') === 'ACTIVE' ? 'bg-white text-indigo-600' : 'bg-red-600 text-white'}`}>
                      {member.status || 'ACTIVE'}
                    </div> */}
                    {/* <div className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm ${member.status === 'ACTIVE' ? 'bg-white text-indigo-600' : 'bg-red-600 text-white'}`}>
                      {member.status}
                    </div> */}
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
        onConfirm={handleDelete} // دالة الحذف موجودة في الكود الأصلي
        title={selectedMember?.typeMember === 'ENTERPRISE' ? selectedMember.entreprise?.nameFr || "" : "Member"}
      />
      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMembersData} />

      <style jsx>{`.clip-path-slant { clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%); }`}</style>
    </div>
  );
}