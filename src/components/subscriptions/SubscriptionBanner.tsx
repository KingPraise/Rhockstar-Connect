"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Crown, AlertTriangle, Clock, ArrowRight, X } from "lucide-react";

export default function SubscriptionBanner() {
  const { profile } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  // Check if previously dismissed in this browser session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = sessionStorage.getItem("sub_banner_dismissed") === "true";
      setDismissed(isDismissed);
    }
  }, []);

  if (!profile || dismissed) return null;

  const isSubActive =
    (profile.subscriptionTier === "pro" || profile.subscriptionTier === "elite") &&
    profile.subscriptionStatus !== "inactive";

  const premiumUntil = profile.premiumUntil;
  if (!premiumUntil) return null;

  const expiryDate = new Date(premiumUntil);
  if (isNaN(expiryDate.getTime())) return null;

  const now = new Date();
  const msRemaining = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60)));

  const isExpired = msRemaining <= 0 || (!isSubActive && profile.subscriptionTier === "free");
  const isExpiringSoon = isSubActive && daysRemaining <= 7 && daysRemaining > 0;

  if (!isExpired && !isExpiringSoon) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sub_banner_dismissed", "true");
    }
  };

  const formattedDate = expiryDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (isExpired) {
    return (
      <aside aria-label="Subscription expired alert" className="mb-6 mx-4 sm:mx-6 lg:mx-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-slate-900/90 border border-rose-500/40 p-4 shadow-[0_0_25px_rgba(244,63,94,0.25)] backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>Your Premium Subscription Has Expired</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Inactive
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Your verified badge, dating boosts, and unlimited messages are paused. Renew today to restore your perks!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Link
                href="/premium"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Renew Subscription Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDismiss}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Expiring Soon (7 days, 5 days, 3 days, 1 day)
  const isUrgent = daysRemaining <= 1;

  return (
    <aside aria-label="Subscription renewal alert" className="mb-6 mx-4 sm:mx-6 lg:mx-8">
      <div
        className={`relative overflow-hidden rounded-2xl p-4 shadow-lg backdrop-blur-md border ${
          isUrgent
            ? "bg-gradient-to-r from-amber-950/90 via-rose-950/80 to-slate-900/90 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
            : "bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-brand/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isUrgent
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-bounce"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {isUrgent ? <Clock className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                {isUrgent ? (
                  <>
                    <span>🚨 Final Notice: Expires in {hoursRemaining} hour{hoursRemaining > 1 ? "s" : ""}!</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Ending Soon
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      ⏳ Your {profile.subscriptionTier?.toUpperCase()} Plan Expires in {daysRemaining} Day{daysRemaining > 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {formattedDate}
                    </span>
                  </>
                )}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300">
                Renew now to maintain your verified badge, dating boosts, and unlimited messaging uninterrupted.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Link
              href="/premium"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Renew Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
