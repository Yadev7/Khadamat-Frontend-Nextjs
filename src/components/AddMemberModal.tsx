"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, CheckCircle2, User, Building2, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadFile, createMember, api } from "@/api/members-api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [memberType, setMemberType] = useState<'INDIVIDUAL' | 'ENTERPRISE'>('INDIVIDUAL');
  const [cities, setCities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", firstNameAr: "", lastNameAr: "",
    email: "", phoneCell: "", phoneGround: "",
    lineAddressFr: "", lineAddressAr: "",
    entrepriseNameAr: "", entrepriseNameFr: "", entrepriseNameEn: "",
    cityId: "", countryId: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({ picture: null });

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const [citiesRes, countriesRes] = await Promise.all([
          api.get('/v1/cities'),
          api.get('/v1/countries')
        ]);
        setCities(citiesRes.data?.data || citiesRes.data || []);
        setCountries(countriesRes.data?.data || countriesRes.data || []);
      } catch (err) {
        console.error("Error loading geography data:", err);
      }
    };

    if (isOpen) fetchGeoData();
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const fieldName = e.target.name;
      if (previews[fieldName]) URL.revokeObjectURL(previews[fieldName]);
      setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
      setFiles(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoId = null;
      if (files.picture) {
        const uploadRes = await uploadFile(files.picture);
        photoId = uploadRes.id;
      }

      const payload = {
        typeMember: memberType,
        user: {
          email: formData.email,
          photo: photoId ? { id: photoId } : null,
        },
        contact: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          firstNameAr: formData.firstNameAr,
          lastNameAr: formData.lastNameAr,
          email: formData.email,
          phoneCell: String(formData.phoneCell), // Must be String
          phoneGround: String(formData.phoneGround), // Must be String
          address: {
            lineAddressFr: formData.lineAddressFr,
            lineAddressAr: formData.lineAddressAr,
            city: { id: formData.cityId },
            country: { id: formData.countryId },
          }
        },
        // DO NOT send entreprise: null if it's an individual. 
        // Only include the key if the type is ENTERPRISE.
        ...(memberType === 'ENTERPRISE' && {
          entreprise: {
            nameAr: formData.entrepriseNameAr,
            nameFr: formData.entrepriseNameFr,
            nameEn: formData.entrepriseNameEn || formData.entrepriseNameFr,
          }
        })
      };

      await createMember(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      // BETTER ERROR LOGGING: This helps find exactly what field failed
      const responseData = err.response?.data;
      console.error("Backend Validation Error Details:", responseData);

      // Extract message (NestJS usually puts it in response.data.message as string or array)
      const errorMsg = responseData?.message || responseData?.errors || "Validation Failed";

      alert(Array.isArray(errorMsg) ? errorMsg.join("\n") : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase">Register {memberType}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Member Directory</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition text-slate-400 hover:text-red-500"><X size={20} /></button>
        </div>

        {/* Member Type Toggle */}
        <div className="flex p-1 bg-slate-100 mx-8 mt-6 rounded-2xl border border-slate-200">
          <button type="button" onClick={() => setMemberType('INDIVIDUAL')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${memberType === 'INDIVIDUAL' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><User size={16} /> INDIVIDUAL</button>
          <button type="button" onClick={() => setMemberType('ENTERPRISE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${memberType === 'ENTERPRISE' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><Building2 size={16} /> ENTERPRISE</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

          {memberType === 'ENTERPRISE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <input name="entrepriseNameFr" required placeholder="Company Name (FR)" value={formData.entrepriseNameFr} onChange={handleInputChange} className="input-style" />
              <input name="entrepriseNameAr" required placeholder="اسم الشركة" dir="rtl" value={formData.entrepriseNameAr} onChange={handleInputChange} className="input-style text-right" />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative h-28 w-28 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 shrink-0 overflow-hidden group">
              {previews.picture ? (
                <Image src={previews.picture} alt="Avatar" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <Upload size={24} />
                  <span className="text-[8px] font-black mt-2 uppercase tracking-tighter">Avatar</span>
                </div>
              )}
              <input type="file" name="picture" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <input name="firstName" required placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="input-style" />
              <input name="firstNameAr" required placeholder="الإسم الشخصي" dir="rtl" value={formData.firstNameAr} onChange={handleInputChange} className="input-style text-right font-bold" />
              <input name="lastName" required placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="input-style" />
              <input name="lastNameAr" required placeholder="الإسم العائلي" dir="rtl" value={formData.lastNameAr} onChange={handleInputChange} className="input-style text-right font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="email" type="email" required placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="input-style" />
            <input name="phoneCell" required placeholder="Mobile Number" value={formData.phoneCell} onChange={handleInputChange} className="input-style" />
            <input name="phoneGround" placeholder="Phone Number" value={formData.phoneGround} onChange={handleInputChange} className="input-style" />

            <select name="countryId" value={formData.countryId} onChange={handleInputChange} required className="input-style">
              <option value="">Select Country</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
            </select>

            <select name="cityId" value={formData.cityId} onChange={handleInputChange} required className="input-style">
              <option value="">Select City</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.nameFr} ({c.nameAr})</option>)}
            </select>

            <div className="col-span-full space-y-3">
              <input name="lineAddressFr" required placeholder="Address (FR)" value={formData.lineAddressFr} onChange={handleInputChange} className="input-style" />
              <input name="lineAddressAr" required placeholder="العنوان بالكامل (AR)" dir="rtl" value={formData.lineAddressAr} onChange={handleInputChange} className="input-style text-right" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-50 transition-all">Discard</button>
            <button type="submit" disabled={loading} className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase shadow-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              {loading ? "Saving..." : "Register Member"}
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
          font-size: 0.85rem;
          outline: none;
          transition: all 0.2s;
          background: #fff;
        }
        .input-style:focus {
          border-color: #6366f1;
          background: #fafbff;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}