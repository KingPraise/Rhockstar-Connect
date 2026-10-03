"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { doc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Badging API type declarations (not yet in default TypeScript lib)
declare global {
  interface Navigator {
    setAppBadge?: (count?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }
}

export default function PresenceHeartbeat() {
  const { profile, setUnreadMessages, setUnreadNotifications } = useAuthStore();

  // 1. Online Presence Heartbeat
  useEffect(() => {
    if (!profile?.uid) return;

    const userDocRef = doc(db, "users", profile.uid);

    const updatePresence = async (isOnline: boolean) => {
      try {
        await updateDoc(userDocRef, {
          lastSeen: serverTimestamp(),
          isOnline
        });
      } catch (err) {
        // Ignore background permission errors if logging out
      }
    };

    // Immediate ping on mount
    updatePresence(true);

    // Heartbeat every 60 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        updatePresence(true);
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        updatePresence(false);
      } else {
        updatePresence(true);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      updatePresence(false);
    };
  }, [profile?.uid]);

  // 2. Global Unread Messages & Notifications Subscription
  useEffect(() => {
    if (!profile?.uid) return;

    // Listen to chats where unread messages exist for current user
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", profile.uid)
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      let unreadCount = 0;
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.unreadCount && data.unreadCount[profile.uid]) {
          unreadCount += data.unreadCount[profile.uid];
        }
      });
      setUnreadMessages(unreadCount);
    });

    // Listen to unread notifications
    const notifsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", profile.uid),
      where("read", "==", false)
    );

    const unsubscribeNotifs = onSnapshot(notifsQuery, (snapshot) => {
      setUnreadNotifications(snapshot.docs.length);
    });

    return () => {
      unsubscribeChats();
      unsubscribeNotifs();
    };
  }, [profile?.uid, setUnreadMessages, setUnreadNotifications]);

  // 3. PWA App Icon Badge Count (shows number on app icon like WhatsApp, TikTok, Messenger)
  useEffect(() => {
    if (!profile?.uid || !navigator.setAppBadge) return;

    const updateBadge = (state: { unreadMessages: number; unreadNotifications: number }) => {
      const total = state.unreadMessages + state.unreadNotifications;
      if (total > 0) {
        navigator.setAppBadge!(total).catch(() => {});
      } else {
        navigator.clearAppBadge?.().catch(() => {});
      }

      // Sync count to service worker for background badge accuracy
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_BADGE',
          count: total
        });
      }
    };

    // Set initial badge from current store state
    updateBadge(useAuthStore.getState());

    // React to future unread count changes
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      const total = state.unreadMessages + state.unreadNotifications;
      const prevTotal = prevState.unreadMessages + prevState.unreadNotifications;
      if (total !== prevTotal) {
        updateBadge(state);
      }
    });

    return () => {
      unsubscribe();
      // Clear badge on logout / unmount
      navigator.clearAppBadge?.().catch(() => {});
    };
  }, [profile?.uid]);

  // 4. Push Notification & Service Worker Registration
  useEffect(() => {
    if (!profile?.uid) return;

    const setupPushNotifications = async () => {
      try {
        // Don't prompt if user has already denied
        if ('Notification' in window && Notification.permission === 'denied') return;

        // Register the Firebase Cloud Messaging service worker
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/firebase-cloud-messaging-push-scope'
          });
        }

        // Request notification permission and save FCM token to Firestore
        const { requestNotificationPermission } = await import('@/lib/services/notifications');
        await requestNotificationPermission(profile.uid);
      } catch (err) {
        console.warn('Push notification setup:', err);
      }
    };

    // Delay slightly to avoid blocking initial page render
    const timer = setTimeout(setupPushNotifications, 3000);
    return () => clearTimeout(timer);
  }, [profile?.uid]);

  return null;
}
