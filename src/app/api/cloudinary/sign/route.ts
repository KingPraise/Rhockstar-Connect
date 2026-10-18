import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FOLDERS = new Set([
  'avatars', 
  'covers', 
  'posts', 
  'resumes', 
  'ads', 
  'dating', 
  'messages'
]);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or malformed authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token || token.split('.').length !== 3) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token format' }, { status: 401 });
    }

    // Attempt cryptographic verification via adminAuth
    try {
      if (adminAuth) {
        await adminAuth.verifyIdToken(token);
      }
    } catch (authErr) {
      // If token verification fails specifically due to expiration or invalid signature
      console.warn('Token verification warning:', authErr);
      return NextResponse.json({ error: 'Unauthorized: Authentication token has expired or is invalid' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedFolder = String(body.folder || 'posts').toLowerCase().trim();

    // Security check: Whitelist folder names and disallow path traversal
    if (!ALLOWED_FOLDERS.has(requestedFolder) || requestedFolder.includes('..') || requestedFolder.includes('/')) {
      return NextResponse.json({ 
        error: `Security Policy Violation: Upload folder '${requestedFolder}' is not permitted.` 
      }, { status: 403 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json({ error: 'Cloudinary signature secret is not configured' }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: requestedFolder,
      },
      apiSecret
    );

    return NextResponse.json({ timestamp, signature, folder: requestedFolder });
  } catch (error: any) {
    console.error('Cloudinary signature error', error);
    return NextResponse.json({ error: error.message || 'Failed to sign request' }, { status: 500 });
  }
}
