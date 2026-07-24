"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error caught by ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-xl">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-extrabold mb-2">Connecting to Feed...</h2>
      <p className="text-slate-400 max-w-sm text-sm mb-6">
        Syncing your session with Rhockstar Connect.
      </p>

      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          } else {
            reset();
          }
        }}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reload Feed</span>
      </button>
    </div>
  );
}
