/**
 * Firebase Cloud Messaging (FCM) Web Push Notification Service
 */

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app } from "./firebase";

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Push notifications are not supported in this browser.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging(app);
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const token = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    } else {
      console.warn("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}

export async function setupMessageListener(callback: (payload: any) => void) {
  try {
    const supported = await isSupported();
    if (!supported) return;

    // We import dynamicly because this should only run on the client
    const { onMessage, getMessaging } = await import("firebase/messaging");
    const messaging = getMessaging(app);

    return onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      callback(payload);
    });
  } catch (error) {
    console.error("Error setting up message listener:", error);
  }
}
