"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  Bell, 
  Home, 
  User, 
  Users, 
  MessageSquare, 
  Heart, 
  Briefcase, 
  Settings, 
  Sparkles, 
  LogOut, 
  FileText,
  Gift,
  Shield
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutUser } from "@/lib/auth";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setIsOpen(false);
    await logoutUser();
    logout();
    router.push('/login');
  };

  const navLinks = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Connections", href: "/network", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Dating", href: "/dating", icon: Heart },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Rewards & Referrals", href: "/referrals", icon: Gift, badge: "NEW" },
    { name: "Premium", href: "/premium", icon: Sparkles, badge: "PRO" },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Terms of Service", href: "/terms", icon: FileText },
  ];

  return (
    <>
      {/* Top Bar for Mobile */}
      <header className="md:hidden sticky top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg">
        <Link href="/feed" className="flex items-center gap-2 pl-1">
          <Image src="/logo-light.png" alt="Rhockstar Connect" width={220} height={56} priority className="h-14 w-auto object-contain drop-shadow-md" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-white/5 active:scale-95 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Drawer Content */}
          <div className="relative w-[85%] max-w-sm bg-slate-900 border-l border-white/10 h-[100dvh] flex flex-col z-10 shadow-2xl animate-slide-left">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Menu Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Card Header */}
            <div className="p-5 border-b border-white/10 bg-slate-900/60">
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 hover:border-brand/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    profile?.fullName?.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white truncate">{profile?.fullName || 'User'}</p>
                  <p className="text-xs text-brand font-medium truncate">@{profile?.username || 'username'}</p>
                </div>
              </Link>
            </div>

            {/* Menu Items List */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {navLinks.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/feed' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-all ${
                      isActive 
                        ? "bg-brand/10 text-brand shadow-[inset_0_0_15px_rgba(56,189,248,0.1)] border border-brand/20" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-brand' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-brand to-brand-purple text-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer / Logout */}
            <div className="p-4 pb-8 border-t border-white/10 bg-slate-950/60 flex flex-col gap-3">
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold transition-all border border-amber-500/30"
                >
                  <Shield className="w-5 h-5" />
                  <span>Super Admin Portal</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold transition-all active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
