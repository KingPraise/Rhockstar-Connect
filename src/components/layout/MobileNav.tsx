"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, MessageSquare, User, Briefcase, Bell } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Network", href: "/network", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link 
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${
                isActive ? "text-brand" : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand shadow-[0_0_10px_rgba(168,85,247,1)]" />
              )}
              <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
