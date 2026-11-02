"use client";

import { useEffect } from "react";
import { ShieldAlert, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error caught by ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-5 shadow-lg">
        <ShieldAlert className="w-8 h-8" />
      </div>
      
      <h2 className="text-xl font-bold text-white mb-2">Admin Console Error</h2>
      <p className="text-slate-400 max-w-md text-sm mb-6">
        An error occurred within the administrative dashboard. Check browser console logs or reload.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>

        <Link
          href="/admin"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition-all flex items-center gap-2"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Admin Overview</span>
        </Link>
      </div>
    </div>
  );
}
