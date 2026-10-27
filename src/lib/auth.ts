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
  let createdAuthUser: any = null;
  let isOrphanHeal = false;

  try {
    const cleanUsername = username.toLowerCase().replace('@', '').trim();
    if (RESERVED_USERNAMES.includes(cleanUsername)) {
      return { user: null, error: "This username is reserved and cannot be used." };
    }

    // Pre-check if username is already taken BEFORE creating Auth record
    const usernameQuery = query(collection(db, "users"), where("username", "==", cleanUsername));
    const usernameSnap = await getDocs(usernameQuery);
    if (!usernameSnap.empty) {
      return { user: null, error: "This username is already taken. Please choose another." };
    }

    // 1. Create user in Firebase Auth or self-heal orphaned Auth user
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      createdAuthUser = userCredential.user;
    } catch (authErr: any) {
      const msg = authErr?.message || "";
      const isEmailInUse = authErr?.code === 'auth/email-already-in-use' || msg.includes('email-already-in-use');

      if (isEmailInUse) {
        // Self-Healing Mechanism: Check if this email exists in Auth as an orphaned record
        try {
          const signInAttempt = await signInWithEmailAndPassword(auth, email, password);
          const existingDoc = await getDoc(doc(db, "users", signInAttempt.user.uid));
          if (!existingDoc.exists()) {
            // Found orphaned auth record! Reconnect and complete registration seamlessly!
            createdAuthUser = signInAttempt.user;
            isOrphanHeal = true;
          } else {
            // Genuine existing user with a database profile
            await signOut(auth);
            return {
              user: null,
              error: "This email address is already registered. If this is your account, please log in or reset your password."
            };
          }
        } catch {
          // Wrong password or cannot sign in
          return {
            user: null,
            error: "This email address is already in use. If you already have an account, please log in or reset your password."
          };
        }
      } else {
        throw authErr;
      }
    }

    // 2. Update Auth profile
    await updateProfile(createdAuthUser, {
      displayName: fullName,
    });

    // 3. Create Firestore user document
    await setDoc(doc(db, "users", createdAuthUser.uid), {
      uid: createdAuthUser.uid,
      fullName,
      username: cleanUsername,
      email,
      accountType,
      bio: "",
      headline: "",
      location: { city: "", state: "", country: "" },
      stats: { posts: 0, followers: 0, following: 0, connections: 0 },
      referralCode: cleanUsername,
      referralCount: 0,
      referredFriends: [],
      claimedRewards: [],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    // 4. Record referral if referral code was provided
    if (referralCode && referralCode.trim()) {
      await recordReferral(referralCode, createdAuthUser.uid, fullName);
    }

    return { user: createdAuthUser, error: null };
  } catch (error: any) {
    // If brand new Auth user was created but subsequent operations failed, rollback Auth user to prevent orphaned state
    if (createdAuthUser && !isOrphanHeal) {
      try {
        await createdAuthUser.delete();
      } catch (delErr) {
        console.warn("Could not delete orphaned auth user on registration rollback:", delErr);
      }
    }

    const rawMsg = error?.message || "An unexpected error occurred during registration.";
    if (rawMsg.includes("auth/email-already-in-use")) {
      return { 
        user: null, 
        error: "This email address is already registered. If you already have an account, please log in or reset your password." 
      };
    }
    return { user: null, error: rawMsg };
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
