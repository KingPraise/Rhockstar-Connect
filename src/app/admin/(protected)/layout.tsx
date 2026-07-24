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
        {/* Deep Crimson Neomorphic Background Glows */}
        <div className="neo-glow bg-rose-500/10 w-[800px] h-[800px] top-[-300px] left-[-200px]" />
        <div className="neo-glow bg-brand-purple/5 w-[600px] h-[600px] bottom-[10%] right-[-100px]" style={{ animationDelay: '2s' }} />
        
        {/* Custom Admin Sidebar Layout */}
        <AdminSidebar />
        
        <main className="flex-1 h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}
