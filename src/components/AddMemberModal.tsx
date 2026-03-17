"use client";

import React, { useState, useEffect } from "react";
import { X, Smartphone, Home, Briefcase, IdCard, MapPin, CheckCircle2, User, Mail, Upload } from "lucide-react";
import Image from "next/image";
import { City } from "@/constants/cities";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cin: "",
    businessType: "",
    phone: "",
    address: "",
    city: City.Casablanca,
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    picture: null,
    cinFront: null,
    cinBack: null,
  });

  // --- منطق تفريغ البيانات عند إغلاق المودال ---
  useEffect(() => {
    // نقوم بالتفريغ فقط عندما تتغير حالة isOpen من true إلى false
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        cin: "",
        businessType: "",
        phone: "",
        address: "",
        city: City.Casablanca, // تأكد من استخدام القيمة من الـ Enum المحلي
      });

      setFiles({
        picture: null,
        cinFront: null,
        cinBack: null,
      });

      // تنظيف روابط المعاينة من الذاكرة
      Object.values(previews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });

      setPreviews({}); // هذه ستغير previews ولكن لن تعيد تشغيل التأثير لأننا أزلناها من المصفوفة أدناه
      setLoading(false);
    }

    // نضع isOpen فقط هنا. لا تضع previews أبداً
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fieldName = e.target.name;

      // إذا كان هناك صورة قديمة، نحذف الرابط القديم من الذاكرة
      if (previews[fieldName]) {
        URL.revokeObjectURL(previews[fieldName]);
      }

      const objectUrl = URL.createObjectURL(file);
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      setPreviews((prev) => ({ ...prev, [fieldName]: objectUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("cin", formData.cin);
    data.append("businessType", formData.businessType);
    data.append("phone", formData.phone);
    data.append("address", formData.address);
    data.append("city", formData.city);

    const newUserInfo = {
      name: formData.name,
      email: formData.email,
    };
    data.append("user", JSON.stringify(newUserInfo));

    if (files.picture) data.append("picture", files.picture);
    if (files.cinFront) data.append("cinFront", files.cinFront);
    if (files.cinBack) data.append("cinBack", files.cinBack);

    try {
      const response = await fetch("http://localhost:3001/members", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error creating member");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Add New Member</h2>
            <p className="text-xs text-gray-500 font-medium">Register a new member with their account details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-black transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">

          {/* Section 1: Account Information */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Step 1: Account Access</label>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Picture Upload */}
              <div className="relative group flex-shrink-0">
                <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center transition-all group-hover:border-indigo-300">
                  {previews.picture ? (
                    <Image
                      src={previews.picture}
                      alt="Profile Picture Preview"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="text-gray-300 mx-auto" size={24} />
                      <span className="text-[8px] font-bold text-black block mt-1 uppercase">Avatar</span>
                    </div>
                  )}
                </div>
                <input type="file" name="picture" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              {/* Name & Email Inputs */}
              <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
                  <input name="name" required placeholder="Full Name" value={formData.name} onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-black rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
                  <input name="email" type="email" required placeholder="Email Address" value={formData.email} onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-black rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Member Profile Details */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Step 2: Member Details</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-1"><IdCard size={12} /> CIN</label>
                <input name="cin" required placeholder="Ex: AB123456" value={formData.cin} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-1"><Briefcase size={12} /> Business</label>
                <input name="businessType" required placeholder="Ex: Developer" value={formData.businessType} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-1"><Smartphone size={12} /> Phone</label>
                <input name="phone" required placeholder="+212 6..." value={formData.phone} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-1"><MapPin size={12} />  City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {Object.values(City).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-1"><Home size={12} /> Address</label>
              <input name="address" required placeholder="Full Address" value={formData.address} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            </div>
          </div>

          {/* Section 3: Document Upload (Using Next.js Image) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {['cinFront', 'cinBack'].map((side) => (
              <div key={side} className="space-y-2">
                <label className="text-[10px] font-bold text-black uppercase tracking-tighter">
                  CIN {side === 'cinFront' ? 'Front Side' : 'Back Side'}
                </label>
                <div className="relative h-28 w-full border-2 border-dashed border-black rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-indigo-50 transition-all overflow-hidden">
                  {previews[side] ? (
                    <div className="relative w-full h-full group">
                      <Image
                        src={previews[side]}
                        alt={`Preview of ${side}`}
                        fill // Makes the image fill the container
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized // Recommended for local Blob URLs to avoid processing errors
                      />
                      <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                        <span className="text-[10px] font-black text-white uppercase">Change File</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <IdCard className="text-gray-300 mb-1" size={24} />
                      <span className="text-[9px] font-bold text-black uppercase">Upload Copy</span>
                    </>
                  )}
                  <input
                    type="file"
                    name={side}
                    required={!previews[side]}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-30"
                    accept="image/*"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs transition-all hover:bg-gray-50 uppercase tracking-widest">
              Discard
            </button>
            <button type="submit" disabled={loading}
              className="pointer-cursor px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center gap-2 active:scale-95 transition-all uppercase tracking-widest">
              {loading ? "Saving..." : (
                <><CheckCircle2 size={16} /> Save Member Account</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}