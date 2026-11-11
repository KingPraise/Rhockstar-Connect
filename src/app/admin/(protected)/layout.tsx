"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopNav from "@/components/layout/AdminTopNav";
import AdminMobileNav from "@/components/layout/AdminMobileNav";
import AdminRoute from "@/components/auth/AdminRoute";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <AdminRoute>
      <div className="flex h-screen w-screen bg-[#020617] text-white relative overflow-hidden">
        {/* Background Radial Glows */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08),transparent_50%)] z-0" />
        
        {/* Custom Admin Sidebar Layout (Desktop Stationary + Mobile Slide-over Drawer) */}
        <AdminSidebar 
          mobileOpen={mobileDrawerOpen}
          setMobileOpen={setMobileDrawerOpen}
        />
        
        {/* Main Content Area with Header & Bottom-nav clearance */}
        <main className="flex-1 h-full overflow-y-auto w-full max-w-7xl mx-auto p-3.5 pt-18 pb-28 sm:p-6 sm:pt-20 sm:pb-28 lg:p-8 lg:pt-8 lg:pb-8 relative z-10 custom-scrollbar">
          <AdminTopNav />
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar for Instant 1-Tap Switching */}
        <AdminMobileNav onOpenDrawer={() => setMobileDrawerOpen(true)} />
      </div>
    </AdminRoute>
  );
}
