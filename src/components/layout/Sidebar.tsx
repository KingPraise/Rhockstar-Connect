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
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Gift,
  Shield,
  Search,
  Building2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSearchStore } from "@/store/useSearchStore";
import { logoutUser } from "@/lib/auth";

export default function Sidebar() {
  const { profile, logout, unreadNotifications, unreadMessages } = useAuthStore();
  const { openSearch } = useSearchStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const isPremium = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite';
  const isEmployer = (profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer') && (profile?.subscriptionTier === 'elite' || profile?.role === 'admin');

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push('/login');
  };

  const primaryNavItems = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Network", href: "/network", icon: Users },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    ...(isEmployer ? [{ name: "Employer Portal", href: "/employer", icon: Building2 }] : []),
    { name: "Messages", href: "/messages", icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages.toString() : undefined },
    { name: "Dating", href: "/dating", icon: Heart },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications.toString() : undefined },
  ].filter(item => !(item.name === "Dating" && profile?.accountType === 'employer'));

  const secondaryNavItems = [
    { name: "Search", href: "/search", icon: Search },
    { name: "Insights", href: "/insights", icon: TrendingUp },
    { name: "Career Hub", href: "/resources/career", icon: Briefcase },
    { name: "Rewards", href: "/referrals", icon: Gift },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <aside 
      className={`h-screen sticky top-0 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 hidden md:flex flex-col z-20 transition-all duration-300 ${
        isMinimized ? "w-24" : "w-72"
      } overflow-y-auto overscroll-contain no-scrollbar`}
    >
      {/* Header / Logo */}
      <div className={`p-6 flex items-center ${isMinimized ? "justify-center" : "justify-between"}`}>
        {!isMinimized ? (
          <Link href="/feed" className="flex items-center justify-center group pl-2 mt-2 w-full">
            <Image src="/icon.png" alt="Rhockstar Connect" width={140} height={140} className="object-contain group-hover:opacity-80 transition-opacity" />
          </Link>
        ) : (
          <Link href="/feed" className="flex justify-center group">
            <Image src="/icon.png" alt="RC" width={56} height={56} className="group-hover:opacity-80 transition-opacity" />
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
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors">{profile?.fullName || 'User'}</p>
                {isPremium && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                    {profile.subscriptionTier}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">@{profile?.username || 'user'}</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex flex-col gap-2 px-4 flex-1">
        {/* Primary Nav */}
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              id={`tour-${item.name.toLowerCase()}-nav`}
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

        {/* More Options Section */}
        <div className="mt-2">
          {!isMinimized && (
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="w-full flex items-center justify-between px-5 py-3 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform opacity-0" /> {/* Spacer */}
                <span className="-ml-9">Explore More</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-90' : ''}`} />
            </button>
          )}

          {(isMoreOpen || isMinimized) && (
            <div className={`flex flex-col gap-2 ${isMinimized ? 'mt-4 border-t border-white/5 pt-4' : 'mt-1 pl-4 border-l-2 border-white/5 ml-7'}`}>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                if (item.name === "Search") {
                  return (
                    <button
                      key={item.name}
                      onClick={openSearch}
                      className={`flex items-center ${isMinimized ? "justify-center px-0" : "gap-4 px-4"} py-2.5 rounded-xl font-semibold transition-all group relative text-slate-400 hover:text-white hover:bg-slate-800/30 w-full text-left`}
                      title={isMinimized ? item.name : undefined}
                    >
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 text-slate-500 group-hover:text-white`} />
                      {!isMinimized && <span className="text-sm">{item.name}</span>}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center ${isMinimized ? "justify-center px-0" : "gap-4 px-4"} py-2.5 rounded-xl font-semibold transition-all group relative ${
                      isActive 
                        ? "text-brand bg-brand/5" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                    }`}
                    title={isMinimized ? item.name : undefined}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-brand' : 'text-slate-500 group-hover:text-white'}`} />
                    {!isMinimized && <span className="text-sm">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* BOTTOM SECTION */}
      <div className="p-4 mt-8 space-y-4">
        {/* PREMIUM CARD */}
        {!isPremium && (
          !isMinimized ? (
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
          )
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

      </div>
    </aside>
  );
}
