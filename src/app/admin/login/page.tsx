"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Loader2, ArrowLeft } from "lucide-react";
import { loginUser } from "@/lib/auth";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { user, error } = await loginUser(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else if (user) {
      // AdminRoute will handle kicking them out if they are not an admin
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-white flex items-center justify-center">
      
      {/* Background elements */}
      <div className="neo-glow bg-rose-500/10 w-[800px] h-[800px] top-[-300px] left-[-200px]" />
      <div className="neo-glow bg-brand-purple/10 w-[600px] h-[600px] bottom-[-200px] right-[-100px]" />

      <div className="w-full max-w-md relative z-10 p-6 sm:p-12 animate-slide-up">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to main site
        </Link>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg mb-6 shadow-rose-500/20">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2 text-white tracking-tight">Super Admin Portal</h2>
          <p className="text-slate-400 font-medium">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 backdrop-blur-md">
            <span className="mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 relative group">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Admin Email</label>
            <input
              type="email"
              className="w-full bg-slate-800/40 border border-white/5 rounded-xl px-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner"
              placeholder="admin@rhockstarconnect.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10 pt-7">
              <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            </div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Secure Password</label>
            <input
              type="password"
              className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-4 pr-12 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-rose-600 to-rose-400 p-[1px] disabled:opacity-70 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] mt-8"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors z-0" />
            <div className="relative z-10 flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <span className="font-bold text-white text-lg tracking-wide">Authenticate</span>
                  <Shield className="w-5 h-5 text-white" />
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
