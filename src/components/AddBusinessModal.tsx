"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, CheckCircle2, Music, Video, FileStack, Globe, MessageSquare, ShieldCheck } from "lucide-react";
import { api, createBusiness } from "@/services/businesses-api";
import { uploadFile } from "@/services/members-api";

export default function AddBusinessModal({ isOpen, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [services, setServices] = useState([]);
    const [contacts, setContacts] = useState([]);

    const [formData, setFormData] = useState({
        nameFr: "", nameAr: "", nameEn: "",
        descrFr: "", descrAr: "", descrEn: "",
        socialMedia: "", businessUrlSite: "",
        ownerId: "", managerId: "",
        serviceId: "",
        contactId: ""
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        flyer: null, 
        audioAr: null, audioFr: null, audioEn: null,
        videoAr: null, videoFr: null, videoEn: null
    });

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                api.get('/v1/members'),
                api.get('/v1/services'),
                api.get('/v1/contacts')
            ]).then(([m, s, c]) => {
                setMembers(m.data?.data || m.data || []);
                setServices(s.data?.data || s.data || []);
                setContacts(c.data?.data || c.data || []);
            }).catch(err => {
                console.error("Error loading modal relations:", err.response?.data || err.message);
            });
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles({ ...files, [e.target.name]: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.flyer) {
            alert("Please upload a flyer image.");
            return;
        }
        setLoading(true);

        try {
            const uploadedFiles: any = {};
            const uploadPromises = Object.entries(files).map(async ([key, file]) => {
                if (file) {
                    const res = await uploadFile(file);
                    if (res && res.id) uploadedFiles[key] = { id: res.id };
                }
            });
            await Promise.all(uploadPromises);

            const payload = {
                ...formData,
                owner: formData.ownerId ? { id: formData.ownerId } : undefined,
                manager: { id: formData.managerId || formData.ownerId },
                contact: formData.contactId ? { id: formData.contactId } : undefined,
                service: formData.serviceId ? { id: formData.serviceId } : undefined,
                ...uploadedFiles,
            };

            await createBusiness(payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            const backendErrors = err.response?.data?.message;
            alert(Array.isArray(backendErrors) ? backendErrors.join("\n") : "Error creating business");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh]">
                
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-[2.5rem]">
                    <div>
                        <h2 className="text-2xl font-black text-indigo-900">NEW LISTING</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Business & Professional Directory</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-red-500"><X size={24}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                    
                    {/* 1. IDENTITY & CATEGORY */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                            <ShieldCheck className="text-indigo-600" size={20}/>
                            <h3 className="font-black text-slate-800 uppercase text-sm">Identity & Classification</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input name="nameFr" placeholder="Nom du Business (FR)" className="input-style" onChange={handleInputChange} required />
                            <input name="nameEn" placeholder="Business Name (EN)" className="input-style" onChange={handleInputChange} />
                            <input name="nameAr" placeholder="اسم العمل التجاري (AR)" dir="rtl" className="input-style text-right font-bold" onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select name="serviceId" className="input-style" required value={formData.serviceId} onChange={handleInputChange}>
                                <option value="">Select Service Specialty</option>
                                {services.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.nameFr || s.nameAr || s.id}</option>
                                ))}
                            </select>
                            <select name="contactId" className="input-style" required value={formData.contactId} onChange={handleInputChange}>
                                <option value="">Link Physical Address / Contact</option>
                                {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 2. DESCRIPTIONS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                            <MessageSquare className="text-indigo-600" size={20}/>
                            <h3 className="font-black text-slate-800 uppercase text-sm">Descriptions & Bios</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <textarea name="descrFr" placeholder="Description détaillée (FR)" className="input-style min-h-[100px]" onChange={handleInputChange} />
                            <textarea name="descrAr" placeholder="وصف مفصل (AR)" dir="rtl" className="input-style min-h-[100px] text-right" onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* 3. OWNERSHIP & LINKS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                            <Globe className="text-indigo-600" size={20}/>
                            <h3 className="font-black text-slate-800 uppercase text-sm">Ownership & Social Presence</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select name="ownerId" className="input-style" required value={formData.ownerId} onChange={handleInputChange}>
                                <option value="">Select Legal Owner</option>
                                {members.map((m: any) => <option key={m.id} value={m.id}>{m.user?.firstName || 'User'} - {m.user?.email}</option>)}
                            </select>
                            <input name="businessUrlSite" placeholder="Website URL (https://...)" className="input-style" onChange={handleInputChange} />
                        </div>
                        <input name="socialMedia" placeholder="Social Media Links (FB, IG, etc.)" className="input-style" onChange={handleInputChange} />
                    </div>

                    {/* 4. MULTIMEDIA ASSETS */}
                    <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                            <FileStack className="text-indigo-600" size={20}/>
                            <h3 className="font-black text-slate-800 uppercase text-sm">Multimedia Content</h3>
                        </div>
                        
                        {/* Flyer Primary */}
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><FileStack size={24}/></div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-700 uppercase">Flyer / Cover Image *</p>
                                <input type="file" name="flyer" onChange={handleFileChange} className="text-xs mt-1" accept="image/*" />
                            </div>
                        </div>

                        {/* Audios */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Ar', 'Fr', 'En'].map(lang => (
                                <div key={lang} className="bg-white p-4 rounded-2xl border border-slate-200">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Audio Bio ({lang})</p>
                                    <input type="file" name={`audio${lang}`} onChange={handleFileChange} className="text-[10px] w-full" accept="audio/*" />
                                </div>
                            ))}
                        </div>

                        {/* Videos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Ar', 'Fr', 'En'].map(lang => (
                                <div key={lang} className="bg-white p-4 rounded-2xl border border-slate-200">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Video Promo ({lang})</p>
                                    <input type="file" name={`video${lang}`} onChange={handleFileChange} className="text-[10px] w-full" accept="video/*" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-colors">DISCARD</button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
                            {loading ? "PROCESSING..." : <><CheckCircle2 size={20} /> PUBLISH BUSINESS</>}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .input-style {
                    width: 100%;
                    padding: 0.9rem 1.2rem;
                    border: 2px solid #f1f5f9;
                    border-radius: 1.25rem;
                    background: #fff;
                    outline: none;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    color: #1e293b;
                }
                .input-style:focus { border-color: #6366f1; background: #fafbff; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}