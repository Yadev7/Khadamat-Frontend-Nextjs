"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Inbox, Loader2, Mail, Phone, Trash2, Calendar, Store, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getBusinesses } from "@/api/businesses-api";
import { getMessages, deleteMessage } from "@/api/messages-api";

const MySwal = withReactContent(Swal);

export default function MessagesInboxPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const langSuffix = i18n.language.charAt(0).toUpperCase() + i18n.language.slice(1);
  const businessName = (b: any) => b?.[`name${langSuffix}`] || b?.nameFr || b?.nameEn || b?.nameAr || "Business";

  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await getBusinesses(1, 100);
      const dataArray = response?.data || (Array.isArray(response) ? response : []);
      setBusinesses(dataArray);
      if (dataArray.length > 0) {
        setSelectedBusinessId((prev) => prev || dataArray[0].id);
      }
    } catch (err: any) {
      console.error("❌ API Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (businessId: string) => {
    setMessagesLoading(true);
    try {
      const data = await getMessages(businessId || undefined);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Messages Error:", err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchMessages(selectedBusinessId);
    } else {
      setMessages([]);
    }
  }, [selectedBusinessId, fetchMessages]);

  const handleDelete = async (message: any) => {
    const result = await MySwal.fire({
      title: "Delete message?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteMessage(message.id);
        setMessages((prev) => prev.filter((m) => m.id !== message.id));
        MySwal.fire("Deleted!", "The message has been deleted.", "success");
      } catch (error) {
        MySwal.fire("Error", "Failed to delete message.", "error");
      }
    }
  };

  const messageText = (m: any) =>
    m?.textEn || m?.textFr || m?.textAr || m?.titleEn || m?.titleFr || m?.titleAr || "No content";

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleString() : "";

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium">Loading inbox...</p>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t("dashboard.messages.title") || "Client Messages"}</h1>
          <p className="text-slate-500 text-sm">{t("dashboard.messages.subtitle") || "Messages sent by clients from your business profiles"}</p>
        </div>

        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
        >
          <option value="">{t("dashboard.messages.all_businesses") || "All businesses"}</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>{businessName(b)}</option>
          ))}
        </select>
      </div>

      {messagesLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed gap-3">
          <Inbox size={48} className="text-slate-300" />
          <p className="text-lg font-medium">{t("dashboard.messages.empty") || "No messages yet"}</p>
          <p className="text-sm text-slate-400">{t("dashboard.messages.empty_desc") || "Messages sent by clients will appear here."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {messages.map((message) => (
            <div key={message.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {message.business ? businessName(message.business) : "Business"}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(message)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 grow">
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{messageText(message)}</p>
              </div>

              {(message.emailContact || message.phoneContact) && (
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-50 space-y-1.5">
                  {message.emailContact && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail size={12} className="text-indigo-400" />
                      <span className="truncate" dir="ltr">{message.emailContact}</span>
                    </div>
                  )}
                  {message.phoneContact && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={12} className="text-indigo-400" />
                      <span dir="ltr">+{message.phoneContact}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
