"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      if (pathname.startsWith("/admin")) {
        router.replace("/admin/login");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router, pathname]);

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return <>{children}</>;
}
