import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import MobileHeader from "@/components/layout/MobileHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#020617] text-white relative pb-16 md:pb-0">
      {/* Optimized Background Radial Glows */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.08),transparent_50%)] z-0" />
      
      {/* Mobile Top Navigation Header */}
      <MobileHeader />

      {/* Sidebar Layout for Desktop (Stationary) */}
      <Sidebar />

      {/* Main Content Area (Independently Scrollable) */}
      <main className="flex-1 h-full overflow-y-auto w-full max-w-4xl mx-auto p-4 md:p-8 relative z-10 custom-scrollbar">
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
