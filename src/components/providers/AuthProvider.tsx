"use client";

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore, UserProfile } from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();

  // 1. Immediately restore cached profile from localStorage on client mount (0ms instant display)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem('rhockstar_cached_profile');
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } catch {}
  }, [setProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore with metadata changes so cached doc emits instantly
        const docRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(
          docRef, 
          { includeMetadataChanges: true },
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile(data);
              try {
                localStorage.setItem('rhockstar_cached_profile', JSON.stringify(data));
              } catch {}
            } else {
              console.warn("User profile document not found!");
              setProfile(null);
            }
            setLoading(false);
          }, 
          (error) => {
            console.error("Error listening to user profile:", error);
            setLoading(false);
          }
        );
        
        // Clean up profile listener when auth state changes
        if ((window as any)._profileUnsub) {
          (window as any)._profileUnsub();
        }
        (window as any)._profileUnsub = unsubscribeProfile;
      } else {
        setProfile(null);
        try {
          localStorage.removeItem('rhockstar_cached_profile');
        } catch {}
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if ((window as any)._profileUnsub) {
        (window as any)._profileUnsub();
      }
    };
  }, [setUser, setProfile, setLoading]);

  // Fallback: forcefully drop loading state after 1.5 seconds so users never freeze on slow/spotty network
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(safetyTimer);
  }, [setLoading]);

  return (
    <>
      {children}
    </>
  );
}
