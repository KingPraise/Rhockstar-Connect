"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { playNotificationChime, isNotificationSoundEnabled } from "@/lib/audioNotifications";

export default function SubscriptionLifecycleManager() {
  const { profile, setProfile, isLoading } = useAuthStore();
  const checkingRef = useRef(false);

  useEffect(() => {
    if (isLoading || !profile?.uid || !profile.premiumUntil) return;
    if (checkingRef.current) return;

    checkingRef.current = true;

    const processLifecycle = async () => {
      try {
        const expiryDate = new Date(profile.premiumUntil!);
        if (isNaN(expiryDate.getTime())) return;

        const now = Date.now();
        const msRemaining = expiryDate.getTime() - now;
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60)));

        const sentReminders: string[] = (profile as any).subscriptionRemindersSent || [];
        const isSubActive =
          (profile.subscriptionTier === "pro" || profile.subscriptionTier === "elite") &&
          profile.subscriptionStatus !== "inactive";

        // 1. Expiration check: Has subscription expired?
        if (msRemaining <= 0) {
          if (isSubActive) {
            // Downgrade to free tier and record expiration milestone
            const userRef = doc(db, "users", profile.uid);
            await updateDoc(userRef, {
              subscriptionTier: "free",
              subscriptionStatus: "inactive",
              subscriptionRemindersSent: arrayUnion("expired"),
            });

            // Send in-app notification if not sent yet
            if (!sentReminders.includes("expired")) {
              await addDoc(collection(db, "notifications"), {
                userId: profile.uid,
                type: "subscription",
                title: "❌ Premium Subscription Expired",
                message: `Your ${profile.subscriptionTier?.toUpperCase()} subscription has ended. Click here to renew and restore your verified badge and perks!`,
                link: "/premium",
                read: false,
                createdAt: serverTimestamp(),
              });

              if (isNotificationSoundEnabled()) {
                playNotificationChime();
              }
            }

            setProfile({
              ...profile,
              subscriptionTier: "free",
              subscriptionStatus: "inactive",
              subscriptionRemindersSent: [...sentReminders, "expired"],
            } as any);
          }
          return;
        }

        // 2. Active Subscription: Countdown Reminders (7d, 5d, 3d, 1d)
        if (!isSubActive) return;

        let milestoneToSend: { key: string; title: string; message: string } | null = null;

        if (msRemaining <= 24 * 60 * 60 * 1000) {
          // Less than 24 hours left
          if (!sentReminders.includes("1d")) {
            milestoneToSend = {
              key: "1d",
              title: "🚨 Final Notice: 24 Hours Left on Premium!",
              message: `Your ${profile.subscriptionTier?.toUpperCase()} perks expire in under ${hoursRemaining} hour(s)! Renew today to keep your verified badge and unlimited messaging.`,
            };
          }
        } else if (daysRemaining <= 3) {
          // 3 days left
          if (!sentReminders.includes("3d")) {
            milestoneToSend = {
              key: "3d",
              title: "⚠️ Premium Expiring in 3 Days",
              message: `Only 3 days remaining on your ${profile.subscriptionTier?.toUpperCase()} membership! Renew early to keep your benefits uninterrupted.`,
            };
          }
        } else if (daysRemaining <= 5) {
          // 5 days left
          if (!sentReminders.includes("5d")) {
            milestoneToSend = {
              key: "5d",
              title: "⏳ 5 Days Remaining on Your Premium Plan",
              message: `Just 5 days left of your ${profile.subscriptionTier?.toUpperCase()} perks! Keep your Stardom ranking, dating boost, and verified status.`,
            };
          }
        } else if (daysRemaining <= 7) {
          // 7 days left (1 week)
          if (!sentReminders.includes("7d")) {
            milestoneToSend = {
              key: "7d",
              title: "👑 Premium Renewal Reminder (7 Days Left)",
              message: `Your ${profile.subscriptionTier?.toUpperCase()} subscription renews in 7 days. Renew now to maintain your verified badge and unlimited direct messages!`,
            };
          }
        }

        // If a milestone is ready to fire, record it atomically and notify
        if (milestoneToSend) {
          const userRef = doc(db, "users", profile.uid);
          await updateDoc(userRef, {
            subscriptionRemindersSent: arrayUnion(milestoneToSend.key),
          });

          await addDoc(collection(db, "notifications"), {
            userId: profile.uid,
            type: "subscription",
            title: milestoneToSend.title,
            message: milestoneToSend.message,
            link: "/premium",
            read: false,
            createdAt: serverTimestamp(),
          });

          if (isNotificationSoundEnabled()) {
            playNotificationChime();
          }

          setProfile({
            ...profile,
            subscriptionRemindersSent: [...sentReminders, milestoneToSend.key],
          } as any);
        }
      } catch (err) {
        console.warn("Subscription lifecycle check error:", err);
      } finally {
        checkingRef.current = false;
      }
    };

    processLifecycle();
  }, [profile, isLoading, setProfile]);

  return null;
}
