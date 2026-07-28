"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, UserPlus, Loader2, AtSign, Gift, Eye, EyeOff, Calendar } from "lucide-react";
import { registerUser } from "@/lib/auth";
import Image from "next/image";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("code") || searchParams.get("referral");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

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

    if (!dobYear || !dobMonth || !dobDay) {
      setError("Please complete your date of birth");
      setLoading(false);
      return;
    }

    const dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;

    // Check age >= 18
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    if (age < 18) {
      setError("You must be at least 18 years old to join Rhockstar Connect, as per our Terms of Service.");
      setLoading(false);
      return;
    }

    const { user, error } = await registerUser(email, password, fullName, username, referralCode);

    if (error) {
      setError(error);
      setLoading(false);
    } else if (user) {
      router.push("/feed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-white flex">
      
      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 p-6 sm:p-12 order-1 lg:order-2">
        {/* NAV */}
        <nav className="flex justify-between items-center w-full max-w-xl mx-auto mb-auto animate-fade-in">
          <Link href="/" className="flex items-center group">
            <Image src="/logo-light.png" alt="Rhockstar Connect" width={140} height={32} className="group-hover:opacity-80 transition-opacity" />
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Login
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-purple group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        {/* AUTH WRAPPER */}
        <div className="w-full max-w-lg mx-auto my-auto py-12 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="text-left mb-10">
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date of Birth</label>
              <div className="flex gap-2">
                <select
                  className="w-1/3 bg-slate-800/40 border border-white/5 rounded-xl px-3 py-4 text-white focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner appearance-none cursor-pointer text-center"
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  required
                >
                  <option value="" disabled>Month</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'short' })} ({m})</option>
                  ))}
                </select>
                
                <select
                  className="w-1/3 bg-slate-800/40 border border-white/5 rounded-xl px-3 py-4 text-white focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner appearance-none cursor-pointer text-center"
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  required
                >
                  <option value="" disabled>Day</option>
                  {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  className="w-1/3 bg-slate-800/40 border border-white/5 rounded-xl px-3 py-4 text-white focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner appearance-none cursor-pointer text-center"
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  required
                >
                  <option value="" disabled>Year</option>
                  {Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - 10 - i)).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-slate-400 hover:text-brand-purple transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full bg-slate-800/40 border border-white/5 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all shadow-inner"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-slate-400 hover:text-brand-purple transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 pt-7">
                <Gift className="w-5 h-5 text-amber-400 group-focus-within:text-brand-purple transition-colors" />
              </div>
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Code (Optional)</label>
                {referralCode && <span className="text-xs text-amber-400 font-bold">Applied! ✨</span>}
              </div>
              <input
                type="text"
                className="w-full bg-slate-800/40 border border-amber-500/20 rounded-xl pl-12 pr-4 py-4 text-amber-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
                placeholder="Enter referral username (e.g. elijah)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
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
                <span className="font-medium group-hover:text-white transition-colors">I agree to the <Link href="/terms" className="text-brand-purple hover:underline">Terms of Service</Link> & Privacy Policy</span>
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
        </div>
      </div>

      {/* LEFT SIDE: Image */}
      <div className="hidden lg:block lg:w-1/2 relative order-2 lg:order-1 border-r border-white/5">
        <div className="absolute inset-0 bg-brand-purple/20 mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020617] z-20" />
        <Image 
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80" 
          alt="People networking" 
          fill
          className="object-cover"
        />
        <div className="absolute bottom-12 left-12 z-30 max-w-md text-left">
          <h2 className="text-4xl font-bold text-white mb-4">A community built for growth.</h2>
          <p className="text-lg text-white/80 font-medium">Join the network where professionals connect, collaborate, and discover new opportunities.</p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
