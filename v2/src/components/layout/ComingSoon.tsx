"use client";

import { Rocket, Construction } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      
      <div className="neo-card p-12 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 flex flex-col items-center text-center max-w-lg w-full relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-1 bg-gradient-to-br from-brand/20 to-brand-purple/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand/10 to-brand-purple/10 border border-white/5 flex items-center justify-center mb-8 relative z-10 shadow-inner">
          <Rocket className="w-12 h-12 text-brand animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold mb-4 relative z-10">
          <Construction className="w-4 h-4" />
          Under Construction
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-4 relative z-10 tracking-tight">
          {title} <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-purple">Coming Soon</span>
        </h1>
        
        <p className="text-slate-400 font-medium mb-8 relative z-10 leading-relaxed">
          {description || `We're working hard to bring you the best ${title} experience. Stay tuned for exciting updates!`}
        </p>

        <Link 
          href="/feed"
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all relative z-10"
        >
          Back to Feed
        </Link>
      </div>
    </div>
  );
}
