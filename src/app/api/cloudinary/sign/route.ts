
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // 2. Always verify the token. Never silently skip verification.
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.warn('Firebase token verification failed:', authError);

      return NextResponse.json(
        { error: 'Unauthorized: Authentication token is invalid or expired' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // 3. Read and validate the request body.
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
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

      // The folder is derived from the verified Firestore document ID.
      approvedFolder = `chats_${chatId}`;
    } else {
      // 5. Non-chat uploads must use an exact permitted folder name.
      const requestedFolder =
        typeof body.folder === 'string' ? body.folder.trim() : '';

      if (!ALLOWED_FOLDERS.has(requestedFolder)) {
        return NextResponse.json(
          { error: 'Security Policy Violation: Upload folder is not permitted.' },
          { status: 403 }
        );
      }

      approvedFolder = requestedFolder;
    }

    // 6. Ensure the Cloudinary signing secret exists.
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      console.error('Cloudinary API secret is not configured.');

      return NextResponse.json(
        { error: 'Cloudinary signing is not configured' },
        { status: 500 }
      );
    }

    // 7. Sign the exact folder approved by the server.
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: approvedFolder,
      },
      apiSecret
    );

    return NextResponse.json({
      timestamp,
      signature,
      folder: approvedFolder,
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);

    return NextResponse.json(
      { error: 'Failed to generate Cloudinary upload signature' },
      { status: 500 }
    );
  }
}
