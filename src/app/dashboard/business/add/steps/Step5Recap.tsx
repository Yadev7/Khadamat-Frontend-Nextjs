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
            <div className="flex items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-100 dark:bg-gray-900 dark:border-gray-800">
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full animate-ping"></div>
                    <p className="text-xs font-bold text-slate-400 dark:text-gray-500">Preparing review data...</p>
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
        <div className="space-y-6 max-h-[500px] overflow-y-auto p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-gray-800">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 dark:text-gray-100">
                    🔍 Review Business Configuration
                </h2>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full dark:bg-indigo-950 dark:text-indigo-300">
                    Final Step
                </span>
            </div>

            {/* Section: Basic Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1 dark:text-gray-500 dark:border-gray-800">
                    <Building2 size={14} className="text-indigo-500" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-bold text-slate-400 text-xs block dark:text-gray-500">Name (EN / FR / AR)</span>
                        <div className="font-semibold text-slate-700 dark:text-gray-200">
                            {data.nameEn || "—"} / {data.nameFr || "—"} / {data.nameAr || "—"}
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block dark:text-gray-500">Service Type</span>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                            {selectedService ? (selectedService.nameServEn || selectedService.nameServAr) : "Not Selected"}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-bold text-slate-400 text-xs block dark:text-gray-500">Description (EN)</span>
                        <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded-xl mt-1 border border-slate-100 whitespace-pre-wrap dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700">{data.descrEn || "No description"}</p>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-bold text-slate-400 text-xs block dark:text-gray-500">Description (FR)</span>
                        <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded-xl mt-1 border border-slate-100 whitespace-pre-wrap dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700">{data.descrFr || "No description"}</p>
                    </div>
                    <div className="md:col-span-2 text-right" dir="rtl">
                        <span className="font-bold text-slate-400 text-xs block mr-1 dark:text-gray-500">الوصف (AR)</span>
                        <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded-xl mt-1 border border-slate-100 text-right whitespace-pre-wrap dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700">{data.descrAr || "لا يوجد وصف"}</p>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1 dark:text-gray-500"><Globe size={12} /> Website</span>
                        <div className="text-slate-700 truncate dark:text-gray-200">{data.siteUrl || "—"}</div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1 dark:text-gray-500"><Share2 size={12} /> Social Media</span>
                        <div className="text-slate-700 dark:text-gray-200">{data.socialMedia || "—"}</div>
                    </div>
                </div>
            </div>

            {/* Section: Owner & Contact */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1 dark:text-gray-500 dark:border-gray-800">
                    <User size={14} className="text-emerald-500" /> Ownership & Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-bold text-slate-400 text-xs block dark:text-gray-500">Business Owner</span>
                        <div className="font-semibold text-slate-700 dark:text-gray-200">
                            {selectedOwner ? (selectedOwner.contact?.firstName || selectedOwner.email) : "Not Selected"}
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1 dark:text-gray-500"><MapPin size={12} /> Linked Contact</span>
                        <div className="font-semibold text-slate-700 dark:text-gray-200">
                            {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : "Not Selected"}
                        </div>
                    </div>
                    {selectedContact && (
                        <div className="md:col-span-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700">
                            <span className="font-bold block">Contact Address:</span>
                            {selectedContact.address?.lineAddressFr || selectedContact.address?.lineAddressAr || "No address details"}
                        </div>
                    )}
                </div>
            </div>

            {/* Section: Manager Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1 dark:text-gray-500 dark:border-gray-800">
                    <ShieldAlert size={14} className="text-indigo-500" /> Manager Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-bold text-slate-400 text-xs block dark:text-gray-500">Management Type</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-extrabold text-[10px] dark:bg-gray-800 dark:text-gray-300">
                            {data.managementType === 'ownerId' ? "Owner is Manager" : "Assigned New Manager"}
                        </span>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block dark:text-gray-500">Manager Name</span>
                        <div className="font-bold text-slate-800 dark:text-gray-100">
                            {data.newManagerFirstName || "—"} {data.newManagerLastName || "—"}
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1 dark:text-gray-500"><Mail size={12} /> Email</span>
                        <div className="text-slate-700 truncate dark:text-gray-200">{data.newManagerEmail || "—"}</div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-400 text-xs block flex items-center gap-1 dark:text-gray-500"><Phone size={12} /> Phone</span>
                        <div className="text-slate-700 dark:text-gray-200">{data.newManagerPhone || "—"}</div>
                    </div>
                </div>
            </div>

            {/* Section: Uploaded Media */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1 dark:text-gray-500 dark:border-gray-800">
                    <FileText size={14} className="text-rose-500" /> Media & Uploads
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Gallery Images</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.images)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Flyer PDF/JPG</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.flyer)}</span>
                    </div>
                    
                    {/* Audios */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Audio (AR)</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.audioAr)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Audio (EN)</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.audioEn)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Audio (FR)</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.audioFr)}</span>
                    </div>

                    {/* Videos */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Video (AR)</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.videoAr)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Video (EN)</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.videoEn)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-bold text-slate-400 block mb-1 dark:text-gray-500">Video (FR)</span>
                        <span className="font-semibold text-slate-700 truncate block dark:text-gray-200">{getFileName(data.videoFr)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}