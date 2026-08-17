"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { getThemeClasses } from "@/lib/constants/themes";

export default function DashboardThemeContainer({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();
  const themeClasses = getThemeClasses((profile as any)?.profileTheme);

  return (
    <div className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden text-white relative pb-16 md:pb-0 transition-colors duration-500 ${themeClasses.appBg}`}>
      {/* Dynamic Ambient Background Radial Glows */}
      <div className={`pointer-events-none fixed inset-0 transition-all duration-500 ${themeClasses.radialGlow} z-0`} />
      {children}
    </div>
  );
}
