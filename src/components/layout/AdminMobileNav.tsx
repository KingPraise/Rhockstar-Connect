"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Users, Briefcase, Megaphone, Menu } from "lucide-react";

interface AdminMobileNavProps {
  onOpenDrawer: () => void;
}

export default function AdminMobileNav({ onOpenDrawer }: AdminMobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin", icon: TrendingUp, exact: true },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
    { name: "Ads", href: "/admin/ads", icon: Megaphone },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-rose-500/20 z-40 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? "text-rose-500 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]" />
              )}
              <item.icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
}
