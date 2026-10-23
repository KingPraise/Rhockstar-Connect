"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  auth,
  db,
} from "@/lib/firebase";
import {
  useAuthStore,
  UserProfile,
} from "@/store/useAuthStore";

const CACHED_PROFILE_KEY =
  "rhockstar_cached_profile";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    setUser,
    setProfile,
    setLoading,
  } = useAuthStore();

  /*
   * Restore the most recently known profile immediately.
   *
   * This prevents the UI from unnecessarily blocking while
   * Firebase Auth / Firestore reconnect in the background.
   */
  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const cachedProfile =
        localStorage.getItem(
          CACHED_PROFILE_KEY
        );

      if (cachedProfile) {
        setProfile(
          JSON.parse(
            cachedProfile
          ) as UserProfile
        );
      }
    } catch {
      // Ignore malformed/unavailable local storage.
    }
  }, [setProfile]);

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | null = null;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          /*
           * Always stop the previous profile listener
           * before reacting to another auth-state change.
           *
           * This prevents permission errors during logout
           * and prevents multiple profile listeners from
           * surviving at once.
           */
          if (
            unsubscribeProfile
          ) {
            unsubscribeProfile();

            unsubscribeProfile =
              null;
          }

          setUser(
            firebaseUser
          );

          if (!firebaseUser) {
            setProfile(null);

            try {
              localStorage.removeItem(
                CACHED_PROFILE_KEY
              );
            } catch {
              // Ignore storage errors.
            }

            setLoading(false);

            return;
          }

          const docRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          unsubscribeProfile =
            onSnapshot(
              docRef,
              {
                includeMetadataChanges:
                  true,
              },
              (docSnap) => {
                if (
                  docSnap.exists()
                ) {
                  const data =
                    docSnap.data() as UserProfile;

                  setProfile(data);

                  /*
                   * Store the latest profile locally so the
                   * next application start can hydrate instantly.
                   */
                  try {
                    localStorage.setItem(
                      CACHED_PROFILE_KEY,
                      JSON.stringify(
                        data
                      )
                    );
                  } catch {
                    // Ignore storage quota/privacy errors.
                  }
                } else {
                  console.warn(
                    "User profile document not found!"
                  );

                  setProfile(
                    null
                  );
                }

                setLoading(
                  false
                );
              },
              (error) => {
                /*
                 * Firestore may briefly report permission-denied
                 * while a listener is shutting down after logout.
                 * That is expected and should not become a visible
                 * application error.
                 */
                if (
                  error.code ===
                    "permission-denied" &&
                  !auth.currentUser
                ) {
                  return;
                }

                console.error(
                  "Error listening to user profile:",
                  error
                );

                setLoading(
                  false
                );
              }
            );
        }
      );

    return () => {
      unsubscribeAuth();

      if (
        unsubscribeProfile
      ) {
        unsubscribeProfile();

        unsubscribeProfile =
          null;
      }
    };
  }, [
    setUser,
    setProfile,
    setLoading,
  ]);

  /*
   * Safety fallback.
   *
   * Authentication should normally resolve much sooner,
   * but this prevents the application from being trapped
   * indefinitely behind an auth loading state.
   *
   * Keep upstream's shorter timeout.
   */
  useEffect(() => {
    const safetyTimer =
      setTimeout(() => {
        setLoading(false);
      }, 1500);

    return () =>
      clearTimeout(
        safetyTimer
      );
  }, [setLoading]);

  return <>{children}</>;
}