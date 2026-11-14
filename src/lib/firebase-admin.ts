import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Auth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import type { Messaging } from 'firebase-admin/messaging';

function cleanPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let cleaned = key.trim();
  // Strip enclosing single or double quotes repeatedly
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Replace escaped \n sequences with actual newlines
  cleaned = cleaned.replace(/\\n/g, '\n');
  return cleaned;
}

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminMessaging: Messaging | null = null;

function initializeAdmin() {
  if (adminApp && adminAuth && adminDb) {
    return;
  }

  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  const isConfigured = Boolean(projectId && clientEmail && privateKey);

  try {
    if (!getApps().length) {
      if (isConfigured) {
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

    if (activeApp) {
      if (!adminAuth) {
        try { adminAuth = getAuth(activeApp); } catch (e) { console.warn('adminAuth init warning:', e); }
      }
      if (!adminDb) {
        try { adminDb = getFirestore(activeApp); } catch (e) { console.warn('adminDb init warning:', e); }
      }
      if (!adminMessaging) {
        try { adminMessaging = getMessaging(activeApp); } catch (e) { console.warn('adminMessaging init warning:', e); }
      }
    }
  } catch (globalErr) {
    console.error('Firebase admin initialization error:', globalErr);
  }
}

// Initial attempt (safe, will not throw)
initializeAdmin();

export function getAdminApp(): App | null {
  if (!adminApp) initializeAdmin();
  return adminApp;
}

export function getAdminAuth(): Auth | null {
  if (!adminAuth) initializeAdmin();
  return adminAuth;
}

export function getAdminDb(): Firestore | null {
  if (!adminDb) initializeAdmin();
  return adminDb;
}

export function getAdminMessaging(): Messaging | null {
  if (!adminMessaging) initializeAdmin();
  return adminMessaging;
}

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

export { adminApp, adminAuth, adminDb, adminMessaging, isAdminConfigured };
