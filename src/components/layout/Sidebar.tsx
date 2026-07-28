"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  User, 
  Users, 
  MessageSquare, 
  Briefcase, 
  Bell, 
  Settings, 
  Heart,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gift,
  Shield
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutUser } from "@/lib/auth";

export default function Sidebar() {
  const { profile, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Connections", href: "/network", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Dating", href: "/dating", icon: Heart },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Rewards & Referrals", href: "/referrals", icon: Gift },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={`h-screen sticky top-0 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 hidden md:flex flex-col z-20 transition-all duration-300 ${
        isMinimized ? "w-24" : "w-72"
      } overflow-y-auto overscroll-contain no-scrollbar`}
    >
      {/* Header / Logo */}
      <div className={`p-6 flex items-center ${isMinimized ? "justify-center" : "justify-between"}`}>
        {!isMinimized ? (
          <Link href="/feed" className="flex items-center gap-3 group">
            <Image src="/logo-light.png" alt="Rhockstar Connect" width={240} height={56} className="h-14 w-auto object-contain group-hover:opacity-80 transition-opacity drop-shadow-md" />
          </Link>
        ) : (
          <Link href="/feed" className="flex justify-center group">
            <Image src="/icon.png" alt="RC" width={40} height={40} className="group-hover:opacity-80 transition-opacity" />
          </Link>
        )}
        
        {!isMinimized && (
          <button 
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isMinimized && (
        <div className="flex justify-center pb-6">
          <button 
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile on Top */}
      <div className="px-6 mb-6">
        <Link href="/profile" className={`block neo-card p-3 flex items-center ${isMinimized ? "justify-center" : "gap-3"} bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/5 hover:border-brand/30 transition-all group cursor-pointer`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 group-hover:scale-105 transition-transform">
            {profile?.fullName?.charAt(0) || 'U'}
          </div>
          {!isMinimized && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors">{profile?.fullName || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">@{profile?.username || 'user'}</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex flex-col gap-2 px-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex items-center ${isMinimized ? "justify-center px-0" : "gap-4 px-5"} py-3 rounded-xl font-semibold transition-all group relative ${
                isActive 
                  ? "bg-brand/10 text-brand shadow-[inset_0_0_15px_rgba(56,189,248,0.1)] border border-brand/20" 
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent"
              }`}
              title={isMinimized ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-brand' : 'text-slate-500 group-hover:text-white'}`} />
              {!isMinimized && <span>{item.name}</span>}
              {isActive && isMinimized && (
                <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-brand" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM SECTION */}
      <div className="p-4 mt-8 space-y-4">
        {/* PREMIUM CARD */}
        {!isMinimized ? (
          <div className="neo-card p-4 bg-gradient-to-br from-brand-purple/20 to-brand/20 border-brand-purple/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
            <div className="relative z-10 text-center">
              <h4 className="font-bold text-white mb-1 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-purple animate-pulse" />
                Premium
              </h4>
              <p className="text-xs text-slate-300 mb-3">Get verified, boost visibility, and message anyone.</p>
              <Link href="/premium" className="block w-full py-2 bg-gradient-to-r from-brand to-brand-purple text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-shadow">
                Upgrade Now
              </Link>
            </div>
          </div>
        ) : (
          <Link href="/premium" className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand/20 border border-brand-purple/30 group hover:border-brand-purple/60 transition-colors" title="Upgrade to Premium">
            <Sparkles className="w-5 h-5 text-brand-purple group-hover:scale-110 transition-transform animate-pulse" />
          </Link>
        )}

        {/* SUPER ADMIN SHORTCUT */}
        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            title={isMinimized ? "Super Admin Portal" : undefined}
            className={`w-full p-3 rounded-xl flex items-center ${isMinimized ? "justify-center" : "justify-center gap-2"} text-amber-300 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 transition-all border border-amber-500/30 shadow-lg font-bold text-sm`}
          >
            <Shield className="w-5 h-5 text-amber-400" />
            {!isMinimized && <span>Super Admin</span>}
          </Link>
        )}

        {/* LOGOUT */}
        <button 
          onClick={handleLogout}
          title={isMinimized ? "Log Out" : undefined}
          className={`w-full p-3 rounded-xl flex items-center ${isMinimized ? "justify-center" : "justify-center gap-2"} text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg`}
        >
          <LogOut className="w-5 h-5" />
          {!isMinimized && <span className="text-sm font-bold">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
