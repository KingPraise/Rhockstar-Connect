import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* Neomorphic Background Glows */}
      <div className="neo-glow bg-brand/10 w-[800px] h-[800px] top-[-300px] left-[-200px]" />
      <div className="neo-glow bg-brand-purple/10 w-[600px] h-[600px] bottom-[20%] right-[-100px]" style={{ animationDelay: '3s' }} />
      
      {/* Sidebar Layout */}
      <Sidebar />
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
