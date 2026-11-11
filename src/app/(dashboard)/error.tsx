"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg">
        <AlertCircle className="w-7 h-7" />
      </div>
      
      <h2 className="text-xl font-bold text-white mb-2">Unable to load this section</h2>
      <p className="text-slate-400 max-w-sm text-sm mb-6">
        A temporary glitch occurred while displaying this page. You can try reloading or return to your feed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/feed"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition-all flex items-center gap-2"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
      </div>
    </div>
  );
}
