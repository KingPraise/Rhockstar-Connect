"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { doc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  return null;
}
