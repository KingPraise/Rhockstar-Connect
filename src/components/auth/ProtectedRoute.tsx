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
    if (user && mounted) {
      import('@/lib/services/notifications').then(({ requestNotificationPermission, subscribeToNotifications }) => {
        requestNotificationPermission(user.uid);
        
        // Keep unread count globally synced
        const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
          const unreadCount = notifications.filter(n => !n.read).length;
          useAuthStore.getState().setUnreadNotifications(unreadCount);
        });
        
        // We won't strictly unsubscribe here since ProtectedRoute wraps the whole app
        // and we want notifications running as long as the user is logged in.
      }).catch(console.error);
    }
  }, [user, mounted]);

  const isPublicRoute = 
    pathname === "/feed" || 
    pathname.startsWith("/profile") || 
    pathname === "/jobs" || 
    pathname === "/terms";

  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      if (pathname.startsWith("/admin")) {
        router.replace("/admin/login");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router, pathname, isPublicRoute]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
