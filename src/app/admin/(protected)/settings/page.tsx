"use client";

import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-white/5">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
          <p className="text-slate-400">Configure global application behavior</p>
        </div>
      </div>

      <div className="p-8 bg-slate-900/60 backdrop-blur-md border border-rose-500/10 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
        <Settings className="w-16 h-16 text-slate-700 mb-4 animate-[spin_10s_linear_infinite]" />
        <h2 className="text-xl font-bold text-white mb-2">Global Settings</h2>
        <p className="text-slate-400 max-w-md text-center">
          Coming soon. You will be able to manage site-wide settings like maintenance mode, API integrations, and feature toggles.
        </p>
      </div>
    </div>
  );
}
