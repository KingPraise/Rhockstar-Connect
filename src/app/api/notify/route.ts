import { NextResponse } from 'next/server';
import { adminDb, adminMessaging, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// In-memory sliding rate-limiter for push notifications (15 requests/min per user)
const notifyRateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(senderUid: string): boolean {
  const now = Date.now();
  const entry = notifyRateLimitMap.get(senderUid);

  if (!entry || now > entry.expiresAt) {
    notifyRateLimitMap.set(senderUid, { count: 1, expiresAt: now + 60000 });
    return true;
  }

  if (entry.count >= 15) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or malformed token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Rate limit check
    if (!checkRateLimit(decodedToken.uid)) {
      return NextResponse.json({ 
        error: 'Too many notification requests. Please wait a minute before sending more.' 
      }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { userId, title, body: notifBody, icon, url } = body;

    if (!userId || !title || !notifBody) {
      return NextResponse.json({ error: 'Missing required notification fields' }, { status: 400 });
    }

    // Input sanitization & bounds checking
    const sanitizedTitle = String(title).replace(/<[^>]*>?/gm, '').trim().slice(0, 100);
    const sanitizedBody = String(notifBody).replace(/<[^>]*>?/gm, '').trim().slice(0, 300);

    // Phishing Prevention: Ensure notification link is strictly internal or on our domain
    let safeUrl = '/';
    if (typeof url === 'string') {
      const trimmedUrl = url.trim();
      if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
        safeUrl = trimmedUrl;
      } else if (trimmedUrl.startsWith('https://rhockstarconnect.com') || trimmedUrl.startsWith('http://localhost:3000')) {
        safeUrl = trimmedUrl;
      }
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const fcmTokens = userData?.fcmTokens || [];

    if (fcmTokens.length === 0) {
      return NextResponse.json({ success: true, message: 'User has no registered devices' });
    }

    const message = {
      notification: {
        title: sanitizedTitle,
        body: sanitizedBody,
        ...(icon && typeof icon === 'string' && icon.startsWith('http') && { image: icon })
      },
      webpush: {
        fcmOptions: {
          link: safeUrl
        }
      },
      tokens: fcmTokens
    };

    const response = await adminMessaging.sendEachForMulticast(message);
    
    // Cleanup invalid or expired tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        await adminDb.collection('users').doc(userId).update({
          fcmTokens: FieldValue.arrayRemove(...failedTokens)
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount 
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to dispatch push notification securely' }, { status: 500 });
  }
}
