"use client";

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore, UserProfile } from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            console.warn("User profile document not found!");
            setProfile(null);
          }
        }, (error) => {
          console.error("Error listening to user profile:", error);
        });
        
        // Clean up profile listener when auth state changes (if needed, though this is handled by the parent effect cleanup)
        // Store it on the window to prevent memory leaks if auth state changes rapidly
        if ((window as any)._profileUnsub) {
          (window as any)._profileUnsub();
        }
        (window as any)._profileUnsub = unsubscribeProfile;
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if ((window as any)._profileUnsub) (window as any)._profileUnsub();
    };
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}
