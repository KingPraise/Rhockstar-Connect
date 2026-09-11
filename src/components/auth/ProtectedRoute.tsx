"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, logout } = useAuthStore();
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
    pathname.startsWith("/company") || 
    pathname === "/jobs" || 
    pathname === "/terms";

  useEffect(() => {
    const checkExpiration = async () => {
      if (!isLoading && profile && profile.premiumUntil && profile.subscriptionTier && profile.subscriptionTier !== 'free') {
        const expirationDate = new Date(profile.premiumUntil);
        if (expirationDate < new Date()) {
          import('firebase/firestore').then(async ({ doc, updateDoc }) => {
            const { db } = await import('@/lib/firebase');
            await updateDoc(doc(db, 'users', profile.uid), {
              subscriptionTier: 'free',
              subscriptionStatus: 'inactive'
            });
            import('react-hot-toast').then(({ toast }) => {
              toast.error("Your Premium subscription has expired.");
            });
            // Update local state to avoid infinite loops
            useAuthStore.getState().setProfile({ ...profile, subscriptionTier: 'free', subscriptionStatus: 'inactive' } as any);
          });
        }
      }
    };
    checkExpiration();
  }, [profile, isLoading]);

  useEffect(() => {
    if (!isLoading && profile?.isBanned) {
      import('react-hot-toast').then(({ toast }) => {
        toast.error("Your account has been banned due to policy violations.");
      });
      logout();
      router.replace("/login");
    }
  }, [profile, isLoading, logout, router]);

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
