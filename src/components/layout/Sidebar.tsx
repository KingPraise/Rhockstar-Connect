"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const { user, profile, logout } = useAuthStore();
  const pathname = usePathname();

  const navItems = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Connections", href: "/network", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Dating", href: "/dating", icon: Heart },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 hidden md:flex flex-col p-6 z-20">
      <div className="p-6">
        <Link href="/feed" className="flex items-center gap-3 group">
          <Image src="/logo-light.png" alt="Rhockstar Connect" width={140} height={32} className="group-hover:opacity-80 transition-opacity" />
        </Link>
      </div>

      <nav className="flex flex-col gap-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-medium transition-all group ${
                isActive 
                  ? "neo-card bg-slate-800/60 text-brand shadow-[0_0_15px_rgba(56,189,248,0.15)] border-brand/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/30"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-brand' : 'text-slate-500 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM SECTION */}
      <div className="p-6 mt-auto space-y-4">
        {/* PREMIUM CARD */}
        <div className="neo-card p-4 bg-gradient-to-br from-brand-purple/20 to-brand/20 border-brand-purple/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative z-10 text-center">
            <h4 className="font-bold text-white mb-1 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              Premium
            </h4>
            <p className="text-xs text-slate-300 mb-3">Get verified, boost visibility, and message anyone.</p>
            <Link href="/premium" className="block w-full py-2 bg-gradient-to-r from-brand to-brand-purple text-white text-sm font-bold rounded-xl hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-shadow">
              Upgrade Now
            </Link>
          </div>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="space-y-2">
          <div className="neo-card p-3 flex items-center gap-3 bg-slate-900/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center font-bold text-white shadow-lg shrink-0">
              {profile?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.fullName || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">@{profile?.username || 'user'}</p>
            </div>
          </div>
          
          <button 
            onClick={() => logout()}
            className="w-full neo-card p-3 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-bold">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
