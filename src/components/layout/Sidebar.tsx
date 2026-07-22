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
  Heart 
} from "lucide-react";

export default function Sidebar() {
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
          <Image src="/logo-dark.png" alt="Rhockstar Connect" width={180} height={40} className="group-hover:opacity-80 transition-opacity" />
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

      {/* Premium Upgrade CTA */}
      <div className="mt-8 pt-8 border-t border-white/5">
        <div className="neo-card p-5 bg-gradient-to-br from-brand-purple/20 to-brand/10 border border-brand-purple/30 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-purple/10 group-hover:bg-brand-purple/20 transition-colors" />
          <div className="relative z-10">
            <h4 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
              <span className="text-xl">✨</span> Premium
            </h4>
            <p className="text-slate-300 text-xs mb-4">Get verified, boost visibility, and message anyone.</p>
            <Link 
              href="/premium" 
              className="block w-full text-center py-2 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:scale-105 transition-all"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="neo-card p-4 bg-slate-800/30 flex items-center gap-4 cursor-pointer hover:border-brand/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]">
            EP
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-sm text-white truncate">Elijah Peter</span>
            <span className="text-xs text-slate-400 truncate">@elijah_p</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
