"use client";

import { Crown, Lock, Sparkles, CheckCircle2, ArrowRight, Gift, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PremiumLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  featureList?: string[];
}

export default function PremiumLockModal({
  isOpen,
  onClose,
  title = "Unlock Premium Feature",
  description = "This feature is reserved for Rhockstar Connect Premium members.",
  featureList = [
    "Unlimited Direct Messaging & Connections",
    "See Who Liked Your Profile & Top Matches",
    "Gold Verified Badge & Maximum Visibility",
    "Unlimited Job Applications & Featured Badges"
  ]
}: PremiumLockModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] relative overflow-hidden text-center space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* GLOWING BADGE */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)] mx-auto relative">
          <Crown className="w-10 h-10 text-amber-400 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">{description}</p>
        </div>

        {/* PERKS LIST */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2.5 text-left text-xs text-slate-300">
          {featureList.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              onClose();
              router.push("/premium");
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <span>Upgrade to Premium</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/referrals"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800/80 text-amber-300 hover:text-white font-bold text-xs border border-amber-500/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Or Invite 1 Friend to Earn 7 Days Free Premium!</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
