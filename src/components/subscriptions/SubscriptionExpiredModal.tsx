"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Crown, AlertTriangle, CheckCircle2, XCircle, ArrowRight, X, Sparkles } from "lucide-react";

export default function SubscriptionExpiredModal() {
  const { profile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined" || !profile) return;

    // Check if user's subscription has expired
    const isSubActive =
      (profile.subscriptionTier === "pro" || profile.subscriptionTier === "elite") &&
      profile.subscriptionStatus !== "inactive";

    const premiumUntil = profile.premiumUntil;
    if (!premiumUntil) return;

    const expiryDate = new Date(premiumUntil);
    if (isNaN(expiryDate.getTime())) return;

    const msRemaining = expiryDate.getTime() - Date.now();
    const isExpired = msRemaining <= 0 || (!isSubActive && profile.subscriptionTier === "free");

    if (isExpired) {
      const alreadySeen = sessionStorage.getItem(`sub_expired_modal_${profile.uid}`);
      if (!alreadySeen) {
        setIsOpen(true);
      }
    }
  }, [profile]);

  if (!isOpen || !mounted || !profile) return null;

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`sub_expired_modal_${profile.uid}`, "true");
    }
  };

  const pausedPerks = [
    { title: "Verified Member Badge", desc: "Gold/Blue checkmark paused on your profile and posts" },
    { title: "Dating Stardom Boost", desc: "Priority placement in dating discovery paused" },
    { title: "Unlimited Direct Messages", desc: "Chat messaging returned to standard daily limits" },
    { title: "Premium Analytics & Insights", desc: "Profile view and audience analytics restricted" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] space-y-6 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Visual */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
            <Crown className="w-8 h-8 text-rose-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Subscription Expired</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your Premium Membership Has Ended
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Your 30-day Premium access has concluded. Here is what has been paused on your account:
          </p>
        </div>

        {/* Paused Perks List */}
        <div className="space-y-2.5 bg-slate-950/60 border border-white/5 rounded-2xl p-4">
          {pausedPerks.map((perk, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5 text-rose-400">
                <XCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-white leading-snug">{perk.title}</p>
                <p className="text-[11px] text-slate-400">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href="/premium"
            onClick={handleClose}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 text-white font-extrabold text-sm sm:text-base shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Renew Premium Subscription</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={handleClose}
            className="w-full py-2.5 px-4 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Continue with Free Plan for Now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
