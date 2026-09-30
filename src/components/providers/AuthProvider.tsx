"use client";

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore, UserProfile } from '@/store/useAuthStore';

import SplashScreen from '@/components/layout/SplashScreen';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, isLoading } = useAuthStore();

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
          // Hold the splash screen until we actually have the profile data!
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });
        
        // Clean up profile listener when auth state changes
        if ((window as any)._profileUnsub) {
          (window as any)._profileUnsub();
        }
        (window as any)._profileUnsub = unsubscribeProfile;
      } else {
        setProfile(null);
        // Only dismiss loading immediately if there is absolutely no logged-in user
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if ((window as any)._profileUnsub) (window as any)._profileUnsub();
    };
  }, [setUser, setProfile, setLoading]);

  return (
    <>
      <SplashScreen isLoading={isLoading} />
      {children}
    </>
  );
}
