"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { markNotificationAsRead, Notification } from "@/lib/services/notifications";
import UserAvatar from "@/components/ui/UserAvatar";
import { 
  X, 
  Bell, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  Briefcase, 
  MessageCircle,
  Sparkles,
  ExternalLink 
} from "lucide-react";

// Subtle non-intrusive sound chime using Web Audio API (no external audio files needed)
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Smooth chime: C6 (1046.5Hz) -> E6 (1318.5Hz)
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch {
    // Audio autoplay might be restricted before first user interaction
  }
}

export default function InAppNotificationBanner() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const isInitialSnapshotRef = useRef(true);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!profile?.uid) return;

    isInitialSnapshotRef.current = true;

    // Listen to real-time notifications for the current user
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", profile.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Don't show toast for pre-existing notifications on initial page load
      if (isInitialSnapshotRef.current) {
        isInitialSnapshotRef.current = false;
        return;
      }

      // Check for newly added documents in this snapshot
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notif = { id: change.doc.id, ...change.doc.data() } as Notification;

          // Don't toast self-notifications if any exist
          if (notif.senderId && notif.senderId === profile.uid) return;

          // Play chime & haptic feedback
          playNotificationChime();
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            try { navigator.vibrate([30, 20, 30]); } catch {}
          }

          // Set active toast
          setActiveToast(notif);

          // Clear any previous dismiss timer
          if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

          // Auto-dismiss after 6 seconds
          dismissTimerRef.current = setTimeout(() => {
            setActiveToast(null);
          }, 6000);
        }
      });
    }, (err) => {
      console.warn("InAppNotification listener:", err);
    });

    return () => {
      unsubscribe();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [profile?.uid]);

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveToast(null);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  };

  const handleToastClick = async () => {
    if (!activeToast) return;
    const notif = activeToast;
    handleDismiss();

    // Mark as read in Firestore
    try {
      await markNotificationAsRead(notif.id);
    } catch {}

    // Navigate to deep link
    if (notif.link) {
      if (notif.link === "/") router.push("/feed");
      else router.push(notif.link);
      return;
    }

    // Fallbacks
    switch (notif.type) {
      case "like":
      case "comment":
        if (notif.targetId) router.push(`/feed?postId=${notif.targetId}#post-${notif.targetId}`);
        else router.push("/feed");
        break;
      case "message":
        if (notif.targetId || notif.senderId) router.push(`/messages?chatId=${notif.targetId || notif.senderId}`);
        else router.push("/messages");
        break;
      case "connection":
        if (notif.senderId) router.push(`/profile?uid=${notif.senderId}`);
        else router.push("/network");
        break;
      case "job":
        if (notif.targetId) router.push(`/jobs?jobId=${notif.targetId}`);
        else router.push("/jobs");
        break;
      case "match":
        router.push("/dating");
        break;
      default:
        router.push("/feed");
        break;
    }
  };

  if (!activeToast) return null;

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />;
      case "comment":
        return <MessageCircle className="w-3.5 h-3.5 text-amber-400" />;
      case "message":
        return <MessageSquare className="w-3.5 h-3.5 text-brand" />;
      case "connection":
        return <UserPlus className="w-3.5 h-3.5 text-purple-400" />;
      case "job":
        return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
      case "match":
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-brand" />;
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={handleToastClick}
      className="fixed top-4 right-4 z-[99999] max-w-sm sm:max-w-md w-[calc(100%-2rem)] bg-slate-900/95 hover:bg-slate-900 text-white p-4 rounded-3xl border border-brand/30 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] group animate-in slide-in-from-top-4 fade-in"
    >
      {/* Top glowing accent line */}
      <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />

      <div className="flex items-start gap-3.5">
        {/* Avatar or Icon */}
        <div className="relative shrink-0">
          <UserAvatar
            src={activeToast.senderAvatar}
            name={activeToast.senderName || activeToast.title}
            className="w-11 h-11 rounded-2xl ring-2 ring-brand/30 shadow-md"
            textClassName="text-sm font-bold"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shadow">
            {getBadgeIcon(activeToast.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-bold text-white group-hover:text-brand transition-colors truncate">
              {activeToast.title || "New Notification"}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-brand/10 border border-brand/20 text-[9px] font-bold text-brand uppercase tracking-wider shrink-0">
              New
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
            {activeToast.message}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-brand font-semibold group-hover:underline">
            <span>Tap to view</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
