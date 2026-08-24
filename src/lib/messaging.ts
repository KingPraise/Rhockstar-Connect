/**
 * Firebase Cloud Messaging (FCM) Web Push Notification Service
 */

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app } from "./firebase";

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Web Push Notifications are not supported in this browser environment.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}
