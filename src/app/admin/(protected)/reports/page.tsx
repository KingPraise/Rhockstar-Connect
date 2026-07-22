"use client";

import { AlertTriangle } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 border border-white/5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Content Reports</h1>
          <p className="text-slate-400">Review reported posts, comments, and messages</p>
        </div>
      </div>

      <div className="p-8 bg-slate-900/60 backdrop-blur-md border border-rose-500/10 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Moderation Queue</h2>
        <p className="text-slate-400 max-w-md text-center">
          Coming soon. This is where you will review flagged content to ensure community guidelines are upheld.
        </p>
      </div>
    </div>
  );
}
