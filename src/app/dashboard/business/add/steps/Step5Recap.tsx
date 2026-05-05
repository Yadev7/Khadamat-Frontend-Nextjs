import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getServicesList, getMembersList, getContactsList } from "@/api/businesses-api";
import { Building2, User, Phone, Mail, Globe, Share2, FileText, MapPin, ShieldAlert } from "lucide-react";

export function Step5Recap() {
    const { getValues } = useFormContext();
    const data = getValues();

    const [services, setServices] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecapData = async () => {
            try {
                const [sData, mData, cData] = await Promise.all([
                    getServicesList(),
                    getMembersList(),
                    getContactsList()
                ]);
                setServices(sData.data || sData || []);
                setMembers(mData.data || mData || []);
                setContacts(cData.data || cData || []);
            } catch (error) {
                console.error("Error loading recap data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadRecapData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full animate-ping"></div>
                    <p className="text-xs font-bold text-slate-400">Preparing review data...</p>
                </div>
            </div>
        );
    }

    const selectedService = services.find((s) => String(s.id) === String(data.serviceId));
    const selectedOwner = members.find((m) => String(m.id) === String(data.ownerId));
    const selectedContact = contacts.find((c) => String(c.id) === String(data.contactId));

    const getFileName = (file: any) => {
        if (!file) return "No file uploaded";
        if (file instanceof FileList) {
            if (file.length === 0) return "No file uploaded";
            return Array.from(file).map((f: any) => f.name).join(", ");
        }
        if (file instanceof File) return file.name;
        return "No file uploaded";
    };

    return (
        <div className="space-y-6 max-h-[500px] overflow-y-auto p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    🔍 Review Business Configuration
                </h2>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                    Final Step
                </span>
            </div>

            {/* Section: Basic Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1">
                    <Building2 size={14} className="text-indigo-500" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-bold text-slate-400 text-xs block">Name (EN / FR / AR)</span>
                        <div className="font-semibold text-slate-700">
                            {data.nameEn || "—"} / {data.nameFr || "—"} / {data.nameAr || "—"}
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block">Service Type</span>
                        <div className="font-bold text-indigo-600">
                            {selectedService ? (selectedService.nameServEn || selectedService.nameServAr) : "Not Selected"}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-bold text-slate-400 text-xs block">Description (EN)</span>
                        <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded-xl mt-1 border border-slate-100 whitespace-pre-wrap">{data.descrEn || "No description"}</p>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-bold text-slate-400 text-xs block">Description (FR)</span>
                        <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded-xl mt-1 border border-slate-100 whitespace-pre-wrap">{data.descrFr || "No description"}</p>
                    </div>
                    <div className="md:col-span-2 text-right" dir="rtl">
                        <span className="font-bold text-slate-400 text-xs block mr-1">الوصف (AR)</span>
                        <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded-xl mt-1 border border-slate-100 text-right whitespace-pre-wrap">{data.descrAr || "لا يوجد وصف"}</p>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1"><Globe size={12} /> Website</span>
                        <div className="text-slate-700 truncate">{data.siteUrl || "—"}</div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1"><Share2 size={12} /> Social Media</span>
                        <div className="text-slate-700">{data.socialMedia || "—"}</div>
                    </div>
                </div>
            </div>

            {/* Section: Owner & Contact */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1">
                    <User size={14} className="text-emerald-500" /> Ownership & Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-bold text-slate-400 text-xs block">Business Owner</span>
                        <div className="font-semibold text-slate-700">
                            {selectedOwner ? (selectedOwner.contact?.firstName || selectedOwner.email) : "Not Selected"}
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1"><MapPin size={12} /> Linked Contact</span>
                        <div className="font-semibold text-slate-700">
                            {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : "Not Selected"}
                        </div>
                    </div>
                    {selectedContact && (
                        <div className="md:col-span-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="font-bold block">Contact Address:</span>
                            {selectedContact.address?.lineAddressFr || selectedContact.address?.lineAddressAr || "No address details"}
                        </div>
                    )}
                </div>
            </div>

            {/* Section: Manager Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1">
                    <ShieldAlert size={14} className="text-indigo-500" /> Manager Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-bold text-slate-400 text-xs block">Management Type</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-extrabold text-[10px]">
                            {data.managementType === 'ownerId' ? "Owner is Manager" : "Assigned New Manager"}
                        </span>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block">Manager Name</span>
                        <div className="font-bold text-slate-800">
                            {data.newManagerFirstName || "—"} {data.newManagerLastName || "—"}
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1"><Mail size={12} /> Email</span>
                        <div className="text-slate-700 truncate">{data.newManagerEmail || "—"}</div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1"><Phone size={12} /> Phone</span>
                        <div className="text-slate-700">{data.newManagerPhone || "—"}</div>
                    </div>
                </div>
            </div>

            {/* Section: Uploaded Media */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1">
                    <FileText size={14} className="text-rose-500" /> Media & Uploads
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Gallery Images</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.images)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Flyer PDF/JPG</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.flyer)}</span>
                    </div>
                    
                    {/* Audios */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Audio (AR)</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.audioAr)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Audio (EN)</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.audioEn)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Audio (FR)</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.audioFr)}</span>
                    </div>

                    {/* Videos */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Video (AR)</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.videoAr)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Video (EN)</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.videoEn)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-400 block mb-1">Video (FR)</span>
                        <span className="font-semibold text-slate-700 truncate block">{getFileName(data.videoFr)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}