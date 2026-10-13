"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !justReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md pointer-events-auto transition-all animate-in slide-in-from-top-4 duration-300"
    >
      {isOffline ? (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-amber-300 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
            <div className="truncate text-xs">
              <span className="font-bold">Offline mode: </span>
              <span className="text-slate-300">Showing cached content</span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 shadow-2xl backdrop-blur-md animate-in fade-in">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">You&apos;re back online!</span>
        </div>
      )}
    </div>
  );
}
