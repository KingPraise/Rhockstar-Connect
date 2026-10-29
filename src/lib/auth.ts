import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

import { useAuthStore, UserProfile } from "@/store/useAuthStore";
import { recordReferral } from "./services/referrals";

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'support', 'help', 'team', 'official', 'verified', 'verify', 
  'security', 'system', 'moderator', 'mod', 'staff', 'founder', 'ceo', 'owner', 'developer', 
  'dev', 'news', 'updates', 'blog', 'careers', 'jobs', 'ads', 'advertise', 'business', 
  'press', 'media', 'privacy', 'legal', 'terms', 'community', 'events', 'feedback', 
  'report', 'appeal', 'notifications', 'api', 'bot', 'ai', 'assistant', 'store', 'market', 
  'payments', 'wallet', 'rhockstarconnect', 'rhockstarnation', 
  'rhockstar_support', 'rhockstar_help', 'rhockstar_official', 'connectsupport', 'connectadmin'
];

export const registerUser = async (
  email: string, 
  password: string, 
  fullName: string, 
  username: string,
  referralCode?: string,
  accountType: 'standard' | 'employer' = 'standard'
) => {
  const cleanUsername = username.toLowerCase().replace('@', '').replace(/[^a-z0-9_]/g, '').trim();
  if (RESERVED_USERNAMES.includes(cleanUsername)) {
    return { user: null, error: "This username is reserved and cannot be used." };
  }

  // Primary Path: Server-side API registration with full Firebase Admin SDK
  // This executes with server-level privileges, completely eliminating client Firestore rule / permission errors.
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        username: cleanUsername,
        referralCode: referralCode?.trim(),
        accountType,
      })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      // Server-side registration completed cleanly! Now sign in client-side to establish browser session
      const signInResult = await signInWithEmailAndPassword(auth, email.trim(), password);

      // Sync auth store immediately
      try {
        const userDocRef = doc(db, "users", signInResult.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          useAuthStore.getState().setProfile(userDocSnap.data() as UserProfile);
        }
        useAuthStore.getState().setUser(signInResult.user);
        useAuthStore.getState().setLoading(false);
      } catch (syncErr) {
        console.warn("Profile sync warning after registration:", syncErr);
      }

      return { user: signInResult.user, error: null };
    }

    // Real validation error (e.g. username taken, email registered, password invalid)
    if (res.status === 400 && data.error) {
      return { user: null, error: data.error };
    }

    // If server returned fallback or non-400 status, seamlessly fall through to client registration
    if (!data.fallback) {
      console.warn("Server API returned non-400 status, falling back to direct client registration:", res.status, data);
    }
  } catch (apiErr: any) {
    console.warn("API registration unreachable, attempting direct client fallback:", apiErr);
  }

  // Fallback Path: Direct client SDK registration
  let createdAuthUser: any = null;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    createdAuthUser = userCredential.user;

    await updateProfile(createdAuthUser, {
      displayName: fullName.trim(),
    });

    // Create user document in Firestore without protected keys
    await setDoc(doc(db, "users", createdAuthUser.uid), {
      uid: createdAuthUser.uid,
      fullName: fullName.trim(),
      username: cleanUsername,
      email: email.trim(),
      accountType,
      bio: "",
      headline: "",
      location: { city: "", state: "", country: "" },
      stats: { posts: 0, followers: 0, following: 0, connections: 0 },
      referralCode: cleanUsername,
      referralCount: 0,
      referredFriends: [],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    if (referralCode && referralCode.trim()) {
      try {
        await recordReferral(referralCode, createdAuthUser.uid, fullName);
      } catch (refErr) {
        console.warn("Referral recording fallback warning:", refErr);
      }
    }

    try {
      const userDocRef = doc(db, "users", createdAuthUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        useAuthStore.getState().setProfile(userDocSnap.data() as UserProfile);
      }
      useAuthStore.getState().setUser(createdAuthUser);
      useAuthStore.getState().setLoading(false);
    } catch (syncErr) {
      console.warn("Profile sync warning after registration:", syncErr);
    }

    return { user: createdAuthUser, error: null };
  } catch (clientErr: any) {
    if (createdAuthUser) {
      try {
        await createdAuthUser.delete();
      } catch (delErr) {
        console.warn("Client rollback delete warning:", delErr);
      }
    }

    const rawMsg = clientErr?.message || "An unexpected error occurred during registration.";
    if (rawMsg.includes("auth/email-already-in-use")) {
      return { 
        user: null, 
        error: "This email address is already registered. If you already have an account, please log in or reset your password." 
      };
    }
    return { user: null, error: rawMsg };
  }
};

export const loginUser = async (emailOrUsername: string, password: string, rememberMe: boolean = true) => {
  try {
    const inputClean = emailOrUsername.trim();
    let emailToUse = inputClean;

    // Set persistence according to Remember Me checkbox
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    } catch (persErr) {
      console.warn("Could not set Auth persistence:", persErr);
    }

    // Helper to populate auth store immediately
    const syncAuthStore = async (uid: string, authUser: any) => {
      try {
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          useAuthStore.getState().setProfile(userDocSnap.data() as UserProfile);
        }
      } catch (err) {
        console.warn("Error pre-fetching profile:", err);
      }
      useAuthStore.getState().setUser(authUser);
      useAuthStore.getState().setLoading(false);
    };

    // If input does not look like an email, search for user by username
    if (!inputClean.includes("@")) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", inputClean.toLowerCase().replace('@', '')));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        if (userData.email) {
          emailToUse = userData.email;
        }
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      
      // Check if banned & auto-heal missing profile document
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().isBanned) {
        await signOut(auth);
        return { user: null, error: "Your account has been banned due to policy violations." };
      }

      if (!userDocSnap.exists()) {
        // Auto-heal missing profile document so user is never broken or invisible
        const rawEmailName = (userCredential.user.email?.split('@')[0] || "user")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 15);
        const generatedUsername = `${rawEmailName}${Math.floor(100 + Math.random() * 900)}`;

        const fallbackProfile = {
          uid: userCredential.user.uid,
          fullName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || "Rhockstar Member",
          username: generatedUsername,
          email: userCredential.user.email || emailToUse,
          accountType: "standard",
          bio: "",
          headline: "",
          location: { city: "", state: "", country: "" },
          stats: { posts: 0, followers: 0, following: 0, connections: 0 },
          referralCode: generatedUsername,
          referralCount: 0,
          referredFriends: [],
          claimedRewards: [],
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };

        await setDoc(userDocRef, fallbackProfile);
      } else {
        const updateData: any = { lastLogin: serverTimestamp() };
        await setDoc(userDocRef, updateData, { merge: true });
      }

      await syncAuthStore(userCredential.user.uid, userCredential.user);

      return { user: userCredential.user, error: null };
    } catch (authErr: any) {
      throw authErr;
    }
  } catch (error: unknown) {
    return { user: null, error: (error as Error).message };
  }
};


export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    return { error: (error as Error).message };
  }
};
