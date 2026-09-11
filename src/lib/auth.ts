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

import { recordReferral } from "./services/referrals";

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'support', 'help', 'team', 'official', 'verified', 'verify', 
  'security', 'system', 'moderator', 'mod', 'staff', 'founder', 'ceo', 'owner', 'developer', 
  'dev', 'news', 'updates', 'blog', 'careers', 'jobs', 'ads', 'advertise', 'business', 
  'press', 'media', 'privacy', 'legal', 'terms', 'community', 'events', 'feedback', 
  'report', 'appeal', 'notifications', 'api', 'bot', 'ai', 'assistant', 'store', 'market', 
  'payments', 'wallet', 'rhockstar', 'rhockstarconnect', 'rhockstarnation', 
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
  try {
    const cleanUsername = username.toLowerCase().replace('@', '');
    if (RESERVED_USERNAMES.includes(cleanUsername)) {
      return { user: null, error: "This username is reserved and cannot be used." };
    }

    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Update Auth profile
    await updateProfile(user, {
      displayName: fullName,
    });

    // 3. Create Firestore user document
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName,
      username: username.toLowerCase().replace('@', ''),
      email,
      accountType,
      bio: "",
      headline: "",
      location: { city: "", state: "", country: "" },
      stats: { posts: 0, followers: 0, following: 0, connections: 0 },
      referralCode: username.toLowerCase().replace('@', ''),
      referralCount: 0,
      referredFriends: [],
      claimedRewards: [],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    // 4. Record referral if referral code was provided
    if (referralCode && referralCode.trim()) {
      await recordReferral(referralCode, user.uid, fullName);
    }

    return { user, error: null };
  } catch (error: unknown) {
    return { user: null, error: (error as Error).message };
  }
};

import { useAuthStore, UserProfile } from "@/store/useAuthStore";

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
      
      // Check if banned
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().isBanned) {
        await signOut(auth);
        return { user: null, error: "Your account has been banned due to policy violations." };
      }

      const updateData: any = { lastLogin: serverTimestamp() };
      if (emailToUse.toLowerCase() === "elijah@rhockstarconnect.com") {
        updateData.role = "admin";
      }

      await setDoc(doc(db, "users", userCredential.user.uid), updateData, { merge: true });
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
