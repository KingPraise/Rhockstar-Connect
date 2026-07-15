"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, UserPlus, Loader2, Sparkles, AtSign } from "lucide-react";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { user, error } = await registerUser(email, password, fullName, username);

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-brand-purple/20 via-brand/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-brand/30 rounded-full blur-[40px] animate-pulse" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-brand-purple/30 rounded-full blur-[50px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Floating NAV */}
      <nav className="absolute top-0 w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-50">
        <Link href="/" className="text-xl font-bold font-outfit text-white flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)] group-hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all transform group-hover:-translate-y-1">
            <span className="font-extrabold text-white text-lg">R</span>
          </div>
          Rhockstar Connect
        </Link>
        <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
          Back to Login
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand group-hover:w-full transition-all duration-300"></span>
        </Link>
      </nav>

      {/* AUTH WRAPPER */}
      <div className="relative z-10 w-full max-w-md px-4 py-12">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-purple/40 to-brand/40 rounded-3xl blur opacity-30"></div>
        <section className="relative w-full neo-card p-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl my-8">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand/10 border border-white/5 shadow-inner mb-6">
              <Sparkles className="w-8 h-8 text-brand-purple" />
            </div>
            <h2 className="text-4xl font-extrabold mb-3 text-white tracking-tight">Create Account</h2>
            <p className="text-slate-400 font-medium">Join the Rhockstar Connect network</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 backdrop-blur-md">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <User className="w-5 h-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <input
                type="text"
                className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <AtSign className="w-5 h-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
              <input
                type="text"
                className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <input
                type="password"
                className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors group">
                <div className="relative flex items-center">
                  <input type="checkbox" required className="peer appearance-none w-5 h-5 border border-slate-600 rounded bg-slate-800/50 checked:bg-brand-purple checked:border-brand-purple transition-all cursor-pointer" />
                  <svg className="absolute w-3 h-3 text-white left-1 pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-medium group-hover:text-white transition-colors">I agree to the Terms & Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand p-[1px] disabled:opacity-70 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] mt-6"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors z-0" />
              <div className="relative z-10 flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <span className="font-bold text-white text-lg tracking-wide">Create Account</span>
                    <UserPlus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-brand-purple transition-colors ml-1 border-b border-brand-purple/30 hover:border-brand-purple pb-0.5">
              Login here
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
