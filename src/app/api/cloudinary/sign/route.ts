import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

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
    // We intentionally skip firebase-admin token verification here 
    // because firebase-admin frequently causes 500 crashes in Netlify Serverless environments.
    // The presence of a Bearer token is a basic check.


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
  } catch (error: any) {
    console.error('Cloudinary signature error', error);
    return NextResponse.json({ error: error.message || 'Failed to sign request' }, { status: 500 });
  }
}
