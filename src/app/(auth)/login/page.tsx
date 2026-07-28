"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/auth";
import Image from "next/image";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rhockstar_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem("rhockstar_remembered_email", email);
    } else {
      localStorage.removeItem("rhockstar_remembered_email");
    }

    const { user, error } = await loginUser(email, password, rememberMe);

    if (error) {
      setError(error);
      setLoading(false);
    } else if (user) {
      window.location.href = "/feed";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-white flex">
      {/* LEFT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 p-6 sm:p-12">
        {/* NAV */}
        <nav className="flex justify-between items-center w-full max-w-lg mx-auto mb-auto animate-fade-in">
          <Link href="/" className="flex items-center group">
            <Image src="/logo-light.png" alt="Rhockstar Connect" width={140} height={32} className="group-hover:opacity-80 transition-opacity" />
          </Link>
          <Link href="/register" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Create Account
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        {/* AUTH WRAPPER */}
        <div className="w-full max-w-md mx-auto my-auto py-12 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="text-left mb-10">
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-slate-400 hover:text-brand transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border border-slate-600 rounded bg-slate-800/50 checked:bg-brand checked:border-brand transition-all cursor-pointer" 
                  />
                  <svg className="absolute w-3 h-3 text-white left-1 pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-medium group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setResetModalOpen(true)}
                className="text-sm text-slate-400 hover:text-brand font-medium transition-colors"
              >
                Forgot Password?
              </button>
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
          
          <div className="mt-8 text-center text-xs text-slate-500">
            By continuing, you agree to our <Link href="/terms" className="hover:text-brand transition-colors underline decoration-white/20">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-brand/20 mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#020617] z-20" />
        <Image 
          src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80" 
          alt="Professional working" 
          fill
          className="object-cover"
        />
        <div className="absolute bottom-12 right-12 z-30 max-w-md text-right">
          <h2 className="text-4xl font-bold text-white mb-4">Your next big opportunity is waiting.</h2>
          <p className="text-lg text-white/80 font-medium">Join thousands of professionals already connecting on Rhockstar Connect.</p>
        </div>
      </div>

      <ResetPasswordModal 
        isOpen={resetModalOpen} 
        onClose={() => setResetModalOpen(false)} 
      />
    </div>
  );
}
