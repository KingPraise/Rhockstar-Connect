"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Shield, TrendingUp, AlertTriangle, Star, Settings, LogOut, UserCheck, Menu, X, Gift } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutUser } from "@/lib/auth";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, logout } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push("/login");
  };

  const navItems = [
    { icon: TrendingUp, label: "Overview", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Star, label: "Subscriptions", href: "/admin/subscriptions" },
    { icon: Gift, label: "Referrals & Rewards", href: "/admin/referrals" },
    { icon: AlertTriangle, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
    { icon: UserCheck, label: "Admin Profile", href: "/admin/profile" },
  ];

  return (
    <>
      {/* MOBILE TOP BAR FOR ADMIN */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-rose-500/20 px-4 py-3 flex items-center justify-between shadow-xl">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-base">Super<span className="text-rose-500">Admin</span></span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 border border-white/10"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER (Desktop Sidebar + Mobile Drawer) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50 bg-slate-900/95 backdrop-blur-xl border-r border-rose-500/20 flex flex-col justify-between py-6 px-4 transition-all duration-300 overflow-y-auto overscroll-contain no-scrollbar
        ${mobileOpen ? "translate-x-0 w-64 shadow-2xl pt-20 lg:pt-6" : "-translate-x-full lg:translate-x-0 w-64"}
      `}>
        <div>
          {/* LOGO */}
          <div className="hidden lg:flex items-center px-2 mb-8">
            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg group-hover:shadow-rose-500/50 transition-all">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Super<span className="text-rose-500">Admin</span></span>
            </Link>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? "bg-rose-500/15 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className={`font-bold ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER */}
        <div className="space-y-4">
          {profile && (
            <Link href="/admin/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/50 border border-rose-500/10 hover:border-rose-500/30 transition-all">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-500/20 relative flex-shrink-0 border border-rose-500/50">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt={profile.fullName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rose-500 font-bold text-sm">
                    {profile.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-bold text-sm truncate">{profile.fullName}</p>
                <p className="text-rose-400 text-xs truncate">Super Administrator</p>
              </div>
            </Link>
          )}

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
