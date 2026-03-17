"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddMemberModal from "@/components/AddMemberModal";
import {
  Trash2, UserPlus, MapPin, Phone,
  Mail, Lock, Unlock
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface Member {
  id: number;
  cin: string;
  businessType: string;
  phone: string;
  address: string;
  city: string;
  status: 'ACTIVE' | 'BLOCKED'; // Explicit type
  cinFront?: string;
  cinBack?: string;
  userId: string;
  user: {
    name: string;
    email: string;
    picture?: string;
    role: string;
  };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const router = useRouter();
  const { t } = useTranslation();

  const fetchMembers = async () => {
    try {
      const response = await fetch("http://localhost:3001/members", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.status === 401) return router.push("/sign-in");

      const data = await response.json();



      // Fix: Ensure data is an array before setting state
      if (data && Array.isArray(data)) {
        setMembers(data);
      } else {
        console.error("Expected array but got:", data);
        setMembers([]); // Force it to be an empty array so .map() doesn't fail
      }
    } catch (err) {
      console.error("Failed to load members.", err);
      setMembers([]); // Ensure state remains an array on network error
    } finally {
      setLoading(false);
    }
  };

  // const fetchMembers = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3001/members", {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //     });
  //     if (response.status === 401) return router.push("/sign-in");
  //     const data = await response.json();
  //     setMembers(data);
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (err) {
  //     console.error("Failed to load members.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    try {
      const response = await fetch(`http://localhost:3001/members/${selectedMember.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Status Toggle Logic
  const handleToggleStatus = async (memberId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      const response = await fetch(`http://localhost:3001/members/${memberId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (response.ok) {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Status update failed");
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600 to-violet-700 -z-10 clip-path-slant" />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-end mb-12">
          <h1 className="text-4xl font-black text-black tracking-tight">{t("members.pros")}</h1>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold shadow-xl">
            <UserPlus size={20} />
            <span>{t("members.add_member")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(members) && members.map((member) => (
            <div key={member.id} className={`bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-200/60 group transition-all duration-500 ${member.status === 'BLOCKED' ? 'grayscale opacity-75' : ''}`}>

              <div className="relative h-36 w-full rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 mb-12 p-6">
                <div className="flex justify-between items-center h-full">
                  <div className="relative">
                    {member.user?.picture ? (
                      <Image src={`http://localhost:3001${member.user.picture}`} alt="Profile" width={96} height={96} className="rounded-3xl border-4 border-white shadow-2xl bg-white" />
                    ) : (
                      <div className="h-24 w-24 rounded-3xl bg-white border-4 border-white flex items-center justify-center text-indigo-600 text-3xl font-black">
                        {member.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>

                  <div className="text-right text-white">
                    <h3 className="text-xl font-black leading-tight">{member.user?.name}</h3>
                    <span className="inline-block mt-1 px-3 py-1 rounded-lg bg-white/20 text-[10px] font-bold uppercase tracking-widest">{member.businessType}</span>
                  </div>
                </div>

                {/* Floating Actions */}
                <div className="absolute -top-1 -right-1 flex gap-1 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleToggleStatus(member.id, member.status)} className={`p-2 rounded-xl backdrop-blur-md text-white transition-colors ${member.status === 'ACTIVE' ? 'bg-white/10 hover:bg-red-500' : 'bg-red-500 hover:bg-emerald-500'}`}>
                    {member.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  <button onClick={() => { setSelectedMember(member); setIsDeleteModalOpen(true); }} className="p-2 bg-white/10 backdrop-blur-md hover:bg-red-500 text-white rounded-xl">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="grid gap-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500"><Mail size={16} /><span className="text-sm truncate">{member.user?.email}</span></div>
                  <div className="flex items-center gap-3 text-slate-500"><Phone size={16} /><span className="text-sm">{member.phone}</span></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3"><MapPin size={18} className="text-indigo-500" /><div><p className="text-[10px] font-black text-slate-400 uppercase">City</p><p className="text-sm font-bold text-slate-700">{member.city}</p></div></div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm ${member.status === 'ACTIVE' ? 'bg-white text-indigo-600' : 'bg-red-600 text-white'}`}>
                    {member.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title={selectedMember?.user.name || ""} />
      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMembers} />

      <style jsx>{`.clip-path-slant { clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%); }`}</style>
    </div>
  );
}