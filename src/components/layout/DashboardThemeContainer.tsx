"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { getThemeClasses } from "@/lib/constants/themes";
import { useEffect } from "react";

export default function DashboardThemeContainer({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();
  const activeTheme = (profile as any)?.profileTheme;
  const themeClasses = getThemeClasses(activeTheme);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--theme-primary", themeClasses.primaryColor);
      root.style.setProperty("--theme-primary-hover", themeClasses.primaryHover);
      root.style.setProperty("--theme-primary-rgb", themeClasses.primaryRgb);
    }
  }, [themeClasses]);

  return (
    <div 
      className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden text-white relative pb-16 md:pb-0 transition-colors duration-500 ${themeClasses.appBg}`}
      style={{
        // Inject CSS variables for real-time dynamic button & card styling
        ["--theme-primary" as any]: themeClasses.primaryColor,
        ["--theme-primary-hover" as any]: themeClasses.primaryHover,
        ["--theme-primary-rgb" as any]: themeClasses.primaryRgb,
      }}
    >
      {/* Dynamic Ambient Background Radial Glows */}
      <div className={`pointer-events-none fixed inset-0 transition-all duration-500 ${themeClasses.radialGlow} z-0`} />
      {children}
    </div>
  );
}
