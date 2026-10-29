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

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

try {
  if (!getApps().length) {
    if (isAdminConfigured) {
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId: projectId!,
            clientEmail: clientEmail!,
            privateKey: privateKey!,
          }),
        });
      } catch (certErr) {
        console.error('Firebase Admin cert initialization error:', certErr);
      }
    }
  } else {
    adminApp = getApp();
  }

  const activeApp = adminApp || (getApps().length > 0 ? getApp() : null);

  if (activeApp && isAdminConfigured) {
    try { adminAuth = getAuth(activeApp); } catch (e) { console.warn('adminAuth init warning:', e); }
    try { adminDb = getFirestore(activeApp); } catch (e) { console.warn('adminDb init warning:', e); }
    try { adminMessaging = getMessaging(activeApp); } catch (e) { console.warn('adminMessaging init warning:', e); }
  }
} catch (globalErr) {
  console.error('Firebase admin top-level initialization error:', globalErr);
}

// Proxies or direct exports so existing callers expecting non-null get meaningful errors on invocation rather than crash on import
export { adminApp, adminAuth, adminDb, adminMessaging, isAdminConfigured };
