"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
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
      router.push("/feed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-white flex flex-col items-center justify-center">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-brand/20 via-brand-purple/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-brand/30 rounded-full blur-[40px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-brand-purple/30 rounded-full blur-[50px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Floating NAV */}
      <nav className="absolute top-0 w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-50">
        <Link href="/" className="text-xl font-bold font-outfit text-white flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)] group-hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all transform group-hover:-translate-y-1">
            <span className="font-extrabold text-white text-lg">R</span>
          </div>
          Rhockstar Connect
        </Link>
        <Link href="/register" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
          Create Account
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand group-hover:w-full transition-all duration-300"></span>
        </Link>
      </nav>

      {/* AUTH WRAPPER */}
      <div className="relative z-10 w-full max-w-md px-4 py-12">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-brand/40 to-brand-purple/40 rounded-3xl blur opacity-30"></div>
        <section className="relative w-full neo-card p-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/10 to-brand-purple/10 border border-white/5 shadow-inner mb-6">
              <Sparkles className="w-8 h-8 text-brand" />
            </div>
            <h2 className="text-4xl font-extrabold mb-3 text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 font-medium">Login to continue to Rhockstar Connect</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 backdrop-blur-md">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border border-slate-600 rounded bg-slate-800/50 checked:bg-brand checked:border-brand transition-all cursor-pointer" />
                  <svg className="absolute w-3 h-3 text-white left-1 pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-medium group-hover:text-white transition-colors">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-slate-400 hover:text-brand font-medium transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-purple p-[1px] disabled:opacity-70 transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] mt-4"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors z-0" />
              <div className="relative z-10 flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <span className="font-bold text-white text-lg tracking-wide">Access Account</span>
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:text-brand transition-colors ml-1 border-b border-brand/30 hover:border-brand pb-0.5">
              Create one now
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
