"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/admin/login");
      } else if (profile && profile.role !== "admin") {
        router.replace("/feed");
      } else if (!profile && user) {
        // Orphan user detected: authenticated in Auth but has no Firestore profile
        router.replace("/admin/login");
      }
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || !user || profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return <>{children}</>;
}
