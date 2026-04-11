"use client";

import React, { useState, useEffect } from "react";
import { X, Smartphone, Home, Building2, User, Mail, Upload, Globe, CheckCircle2, MapPin } from "lucide-react";
import Image from "next/image";
import { uploadFile, createMember, api } from "@/services/members-api"; // Ensure api is exported or use axios

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [memberType, setMemberType] = useState<'INDIVIDUAL' | 'ENTERPRISE'>('INDIVIDUAL');
  
  // State for Dynamic Data from DB
  const [cities, setCities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", firstNameAr: "", lastNameAr: "",
    email: "", phoneCell: "", phoneGround: "", 
    lineAddressFr: "", lineAddressAr: "",
    entrepriseNameAr: "", entrepriseNameFr: "", entrepriseNameEn: "",
    cityId: "", 
    countryId: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    picture: null,
  });

  // 1. Fetch real Geography Data when Modal opens
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const [citiesRes, countriesRes] = await Promise.all([
          api.get('/v1/cities'),
          api.get('/v1/countries')
        ]);
        
        const cityList = citiesRes.data?.data || citiesRes.data;
        const countryList = countriesRes.data?.data || countriesRes.data;

        setCities(cityList);
        setCountries(countryList);

        // Auto-select first items to avoid empty UUIDs
        if (cityList.length > 0 || countryList.length > 0) {
          setFormData(prev => ({
            ...prev,
            cityId: cityList[0]?.id || "",
            countryId: countryList[0]?.id || ""
          }));
        }
      } catch (err) {
        console.error("Error loading geography data:", err);
      }
    };

    if (isOpen) {
      fetchGeoData();
    } else {
      // Reset form on close
      setFormData({
        firstName: "", lastName: "", firstNameAr: "", lastNameAr: "",
        email: "", phoneCell: "", phoneGround: "",
        lineAddressFr: "", lineAddressAr: "",
        entrepriseNameAr: "", entrepriseNameFr: "", entrepriseNameEn: "",
        cityId: "", countryId: ""
      });
      setFiles({ picture: null });
      Object.values(previews).forEach(url => URL.revokeObjectURL(url));
      setPreviews({});
    }
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
    if (!formData.cityId || formData.cityId === "1") {
      alert("Please select a valid city.");
      return;
    }
    
    setLoading(true);

    try {
      let photoId = null;

      // 1. Upload Avatar
      if (files.picture) {
        const uploadRes = await uploadFile(files.picture);
        photoId = uploadRes.id;
      }

      // 2. Construct Payload mirroring the DTO
      // const payload = {
      //   typeMember: memberType,
      //   user: {
      //     email: formData.email,
      //     id: photoId, 
      //   },
      //   contact: {
      //     firstName: formData.firstName,
      //     lastName: formData.lastName,
      //     firstNameAr: formData.firstNameAr,
      //     lastNameAr: formData.lastNameAr,
      //     email: formData.email,
      //     phoneCell: Number(formData.phoneCell), // Convert string to number for @IsNumber()
      //     address: {
      //       lineAddressFr: formData.lineAddressFr,
      //       lineAddressAr: formData.lineAddressAr,
      //       city: { id: formData.cityId },    // Send as object with ID
      //       country: { id: formData.countryId }, // Send as object with ID
      //     }
      //   },
      //   ...(memberType === 'ENTERPRISE' && {
      //     entreprise: {
      //       nameAr: formData.entrepriseNameAr,
      //       nameFr: formData.entrepriseNameFr,
      //       nameEn: formData.entrepriseNameEn || formData.entrepriseNameFr,
      //     }
      //   })
      // };

      // Inside AddMemberModal.tsx -> handleSubmit

const payload = {
  typeMember: memberType,
  user: {
    email: formData.email,
    // Change 'id: photoId' to 'photo: { id: photoId }'
    // This allows the backend to create a User and link it to a FileEntity
    photo: photoId ? { id: photoId } : null, 
  },
  contact: {
    firstName: formData.firstName,
    lastName: formData.lastName,
    firstNameAr: formData.firstNameAr,
    lastNameAr: formData.lastNameAr,
    email: formData.email,
    phoneCell: Number(formData.phoneCell),
    phoneGround: Number(formData.phoneGround),
    address: {
      lineAddressFr: formData.lineAddressFr,
      lineAddressAr: formData.lineAddressAr,
      city: { id: formData.cityId },
      country: { id: formData.countryId },
    }
  },
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
      const msg = err.response?.data?.message || "Check console for errors";
      alert(Array.isArray(msg) ? msg.join("\n") : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Add New {memberType}</h2>
            <p className="text-xs text-gray-500 font-medium">Linked to Contact, User, and Address records</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-black"><X size={20} /></button>
        </div>

        {/* Member Type Toggle */}
        <div className="flex p-1 bg-slate-100 mx-8 mt-6 rounded-2xl">
          <button type="button" onClick={() => setMemberType('INDIVIDUAL')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${memberType === 'INDIVIDUAL' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><User size={16} /> INDIVIDUAL</button>
          <button type="button" onClick={() => setMemberType('ENTERPRISE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${memberType === 'ENTERPRISE' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><Building2 size={16} /> ENTERPRISE</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          
          {memberType === 'ENTERPRISE' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Enterprise Info</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="entrepriseNameFr" required placeholder="Company Name (FR)" value={formData.entrepriseNameFr} onChange={handleInputChange} className="input-style" />
                <input name="entrepriseNameAr" required placeholder="اسم الشركة" dir="rtl" value={formData.entrepriseNameAr} onChange={handleInputChange} className="input-style text-right" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Contact Identity</label>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 shrink-0 overflow-hidden">
                {previews.picture ? <Image src={previews.picture} alt="Avatar" fill className="object-cover" unoptimized /> : <div className="flex flex-col items-center justify-center h-full text-gray-300"><Upload size={20} /><span className="text-[8px] font-bold mt-1 uppercase">Avatar</span></div>}
                <input type="file" name="picture" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <input name="firstName" required placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="input-style" />
                <input name="firstNameAr" required placeholder="الإسم الشخصي" dir="rtl" value={formData.firstNameAr} onChange={handleInputChange} className="input-style text-right" />
                <input name="lastName" required placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="input-style" />
                <input name="lastNameAr" required placeholder="الإسم العائلي" dir="rtl" value={formData.lastNameAr} onChange={handleInputChange} className="input-style text-right" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Location & Contact</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                {/* <Mail className="absolute left-3 top-3.5 text-slate-400" size={16} /> */}
                <input name="email" type="email" required placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="input-style pl-10" />
                </div>
              <div className="relative">
                {/* <Smartphone className="absolute left-3 top-3.5 text-slate-400" size={16} /> */}
                <input name="phoneCell" required placeholder="Mobile Number" value={formData.phoneCell} onChange={handleInputChange} className="input-style pl-10" />
              </div>

              <div className="relative">
                {/* <Smartphone className="absolute left-3 top-3.5 text-slate-400" size={16} /> */}
                <input name="phoneGround" required placeholder="Phone Number" value={formData.phoneGround} onChange={handleInputChange} className="input-style pl-10" />
              </div>
              
              <div className="relative">
                {/* <MapPin className="absolute left-3 top-3.5 text-slate-400" size={16} /> */}
                <select name="cityId" value={formData.cityId} onChange={handleInputChange} required className="input-style pl-10 appearance-none">
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.nameFr} ({c.nameAr})</option>)}
                </select>
              </div>
              <div className="relative">
                {/* <Globe className="absolute left-3 top-3.5 text-slate-400" size={16} /> */}
                <select name="countryId" value={formData.countryId} onChange={handleInputChange} required className="input-style pl-10 appearance-none">
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
                </select>
              </div>

              <div className="col-span-full space-y-3">
                <input name="lineAddressFr" required placeholder="Address (FR)" value={formData.lineAddressFr} onChange={handleInputChange} className="input-style" />
                <input name="lineAddressAr" required placeholder="العنوان بالكامل" dir="rtl" value={formData.lineAddressAr} onChange={handleInputChange} className="input-style text-right" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border text-slate-500 font-bold text-xs uppercase hover:bg-slate-50 transition-all">Discard</button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase shadow-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all">
              {loading ? "Saving..." : <><CheckCircle2 size={16} /> Register Member</>}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.8rem;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-style:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}