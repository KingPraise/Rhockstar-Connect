"use client";

import Link from "next/link";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-brand-purple/20 via-brand/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center p-8">
        {/* Floating Icon */}
        <div className="w-32 h-32 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 neo-card flex items-center justify-center mb-8 shadow-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand to-brand-purple rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <AlertTriangle className="w-16 h-16 text-brand-purple relative z-10 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
        </div>

        <h1 className="text-7xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mb-6">Page Not Found</h2>
        
        <p className="text-slate-400 text-lg max-w-md mb-10 font-medium">
          Oops! It looks like you&apos;ve ventured into uncharted territory. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link 
          href="/" 
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all hover:-translate-y-1"
        >
          <Home className="w-5 h-5" />
          Return to Base
        </Link>
      </div>
    </div>
  );
}
