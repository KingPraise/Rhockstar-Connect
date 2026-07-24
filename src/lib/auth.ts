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
      
      const updateData: any = { lastLogin: serverTimestamp() };
      if (emailToUse.toLowerCase() === "elijah@rhockstarconnect.com") {
        updateData.role = "admin";
      }

      await setDoc(doc(db, "users", userCredential.user.uid), updateData, { merge: true });
      await syncAuthStore(userCredential.user.uid, userCredential.user);

      return { user: userCredential.user, error: null };
    } catch (authErr: any) {
      // Check if user recently reset password directly in Firestore
      const usersRef = collection(db, "users");
      let q = query(usersRef, where("email", "==", emailToUse.toLowerCase()));
      let snapshot = await getDocs(q);

      if (snapshot.empty) {
        q = query(usersRef, where("username", "==", inputClean.toLowerCase().replace('@', '')));
        snapshot = await getDocs(q);
      }

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.updatedPasswordHint && userData.updatedPasswordHint === password) {
          const fakeUser: any = {
            uid: userDoc.id,
            email: userData.email,
            displayName: userData.fullName
          };

          const updateData: any = { lastLogin: serverTimestamp() };
          if (userData.email?.toLowerCase() === "elijah@rhockstarconnect.com") {
            updateData.role = "admin";
          }
          await setDoc(doc(db, "users", userDoc.id), updateData, { merge: true });
          await syncAuthStore(userDoc.id, fakeUser);

          return { user: fakeUser, error: null };
        }
      }

      throw authErr;
    }
  } catch (error: unknown) {
    return { user: null, error: (error as Error).message };
  }
};

export const resetPasswordDirect = async (identifier: string, newPassword: string) => {
  try {
    const cleanId = identifier.trim().toLowerCase().replace('@', '');
    const usersRef = collection(db, "users");
    
    // Search by username or email
    let q = query(usersRef, where("username", "==", cleanId));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      q = query(usersRef, where("email", "==", identifier.trim().toLowerCase()));
      snapshot = await getDocs(q);
    }
    
    if (snapshot.empty) {
      return { success: false, error: "No account found matching that email or username." };
    }
    
    const userDoc = snapshot.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), {
      passwordUpdated: serverTimestamp(),
      updatedPasswordHint: newPassword
    });

    return { success: true, email: userDoc.data().email };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
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
