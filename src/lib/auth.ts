import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

import { recordReferral } from "./services/referrals";

export const registerUser = async (
  email: string, 
  password: string, 
  fullName: string, 
  username: string,
  referralCode?: string
) => {
  try {
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

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Ensure Elijah always gets the admin role
    const updateData: any = { lastLogin: serverTimestamp() };
    if (email.toLowerCase() === "elijah@rhockstarconnect.com") {
      updateData.role = "admin";
    }

    // Update lastLogin in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), updateData, { merge: true });

    return { user: userCredential.user, error: null };
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
