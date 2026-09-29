import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    
    // Verify user is authenticated before allowing upload
    try {
      await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 });
    }

    const body = await req.json();
    const folder = body.folder || 'general';

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({ timestamp, signature, folder });
  } catch (error) {
    console.error('Cloudinary signature error', error);
    return NextResponse.json({ error: 'Failed to sign request' }, { status: 500 });
  }
}
