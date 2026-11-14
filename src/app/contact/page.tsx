"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Clock, Building2, PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';


export default function ContactPage() {
    const { t, i18n } = useTranslation();
    
    // États du formulaire et des données
    const [requestType, setRequestType] = useState<'registration' | 'other'>('other');
    const [services, setServices] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        serviceId: '',
        customService: '' // Champ pour le service personnalisé si "Autre" est sélectionné
    });

 

    // Gestion des changements de champs de saisie
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const langSuffix = i18n.language ? i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1) : 'Fr';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Si "custom" est sélectionné, on peut envoyer customService au lieu de serviceId
            const finalData = {
                ...formData,
                requestType,
                selectedService: formData.serviceId === 'custom' ? formData.customService : formData.serviceId
            };
            console.log("Données soumises :", finalData);
            // ... Appel API d'envoi de formulaire ...
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:placeholder-gray-500";

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">

                <div className="flex flex-col md:flex-row">

                    {/* PARTIE 1 : FORMULAIRE */}
                    <div className="w-full md:w-3/5 p-8 lg:p-12">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 font-sans">{t("contact.write_us")}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                            {t("contact.instruction")} <span className="text-red-500 font-bold">*</span>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">


                            {/* CHAMP NOM */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("contact.name")}</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder={t('contact.placeholder.name')}
                                />
                            </div>

                            {/* GRILLE : EMAIL & TÉLÉPHONE */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("contact.email")}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder={t('contact.placeholder.email')}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("contact.placeholder.tel")}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="+212 600-000000"
                                    />
                                </div>
                            </div>

                            {/* CHAMP OBJET */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("contact.object")}</label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder={t('contact.placeholder.subject')}
                                />
                            </div>

                            {/* CHAMP MESSAGE (OPTIONNEL) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t("contact.message")} <span className="text-xs text-gray-400 font-normal">({t("contact.optional")})</span>
                                </label>
                                <textarea
                                    rows={5}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`${inputClasses} resize-none`}
                                    placeholder={t('contact.placeholder.message')}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? "Envoi en cours..." : t("contact.button")}
                            </button>
                        </form>
                    </div>

                    {/* PARTIE 2 : INFOS SOCIÉTÉ + LOGO */}
                    <div className="w-full md:w-2/5 bg-slate-900 p-8 lg:p-12 text-white flex flex-col justify-between">
                        <div>
                            {/* --- LOGO --- */}
                            <div className="mb-10 flex items-center space-x-3">
                                <div className="relative w-16 h-16 bg-white p-2 rounded-xl shadow-inner">
                                    <Image
                                        src="/newdevlogo.png"
                                        alt="Logo de la société"
                                        fill
                                        className="object-contain p-1"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight uppercase">New Dev Maroc</h1>
                                    <p className="text-xs text-blue-400 font-medium">{t("contact.new_dev_maroc_description")}</p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-semibold mb-8 text-blue-100">Informations</h2>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4 group">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{t("contact.new_dev_maroc.address")}</p>
                                </div>

                                <div className="flex items-center space-x-4 group">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition">
                                        <Phone className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-slate-300 text-sm">{t("contact.new_dev_maroc.phone")}</p>
                                </div>

                                <div className="flex items-center space-x-4 group">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-slate-300 text-sm">{t("contact.new_dev_maroc.email")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-slate-700 space-y-2">
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-xs text-slate-400 italic">{t("contact.horaires.monday_friday")}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-xs text-slate-400 italic">{t("contact.horaires.saturday")}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-xs text-slate-400 italic">{t("contact.horaires.sunday")}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}