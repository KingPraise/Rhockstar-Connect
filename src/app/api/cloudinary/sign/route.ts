import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ALLOWED_FOLDERS = new Set([
  'avatars',
  'covers',
  'posts',
  'resumes',
  'ads',
  'ads_logos',
  'ads_media',
  'dating',
  'dating_photos',
  'dating_voice',
  'messages',
]);

function isFolderAllowed(folder: string): boolean {
  if (ALLOWED_FOLDERS.has(folder)) return true;
  if (folder.startsWith('chats_')) return true;
  return false;
}

function verifyFirebaseToken(
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
    return { valid: false, error: err?.message || 'Malformed token' };
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or malformed authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Empty authorization token' },
        { status: 401 }
      );
    }

    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID;
    const tokenCheck = verifyFirebaseToken(token, projectId);
    if (!tokenCheck.valid) {
      return NextResponse.json(
        { error: `Unauthorized: ${tokenCheck.error}` },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const requestedFolder = String(body.folder || 'posts').toLowerCase().trim();

    // Security check: Whitelist folder names and disallow path traversal
    if (
      !isFolderAllowed(requestedFolder) ||
      requestedFolder.includes('..') ||
      requestedFolder.includes('/') ||
      requestedFolder.includes('\\')
    ) {
      return NextResponse.json(
        {
          error: `Security Policy Violation: Upload folder '${requestedFolder}' is not permitted.`,
        },
        { status: 403 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      console.error('CLOUDINARY_API_SECRET is missing from environment variables');
      return NextResponse.json(
        {
          error:
            'Cloudinary signature secret is not configured. Please add CLOUDINARY_API_SECRET to your Netlify environment variables.',
        },
        { status: 500 }
      );
    }

    // Cloudinary signature formula: SHA-1 hash of alphabetized parameters followed directly by api_secret
    const paramsToSign: Record<string, string | number> = {
      folder: requestedFolder,
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
      folder: requestedFolder,
    });
  } catch (error: any) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sign request' },
      { status: 500 }
    );
  }
}
