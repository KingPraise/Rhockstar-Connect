"use client";

import Link from "next/link";
import { X, Sparkles, LogIn, UserPlus } from "lucide-react";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export default function AuthRequiredModal({ isOpen, onClose, actionName = "interact" }: AuthRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 neo-card p-6 md:p-8 flex flex-col items-center text-center shadow-2xl rounded-3xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white mb-5 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
          <Sparkles className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-2">Join Rhockstar Connect</h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Please log in or create a free account to {actionName} and connect with professionals on Rhockstar Connect.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span>Log In to Account</span>
          </Link>

          <Link
            href="/register"
            className="w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 transition-all"
          >
            <UserPlus className="w-5 h-5 text-brand" />
            <span>Create Free Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
