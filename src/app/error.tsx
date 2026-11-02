"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught by Global ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-xl">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-extrabold mb-2">Something went wrong</h2>
      <p className="text-slate-400 max-w-md text-sm mb-6">
        An unexpected error occurred while loading this page. Our team has been notified.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-white/10 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
