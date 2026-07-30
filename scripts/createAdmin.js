import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import path from 'path';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = 'elijah@rhockstarconnect.com';
const password = 'RhockstarAdmin2026';

async function createAdmin() {
  try {
    console.log("Attempting to login...");
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Admin already exists and password is correct.");
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        console.log("Creating admin account...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: 'Elijah (Admin)',
          username: 'elijah_admin',
          accountType: 'admin',
          avatar: '👑',
          createdAt: new Date().toISOString()
        });
        console.log("Admin created successfully!");
      } catch (createError) {
        console.error("Error creating admin:", createError);
      }
    } else {
      console.error("Error signing in:", error);
    }
  }
  process.exit(0);
}

createAdmin();
