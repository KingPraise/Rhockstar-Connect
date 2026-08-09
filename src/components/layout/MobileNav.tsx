"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Briefcase, MessageSquare, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useAuthStore } from "@/store/useAuthStore";

export default function MobileNav() {
  const pathname = usePathname();
  const { unreadMessages } = useAuthStore();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const currentScrollY = target.scrollTop;
      const delta = currentScrollY - lastScrollY.current;
      
      if (currentScrollY < 50) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
      } else if (delta > 15) {
        setIsVisible(false); // scrolling down
        lastScrollY.current = currentScrollY;
      } else if (delta < -15) {
        setIsVisible(true); // scrolling up
        lastScrollY.current = currentScrollY;
      }
    };

    const container = document.getElementById('main-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const navItems = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Dating", href: "/dating", icon: Heart, isSpecial: true },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isDating = item.href === '/dating';
          
          return (
            <Link 
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${
                isActive 
                  ? (isDating ? "text-rose-500 font-bold" : "text-brand font-bold") 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  isDating ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]" : "bg-brand shadow-[0_0_10px_rgba(56,189,248,1)]"
                }`} />
              )}
              <div className="relative">
                <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''} ${isDating && isActive ? 'fill-rose-500/20' : ''}`} />
                {item.href === '/messages' && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] flex items-center justify-center bg-brand text-[9px] font-bold text-white rounded-full px-1 border border-slate-900 shadow-md">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
