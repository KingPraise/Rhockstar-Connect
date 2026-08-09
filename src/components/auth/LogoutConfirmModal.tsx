"use client";

import { LogOut, X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { logoutUser } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await logoutUser();
      logout();
      toast.success("Successfully logged out");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="neo-card bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <LogOut className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Log Out?</h2>
          <p className="text-sm text-slate-400">Are you sure you want to log out of your Rhockstar Connect account?</p>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-sm transition-colors border border-white/5"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Logging out..." : "Yes, Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
