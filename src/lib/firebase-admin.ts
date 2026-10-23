import { getApps, initializeApp, cert, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

function cleanPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let cleaned = key.trim();
  // Strip enclosing single or double quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  // Replace escaped \n with actual newlines
  return cleaned.replace(/\\n/g, '\n');
}

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminMessaging: Messaging | null = null;

try {
  if (!getApps().length) {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (projectId && clientEmail && privateKey) {
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } catch (certErr) {
        console.error('Firebase Admin cert initialization error:', certErr);
      }
    }

    if (!adminApp && !getApps().length) {
      try {
        adminApp = initializeApp();
      } catch (defaultErr) {
        console.warn('Firebase Admin default app fallback could not initialize:', defaultErr);
      }
    }
  } else {
    adminApp = getApp();
  }

  const activeApp = adminApp || (getApps().length > 0 ? getApp() : null);

  if (activeApp) {
    try { adminAuth = getAuth(activeApp); } catch (e) { console.warn('adminAuth init warning:', e); }
    try { adminDb = getFirestore(activeApp); } catch (e) { console.warn('adminDb init warning:', e); }
    try { adminMessaging = getMessaging(activeApp); } catch (e) { console.warn('adminMessaging init warning:', e); }
  }
} catch (globalErr) {
  console.error('Firebase admin top-level initialization error:', globalErr);
}

// Proxies or direct exports so existing callers expecting non-null get meaningful errors on invocation rather than crash on import
export { adminApp, adminAuth, adminDb, adminMessaging };
