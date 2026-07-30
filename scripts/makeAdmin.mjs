import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', 'elijah@rhockstarconnect.com'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('User not found by email. Searching by name...');
    const q2 = query(usersRef, where('name', '>=', 'Elijah'), where('name', '<=', 'Elijah\\uf8ff'));
    const snap2 = await getDocs(q2);
    for (const d of snap2.docs) {
      console.log('Found:', d.id, d.data().email, d.data().name);
      await updateDoc(doc(db, 'users', d.id), { role: 'admin' });
      console.log('Role updated to admin!');
    }
  } else {
    for (const d of snapshot.docs) {
      console.log('Found user:', d.data().email);
      await updateDoc(doc(db, 'users', d.id), { role: 'admin' });
      console.log('Role updated to admin!');
    }
  }
}
run().then(() => process.exit(0)).catch(console.error);
