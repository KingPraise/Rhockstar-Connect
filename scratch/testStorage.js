const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadString, getDownloadURL } = require("firebase/storage");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function test() {
  try {
    console.log("Logging in...");
    await signInWithEmailAndPassword(auth, "elijah@rhockstarconnect.com", "123456");
    console.log("Logged in!");
    const storageRef = ref(storage, "test_file.txt");
    console.log("Storage ref created:", storageRef.toString());
    console.log("Uploading...");
    
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
    
    const uploadTask = uploadString(storageRef, "Hello World");
    await Promise.race([uploadTask, timeout]);
    
    console.log("Upload success!");
    const url = await getDownloadURL(storageRef);
    console.log("Download URL:", url);
    process.exit(0);
  } catch (error) {
    console.error("Upload failed:");
    console.error(error);
    process.exit(1);
  }
}

test();
