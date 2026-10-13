"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ isLoading }: { isLoading: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // When isLoading becomes false, we wait a tiny bit to fade out smoothly
    if (!isLoading) {
      const timer = setTimeout(() => setShow(false), 500); // 500ms fade out transition
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0514] transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-pulse">
        {/* RC Logo */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          <span className="text-4xl font-extrabold text-white tracking-tighter">RC</span>
          
          {/* Subtle ring animation around logo */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>
        
        <h1 className="text-xl font-bold text-white tracking-tight">Rhockstar Connect</h1>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-progress"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; opacity: 1; }
          50% { width: 70%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
