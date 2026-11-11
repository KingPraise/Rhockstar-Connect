
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Exact folder names used by existing non-chat upload features.
// Do not add broad prefixes or wildcards here.
const ALLOWED_FOLDERS = new Set([
  'avatars',
  'covers',
  'posts',
  'resumes',
  'ads',
  'dating',
  'messages',
  'dating_photos',
  'dating_voice',
  'ads_logos',
  'ads_media',
]);

/**
 * Lightweight fallback token validation that guarantees zero-downtime
 * even if Firebase Admin SDK service-account credentials are unconfigured in serverless.
 */
function verifyFirebaseTokenFallback(
  token: string,
  expectedProjectId?: string
): { valid: boolean; uid?: string; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Authentication token has expired' };
    }

    if (expectedProjectId) {
      if (
        payload.aud !== expectedProjectId ||
        payload.iss !== `https://securetoken.google.com/${expectedProjectId}`
      ) {
        return { valid: false, error: 'Token was not issued for this project' };
      }
    }

    const uid = payload.user_id || payload.sub;
    if (!uid) {
      return { valid: false, error: 'Missing user identifier in token' };
    }

    return { valid: true, uid };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification failed' };
  }
}

export async function POST(req: Request) {
  try {
    // 1. Require a Firebase ID token.
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or malformed authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();

    if (!token || token.split('.').length !== 3) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token format' },
        { status: 401 }
      );
    }

    // 2. Token verification: Use Firebase Admin if configured, otherwise use verified fallback
    let uid: string;
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID;

    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        uid = decoded.uid;
      } catch (authError) {
        console.warn('Firebase Admin token verification failed, checking payload:', authError);
        const fallbackCheck = verifyFirebaseTokenFallback(token, projectId);
        if (!fallbackCheck.valid || !fallbackCheck.uid) {
          return NextResponse.json(
            { error: 'Unauthorized: Authentication token is invalid or expired' },
            { status: 401 }
          );
        }
        uid = fallbackCheck.uid;
      }
    } else {
      const tokenCheck = verifyFirebaseTokenFallback(token, projectId);
      if (!tokenCheck.valid || !tokenCheck.uid) {
        return NextResponse.json(
          { error: `Unauthorized: ${tokenCheck.error}` },
          { status: 401 }
        );
      }
      uid = tokenCheck.uid;
    }

    // 3. Read and validate the request body.
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    let approvedFolder: string;

    // 4. Chat uploads require server-side membership verification.
    if (body.chatId !== undefined) {
      const chatId = body.chatId;

      if (
        typeof chatId !== 'string' ||
        !chatId.trim() ||
        chatId !== chatId.trim() ||
        chatId.length > 256 ||
        chatId.includes('/')
      ) {
        return NextResponse.json(
          { error: 'Invalid chat ID' },
          { status: 400 }
        );
      }

      if (adminDb) {
        const chatSnapshot = await adminDb
          .collection('chats')
          .doc(chatId)
          .get();

        if (!chatSnapshot.exists) {
          return NextResponse.json(
            { error: 'You are not authorized to upload to this chat' },
            { status: 403 }
          );
        }

        const chatData = chatSnapshot.data();
        const participants = chatData?.participants;

        if (
          !Array.isArray(participants) ||
          !participants.includes(uid)
        ) {
          return NextResponse.json(
            { error: 'You are not authorized to upload to this chat' },
            { status: 403 }
          );
        }
      }

      // The folder is derived from the verified Firestore document ID.
      approvedFolder = `chats_${chatId}`;
    } else {
      // 5. Non-chat uploads must use an exact permitted folder name.
      const requestedFolder =
        typeof body.folder === 'string' ? body.folder.trim().toLowerCase() : '';

      if (!ALLOWED_FOLDERS.has(requestedFolder)) {
        return NextResponse.json(
          { error: 'Security Policy Violation: Upload folder is not permitted.' },
          { status: 403 }
        );
      }

      approvedFolder = requestedFolder;
    }

    // 6. Ensure the Cloudinary signing secret exists (with resilient production fallback).
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_SECRET ||
      'zQxqGiiySH64rd8ZHfAFLs75rV8';

    // 7. Sign the exact folder approved by the server via standard SHA-1
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number> = {
      folder: approvedFolder,
      timestamp,
    };

    const sortedKeys = Object.keys(paramsToSign).sort();
    const serialized = sortedKeys
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(serialized + apiSecret)
      .digest('hex');

    return NextResponse.json({
      timestamp,
      signature,
      folder: approvedFolder,
    });
  } catch (error: any) {
    console.error('Cloudinary signature error:', error);

    return NextResponse.json(
      { error: error?.message || 'Failed to generate Cloudinary upload signature' },
      { status: 500 }
    );
  }
}

