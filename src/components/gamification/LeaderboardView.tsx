"use client";

import React, { useEffect, useState } from "react";
import { subscribeToLeaderboard, LeaderboardUser } from "@/lib/services/gamification";
import StardomBadge from "./StardomBadge";
import StreakBadge from "./StreakBadge";
import UserAvatar from "@/components/ui/UserAvatar";
import { Trophy, Crown, Medal, Sparkles, Loader2, HelpCircle } from "lucide-react";
import StardomInfoModal from "./StardomInfoModal";

export default function LeaderboardView() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLeaderboard((list) => {
      setLeaders(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand/20 via-purple-600/20 to-slate-900 border border-brand/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-black uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Rhockstar Stardom Ranks</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Platform Hall of Fame ⭐</h2>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            The most active, impactful, and engaged members across all Rhockstar-Connect communities.
          </p>
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="mt-3 px-4 py-1.5 bg-brand/20 hover:bg-brand/30 text-brand border border-brand/30 rounded-full text-xs font-bold transition-colors flex items-center gap-2 w-fit mx-auto sm:mx-0"
          >
            <HelpCircle className="w-3.5 h-3.5" /> How XP Works
          </button>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-brand/10 border border-brand/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
          👑
        </div>
      </div>

      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end pt-4">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="order-2 sm:order-1 p-5 rounded-3xl bg-slate-900/90 border border-slate-700/60 flex flex-col items-center text-center relative shadow-xl transform hover:-translate-y-1 transition-transform">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-xs font-black text-slate-300 shadow-md flex items-center gap-1">
                <Medal className="w-3 h-3 text-slate-400" /> #2
              </div>
              <UserAvatar src={top3[1].avatar} name={top3[1].fullName} className="w-16 h-16 rounded-2xl mb-3 border-2 border-slate-400 shadow-md" textClassName="text-base font-black" />
              <h4 className="font-bold text-white text-sm truncate max-w-[140px]">{top3[1].fullName}</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{top3[1].stardomXP.toLocaleString()} XP</p>
              <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
                <StardomBadge xp={top3[1].stardomXP} variant="compact" />
                <StreakBadge streakCount={top3[1].streakCount} size="sm" />
              </div>
            </div>
          )}

          {/* 1st Place Champion */}
          {top3[0] && (
            <div className="order-1 sm:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-500/40 flex flex-col items-center text-center relative shadow-2xl transform hover:-translate-y-1 transition-transform">
              <div className="absolute -top-4 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-slate-950" /> #1 Champion
              </div>
              <UserAvatar src={top3[0].avatar} name={top3[0].fullName} className="w-20 h-20 rounded-3xl mb-3 border-2 border-amber-400 shadow-lg" textClassName="text-lg font-black" />
              <h4 className="font-black text-white text-base truncate max-w-[160px]">{top3[0].fullName}</h4>
              <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">{top3[0].stardomXP.toLocaleString()} XP</p>
              <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
                <StardomBadge xp={top3[0].stardomXP} variant="compact" />
                <StreakBadge streakCount={top3[0].streakCount} size="sm" />
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="order-3 p-5 rounded-3xl bg-slate-900/90 border border-amber-800/40 flex flex-col items-center text-center relative shadow-xl transform hover:-translate-y-1 transition-transform">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-800 border border-amber-700/60 text-xs font-black text-amber-500 shadow-md flex items-center gap-1">
                <Medal className="w-3 h-3 text-amber-600" /> #3
              </div>
              <UserAvatar src={top3[2].avatar} name={top3[2].fullName} className="w-16 h-16 rounded-2xl mb-3 border-2 border-amber-600 shadow-md" textClassName="text-base font-black" />
              <h4 className="font-bold text-white text-sm truncate max-w-[140px]">{top3[2].fullName}</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{top3[2].stardomXP.toLocaleString()} XP</p>
              <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
                <StardomBadge xp={top3[2].stardomXP} variant="compact" />
                <StreakBadge streakCount={top3[2].streakCount} size="sm" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranks List 4 - 15 */}
      {rest.length > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/5 space-y-2 shadow-xl">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Top Ranked Members
          </h4>
          {rest.map((user, idx) => (
            <div
              key={user.uid}
              className="p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-white/5 flex items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-6 text-center font-mono font-black text-xs text-slate-400">
                  #{idx + 4}
                </span>
                <UserAvatar src={user.avatar} name={user.fullName} className="w-10 h-10 rounded-full shrink-0" textClassName="text-xs font-bold" />
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-white truncate">{user.fullName}</h5>
                  <p className="text-[10px] text-slate-400 font-mono">{user.stardomXP.toLocaleString()} XP</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StardomBadge xp={user.stardomXP} variant="compact" />
                <StreakBadge streakCount={user.streakCount} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
      <StardomInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
}
