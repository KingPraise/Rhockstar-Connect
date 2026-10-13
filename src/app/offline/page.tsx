"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { WifiOff, RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : false);

    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-6 relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding */}
      <header className="w-full max-w-md flex items-center justify-between py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-purple flex items-center justify-center font-black text-xl text-slate-950 shadow-lg shadow-brand/20">
            R
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Rhockstar Connect
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Offline Mode
            </p>
          </div>
        </div>
      </header>

      {/* Main Offline Card */}
      <main className="w-full max-w-md my-auto py-8 z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-brand to-purple-600" />

          {/* Offline Icon Container */}
          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-500/10 animate-ping opacity-25" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
              <WifiOff className="w-10 h-10" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            No Internet Connection
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            You appear to be offline right now. Don&apos;t worry — once your connection is restored, Rhockstar Connect will automatically reconnect.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
              <span>{isRetrying ? "Checking Connection..." : "Try Reconnecting"}</span>
            </button>

            <Link
              href="/feed"
              className="w-full py-3 px-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Cached Feed</span>
            </Link>
          </div>

          {/* Connection status badge */}
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>{isOnline ? "Network detected! Reloading..." : "Waiting for network..."}</span>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-md text-center py-4 text-xs text-slate-500 z-10">
        <p>&copy; {new Date().getFullYear()} Rhockstar Connect. Offline cached view.</p>
      </footer>
    </div>
  );
}
