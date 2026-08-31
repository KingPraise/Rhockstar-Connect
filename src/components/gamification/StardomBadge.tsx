"use client";

import React from "react";
import { StardomRank, calculateStardom, STARDOM_TIERS } from "@/lib/services/gamification";
import { Sparkles, Crown, Zap, Compass, Link as LinkIcon, Megaphone, Rocket, Star } from "lucide-react";

interface StardomBadgeProps {
  xp?: number;
  rank?: StardomRank;
  variant?: "compact" | "badge" | "progress-pill" | "full-card";
  className?: string;
  showIcon?: boolean;
  showPercent?: boolean;
}

export const StardomIcon = ({ rank, className = "w-3 h-3" }: { rank: StardomRank; className?: string }) => {
  switch (rank) {
    case "Explorer":
      return <Compass className={className} />;
    case "Insider":
      return <Zap className={className} />;
    case "Connector":
      return <LinkIcon className={className} />;
    case "Buzzmaker":
      return <Megaphone className={className} />;
    case "Trendsetter":
      return <Rocket className={className} />;
    case "Influencer":
      return <Sparkles className={className} />;
    case "Superstar":
      return <Star className={className} />;
    case "Rhockstar":
      return <Crown className={className} />;
    default:
      return <Compass className={className} />;
  }
};

export default function StardomBadge({
  xp = 0,
  rank,
  variant = "badge",
  className = "",
  showIcon = true,
  showPercent = true,
}: StardomBadgeProps) {
  const stardom = calculateStardom(xp);
  const activeTier = rank 
    ? STARDOM_TIERS.find((t) => t.rank === rank) || stardom.currentTier
    : stardom.currentTier;

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-sm ${activeTier.borderColor} ${activeTier.textColor} bg-slate-900/80 shadow-xs ${className}`}
        title={`${activeTier.title} (${stardom.progressPercent}% to next rank)`}
      >
        {showIcon && <StardomIcon rank={activeTier.rank} className="w-2.5 h-2.5" />}
        <span>{activeTier.title}</span>
        {showPercent && !stardom.isMaxRank && (
          <span className="text-[9px] opacity-75 font-mono">{stardom.progressPercent}%</span>
        )}
      </span>
    );
  }

  if (variant === "progress-pill") {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border ${activeTier.borderColor} shadow-sm ${className}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{activeTier.badge}</span>
          <span className={`text-xs font-bold ${activeTier.textColor}`}>{activeTier.title}</span>
        </div>
        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-white/5">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${activeTier.bgGradient} transition-all duration-500`}
            style={{ width: `${stardom.progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400 font-mono">
          {stardom.progressPercent}%
        </span>
      </div>
    );
  }

  if (variant === "full-card") {
    return (
      <div className={`p-5 rounded-3xl bg-slate-900/90 border ${activeTier.borderColor} shadow-2xl relative overflow-hidden flex flex-col gap-4 ${className}`}>
        {/* Glow effect */}
        <div className={`absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br ${activeTier.bgGradient} opacity-15 blur-2xl pointer-events-none`} />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeTier.bgGradient} flex items-center justify-center text-white text-xl shadow-lg border border-white/20`}>
              <StardomIcon rank={activeTier.rank} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white">{activeTier.title}</h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-white/5">
                  Tier {activeTier.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeTier.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">
              {stardom.isMaxRank ? "Maximum Rank Reached!" : `Progress to ${stardom.nextTier?.title}`}
            </span>
            <span className={`font-mono font-bold ${activeTier.textColor}`}>
              {stardom.progressPercent}%
            </span>
          </div>
          
          <div className="w-full h-3 rounded-full bg-slate-950/80 p-0.5 border border-white/10 overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${activeTier.bgGradient} transition-all duration-700 shadow-sm`}
              style={{ width: `${stardom.progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{stardom.currentXP.toLocaleString()} XP Total</span>
            {!stardom.isMaxRank && stardom.nextTier && (
              <span>Next: {stardom.nextTier.minXP.toLocaleString()} XP</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default 'badge'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border backdrop-blur-sm ${activeTier.borderColor} ${activeTier.textColor} bg-slate-900/80 shadow-sm ${className}`}
    >
      {showIcon && <StardomIcon rank={activeTier.rank} className="w-3.5 h-3.5" />}
      <span>{activeTier.title}</span>
      {showPercent && (
        <span className="text-[10px] opacity-75 font-mono">({stardom.progressPercent}%)</span>
      )}
    </span>
  );
}
