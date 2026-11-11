"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { doc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { playNotificationChime } from "@/lib/audioNotifications";
import { Community, isCommunityUnread } from "@/lib/services/communities";

// Badging API type declarations (not yet in default TypeScript lib)
declare global {
  interface Navigator {
    setAppBadge?: (count?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }
}

export default function PresenceHeartbeat() {
  const { profile, setUnreadMessages, setUnreadNotifications, setUnreadCommunities } = useAuthStore();
  const prevMessagesRef = useRef<number | null>(null);
  const prevNotifsRef = useRef<number | null>(null);
  const prevCommunitiesRef = useRef<number | null>(null);

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

  // 2. Global Unread Messages, Notifications & Communities Subscription
  useEffect(() => {
    if (!profile?.uid) return;

    // A. Listen to chats where unread messages exist for current user
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", profile.uid)
    );

    const unsubscribeChats = onSnapshot(
      chatsQuery,
      (snapshot) => {
        let unreadCount = 0;
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.unreadCount && data.unreadCount[profile.uid]) {
            unreadCount += data.unreadCount[profile.uid];
          }
        });

        if (prevMessagesRef.current !== null && unreadCount > prevMessagesRef.current) {
          playNotificationChime();
        }
        prevMessagesRef.current = unreadCount;
        setUnreadMessages(unreadCount);
      },
      (error) => {
        console.warn("[PresenceHeartbeat] Chats subscription notice:", error);
      }
    );

    // B. Listen to unread notifications (excluding direct message notifications)
    const notifsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", profile.uid),
      where("read", "==", false)
    );

    const unsubscribeNotifs = onSnapshot(
      notifsQuery,
      (snapshot) => {
        const nonMessageNotifs = snapshot.docs.filter((docSnap) => docSnap.data().type !== 'message');
        const count = nonMessageNotifs.length;

        if (prevNotifsRef.current !== null && count > prevNotifsRef.current) {
          playNotificationChime();
        }
        prevNotifsRef.current = count;
        setUnreadNotifications(count);
      },
      (error) => {
        console.warn("[PresenceHeartbeat] Notifications subscription notice:", error);
      }
    );

    // C. Listen to communities joined by current user to track unread activity
    let cachedCommDocs: any[] = [];
    const communitiesQuery = query(
      collection(db, "communities"),
      where("members", "array-contains", profile.uid)
    );

    const checkCommunityUnread = (docs: any[]) => {
      let unreadCount = 0;
      docs.forEach((docSnap) => {
        const comm = { id: docSnap.id, ...docSnap.data() } as Community;
        // Don't mark as unread if the last message was sent by the user themselves
        if (comm.lastSenderId === profile.uid) return;
        if (isCommunityUnread(comm)) {
          unreadCount++;
        }
      });

      if (prevCommunitiesRef.current !== null && unreadCount > prevCommunitiesRef.current) {
        playNotificationChime();
      }
      prevCommunitiesRef.current = unreadCount;
      setUnreadCommunities(unreadCount);
    };

    const unsubscribeCommunities = onSnapshot(
      communitiesQuery,
      (snapshot) => {
        cachedCommDocs = snapshot.docs;
        checkCommunityUnread(snapshot.docs);
      },
      (error) => {
        console.warn("[PresenceHeartbeat] Communities subscription notice:", error);
      }
    );

    const handleCommunityReadEvent = () => {
      checkCommunityUnread(cachedCommDocs);
    };
    window.addEventListener("rhockstar:community-read", handleCommunityReadEvent);

    return () => {
      unsubscribeChats();
      unsubscribeNotifs();
      unsubscribeCommunities();
      window.removeEventListener("rhockstar:community-read", handleCommunityReadEvent);
    };
  }, [profile?.uid, setUnreadMessages, setUnreadNotifications, setUnreadCommunities]);

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

      // Sync count to service worker for background badge accuracy on Android & iOS
      if ('serviceWorker' in navigator) {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SET_BADGE',
            count: total
          });
        }
        navigator.serviceWorker.getRegistrations?.().then((registrations) => {
          registrations.forEach((reg) => {
            reg.active?.postMessage({
              type: 'SET_BADGE',
              count: total
            });
          });
        }).catch(() => {});
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


  return null;
}
