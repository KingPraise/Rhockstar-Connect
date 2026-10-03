import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminRoute from "@/components/auth/AdminRoute";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="flex h-screen w-screen bg-[#020617] text-white relative overflow-hidden">
        {/* Optimized Background Radial Glows (Replaced neo-glow for better mobile performance) */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08),transparent_50%)] z-0" />
        
        {/* Custom Admin Sidebar Layout */}
        <AdminSidebar />
        
        <main className="flex-1 h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}
