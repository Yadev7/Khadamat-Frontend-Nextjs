"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h2>
          <p className="text-slate-500 font-medium mb-8">
            You are about to delete <span className="text-slate-900 font-bold">{title}</span>. 
            This action will archive the member and they will no longer appear in the list.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}