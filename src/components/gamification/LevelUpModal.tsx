"use client";

import React, { useEffect, useState } from "react";
import { StardomRank, STARDOM_TIERS } from "@/lib/services/gamification";
import { StardomIcon } from "./StardomBadge";
import { Sparkles, X, Trophy } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRank: StardomRank;
}

export default function LevelUpModal({ isOpen, onClose, newRank }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tier = STARDOM_TIERS.find((t) => t.rank === newRank) || STARDOM_TIERS[0];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center overflow-hidden">
        {/* Ambient Glow */}
        <div className={`absolute -top-24 w-72 h-72 rounded-full bg-gradient-to-br ${tier.bgGradient} opacity-25 blur-3xl pointer-events-none`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stardom Level Up!</span>
        </div>

        {/* Animated Rank Badge */}
        <div className="relative my-4">
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${tier.bgGradient} flex items-center justify-center text-white text-4xl shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-transform`}>
            <StardomIcon rank={tier.rank} className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-white/20 text-xs font-black text-amber-400 shadow-md">
            Tier {tier.level}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
          You are now a <span className={`bg-clip-text text-transparent bg-gradient-to-r ${tier.bgGradient}`}>{tier.title}</span>!
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xs mt-2 leading-relaxed">
          {tier.description}
        </p>

        {/* Reward Box */}
        <div className="w-full mt-6 p-4 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            Unlocked exclusive {tier.title} chat flair & multiplier!
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full mt-6 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r ${tier.bgGradient} shadow-xl hover:opacity-90 transition-opacity`}
        >
          Keep Climbing ⭐
        </button>
      </div>
    </div>
  );
}
