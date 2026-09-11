import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 });
    }

    const body = await req.json();
    const { transaction_id, tier, type, adId } = body;

    if (!transaction_id) {
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    // Verify transaction with Flutterwave
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY || 'dummy_test_secret_key_remove_me';
    
    const flwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const flwData = await flwRes.json();

    if (flwData.status === 'success' && flwData.data.status === 'successful') {
      
      // Verification passed, apply changes
      if (type === 'subscription' && tier) {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);
        
        await adminDb.collection('users').doc(decodedToken.uid).update({
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          premiumUntil: expiration.toISOString()
        });
        
        return NextResponse.json({ success: true, message: 'Subscription upgraded successfully' });
      } 
      else if (type === 'ad' && adId) {
        await adminDb.collection('advertisements').doc(adId).update({
          status: 'active',
          paidAt: new Date().toISOString()
        });
        
        return NextResponse.json({ success: true, message: 'Ad activated successfully' });
      }
      
      return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });

    } else {
      return NextResponse.json({ error: 'Transaction verification failed' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
