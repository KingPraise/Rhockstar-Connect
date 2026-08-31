"use client";

import React from "react";
import { Flame } from "lucide-react";
import { getStreakMultiplier } from "@/lib/services/gamification";

interface StreakBadgeProps {
  streakCount?: number;
  showMultiplier?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function StreakBadge({
  streakCount = 0,
  showMultiplier = false,
  className = "",
  size = "sm",
}: StreakBadgeProps) {
  if (!streakCount || streakCount <= 0) return null;

  const mult = getStreakMultiplier(streakCount);
  const isHot = streakCount >= 7;
  const isInferno = streakCount >= 30;

  let sizeClasses = "px-2 py-0.5 text-xs";
  let iconSize = "w-3.5 h-3.5";

  if (size === "md") {
    sizeClasses = "px-3 py-1 text-sm";
    iconSize = "w-4 h-4";
  } else if (size === "lg") {
    sizeClasses = "px-4 py-1.5 text-base";
    iconSize = "w-5 h-5";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black rounded-xl border backdrop-blur-md transition-all shadow-sm ${sizeClasses} ${
        isInferno
          ? "bg-gradient-to-r from-orange-600/30 to-amber-500/30 border-amber-500/50 text-amber-300 animate-pulse"
          : isHot
          ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
          : "bg-slate-800/90 border-white/10 text-slate-300"
      } ${className}`}
      title={`${streakCount} Day Daily Streak (${mult}x XP Multiplier)`}
    >
      <Flame className={`${iconSize} ${isInferno ? "text-amber-400 fill-amber-400 animate-bounce" : isHot ? "text-orange-400 fill-orange-400" : "text-amber-400"}`} />
      <span>{streakCount}</span>
      {showMultiplier && mult > 1 && (
        <span className="text-[10px] opacity-80 font-mono text-amber-400">({mult}x)</span>
      )}
    </span>
  );
}
