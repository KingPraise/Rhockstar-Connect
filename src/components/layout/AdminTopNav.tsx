"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Megaphone, 
  Star, 
  Gift, 
  AlertTriangle, 
  Settings, 
  UserCheck, 
  Home, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminTopNav() {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  const navItems = [
    { icon: TrendingUp, label: "Overview", href: "/admin", exact: true },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
    { icon: Megaphone, label: "Ads", href: "/admin/ads" },
    { icon: Star, label: "Subscriptions", href: "/admin/subscriptions" },
    { icon: Gift, label: "Referrals", href: "/admin/referrals" },
    { icon: AlertTriangle, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
    { icon: UserCheck, label: "Profile", href: "/admin/profile" },
  ];

  const getPageTitle = () => {
    if (pathname === "/admin") return "Overview & Metrics";
    if (pathname.startsWith("/admin/users")) return "User Management & Moderation";
    if (pathname.startsWith("/admin/jobs")) return "Job Board Management";
    if (pathname.startsWith("/admin/ads")) return "Advertisements Control";
    if (pathname.startsWith("/admin/subscriptions")) return "Memberships & Subscriptions";
    if (pathname.startsWith("/admin/referrals")) return "Referral Contests & Rewards";
    if (pathname.startsWith("/admin/reports")) return "User Reports & Moderation";
    if (pathname.startsWith("/admin/settings")) return "System & Security Settings";
    if (pathname.startsWith("/admin/profile")) return "SuperAdmin Profile";
    return "Control Center";
  };

  return (
    <div className="w-full mb-6 space-y-4">
      {/* Top Header Row: Breadcrumbs & Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-rose-500/20 shadow-lg">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-rose-500">
            <ShieldAlert className="w-4 h-4" />
            <span>SuperAdmin</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-extrabold text-white">{getPageTitle()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-white/10 hover:border-brand/40 shadow-sm"
            title="Switch to User Feed"
          >
            <Home className="w-3.5 h-3.5 text-brand" />
            <span className="hidden sm:inline">View User Feed</span>
            <span className="sm:hidden">Feed</span>
          </Link>

          {profile && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{profile.fullName || "Admin"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Quick-Nav Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 ${
                isActive
                  ? "bg-rose-500 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-[1.02]"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 hover:border-white/15"
              }`}
            >
              <item.icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-rose-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
