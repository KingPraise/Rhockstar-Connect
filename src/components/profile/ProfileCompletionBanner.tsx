"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Users, 
  Heart, 
  X, 
  AlertCircle,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { calculateProfileProgress } from "@/lib/utils/profileProgress";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "rhockstar_profile_reminder_dismissed_at";
const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export default function ProfileCompletionBanner() {
  const { profile } = useAuthStore();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "true";

  const [isDismissed, setIsDismissed] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const progress = calculateProfileProgress(profile);

  useEffect(() => {
    if (!profile) {
      setIsDismissed(true);
      return;
    }

    // Always show if just registered or if welcome query is set
    if (isWelcome) {
      setIsDismissed(false);
      return;
    }

    // Check dismissal timestamp
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
      if (timeSinceDismiss < REMINDER_INTERVAL_MS) {
        setIsDismissed(true);
        return;
      }
    }

    // Only show if profile is incomplete (< 85%)
    if (progress.percentage < 85) {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, [profile, progress.percentage, isWelcome]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  // If dismissed or fully complete, do not render full banner
  if (!profile || isDismissed || progress.percentage >= 85) {
    return (
      <>
        {isEditModalOpen && (
          <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-slate-900 border border-purple-500/30 p-4 sm:p-6 shadow-xl shadow-purple-950/30 mb-4 transition-all">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Remind me in 24 hours"
          aria-label="Dismiss reminder"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    {isWelcome ? "Welcome! Complete Your Profile" : "Level Up Your Profile"}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                    {progress.percentage}% Complete
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  An updated profile is your first impression for jobs, love, and network connections.
                </p>
              </div>
            </div>

            {/* CTA Button Desktop */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Update Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.max(progress.percentage, 8)}%` }}
            />
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Unlock Job Applications</p>
                <p className="text-[11px] text-slate-400 leading-tight">Employers require full profiles before reviewing.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">5x More Connections</p>
                <p className="text-[11px] text-slate-400 leading-tight">Appear in suggestions and get discovered faster.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 shrink-0 mt-0.5">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dating & Matchmaking</p>
                <p className="text-[11px] text-slate-400 leading-tight">Show your location and interests to find true love.</p>
              </div>
            </div>
          </div>

          {/* Next Steps Quick List */}
          {progress.missingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Next recommended:</span>
              {progress.missingItems.slice(0, 3).map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20"
                >
                  + {item}
                </span>
              ))}
            </div>
          )}

          {/* CTA Button Mobile */}
          <div className="flex sm:hidden items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs shadow-lg shadow-purple-600/30"
            >
              <span>Update Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl font-medium text-slate-400 hover:text-white text-xs"
            >
              Later
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </>
  );
}
