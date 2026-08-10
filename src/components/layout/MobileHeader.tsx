"use client";

import { useState, useEffect, useRef } from "react";
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
  TrendingUp, 
  LogOut, 
  FileText,
  Gift,
  Shield,
  Search,
  Building2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSearchStore } from "@/store/useSearchStore";
import { logoutUser } from "@/lib/auth";

import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";
import UserAvatar from "@/components/ui/UserAvatar";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const lastScrollY = useRef(0);
  
  const { profile, logout, unreadNotifications, unreadMessages } = useAuthStore();
  const { openSearch } = useSearchStore();
  const pathname = usePathname();
  const router = useRouter();
  const isPremium = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite';
  const isEmployer = profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer';

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const currentScrollY = target.scrollTop;
      const delta = currentScrollY - lastScrollY.current;
      
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (delta > 15) {
        setIsVisible(false); // scrolling down
      } else if (delta < -15) {
        setIsVisible(true); // scrolling up
      }
      
      lastScrollY.current = currentScrollY;
    };

    const mainContainer = document.getElementById("main-scroll-container");
    if (mainContainer) {
      mainContainer.addEventListener("scroll", handleScroll);
      return () => mainContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Handle body scroll locking when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logoutUser();
    logout();
    router.push('/login');
  };

  const socialLinks = [
    { name: "Search", href: "/search", icon: Search },
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Network", href: "/network", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Dating", href: "/dating", icon: Heart },
  ].filter(item => !(item.name === "Dating" && profile?.accountType === 'employer'));

  const careerLinks = [
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    ...(isEmployer ? [{ name: "Employer Portal", href: "/employer", icon: Building2 }] : []),
    { name: "Insights", href: "/insights", icon: TrendingUp },
    { name: "Career Hub", href: "/resources/career", icon: FileText },
  ];

  const accountLinks = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Rewards", href: "/referrals", icon: Gift, badge: "NEW" },
    { name: "Premium", href: "/premium", icon: Sparkles, badge: "PRO" },
    { name: "Settings", href: "/settings", icon: Settings },
  ].filter(item => !(item.name === "Premium" && isPremium));

  return (
    <>
      {/* Top Bar for Mobile */}
      <header className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <Link href="/feed" className="flex items-center gap-2 pl-2">
          <Image src="/icon.png" alt="Rhockstar Connect" width={32} height={32} priority className="object-contain" />
          <span className="font-extrabold text-xl tracking-tight text-white">Rhockstar <span className="text-brand">Connect</span></span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/messages"
            className="relative p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-white/5 active:scale-95 transition-all"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center bg-brand text-[10px] font-bold text-white rounded-full px-1 border-2 border-slate-900 animate-in zoom-in">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </Link>

          <Link
            href="/notifications"
            className="relative p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-white/5 active:scale-95 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full px-1 border-2 border-slate-900 animate-in zoom-in">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
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
        <div className="md:hidden fixed inset-0 z-[60] flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
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
                <UserAvatar src={profile?.avatar} name={profile?.fullName} className="w-12 h-12 rounded-xl" textClassName="text-lg font-bold" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-white truncate">{profile?.fullName || 'User'}</p>
                    {isPremium && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                        {profile.subscriptionTier}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand font-medium truncate">@{profile?.username || 'username'}</p>
                </div>
              </Link>
            </div>

            {/* Menu Items List */}
            <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              
              {/* Social Section */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Social</p>
                <div className="space-y-1">
                  {socialLinks.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/feed' && pathname.startsWith(item.href));
                    
                    if (item.name === "Search") {
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            setIsOpen(false);
                            openSearch();
                          }}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all w-full text-left text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 text-slate-400`} />
                            <span>{item.name}</span>
                          </div>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
                          isActive 
                            ? "bg-brand/10 text-brand shadow-[inset_0_0_15px_rgba(56,189,248,0.1)] border border-brand/20" 
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-brand' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Career Section */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Career</p>
                <div className="space-y-1">
                  {careerLinks.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
                          isActive 
                            ? "bg-brand/10 text-brand shadow-[inset_0_0_15px_rgba(56,189,248,0.1)] border border-brand/20" 
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-brand' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account Section */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Account</p>
                <div className="space-y-1">
                  {accountLinks.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
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
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent transition-all mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {profile?.role === 'admin' && (
                <div className="mt-4 pb-4">
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold transition-all border border-amber-500/30 shadow-lg"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Super Admin Portal</span>
                  </Link>
                </div>
              )}

            </nav>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal for Mobile */}
      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}
