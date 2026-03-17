"use client"
import Image from 'next/image'; // Importation pour l'optimisation
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
     const { t } = useTranslation();
    return (
        <main className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

                <div className="flex flex-col md:flex-row">

                    {/* PARTIE 1 : FORMULAIRE */}
                    <div className="w-full md:w-3/5 p-8 lg:p-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 font-sans">{t("contact.write_us")}</h2>
                        <p className="text-sm text-gray-600 mb-8">
                            {t("contact.instruction")} <span className="text-red-500 font-bold">*</span>
                        </p>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.name")}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder={t('contact.placeholder.name')}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.email")}</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder={t('contact.placeholder.email')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.object")}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder={t('contact.placeholder.subject')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.message")} </label>
                                <textarea
                                    rows={5}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder={t('contact.placeholder.message')}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all shadow-lg active:scale-95"
                            >
                                {t("contact.button")}
                            </button>
                        </form>
                    </div>

                    {/* PARTIE 2 : INFOS SOCIÉTÉ + LOGO */}
                    <div className="w-full md:w-2/5 bg-slate-900 p-8 lg:p-12 text-white flex flex-col justify-between">
                        <div>
                            {/* --- LOGO ICI --- */}
                            <div className="mb-10 flex items-center space-x-3">
                                <div className="relative w-16 h-16 bg-white p-2 rounded-xl shadow-inner">
                                    <Image
                                        src="/newdevlogo.png" // Chemin de votre image dans le dossier public/
                                        alt="Logo de la société"
                                        fill
                                        className="object-contain p-1"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight uppercase">New Dev Maroc</h1>
                                    <p className="text-xs text-blue-400 font-medium">Agence de communication et Publicitée a Fes</p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-semibold mb-8 text-blue-100">Informations</h2>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4 group">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">2eme étage N°7, Bureaux Rayane, Av St Louis, Fès</p>
                                </div>

                                <div className="flex items-center space-x-4 group">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition">
                                        <Phone className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-slate-300 text-sm">+212 5 35 65 07 57</p>
                                </div>

                                <div className="flex items-center space-x-4 group">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-slate-300 text-sm">contact@newdevmaroc.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-slate-700">
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-xs text-slate-400 italic"> Du Lundi au Vendredi (09h - 18h)</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-xs text-slate-400 italic"> Samedi (9h - 13h)</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-xs text-slate-400 italic"> Dimanche : Férier</p>
                            </div>


                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}