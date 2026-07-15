"use client";

import Link from "next/link";
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
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center neo-card shadow-brand/30">
          <span className="font-extrabold text-white text-lg">R</span>
        </div>
        <h2 className="text-xl font-bold font-outfit text-white tracking-tight">Rhockstar</h2>
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
